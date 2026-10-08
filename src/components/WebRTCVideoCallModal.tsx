import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Maximize2,
  Minimize2,
  SwitchCamera,
  ShieldCheck,
  User,
  Clock,
  Sparkles,
  AlertCircle,
  Volume2,
  VolumeX,
  Volume1,
  Radio
} from 'lucide-react';
import { WebRTCCallSession } from '../types';
import {
  RTC_CONFIG,
  optimizeSdpForVoice,
  updateCallSessionInFirebase,
  addIceCandidateInFirebase,
  listenRemoteIceCandidates,
  listenCallSessionInFirebase,
  ringtone,
} from '../services/webrtcService';

interface WebRTCVideoCallModalProps {
  session: WebRTCCallSession;
  isCaller: boolean;
  onClose: () => void;
}

export const WebRTCVideoCallModal: React.FC<WebRTCVideoCallModalProps> = ({
  session,
  isCaller,
  onClose,
}) => {
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended' | 'missed'>(
    isCaller ? 'ringing' : 'connected'
  );
  const [statusMessage, setStatusMessage] = useState<string>(
    isCaller ? 'A chamar destinatário... (Aguardando resposta)' : 'A estabelecer ligação WebRTC...'
  );

  // 8-second countdown for the caller
  const [callerRemainingSecs, setCallerRemainingSecs] = useState<number>(8);

  // In-call controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [remoteVolume, setRemoteVolume] = useState(1.0);

  // Media refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // WebRTC refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const cleanupListenersRef = useRef<(() => void)[]>([]);

  // 1. Initial 8-Second Outgoing Countdown for Caller
  useEffect(() => {
    if (!isCaller || callState !== 'ringing') return;

    ringtone.startRinging();
    const startTime = Date.now();
    const duration = 8000;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const leftMs = Math.max(0, duration - elapsed);
      const secs = Math.ceil(leftMs / 1000);
      setCallerRemainingSecs(secs);

      if (leftMs <= 0) {
        clearInterval(timer);
        ringtone.stopRinging();
        setStatusMessage('Chamada não atendida: tempo limite de 8 segundos esgotado.');
        setCallState('missed');
        updateCallSessionInFirebase(session.id, { status: 'missed' });
      }
    }, 100);

    return () => {
      clearInterval(timer);
      ringtone.stopRinging();
    };
  }, [isCaller, session.id, callState]);

  // 2. Call Duration counter once connected
  useEffect(() => {
    if (callState !== 'connected') return;

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [callState]);

  // 3. Keep Remote Video Audio synced with Speaker Volume state
  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.volume = isSpeakerMuted ? 0 : remoteVolume;
      remoteVideoRef.current.muted = isSpeakerMuted;
    }
  }, [remoteVolume, isSpeakerMuted]);

  // 4. WebRTC Setup & Media Stream Initialization
  useEffect(() => {
    let isMounted = true;

    const setupWebRTC = async () => {
      try {
        // A. Acquire Local Media (Camera + Studio-Grade HD Audio with Noise/Echo Suppression)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 48000,
            sampleSize: 16,
            googEchoCancellation: true,
            googAutoGainControl: true,
            googNoiseSuppression: true,
            googHighpassFilter: true,
            googTypingNoiseDetection: true,
            googAudioMirroring: false,
          } as any,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        // Apply audio track enhancement constraints if supported by browser
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack && audioTrack.applyConstraints) {
          audioTrack
            .applyConstraints({
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            })
            .catch(() => {});
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;
          localVideoRef.current.volume = 0;
        }

        // B. Initialize RTCPeerConnection
        const pc = new RTCPeerConnection(RTC_CONFIG);
        peerConnectionRef.current = pc;

        // C. Setup Remote Stream receiver
        const remoteStream = new MediaStream();
        remoteStreamRef.current = remoteStream;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.muted = isSpeakerMuted;
          remoteVideoRef.current.volume = isSpeakerMuted ? 0 : remoteVolume;
        }

        pc.ontrack = (event) => {
          event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
          });
          if (isMounted) {
            setCallState('connected');
            setStatusMessage('Ligação WebRTC HD P2P Conectada');
          }
        };

        // D. Add local tracks to PeerConnection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Optimize audio sender bitrate for 64kbps HD Voice
        try {
          const senders = pc.getSenders();
          const audioSender = senders.find((s) => s.track?.kind === 'audio');
          if (audioSender && audioSender.getParameters) {
            const params = audioSender.getParameters();
            if (params.encodings && params.encodings.length > 0) {
              params.encodings[0].maxBitrate = 64000;
              audioSender.setParameters(params).catch(() => {});
            }
          }
        } catch (e) {
          console.warn('Audio sender parameters warning:', e);
        }

        // E. Send local ICE Candidates to Firebase
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            addIceCandidateInFirebase(
              session.id,
              isCaller ? 'caller' : 'callee',
              event.candidate.toJSON()
            );
          }
        };

        // F. Listen for Remote ICE Candidates from Firebase
        const stopIceListener = listenRemoteIceCandidates(
          session.id,
          isCaller ? 'callee' : 'caller',
          async (candidateInit) => {
            try {
              if (pc.remoteDescription) {
                await pc.addIceCandidate(new RTCIceCandidate(candidateInit));
              }
            } catch (err) {
              console.warn('Erro ao aplicar ICE candidate remoto:', err);
            }
          }
        );
        cleanupListenersRef.current.push(stopIceListener);

        // G. Signaling Handshake (Offer / Answer with Voice-Optimized SDP)
        if (isCaller) {
          // Caller generates SDP Offer with HD voice parameters
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          const optimizedOfferSdp = optimizeSdpForVoice(offer.sdp || '');
          const enhancedOffer = new RTCSessionDescription({ type: 'offer', sdp: optimizedOfferSdp });
          await pc.setLocalDescription(enhancedOffer);

          await updateCallSessionInFirebase(session.id, {
            offer: { type: 'offer', sdp: enhancedOffer.sdp || '' },
          });

          // Caller listens for Callee Answer
          const stopSessionListener = listenCallSessionInFirebase(session.id, async (updatedCall) => {
            if (!updatedCall || !isMounted) return;

            if (updatedCall.status === 'accepted' && updatedCall.answer && !pc.currentRemoteDescription) {
              ringtone.stopRinging();
              setCallState('connected');
              setStatusMessage('Chamada Aceite! Ligação HD P2P Conectada.');
              const optimizedAnswerSdp = optimizeSdpForVoice(updatedCall.answer.sdp || '');
              await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: optimizedAnswerSdp }));
            } else if (updatedCall.status === 'declined') {
              ringtone.stopRinging();
              setCallState('ended');
              setStatusMessage('A chamada foi recusada pelo destinatário.');
            } else if (updatedCall.status === 'missed') {
              ringtone.stopRinging();
              setCallState('missed');
              setStatusMessage('Chamada não atendida: tempo limite de 8 segundos esgotado.');
            } else if (updatedCall.status === 'ended') {
              ringtone.stopRinging();
              setCallState('ended');
              setStatusMessage('A chamada terminou.');
            }
          });
          cleanupListenersRef.current.push(stopSessionListener);
        } else {
          // Callee receives Offer and generates SDP Answer with HD voice parameters
          if (session.offer) {
            const optimizedRemoteOffer = optimizeSdpForVoice(session.offer.sdp || '');
            await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: optimizedRemoteOffer }));

            const answer = await pc.createAnswer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
            });
            const optimizedAnswerSdp = optimizeSdpForVoice(answer.sdp || '');
            const enhancedAnswer = new RTCSessionDescription({ type: 'answer', sdp: optimizedAnswerSdp });
            await pc.setLocalDescription(enhancedAnswer);

            await updateCallSessionInFirebase(session.id, {
              status: 'accepted',
              answer: { type: 'answer', sdp: enhancedAnswer.sdp || '' },
            });

            setCallState('connected');
            setStatusMessage('Ligação WebRTC HD Estabelecida');
          }

          // Callee listens for call termination
          const stopSessionListener = listenCallSessionInFirebase(session.id, (updatedCall) => {
            if (!updatedCall || !isMounted) return;
            if (updatedCall.status === 'ended') {
              setCallState('ended');
              setStatusMessage('A chamada foi terminada.');
            }
          });
          cleanupListenersRef.current.push(stopSessionListener);
        }
      } catch (err: any) {
        console.error('Erro na inicialização da chamada WebRTC:', err);
        if (isMounted) {
          setStatusMessage(`Falha ao aceder à câmara ou microfone: ${err.message}`);
          setCallState('ended');
        }
      }
    };

    setupWebRTC();

    return () => {
      isMounted = false;
      ringtone.stopRinging();
      cleanupListenersRef.current.forEach((fn) => fn());

      // Stop local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [session.id, isCaller]);

  // Handle In-Call Controls
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoDisabled(!isVideoDisabled);
    }
  };

  const handleEndCall = () => {
    ringtone.stopRinging();
    updateCallSessionInFirebase(session.id, { status: 'ended' });
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatDuration = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const remotePeerName = isCaller ? session.calleeName : session.callerName;
  const remotePeerAvatar = isCaller ? session.calleeAvatar : session.callerAvatar;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950 flex flex-col justify-between text-white animate-fade-in select-none"
    >
      {/* Top Header Bar */}
      <div className="relative z-30 p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
        {/* Remote Peer Identity */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={
                remotePeerAvatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
              }
              alt={remotePeerName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-400"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
              }}
            />
            {callState === 'connected' && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white leading-tight">
              {remotePeerName}
            </h3>
            <div className="flex items-center gap-2 text-xs text-purple-200/80">
              {callState === 'connected' ? (
                <span className="flex items-center gap-1 text-emerald-400 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(callDuration)}</span>
                </span>
              ) : (
                <span className="text-amber-300 font-medium">{statusMessage}</span>
              )}
            </div>
          </div>
        </div>

        {/* Security & Protocol Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 backdrop-blur-md border border-emerald-500/25 text-xs font-semibold text-emerald-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Voz HD 64kbps (Filtro Anti-Eco)</span>
          </div>

          <div className="hidden md:inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-purple-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>WebRTC P2P</span>
          </div>

          <button
            onClick={toggleFullscreen}
            aria-label="Ecrã completo"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition text-white"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Center Video Area */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-slate-900">
        {/* Remote Video Stream (Main viewport) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            callState === 'connected' ? 'opacity-100' : 'opacity-20'
          }`}
        />

        {/* Overlay when Call is Ringing / Awaiting 8-Second Answer */}
        {callState === 'ringing' && isCaller && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center space-y-5 bg-black/60 backdrop-blur-sm">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
              <img
                src={
                  remotePeerAvatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
                }
                alt={remotePeerName}
                referrerPolicy="no-referrer"
                className="w-28 h-28 rounded-full object-cover ring-4 ring-[#7C3AED] shadow-2xl relative z-10"
              />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">A chamar {remotePeerName}...</h2>
              <p className="text-sm text-purple-200">
                O destinatário tem <span className="font-bold text-amber-300">8 segundos</span> para aceitar.
              </p>
            </div>

            {/* 8-second countdown timer for the caller */}
            <div className="px-5 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 backdrop-blur-md flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="text-base font-extrabold text-amber-200">
                Aguardando resposta: {callerRemainingSecs}s restantes
              </span>
            </div>
          </div>
        )}

        {/* Overlay when Call Missed or Ended */}
        {(callState === 'missed' || callState === 'ended') && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-black/85 backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <PhoneOff className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-xl font-bold text-white">
                {callState === 'missed' ? 'Chamada Não Atendida' : 'Chamada Terminada'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">{statusMessage}</p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold transition active:scale-95"
            >
              Fechar Janela
            </button>
          </div>
        )}

        {/* Local Picture-in-Picture Video Preview (Corner) */}
        <div className="absolute bottom-24 right-4 sm:bottom-28 sm:right-6 z-30 w-32 sm:w-44 aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-purple-400/50 bg-slate-800">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover scale-x-[-1] ${
              isVideoDisabled ? 'opacity-0' : 'opacity-100'
            }`}
          />
          {isVideoDisabled && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 text-xs">
              <VideoOff className="w-6 h-6 mb-1" />
              <span>Câmara desligada</span>
            </div>
          )}
          <span className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
            Você
          </span>
        </div>
      </div>

      {/* Bottom Floating In-Call Control Bar */}
      <div className="relative z-30 p-5 sm:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-center gap-3 sm:gap-5">
        {/* Toggle Microphone */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Ativar o teu microfone' : 'Desativar o teu microfone (Mudo)'}
          aria-label={isMuted ? 'Ativar microfone' : 'Desativar microfone'}
          className={`p-3.5 sm:p-4 rounded-2xl backdrop-blur-md transition-all active:scale-95 ${
            isMuted
              ? 'bg-rose-500/80 hover:bg-rose-600 text-white'
              : 'bg-white/15 hover:bg-white/25 text-white'
          }`}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Toggle Camera */}
        <button
          onClick={toggleVideo}
          title={isVideoDisabled ? 'Ligar a tua câmara' : 'Desligar a tua câmara'}
          aria-label={isVideoDisabled ? 'Ativar câmara' : 'Desativar câmara'}
          className={`p-3.5 sm:p-4 rounded-2xl backdrop-blur-md transition-all active:scale-95 ${
            isVideoDisabled
              ? 'bg-rose-500/80 hover:bg-rose-600 text-white'
              : 'bg-white/15 hover:bg-white/25 text-white'
          }`}
        >
          {isVideoDisabled ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
        </button>

        {/* Remote Speaker Audio & Volume Control */}
        <div className="relative group flex items-center">
          <button
            onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
            title={isSpeakerMuted ? 'Ativar som do interlocutor' : `Silenciar som (${Math.round(remoteVolume * 100)}%)`}
            aria-label="Controlo de Som do Altifalante"
            className={`p-3.5 sm:p-4 rounded-2xl backdrop-blur-md transition-all active:scale-95 ${
              isSpeakerMuted
                ? 'bg-amber-500/80 hover:bg-amber-600 text-white'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            {isSpeakerMuted ? (
              <VolumeX className="w-5 h-5 text-amber-200" />
            ) : remoteVolume < 0.5 ? (
              <Volume1 className="w-5 h-5 text-purple-200" />
            ) : (
              <Volume2 className="w-5 h-5 text-purple-200" />
            )}
          </button>

          {/* Quick Volume Slider Popover on hover/focus */}
          <div className="hidden group-hover:flex absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-2.5 bg-slate-900/95 border border-purple-500/30 rounded-2xl shadow-xl flex-col items-center gap-1.5 backdrop-blur-md z-40">
            <span className="text-[10px] font-bold text-purple-300 font-mono">
              {isSpeakerMuted ? 'Mudo' : `${Math.round(remoteVolume * 100)}%`}
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isSpeakerMuted ? 0 : remoteVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setRemoteVolume(val);
                if (val > 0) setIsSpeakerMuted(false);
              }}
              className="w-20 h-1.5 accent-[#7C3AED] bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* End Call / Hang Up (Big Red Button) */}
        <button
          onClick={handleEndCall}
          aria-label="Terminar chamada"
          className="p-3.5 sm:p-4 px-6 sm:px-8 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold transition shadow-xl shadow-rose-950/60 flex items-center gap-2"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="hidden sm:inline text-sm">Desligar</span>
        </button>
      </div>
    </div>
  );
};

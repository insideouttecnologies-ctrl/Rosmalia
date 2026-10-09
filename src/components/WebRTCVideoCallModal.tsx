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

/**
 * Generates an active audio track using Web Audio API
 * Ensures RTCPeerConnection negotiation succeeds and outputs active packets even without microphone permission
 */
const createSyntheticAudioTrack = (): MediaStreamTrack | null => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const dest = ctx.createMediaStreamDestination();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, ctx.currentTime);
    // Sub-audible carrier gain so RTP packets are constantly generated without producing audible noise
    gain.gain.setValueAtTime(0.00001, ctx.currentTime);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    const track = dest.stream.getAudioTracks()[0] || null;
    if (track) {
      track.onended = () => {
        try {
          osc.stop();
          ctx.close().catch(() => {});
        } catch (e) {}
      };
    }
    return track;
  } catch (err) {
    console.warn('Synthetic audio track creation bypassed:', err);
    return null;
  }
};

/**
 * Generates an actively animated video track on a 2D canvas
 * Ensures RTCPeerConnection video encoder produces continuous live video frames
 */
const createSyntheticVideoTrack = (labelName: string = 'Utilizador'): MediaStreamTrack | null => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let frame = 0;
    const render = () => {
      frame++;
      // Dark background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated breathing outer halo
      const pulse = Math.sin(frame * 0.15) * 8;
      ctx.beginPath();
      ctx.arc(320, 200, 72 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(124, 58, 237, 0.25)';
      ctx.fill();

      // Inner purple avatar
      ctx.beginPath();
      ctx.arc(320, 200, 62, 0, Math.PI * 2);
      ctx.fillStyle = '#7c3aed';
      ctx.fill();

      // Avatar letter
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((labelName || 'U').charAt(0).toUpperCase(), 320, 200);

      // Name label
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(labelName || 'Membro Lume', 320, 300);

      // Status text
      ctx.fillStyle = '#a78bfa';
      ctx.font = '13px sans-serif';
      ctx.fillText('Câmara em espera / Chamada em curso', 320, 330);
    };

    render();
    const intervalId = setInterval(render, 150);

    const stream = canvas.captureStream(10);
    const track = stream.getVideoTracks()[0] || null;
    if (track) {
      track.onended = () => {
        clearInterval(intervalId);
      };
    }
    return track;
  } catch (err) {
    console.warn('Synthetic video track creation bypassed:', err);
    return null;
  }
};

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

  // 16-second countdown for the caller
  const [callerRemainingSecs, setCallerRemainingSecs] = useState<number>(16);

  // Media permission state & warnings
  const [permissionWarning, setPermissionWarning] = useState<string | null>(null);
  const [hasLiveCamera, setHasLiveCamera] = useState<boolean>(true);
  const [hasLiveMic, setHasLiveMic] = useState<boolean>(true);
  const [isRetryingPermissions, setIsRetryingPermissions] = useState<boolean>(false);

  // In-call controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [remoteVolume, setRemoteVolume] = useState(1.0);
  const [isAudioAutoplayBlocked, setIsAudioAutoplayBlocked] = useState(false);

  // Media refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // WebRTC refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const cleanupListenersRef = useRef<(() => void)[]>([]);

  // 1. Initial 16-Second Outgoing Countdown for Caller
  useEffect(() => {
    if (!isCaller || callState !== 'ringing') return;

    ringtone.startRinging();
    const startTime = Date.now();
    const duration = 16000;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const leftMs = Math.max(0, duration - elapsed);
      const secs = Math.ceil(leftMs / 1000);
      setCallerRemainingSecs(secs);

      if (leftMs <= 0) {
        clearInterval(timer);
        ringtone.stopRinging();
        setStatusMessage('Chamada não atendida: tempo limite de 16 segundos esgotado.');
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

  // 3. Keep Remote Video & Audio synced with Speaker Volume state
  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.volume = isSpeakerMuted ? 0 : remoteVolume;
      remoteVideoRef.current.muted = isSpeakerMuted;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = isSpeakerMuted ? 0 : remoteVolume;
      remoteAudioRef.current.muted = isSpeakerMuted;
    }
  }, [remoteVolume, isSpeakerMuted]);

  // 4. WebRTC Setup & Media Stream Initialization
  useEffect(() => {
    let isMounted = true;

    const setupWebRTC = async () => {
      try {
        // A. Acquire Local Media (Camera + Microphone with resilient multi-tier fallback)
        const myName = isCaller ? session.callerName : session.calleeName;
        let stream: MediaStream;
        let warningText: string | null = null;

        try {
          // Attempt 1: High quality video + mono noise-suppressed audio
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              channelCount: 1,
            },
          });
          setHasLiveCamera(true);
          setHasLiveMic(true);
        } catch (err1) {
          console.warn('Tentativa 1 falhou, a tentar acesso básico ou parcial:', err1);
          try {
            // Attempt 2: Basic video + audio
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setHasLiveCamera(true);
            setHasLiveMic(true);
          } catch (err2) {
            console.warn('Tentativa 2 falhou, a tentar apenas áudio:', err2);
            try {
              // Attempt 3: Audio only
              stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
              const synthVideo = createSyntheticVideoTrack(myName);
              if (synthVideo) stream.addTrack(synthVideo);
              setHasLiveCamera(false);
              setHasLiveMic(true);
              warningText = 'Câmara não disponível ou permissão recusada. A chamada está ativa em modo de voz.';
            } catch (err3) {
              console.warn('Tentativa 3 falhou, a tentar apenas vídeo:', err3);
              try {
                // Attempt 4: Video only
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                const synthAudio = createSyntheticAudioTrack();
                if (synthAudio) stream.addTrack(synthAudio);
                setHasLiveCamera(true);
                setHasLiveMic(false);
                warningText = 'Microfone não disponível ou permissão recusada. O seu vídeo está ativo.';
              } catch (err4) {
                console.warn('Permissões de media negadas pelo utilizador/navegador. A usar stream sintético para permitir ligação sem encerrar:', err4);
                // Attempt 5: Full synthetic stream so connection succeeds without crashing
                stream = new MediaStream();
                const synthAudio = createSyntheticAudioTrack();
                if (synthAudio) stream.addTrack(synthAudio);
                const synthVideo = createSyntheticVideoTrack(myName);
                if (synthVideo) stream.addTrack(synthVideo);
                setHasLiveCamera(false);
                setHasLiveMic(false);
                warningText = 'Permissão de câmara e microfone em falta. Pode ver e ouvir o outro interlocutor. Para transmitir vídeo/áudio, autorize no ícone de cadeado 🔒 do navegador.';
              }
            }
          }
        }

        if (isMounted && warningText) {
          setPermissionWarning(warningText);
        }

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;
          localVideoRef.current.volume = 0;
          localVideoRef.current.play().catch(() => {});
        }

        // B. Initialize RTCPeerConnection
        const pc = new RTCPeerConnection(RTC_CONFIG);
        peerConnectionRef.current = pc;

        // C. Setup Remote Stream receiver
        const remoteStream = new MediaStream();
        remoteStreamRef.current = remoteStream;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.muted = true; // Video element is purely visual to prevent double audio / echo!
        }
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.muted = isSpeakerMuted;
          remoteAudioRef.current.volume = isSpeakerMuted ? 0 : remoteVolume;
        }

        // Handle incoming remote audio and video tracks safely
        pc.ontrack = (event) => {
          if (event.track) {
            remoteStream.addTrack(event.track);
          }
          if (event.streams && event.streams[0]) {
            event.streams[0].getTracks().forEach((track) => {
              if (!remoteStream.getTracks().some((t) => t.id === track.id)) {
                remoteStream.addTrack(track);
              }
            });
          }

          const streamToPlay = event.streams[0] || remoteStream;

          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = streamToPlay;
            remoteVideoRef.current.muted = true;
            remoteVideoRef.current.play().catch((err) => {
              console.warn('Vídeo remoto a aguardar início:', err);
            });
          }

          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = streamToPlay;
            remoteAudioRef.current.muted = isSpeakerMuted;
            remoteAudioRef.current.volume = isSpeakerMuted ? 0 : remoteVolume;
            remoteAudioRef.current.play().catch((err) => {
              console.warn('Áudio bloqueado pelo navegador (política de autoplay):', err);
              if (isMounted) {
                setIsAudioAutoplayBlocked(true);
              }
            });
          }

          if (isMounted) {
            setCallState('connected');
            setStatusMessage('Ligação WebRTC Ativa');
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'connected') {
            if (isMounted) {
              setCallState('connected');
              setStatusMessage('Ligação WebRTC Ativa');
            }
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
            if (isMounted) {
              setCallState('connected');
              setStatusMessage('Ligação WebRTC Ativa');
            }
          }
        };

        // D. Add local tracks or transceivers to PeerConnection
        const localAudio = stream.getAudioTracks()[0];
        const localVideo = stream.getVideoTracks()[0];

        if (localAudio) {
          pc.addTrack(localAudio, stream);
        } else {
          try {
            pc.addTransceiver('audio', { direction: 'recvonly' });
          } catch (e) {}
        }

        if (localVideo) {
          pc.addTrack(localVideo, stream);
        } else {
          try {
            pc.addTransceiver('video', { direction: 'recvonly' });
          } catch (e) {}
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

        // F. Buffered ICE Candidate processing (prevents dropped candidates before remoteDescription)
        const candidateQueue: RTCIceCandidateInit[] = [];
        let canAcceptCandidates = false;

        const drainCandidateQueue = async () => {
          canAcceptCandidates = true;
          while (candidateQueue.length > 0) {
            const cand = candidateQueue.shift();
            if (cand && cand.candidate) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              } catch (e) {
                console.warn('Erro ao processar candidate da fila:', e);
              }
            }
          }
        };

        const stopIceListener = listenRemoteIceCandidates(
          session.id,
          isCaller ? 'callee' : 'caller',
          async (candidateInit) => {
            if (canAcceptCandidates && pc.remoteDescription && candidateInit && candidateInit.candidate) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidateInit));
              } catch (err) {
                console.warn('Erro ao aplicar ICE candidate remoto:', err);
              }
            } else if (candidateInit && candidateInit.candidate) {
              candidateQueue.push(candidateInit);
            }
          }
        );
        cleanupListenersRef.current.push(stopIceListener);

        // G. Signaling Handshake (Offer / Answer)
        if (isCaller) {
          // Caller generates SDP Offer
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await pc.setLocalDescription(offer);

          await updateCallSessionInFirebase(session.id, {
            offer: { type: 'offer', sdp: offer.sdp || '' },
          });

          // Caller listens for Callee Answer
          const stopSessionListener = listenCallSessionInFirebase(session.id, async (updatedCall) => {
            if (!updatedCall || !isMounted) return;

            if (updatedCall.status === 'accepted' && updatedCall.answer) {
              ringtone.stopRinging();
              setCallState('connected');
              setStatusMessage('Chamada Aceite! Ligação Conectada.');
              try {
                if (pc.signalingState === 'have-local-offer') {
                  await pc.setRemoteDescription(new RTCSessionDescription(updatedCall.answer));
                  await drainCandidateQueue();
                }
              } catch (sdpErr) {
                console.warn('Erro ao processar resposta do callee:', sdpErr);
              }
            } else if (updatedCall.status === 'declined') {
              ringtone.stopRinging();
              setCallState('ended');
              setStatusMessage('A chamada foi recusada pelo destinatário.');
            } else if (updatedCall.status === 'missed') {
              ringtone.stopRinging();
              setCallState('missed');
              setStatusMessage('Chamada não atendida: tempo limite de 16 segundos esgotado.');
            } else if (updatedCall.status === 'ended') {
              ringtone.stopRinging();
              setCallState('ended');
              setStatusMessage('A chamada terminou.');
            }
          });
          cleanupListenersRef.current.push(stopSessionListener);
        } else {
          // Callee receives Offer and generates SDP Answer (with dynamic arrival support)
          let answered = false;

          const answerOffer = async (offerData: { type: RTCSdpType; sdp: string }) => {
            if (answered) return;
            answered = true;
            try {
              if (pc.signalingState === 'stable') {
                await pc.setRemoteDescription(new RTCSessionDescription(offerData));
                await drainCandidateQueue();

                const answer = await pc.createAnswer({
                  offerToReceiveAudio: true,
                  offerToReceiveVideo: true,
                });
                await pc.setLocalDescription(answer);

                await updateCallSessionInFirebase(session.id, {
                  status: 'accepted',
                  answer: { type: 'answer', sdp: answer.sdp || '' },
                });

                if (isMounted) {
                  setCallState('connected');
                  setStatusMessage('Ligação WebRTC Estabelecida');
                }
              }
            } catch (err: any) {
              console.error('Erro ao responder à oferta WebRTC:', err);
            }
          };

          if (session.offer) {
            await answerOffer(session.offer);
          }

          // Callee listens for incoming offer (if not present on click) and call termination
          const stopSessionListener = listenCallSessionInFirebase(session.id, async (updatedCall) => {
            if (!updatedCall || !isMounted) return;

            if (!answered && updatedCall.offer) {
              await answerOffer(updatedCall.offer);
            }

            if (updatedCall.status === 'ended') {
              ringtone.stopRinging();
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

  // Request Live Camera and Microphone permissions interactively if denied initially
  const requestLiveMedia = async () => {
    setIsRetryingPermissions(true);
    let liveStream: MediaStream | null = null;
    let cameraAcquired = false;
    let micAcquired = false;

    try {
      try {
        liveStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
          },
        });
        cameraAcquired = true;
        micAcquired = true;
      } catch (err1) {
        // Fallback 1: Basic video + audio
        try {
          liveStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          cameraAcquired = true;
          micAcquired = true;
        } catch (err2) {
          // Fallback 2: Audio only
          try {
            liveStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            micAcquired = true;
          } catch (err3) {
            // Fallback 3: Video only
            try {
              liveStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
              cameraAcquired = true;
            } catch (err4) {
              throw err4;
            }
          }
        }
      }

      if (liveStream && peerConnectionRef.current) {
        const senders = peerConnectionRef.current.getSenders();
        const videoTrack = liveStream.getVideoTracks()[0];
        const audioTrack = liveStream.getAudioTracks()[0];

        if (videoTrack) {
          const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
          if (videoSender) {
            await videoSender.replaceTrack(videoTrack);
          } else {
            peerConnectionRef.current.addTrack(videoTrack, liveStream);
          }
          setHasLiveCamera(true);
        }

        if (audioTrack) {
          const audioSender = senders.find((s) => s.track && s.track.kind === 'audio');
          if (audioSender) {
            await audioSender.replaceTrack(audioTrack);
          } else {
            peerConnectionRef.current.addTrack(audioTrack, liveStream);
          }
          setHasLiveMic(true);
        }

        // Update local preview
        localStreamRef.current = liveStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = liveStream;
          localVideoRef.current.play().catch(() => {});
        }

        if (cameraAcquired && micAcquired) {
          setPermissionWarning(null);
        } else if (micAcquired) {
          setPermissionWarning('Microfone ativo em direto! A câmara permanece desligada.');
        } else if (cameraAcquired) {
          setPermissionWarning('Câmara ativa em direto! O microfone permanece desligado.');
        }
      }
    } catch (err: any) {
      alert(
        `Permissão bloqueada no navegador: ${err.message}.\n\nPara desbloquear:\n1. Clica no ícone de cadeado 🔒 na barra de navegação;\n2. Altera "Câmara" e "Microfone" para "Permitir";\n3. Clica novamente em "Ativar Agora".`
      );
    } finally {
      setIsRetryingPermissions(false);
    }
  };

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
          muted
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            callState === 'connected' ? 'opacity-100' : 'opacity-20'
          }`}
        />
        {/* Dedicated Remote Audio Playback Element */}
        <audio
          ref={remoteAudioRef}
          autoPlay
          playsInline
          className="hidden"
        />

        {/* Browser Autoplay Blocked Banner */}
        {isAudioAutoplayBlocked && (
          <div className="absolute top-20 left-4 right-4 sm:left-auto sm:right-6 z-50 p-4 rounded-2xl bg-indigo-600/95 text-white backdrop-blur-md shadow-2xl border border-indigo-400/40 flex items-center justify-between gap-3 text-xs animate-bounce">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <span className="font-bold block">Áudio em espera:</span>
                <span className="text-[11px] text-indigo-100">
                  O navegador requer um clique para autorizar a saída de som.
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                if (remoteAudioRef.current) {
                  remoteAudioRef.current
                    .play()
                    .then(() => setIsAudioAutoplayBlocked(false))
                    .catch(() => {});
                }
              }}
              className="px-4 py-2 rounded-xl bg-white text-indigo-800 font-bold text-xs shrink-0 hover:bg-slate-100 shadow-md transition active:scale-95"
            >
              Ativar Som Agora 🔊
            </button>
          </div>
        )}

        {/* Permission Warning Banner (if camera or mic was denied or not found) */}
        {permissionWarning && (
          <div className="absolute top-4 left-4 right-4 sm:left-6 sm:right-6 z-40 p-3.5 sm:p-4 rounded-2xl bg-amber-500/90 dark:bg-amber-950/90 text-amber-950 dark:text-amber-100 backdrop-blur-md border border-amber-400/50 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in">
            <div className="flex items-start sm:items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-900 dark:text-amber-300 shrink-0 mt-0.5 sm:mt-0" />
              <div className="space-y-0.5">
                <span className="font-bold block">Aviso de Dispositivos / Permissão:</span>
                <span className="font-medium leading-relaxed opacity-95">{permissionWarning}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={requestLiveMedia}
              disabled={isRetryingPermissions}
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs shrink-0 transition active:scale-95 shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isRetryingPermissions ? 'A verificar...' : 'Ativar Agora (Tentar Novamente)'}</span>
            </button>
          </div>
        )}

        {/* Overlay when Call is Ringing / Awaiting 16-Second Answer */}
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
                O destinatário tem <span className="font-bold text-amber-300">16 segundos</span> para aceitar.
              </p>
            </div>

            {/* 16-second countdown timer for the caller */}
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
          {(isVideoDisabled || !hasLiveCamera) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 text-xs text-center p-2">
              <VideoOff className="w-5 h-5 mb-1 text-purple-400" />
              <span className="text-[10px]">
                {!hasLiveCamera ? 'Sem câmara / permissão' : 'Câmara desligada'}
              </span>
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

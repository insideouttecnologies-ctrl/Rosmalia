import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Video,
  PhoneCall,
  User,
  ShieldCheck,
  Sparkles,
  Clock,
  Copy,
  Check,
  KeyRound,
  LogIn,
  Camera,
  Mic,
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { WebRTCCallSession, User as AppUser } from '../types';
import {
  createCallSessionInFirebase,
  findActiveRoomCall,
  updateCallSessionInFirebase,
} from '../services/webrtcService';

interface StartVideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCallInitiated: (session: WebRTCCallSession) => void;
  onJoinCall?: (session: WebRTCCallSession) => void;
  onOpenAuth?: () => void;
}

export const StartVideoCallModal: React.FC<StartVideoCallModalProps> = ({
  isOpen,
  onClose,
  onCallInitiated,
  onJoinCall,
  onOpenAuth,
}) => {
  const { currentUser, users } = useBlog();

  const [activeTab, setActiveTab] = useState<'members' | 'room' | 'test'>('members');
  const [customRoomCode, setCustomRoomCode] = useState(
    () => `LUME-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [joinRoomInput, setJoinRoomInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Camera & Mic Test States
  const [isTestingMedia, setIsTestingMedia] = useState(false);
  const [testMediaStatus, setTestMediaStatus] = useState<string | null>(null);
  const [testPermissionDenied, setTestPermissionDenied] = useState(false);
  const testVideoRef = useRef<HTMLVideoElement | null>(null);
  const testStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (testStreamRef.current) {
        testStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  if (!isOpen) return null;

  // Curate selectable users: make sure Mariana Costa and available users are visible
  const studentUser: AppUser = {
    id: 'user-mariana-costa',
    name: 'Mariana Costa (Finalista 13º Ano)',
    email: 'mariana.costa.gestao@gmail.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80',
    bio: 'Estudante do 13º ano de Gestão Empresarial | Administradora',
    createdAt: '2026',
    savedPostIds: [],
    likedPostIds: [],
    readHistoryIds: [],
  };

  const otherUsers: AppUser[] = (users || []).filter(
    (u: AppUser) => u.id !== currentUser?.id && u.email !== currentUser?.email
  );

  const displayUsers =
    otherUsers.length > 0
      ? otherUsers
      : currentUser?.id === studentUser.id
      ? [
          {
            id: 'user-visitor-simulated',
            name: 'Visitante / Leitor Lume',
            email: 'leitor@lume.pt',
            role: 'reader',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
            bio: 'Visitante do blog',
            createdAt: '2026',
            savedPostIds: [],
            likedPostIds: [],
            readHistoryIds: [],
          } as AppUser,
        ]
      : [studentUser];

  const startCallWithUser = async (targetUser: AppUser) => {
    setIsCalling(true);
    try {
      const callerId = currentUser?.id || `guest-${Date.now()}`;
      const callerName = currentUser?.name || 'Visitante Lume';
      const callerAvatar =
        currentUser?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

      const callId = `call-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const now = Date.now();

      const newSession: WebRTCCallSession = {
        id: callId,
        callerId,
        callerName,
        callerAvatar,
        calleeId: targetUser.id,
        calleeName: targetUser.name,
        calleeAvatar: targetUser.avatar,
        status: 'ringing',
        createdAt: now,
        expiresAt: now + 16000, // 16-second rule
      };

      await createCallSessionInFirebase(newSession);
      onCallInitiated(newSession);
      onClose();
    } catch (err: any) {
      alert(`Falha ao iniciar chamada WebRTC: ${err.message}`);
    } finally {
      setIsCalling(false);
    }
  };

  const startSimulationCall = async () => {
    setIsCalling(true);
    try {
      const callerId = currentUser?.id || `guest-${Date.now()}`;
      const callerName = currentUser?.name || 'Visitante Lume';
      const callerAvatar =
        currentUser?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

      const callId = `call-simulated-${Date.now()}`;
      const now = Date.now();

      const newSession: WebRTCCallSession = {
        id: callId,
        callerId,
        callerName,
        callerAvatar,
        calleeId: 'user-simulated-mariana',
        calleeName: 'Mariana Costa (Modo Demonstração)',
        calleeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80',
        status: 'ringing',
        isSimulation: true,
        createdAt: now,
        expiresAt: now + 16000,
      };

      await createCallSessionInFirebase(newSession);
      onCallInitiated(newSession);
      onClose();
    } catch (err: any) {
      alert(`Falha ao iniciar teste de chamada: ${err.message}`);
    } finally {
      setIsCalling(false);
    }
  };

  const simulateIncomingCall = async () => {
    try {
      const now = Date.now();
      const callId = `call-inbound-sim-${now}`;
      const targetId = currentUser?.id || 'guest-user';
      const newSession: WebRTCCallSession = {
        id: callId,
        callerId: 'user-mentor-sim',
        callerName: 'Prof. António Carvalho (Orientador PAP)',
        callerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
        calleeId: targetId,
        calleeName: currentUser?.name || 'Utilizador',
        calleeAvatar: currentUser?.avatar,
        status: 'ringing',
        isSimulation: true,
        createdAt: now,
        expiresAt: now + 16000,
      };

      await createCallSessionInFirebase(newSession);
      onClose();
    } catch (err: any) {
      alert(`Erro ao simular chamada a receber: ${err.message}`);
    }
  };

  const startCallWithRoomCode = async () => {
    if (!customRoomCode.trim()) return;

    setIsCalling(true);
    try {
      const callerId = currentUser?.id || `guest-${Date.now()}`;
      const callerName = currentUser?.name || 'Mariana Costa';
      const callerAvatar =
        currentUser?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

      const cleanCode = customRoomCode.trim().toUpperCase();
      const callId = `call-room-${cleanCode}`;
      const now = Date.now();

      const newSession: WebRTCCallSession = {
        id: callId,
        callerId,
        callerName,
        callerAvatar,
        calleeId: cleanCode,
        calleeName: `Sala ${cleanCode}`,
        roomCode: cleanCode,
        status: 'ringing',
        createdAt: now,
        expiresAt: now + 60000, // Generous 60s window for room codes so friend can paste the code
      };

      await createCallSessionInFirebase(newSession);
      onCallInitiated(newSession);
      onClose();
    } catch (err: any) {
      alert(`Falha ao iniciar sala WebRTC: ${err.message}`);
    } finally {
      setIsCalling(false);
    }
  };

  const handleJoinExistingRoom = async () => {
    const cleanCode = joinRoomInput.trim().toUpperCase();
    if (!cleanCode) {
      setJoinError('Por favor insira o código da sala (ex: LUME-123456).');
      return;
    }

    setIsJoining(true);
    setJoinError(null);
    try {
      const foundSession = await findActiveRoomCall(cleanCode);
      if (!foundSession) {
        setJoinError(`Nenhuma sala ativa encontrada com o código "${cleanCode}". Verifique se o anfitrião já iniciou a chamada.`);
        return;
      }

      const calleeId = currentUser?.id || `guest-${Date.now()}`;
      const calleeName = currentUser?.name || 'Participante WebRTC';
      const calleeAvatar =
        currentUser?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

      await updateCallSessionInFirebase(foundSession.id, {
        calleeId,
        calleeName,
        calleeAvatar,
      });

      foundSession.calleeId = calleeId;
      foundSession.calleeName = calleeName;
      foundSession.calleeAvatar = calleeAvatar;

      if (onJoinCall) {
        onJoinCall(foundSession);
      } else {
        onCallInitiated(foundSession);
      }
      onClose();
    } catch (err: any) {
      setJoinError(`Erro ao entrar na sala: ${err.message}`);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(customRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartMediaTest = async () => {
    setIsTestingMedia(true);
    setTestPermissionDenied(false);
    setTestMediaStatus('A aceder à câmara e microfone...');

    if (testStreamRef.current) {
      testStreamRef.current.getTracks().forEach((t) => t.stop());
      testStreamRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      testStreamRef.current = stream;
      if (testVideoRef.current) {
        testVideoRef.current.srcObject = stream;
        testVideoRef.current.muted = true;
        await testVideoRef.current.play();
      }
      setTestMediaStatus('✅ Câmara e Microfone ativos com sucesso! O teu dispositivo está pronto para chamadas.');
    } catch (err: any) {
      console.warn('Erro no teste de câmara:', err);
      setTestPermissionDenied(true);
      setTestMediaStatus(`⚠️ Permissão recusada (${err.name || err.message}). O sistema ativará modo de proteção com áudio e avatar dinâmico.`);
    }
  };

  const handleStopMediaTest = () => {
    if (testStreamRef.current) {
      testStreamRef.current.getTracks().forEach((t) => t.stop());
      testStreamRef.current = null;
    }
    if (testVideoRef.current) {
      testVideoRef.current.srcObject = null;
    }
    setIsTestingMedia(false);
    setTestMediaStatus(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#161324] rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-900/50 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-purple-950/60 bg-slate-50/50 dark:bg-[#1c182d]/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Vídeo Chamada WebRTC (1-para-1)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ligação direta ponto-a-ponto com temporizador de 16 segundos.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleStopMediaTest();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 16-Seconds Highlight Banner */}
        <div className="mx-6 mt-6 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Regra dos 16 Segundos:</p>
            <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
              O destinatário tem <strong>16 segundos</strong> para aceitar ou recusar com toque sonoro e aviso no ecrã.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-4 flex items-center gap-2 border-b border-slate-100 dark:border-purple-950/40">
          <button
            onClick={() => {
              handleStopMediaTest();
              setActiveTab('members');
            }}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'members'
                ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Membros & Mariana</span>
          </button>
          <button
            onClick={() => {
              handleStopMediaTest();
              setActiveTab('room');
            }}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'room'
                ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Código de Sala</span>
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'test'
                ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Testar Câmara</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {/* TAB 1: Members */}
          {activeTab === 'members' && (
            <div className="space-y-3">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Ligar diretamente a um contacto:
              </span>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {displayUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-purple-950/60 flex items-center justify-between gap-3 hover:border-purple-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-300 dark:ring-purple-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {user.name}
                          </span>
                          {user.role === 'admin' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#7C3AED]/20 text-[#7C3AED] dark:text-purple-300">
                              Admin
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 truncate block max-w-[190px]">
                          {user.email}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => startCallWithUser(user)}
                      disabled={isCalling}
                      className="px-3.5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-xs transition active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Ligar</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Quick Simulation & Testing Actions */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-purple-500/10 border border-purple-200 dark:border-purple-900/40 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#7C3AED] dark:text-purple-300" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Testar Chamada Agora (Demonstração & Loopback)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Permite testar o vídeo, áudio, temporizador de 16 segundos e controlos mesmo sem outro utilizador online.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={startSimulationCall}
                    disabled={isCalling}
                    className="px-3 py-2 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-[#7C3AED] dark:text-purple-300 hover:bg-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Ligar a Mariana (Demo)</span>
                  </button>
                  <button
                    type="button"
                    onClick={simulateIncomingCall}
                    className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Simular Toque 16s</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Room Code (Create or Join) */}
          {activeTab === 'room' && (
            <div className="space-y-5">
              {/* Option A: Create a Room */}
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 space-y-3">
                <span className="block text-xs font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wider">
                  Opção 1: Criar Nova Sala & Partilhar
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customRoomCode}
                    onChange={(e) => setCustomRoomCode(e.target.value.toUpperCase())}
                    placeholder="LUME-XXXXXX"
                    className="flex-1 px-3.5 py-2 text-sm font-mono font-bold uppercase bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-900 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-3.5 py-2 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#7C3AED] dark:text-purple-300 hover:bg-purple-200 font-bold text-xs flex items-center gap-1.5 transition shrink-0"
                    title="Copiar código para partilhar"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={startCallWithRoomCode}
                  disabled={isCalling || !customRoomCode.trim()}
                  className="w-full py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Video className="w-4 h-4" />
                  <span>{isCalling ? 'A Iniciar Sala...' : 'Iniciar Chamada Nesta Sala'}</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                <span className="bg-white dark:bg-[#161324] px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  Ou
                </span>
              </div>

              {/* Option B: Join an Existing Room */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Opção 2: Entrar numa Sala Existente
                </span>
                <input
                  type="text"
                  value={joinRoomInput}
                  onChange={(e) => {
                    setJoinRoomInput(e.target.value.toUpperCase());
                    setJoinError(null);
                  }}
                  placeholder="Inserir código (ex: LUME-123456)"
                  className="w-full px-3.5 py-2 text-sm font-mono font-bold uppercase bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />

                {joinError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{joinError}</span>
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleJoinExistingRoom}
                  disabled={isJoining || !joinRoomInput.trim()}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-purple-600 dark:hover:bg-purple-700 text-white text-xs font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isJoining ? 'A Conectar...' : 'Entrar na Sala'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Media Test & Diagnostic */}
          {activeTab === 'test' && (
            <div className="space-y-4 text-center">
              <div className="relative mx-auto w-full h-44 rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-purple-500/30">
                <video
                  ref={testVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isTestingMedia && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2 p-4">
                    <Camera className="w-8 h-8 opacity-60" />
                    <p className="text-xs">Clica no botão abaixo para verificar a tua câmara e microfone em direto.</p>
                  </div>
                )}
              </div>

              {testMediaStatus && (
                <div
                  className={`p-3 rounded-xl text-xs text-left leading-relaxed ${
                    testPermissionDenied
                      ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                  }`}
                >
                  <p className="font-semibold">{testMediaStatus}</p>
                  {testPermissionDenied && (
                    <div className="mt-2 text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                      <p><strong>Como desbloquear no navegador:</strong></p>
                      <p>1. Clica no ícone de 🔒 na barra de endereços (ao lado do URL);</p>
                      <p>2. Altera "Câmara" e "Microfone" para "Permitir";</p>
                      <p>3. Recarrega a página.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {!isTestingMedia ? (
                  <button
                    type="button"
                    onClick={handleStartMediaTest}
                    className="flex-1 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-4 h-4" />
                    <span>Iniciar Teste de Câmara</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopMediaTest}
                    className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Parar Teste</span>
                  </button>
                )}
              </div>

              {/* Instant Call Simulation Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-purple-950/60 flex gap-2">
                <button
                  type="button"
                  onClick={startSimulationCall}
                  className="flex-1 py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-[#7C3AED] dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 transition"
                >
                  Demonstração em Direto (Com Mariana)
                </button>
                <button
                  type="button"
                  onClick={simulateIncomingCall}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition"
                >
                  Testar Chamada a Receber (16s)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
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
  KeyRound
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { WebRTCCallSession, User as AppUser } from '../types';
import { createCallSessionInFirebase } from '../services/webrtcService';

interface StartVideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCallInitiated: (session: WebRTCCallSession) => void;
  onOpenAuth?: () => void;
}

export const StartVideoCallModal: React.FC<StartVideoCallModalProps> = ({
  isOpen,
  onClose,
  onCallInitiated,
  onOpenAuth,
}) => {
  const { currentUser, users } = useBlog();

  const [activeTab, setActiveTab] = useState<'members' | 'room'>('members');
  const [customRoomCode, setCustomRoomCode] = useState(
    () => `LUME-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [targetEmail, setTargetEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  if (!isOpen) return null;

  // Filter available other members to call
  const otherUsers: AppUser[] = (users || []).filter(
    (u: AppUser) => u.id !== currentUser?.id && u.email !== currentUser?.email
  );

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
        expiresAt: now + 8000, // 8-second acceptance countdown rule
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

  const startCallWithRoomCode = async () => {
    if (!customRoomCode.trim()) return;

    setIsCalling(true);
    try {
      const callerId = currentUser?.id || `guest-${Date.now()}`;
      const callerName = currentUser?.name || 'Membro Lume';
      const callerAvatar =
        currentUser?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

      const callId = `call-room-${customRoomCode.trim().toUpperCase()}`;
      const now = Date.now();

      const newSession: WebRTCCallSession = {
        id: callId,
        callerId,
        callerName,
        callerAvatar,
        calleeId: customRoomCode.trim().toUpperCase(),
        calleeName: `Sala ${customRoomCode.trim().toUpperCase()}`,
        roomCode: customRoomCode.trim().toUpperCase(),
        status: 'ringing',
        createdAt: now,
        expiresAt: now + 8000,
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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(customRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                Ligação direta P2P. A outra pessoa tem 8 segundos para aceitar.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 8-Seconds Highlight Banner */}
        <div className="mx-6 mt-6 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Regra dos 8 Segundos:</p>
            <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
              Ao iniciar a chamada, o destinatário recebe um aviso sonoro e visual com um temporizador de <strong>8 segundos</strong> para aceitar ou recusar.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-4 flex items-center gap-2 border-b border-slate-100 dark:border-purple-950/40">
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'members'
                ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Membros & Administrador</span>
          </button>
          <button
            onClick={() => setActiveTab('room')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'room'
                ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Código de Sala Direto</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {activeTab === 'members' && (
            <div className="space-y-3">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Selecionar pessoa para ligar:
              </span>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {otherUsers.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center space-y-2 text-xs text-slate-500">
                    <p>Podes utilizar a aba "Código de Sala Direto" para ligar para outra aba ou dispositivo.</p>
                  </div>
                ) : (
                  otherUsers.map((user) => (
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
                          <span className="text-[11px] text-slate-400 truncate block max-w-[180px]">
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
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'room' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Código de Sala P2P (WebRTC)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customRoomCode}
                    onChange={(e) => setCustomRoomCode(e.target.value.toUpperCase())}
                    placeholder="LUME-XXXXXX"
                    className="flex-1 px-3.5 py-2.5 text-sm font-mono font-bold uppercase bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-purple-950/60 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-3.5 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 hover:bg-purple-100 font-bold text-xs flex items-center gap-1.5 transition shrink-0"
                    title="Copiar código para partilhar"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Partilhe este código com outra pessoa ou abra numa segunda janela anónima para testar a chamada entre duas pessoas.
                </p>
              </div>

              <button
                type="button"
                onClick={startCallWithRoomCode}
                disabled={isCalling || !customRoomCode.trim()}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white text-sm font-bold shadow-lg transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Video className="w-4 h-4" />
                <span>{isCalling ? 'A Iniciar Ligação...' : 'Ligar com Este Código'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

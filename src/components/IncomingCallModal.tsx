import React, { useEffect, useState } from 'react';
import { Video, PhoneOff, User, Sparkles, Clock } from 'lucide-react';
import { WebRTCCallSession } from '../types';
import { updateCallSessionInFirebase, ringtone } from '../services/webrtcService';

interface IncomingCallModalProps {
  call: WebRTCCallSession;
  onAccept: (call: WebRTCCallSession) => void;
  onDecline: (call: WebRTCCallSession) => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  call,
  onAccept,
  onDecline,
}) => {
  // Exactly 8 seconds countdown requirement
  const [secondsRemaining, setSecondsRemaining] = useState(8);

  useEffect(() => {
    // Start pleasant ringtone
    ringtone.startRinging();

    // Calculate actual remaining seconds based on expiresAt or fixed 8 seconds
    const startTime = Date.now();
    const duration = 8000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const leftMs = Math.max(0, duration - elapsed);
      const secs = Math.ceil(leftMs / 1000);
      setSecondsRemaining(secs);

      if (leftMs <= 0) {
        clearInterval(interval);
        ringtone.stopRinging();
        // Time expired! Mark call as missed and close
        updateCallSessionInFirebase(call.id, { status: 'missed' });
        onDecline(call);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      ringtone.stopRinging();
    };
  }, [call.id]);

  const handleAcceptClick = () => {
    ringtone.stopRinging();
    onAccept(call);
  };

  const handleDeclineClick = () => {
    ringtone.stopRinging();
    updateCallSessionInFirebase(call.id, { status: 'declined' });
    onDecline(call);
  };

  const percentProgress = ((8 - secondsRemaining) / 8) * 100;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-sm bg-white dark:bg-[#161324] rounded-3xl shadow-2xl border-2 border-purple-500/40 p-6 text-center space-y-6 overflow-hidden">
        {/* Animated Top Pulse Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Chamada de Vídeo WebRTC a Entrar</span>
        </div>

        {/* Caller Avatar with Radial Waves */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
          <div className="absolute -inset-2 rounded-full bg-purple-500/10 animate-pulse" />
          <img
            src={
              call.callerAvatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
            }
            alt={call.callerName}
            referrerPolicy="no-referrer"
            className="w-24 h-24 rounded-full object-cover ring-4 ring-[#7C3AED] shadow-xl relative z-10"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80';
            }}
          />
        </div>

        {/* Caller Info */}
        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {call.callerName || 'Membro do Lume'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            A ligar por vídeo peer-to-peer (WebRTC direto)
          </p>
        </div>

        {/* 8-Seconds Countdown Display */}
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>Tempo para atender:</span>
            </span>
            <span className="text-base font-black px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100">
              {secondsRemaining}s
            </span>
          </div>

          {/* Progress countdown bar */}
          <div className="w-full h-2 rounded-full bg-amber-200/60 dark:bg-amber-900/40 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-200 ease-linear"
              style={{ width: `${100 - percentProgress}%` }}
            />
          </div>

          <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
            Tem 8 segundos para aceitar a chamada antes de expirar.
          </p>
        </div>

        {/* Action Buttons: Accept & Decline */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Decline Button */}
          <button
            onClick={handleDeclineClick}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/70 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-200 text-xs sm:text-sm font-bold transition active:scale-95"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Recusar</span>
          </button>

          {/* Accept Button */}
          <button
            onClick={handleAcceptClick}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/40 transition active:scale-95 animate-pulse"
          >
            <Video className="w-4 h-4" />
            <span>Aceitar ({secondsRemaining}s)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

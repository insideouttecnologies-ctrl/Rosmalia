import { ref, set, get, update, onValue, off, push } from 'firebase/database';
import { rtdb } from './firebase';
import { WebRTCCallSession } from '../types';

export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

/**
 * Creates a new WebRTC Call in Firebase Realtime Database
 */
export const createCallSessionInFirebase = async (session: WebRTCCallSession): Promise<void> => {
  try {
    const callRef = ref(rtdb, `calls/${session.id}`);
    await set(callRef, session);
  } catch (error) {
    console.error('Erro ao criar sessão de chamada WebRTC no Firebase:', error);
    throw error;
  }
};

/**
 * Updates call status or properties
 */
export const updateCallSessionInFirebase = async (
  callId: string,
  updates: Partial<WebRTCCallSession>
): Promise<void> => {
  try {
    const callRef = ref(rtdb, `calls/${callId}`);
    await update(callRef, updates);
  } catch (error) {
    console.error(`Erro ao atualizar chamada ${callId}:`, error);
  }
};

/**
 * Listens to a specific call's state
 */
export const listenCallSessionInFirebase = (
  callId: string,
  callback: (call: WebRTCCallSession | null) => void
): (() => void) => {
  const callRef = ref(rtdb, `calls/${callId}`);
  const listener = onValue(callRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });

  return () => {
    off(callRef, 'value', listener);
  };
};

/**
 * Listens for incoming calls targeted at a specific user (by ID or Email) or matching room code
 */
export const listenIncomingCallsForUser = (
  userId: string,
  userEmail: string,
  callback: (call: WebRTCCallSession | null) => void
): (() => void) => {
  const callsRef = ref(rtdb, 'calls');
  const now = Date.now();

  const listener = onValue(callsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    const allCalls: Record<string, WebRTCCallSession> = snapshot.val();
    const activeIncoming = Object.values(allCalls).find((call) => {
      // Must be ringing status
      if (call.status !== 'ringing') return false;
      // Must not be expired (within 8 seconds threshold + 2s buffer)
      if (call.expiresAt && Date.now() > call.expiresAt + 2000) return false;
      // Target matches this user
      const matchesCallee =
        (call.calleeId && call.calleeId === userId) ||
        (call.calleeId && call.calleeId.toLowerCase() === userEmail.toLowerCase()) ||
        (call.calleeName && call.calleeName.toLowerCase() === userEmail.toLowerCase());

      // Caller cannot call oneself
      const isNotSelf = call.callerId !== userId && call.callerId !== userEmail;

      return matchesCallee && isNotSelf;
    });

    callback(activeIncoming || null);
  });

  return () => {
    off(callsRef, 'value', listener);
  };
};

/**
 * Adds an ICE Candidate from Caller or Callee
 */
export const addIceCandidateInFirebase = async (
  callId: string,
  role: 'caller' | 'callee',
  candidate: RTCIceCandidateInit
): Promise<void> => {
  try {
    const candidatePath = role === 'caller' ? `calls/${callId}/callerCandidates` : `calls/${callId}/calleeCandidates`;
    const candidatesRef = ref(rtdb, candidatePath);
    const newCandRef = push(candidatesRef);
    await set(newCandRef, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex,
    });
  } catch (error) {
    console.error('Erro ao adicionar ICE candidate:', error);
  }
};

/**
 * Listens for ICE candidates from the remote peer
 */
export const listenRemoteIceCandidates = (
  callId: string,
  remoteRole: 'caller' | 'callee',
  onCandidate: (candidate: RTCIceCandidateInit) => void
): (() => void) => {
  const candidatePath = remoteRole === 'caller' ? `calls/${callId}/callerCandidates` : `calls/${callId}/calleeCandidates`;
  const candidatesRef = ref(rtdb, candidatePath);

  const seenIds = new Set<string>();

  const listener = onValue(candidatesRef, (snapshot) => {
    if (!snapshot.exists()) return;
    const candidatesObj = snapshot.val();
    Object.entries(candidatesObj).forEach(([id, data]: [string, any]) => {
      if (!seenIds.has(id) && data.candidate) {
        seenIds.add(id);
        onCandidate(data);
      }
    });
  });

  return () => {
    off(candidatesRef, 'value', listener);
  };
};

/**
 * Simple Synthesized Ringtone using Web Audio API
 */
class RingtonePlayer {
  private audioCtx: AudioContext | null = null;
  private intervalId: any = null;
  private isPlaying = false;

  startRinging() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      this.audioCtx = new AudioCtxClass();

      const playBeep = () => {
        if (!this.audioCtx || this.audioCtx.state === 'closed') return;
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }

        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(440, this.audioCtx.currentTime); // A4
        osc2.frequency.setValueAtTime(480, this.audioCtx.currentTime);

        gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(this.audioCtx.currentTime + 1.2);
        osc2.stop(this.audioCtx.currentTime + 1.2);
      };

      playBeep();
      this.intervalId = setInterval(playBeep, 2400);
    } catch (e) {
      console.warn('AudioContext ringtone warning:', e);
    }
  }

  stopRinging() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }
}

export const ringtone = new RingtonePlayer();

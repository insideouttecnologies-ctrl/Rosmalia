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
    { urls: 'stun:global.stun.twilio.com:3478' },
    { urls: 'stun:stun.services.mozilla.com' },
  ],
  iceCandidatePoolSize: 10,
};

/**
 * Validates and safely passes SDP without risky regex mutations that corrupt SDP formats
 */
export const optimizeSdpForVoice = (sdp: string): string => {
  if (!sdp) return '';
  return sdp;
};

export const getBrowserTabId = (): string => {
  if (typeof window === 'undefined') return 'server-tab';
  try {
    let tabId = sessionStorage.getItem('lume_webrtc_tab_id');
    if (!tabId) {
      tabId = `tab-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      sessionStorage.setItem('lume_webrtc_tab_id', tabId);
    }
    return tabId;
  } catch (e) {
    return `tab-${Math.random().toString(36).substring(2, 8)}`;
  }
};

/**
 * Creates a new WebRTC Call in Firebase Realtime Database
 */
export const createCallSessionInFirebase = async (session: WebRTCCallSession): Promise<void> => {
  try {
    const finalSession = {
      ...session,
      callerTabId: session.callerTabId || getBrowserTabId(),
    };
    const callRef = ref(rtdb, `calls/${session.id}`);
    await set(callRef, finalSession);
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
 * Gets a specific call session by ID from Firebase
 */
export const getCallSessionFromFirebase = async (callId: string): Promise<WebRTCCallSession | null> => {
  try {
    const callRef = ref(rtdb, `calls/${callId}`);
    const snapshot = await get(callRef);
    if (snapshot.exists()) {
      return snapshot.val() as WebRTCCallSession;
    }
    return null;
  } catch (error) {
    console.error(`Erro ao obter sessão ${callId}:`, error);
    return null;
  }
};

/**
 * Finds an active call by Room Code
 */
export const findActiveRoomCall = async (roomCode: string): Promise<WebRTCCallSession | null> => {
  try {
    const code = roomCode.trim().toUpperCase();
    // 1. Direct key attempt
    const directSession = await getCallSessionFromFirebase(`call-room-${code}`);
    if (directSession && (directSession.status === 'ringing' || directSession.status === 'accepted')) {
      return directSession;
    }

    // 2. Scan all calls
    const callsRef = ref(rtdb, 'calls');
    const snapshot = await get(callsRef);
    if (!snapshot.exists()) return null;

    const allCalls: Record<string, WebRTCCallSession> = snapshot.val();
    const found = Object.values(allCalls).find((call) => {
      const isCodeMatch =
        (call.roomCode && call.roomCode.toUpperCase() === code) ||
        (call.calleeId && call.calleeId.toUpperCase() === code) ||
        call.id.toUpperCase() === `CALL-ROOM-${code}`;
      const isAlive = call.status === 'ringing' || call.status === 'accepted';
      return isCodeMatch && isAlive;
    });

    return found || null;
  } catch (err) {
    console.error('Erro ao procurar sala WebRTC:', err);
    return null;
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
  callbackOrTabId: string | ((call: WebRTCCallSession | null) => void),
  maybeCallback?: (call: WebRTCCallSession | null) => void
): (() => void) => {
  const currentTabId = typeof callbackOrTabId === 'string' ? callbackOrTabId : getBrowserTabId();
  const callback = typeof callbackOrTabId === 'function' ? callbackOrTabId : (maybeCallback || (() => {}));
  const callsRef = ref(rtdb, 'calls');

  const listener = onValue(callsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    const allCalls: Record<string, WebRTCCallSession> = snapshot.val();
    const activeIncoming = Object.values(allCalls).find((call) => {
      // Must be ringing status
      if (call.status !== 'ringing') return false;
      // Must not be expired (generous 15s buffer for network latency)
      if (call.expiresAt && Date.now() > call.expiresAt + 15000) return false;

      // Caller cannot ring oneself in the EXACT same tab
      if (call.callerTabId && currentTabId && call.callerTabId === currentTabId) {
        return false;
      }

      const uid = (userId || '').toLowerCase();
      const uEmail = (userEmail || '').toLowerCase();
      const calleeId = (call.calleeId || '').toLowerCase();
      const calleeName = (call.calleeName || '').toLowerCase();

      // Check if this call targets the user
      const isDirectMatch =
        (call.calleeId && call.calleeId === userId) ||
        (calleeId && calleeId === uEmail) ||
        (calleeName && calleeName === uEmail) ||
        (calleeName && calleeName === uid);

      // Check if call targets Admin/Mariana
      const isAdminMatch =
        (uid === 'user-admin-main' || uEmail === 'insideouttecnologies@gmail.com') &&
        (calleeId === 'user-admin-main' || calleeId === 'user-mariana-costa' || calleeId === 'insideouttecnologies@gmail.com');

      // Check if call targets Guest/Visitor
      const isGuestMatch =
        (uid.startsWith('guest') || uid === 'user-visitor-simulated' || uEmail.startsWith('guest')) &&
        (calleeId.startsWith('guest') || calleeId === 'user-visitor-simulated' || calleeId === 'guest-user');

      const matchesCallee = isDirectMatch || isAdminMatch || isGuestMatch;

      // Caller cannot call oneself unless in different tabs for testing
      const isNotSelf = call.callerTabId ? call.callerTabId !== currentTabId : (call.callerId !== userId && call.callerId !== userEmail);

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

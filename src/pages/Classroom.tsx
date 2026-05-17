import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    MessageSquare, Users, Loader2, Volume2, WifiOff, Signal
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { cn } from '../lib/utils';
import { socketService } from '../lib/socket';
import { api } from '../lib/api';
import Peer from 'simple-peer';

// ─── ICE Config ───────────────────────────────────────────────────────────────
// trickle: true  → faster connection, sends candidates one by one as found
// trickle: false → waits for all candidates before sending (slower, more reliable in some proxies)
// Using trickle: true here for faster real-world connections
const ICE_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Note: Add TURN server here for production to handle NAT/firewall scenarios.
        // Without TURN, connections behind strict NAT (many mobile networks) will fail.
        // Example:
        // { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' }
    ]
};

// ─── Types ───────────────────────────────────────────────────────────────────
type ConnectionStatus = 'connecting' | 'waiting' | 'connected' | 'failed';

// ─── Component ───────────────────────────────────────────────────────────────
export const Classroom = () => {
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useApp();
    const navigate = useNavigate();

    // ── State ──
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewerCount, setViewerCount] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
    const [needsInteraction, setNeedsInteraction] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // ── Refs (stable across renders, no stale closure) ──
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peersRef = useRef<Map<string, Peer.Instance>>(new Map());
    const localStreamRef = useRef<MediaStream | null>(null);
    const connectionStatusRef = useRef<ConnectionStatus>('connecting');
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const mountedRef = useRef(true); // guard against setting state after unmount

    const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
    const roomName = `live_session_${id}`;

    // ── Keep ref in sync with state ──
    useEffect(() => {
        connectionStatusRef.current = connectionStatus;
    }, [connectionStatus]);

    // ── Mount/unmount guard ──
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    // ── Live timer (only when connected) ──
    useEffect(() => {
        if (connectionStatus === 'connected') {
            timerRef.current = setInterval(() => {
                if (mountedRef.current) setElapsedSeconds(s => s + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [connectionStatus]);

    // ── Format elapsed time ──
    const formatTime = (s: number) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    // ── Sync remote video element ──
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(() => {
                if (mountedRef.current) setNeedsInteraction(true);
            });
        }
    }, [remoteStream]);

    // ── Sync local video element ──
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
            localVideoRef.current.play().catch(() => { /* muted video, safe to ignore */ });
        }
    }, [localStream]);

    // ── Destroy a single peer safely ──
    const destroyPeer = useCallback((peerId: string) => {
        const peer = peersRef.current.get(peerId);
        if (peer) {
            peer.removeAllListeners();
            try { peer.destroy(); } catch { /* already destroyed */ }
            peersRef.current.delete(peerId);
        }
    }, []);

    // ── Create peer: Teacher → initiates connection to each student ──
    const createPeer = useCallback((studentId: string, stream: MediaStream) => {
        // Destroy existing peer for this student to avoid duplicates
        destroyPeer(studentId);

        const socket = socketService.getSocket();
        const peer = new Peer({
            initiator: true,
            trickle: true,   // send candidates as they arrive (faster)
            config: ICE_CONFIG,
            stream
        });

        peer.on('signal', signal => {
            socket.emit('teacher_signal', { conversationId: roomName, studentId, signal });
        });

        peer.on('stream', (st: MediaStream) => {
            if (mountedRef.current) {
                setRemoteStream(st);
                setConnectionStatus('connected');
                setViewerCount(peersRef.current.size);
            }
        });

        peer.on('close', () => {
            peersRef.current.delete(studentId);
            if (mountedRef.current) setViewerCount(peersRef.current.size);
        });

        peer.on('error', (err: Error) => {
            console.warn(`[Classroom] Peer error (teacher→${studentId}):`, err.message);
            destroyPeer(studentId);
            if (mountedRef.current) setViewerCount(peersRef.current.size);
        });

        peersRef.current.set(studentId, peer);
        setViewerCount(peersRef.current.size);
    }, [roomName, destroyPeer]);

    // ── Add peer: Student → responds to teacher signal ──
    const addPeer = useCallback((signal: Peer.SignalData, stream: MediaStream) => {
        // Destroy existing teacher peer to avoid duplicates on reconnect
        destroyPeer('teacher');

        const socket = socketService.getSocket();
        const peer = new Peer({
            initiator: false,
            trickle: true,
            config: ICE_CONFIG,
            stream
        });

        peer.on('signal', (sig: unknown) => {
            socket.emit('student_request', {
                conversationId: roomName,
                studentId: currentUser?.id,
                signal: sig
            });
        });

        peer.on('stream', (st: MediaStream) => {
            if (mountedRef.current) {
                setRemoteStream(st);
                setConnectionStatus('connected');
            }
        });

        peer.on('close', () => {
            peersRef.current.delete('teacher');
            if (mountedRef.current) setConnectionStatus('waiting');
        });

        peer.on('error', (err: Error) => {
            console.warn('[Classroom] Peer error (student):', err.message);
            destroyPeer('teacher');
            if (mountedRef.current) setConnectionStatus('failed');
        });

        peer.signal(signal);
        peersRef.current.set('teacher', peer);
    }, [roomName, currentUser?.id, destroyPeer]);

    // ── Main initialization effect ──
    useEffect(() => {
        if (!id) return;

        const socket = socketService.getSocket();
        let stream: MediaStream | null = null;

        const init = async () => {
            // 1. Acquire media
            try {
                const constraints = isTeacher
                    ? { video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, audio: true }
                    : { audio: true, video: false };

                try {
                    stream = await navigator.mediaDevices.getUserMedia(constraints);
                } catch {
                    // Fallback to audio-only
                    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                }
            } catch {
                if (mountedRef.current) {
                    setError('لا يمكن الوصول إلى الميكروفون أو الكاميرا.\nيرجى السماح بالأذونات من إعدادات المتصفح.');
                    setLoading(false);
                }
                return;
            }

            localStreamRef.current = stream;
            if (mountedRef.current) {
                setLocalStream(stream);
                setLoading(false);
                setConnectionStatus('waiting');
            }

            // 2. Join WebRTC room
            socket.emit('join_conversation', roomName);

            // 3. Setup signaling based on role
            if (isTeacher) {
                // Teacher: respond when a student joins
                socket.on('student_joined', (data: { studentId: string }) => {
                    if (!mountedRef.current || !localStreamRef.current) return;
                    // Only create peer if we don't already have one for this student
                    if (!peersRef.current.has(data.studentId)) {
                        createPeer(data.studentId, localStreamRef.current);
                    }
                });

                // Teacher: handle ICE signal from student
                socket.on('student_request', (data: { studentId: string; signal: Peer.SignalData }) => {
                    peersRef.current.get(data.studentId)?.signal(data.signal as Peer.SignalData);
                });

                // Broadcast readiness every 5s so late-joining students can find us
                intervalRef.current = setInterval(() => {
                    socket.emit('teacher_ready', { conversationId: roomName, teacherId: currentUser?.id });
                }, 5000);

            } else {
                // Student: respond to teacher signal
                    socket.on('teacher_signal', (data: { signal: Peer.SignalData }) => {
                    if (!mountedRef.current || !localStreamRef.current) return;
                    if (!peersRef.current.has('teacher')) {
                        addPeer(data.signal, localStreamRef.current);
                    } else {
                        // Feed trickle ICE candidates to existing peer
                        peersRef.current.get('teacher')?.signal(data.signal as Peer.SignalData);
                    }
                });

                // Poll for teacher availability every 3s while not connected
                intervalRef.current = setInterval(() => {
                    if (connectionStatusRef.current !== 'connected' && mountedRef.current) {
                        socket.emit('student_joined', { conversationId: roomName, studentId: currentUser?.id });
                    }
                }, 3000);
            }
        };

        init().catch(err => {
            console.error('[Classroom] Unexpected init error:', err);
            if (mountedRef.current) {
                setError('حدث خطأ غير متوقع أثناء الاتصال.');
                setLoading(false);
            }
        });

        // ── Cleanup ──
        return () => {
            // Stop polling intervals
            if (intervalRef.current) clearInterval(intervalRef.current);

            // Remove socket listeners registered in this effect
            socket.off('student_joined');
            socket.off('student_request');
            socket.off('teacher_signal');

            // Stop all local media tracks
            stream?.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;

            // Destroy all peer connections
            peersRef.current.forEach((_, peerId) => destroyPeer(peerId));
            peersRef.current.clear();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isTeacher, currentUser?.id]);

    // ── End live session in DB when teacher leaves ──
    const endSessionInDb = useCallback(async () => {
        if (isTeacher && id) {
            try {
                await api.post(`/live/end/${id}`, {});
            } catch (e) {
                console.warn('[Classroom] Could not end session in DB:', e);
            }
        }
    }, [isTeacher, id]);

    // ── Leave handler ──
    const handleLeave = useCallback(async () => {
        // Notify server the teacher is stopping (so students see 'ended')
        if (isTeacher) {
            socketService.getSocket().emit('teacher_stopped', { conversationId: roomName });
            await endSessionInDb();
        }
        navigate(-1);
    }, [isTeacher, roomName, endSessionInDb, navigate]);

    // ── Toggle mute ──
    const toggleMute = useCallback(() => {
        if (!localStreamRef.current) return;
        setIsMuted(prev => {
            const next = !prev;
            localStreamRef.current!.getAudioTracks().forEach(t => { t.enabled = !next; });
            return next;
        });
    }, []);

    // ── Toggle camera ──
    const toggleCamera = useCallback(() => {
        if (!localStreamRef.current) return;
        setIsCameraOff(prev => {
            const next = !prev;
            localStreamRef.current!.getVideoTracks().forEach(t => { t.enabled = !next; });
            return next;
        });
    }, []);

    // ── Status badge color ──
    const statusColor = {
        connecting: 'bg-yellow-600',
        waiting: 'bg-yellow-600',
        connected: 'bg-red-600',
        failed: 'bg-slate-600',
    }[connectionStatus];

    const statusLabel = {
        connecting: 'جاري الاتصال...',
        waiting: 'انتظار الاتصال...',
        connected: 'LIVE',
        failed: 'فشل الاتصال',
    }[connectionStatus];

    // ─────────────────────────────────────────────────────────────────────────
    // Error screen
    // ─────────────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="fixed inset-0 bg-gray-950 text-white flex flex-col items-center justify-center gap-4 p-6 text-center" dir="rtl">
                <WifiOff size={52} className="text-red-500" />
                <p className="font-black text-sm uppercase tracking-widest text-red-400 whitespace-pre-line">{error}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-xs font-black uppercase rounded-lg transition-colors"
                >
                    العودة
                </button>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Main UI
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 bg-black text-white flex flex-col overflow-hidden" dir="rtl">

            {/* ── Top bar ── */}
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-gray-900/70 backdrop-blur-xl z-50 shrink-0">
                <div className="flex items-center gap-3">
                    {/* Live badge */}
                    <div className={cn(
                        'px-3 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors',
                        statusColor
                    )}>
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        {statusLabel}
                        {connectionStatus === 'connected' && (
                            <span className="ml-1 font-mono">{formatTime(elapsedSeconds)}</span>
                        )}
                    </div>

                    {/* Viewer count (teacher only) */}
                    {isTeacher && (
                        <div className="text-white/50 text-xs flex items-center gap-1">
                            <Users size={13} />
                            <span>{viewerCount}</span>
                        </div>
                    )}

                    {/* Connection quality indicator */}
                    {connectionStatus === 'connected' && (
                        <Signal size={14} className="text-emerald-400" />
                    )}
                </div>

                {/* Leave button */}
                <button
                    onClick={handleLeave}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                    title="مغادرة"
                >
                    <PhoneOff size={18} />
                </button>
            </div>

            {/* ── Video area ── */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">

                {/* Teacher: show local video (mirrored) */}
                {isTeacher && (
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-contain -scale-x-100"
                    />
                )}

                {/* Student: show remote teacher video */}
                {!isTeacher && (
                    <>
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain"
                        />

                        {/* Waiting overlay */}
                        {connectionStatus !== 'connected' && !needsInteraction && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 gap-4">
                                {connectionStatus === 'failed' ? (
                                    <>
                                        <WifiOff size={44} className="text-red-500" />
                                        <p className="text-xs font-black opacity-60 uppercase tracking-widest">
                                            فشل الاتصال بالمعلمة
                                        </p>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="text-[10px] font-black bg-red-600 text-white px-4 py-2 rounded uppercase"
                                        >
                                            إعادة المحاولة
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                                        <p className="text-xs font-black opacity-40 uppercase tracking-widest">
                                            جاري محاولة الاتصال...
                                        </p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Autoplay blocked overlay */}
                        {needsInteraction && (
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
                                <button
                                    onClick={() => {
                                        setNeedsInteraction(false);
                                        remoteVideoRef.current?.play();
                                    }}
                                    className="flex flex-col items-center gap-4 group"
                                >
                                    <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl group-hover:bg-red-700 transition-colors">
                                        <Volume2 size={32} className="text-white animate-pulse" />
                                    </div>
                                    <p className="font-black text-sm uppercase tracking-widest">
                                        انقر لتشغيل الصوت والبث
                                    </p>
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-gray-950 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                    </div>
                )}
            </div>

            {/* ── Controls bar ── */}
            <div className="h-24 bg-black/90 border-t border-white/10 flex items-center justify-center gap-6 px-4 shrink-0">

                {/* Microphone */}
                <button
                    onClick={toggleMute}
                    className={cn(
                        'w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all active:scale-95',
                        isMuted
                            ? 'bg-red-600 border-red-800 text-white'
                            : 'bg-white border-gray-200 text-black hover:bg-gray-100'
                    )}
                    title={isMuted ? 'تشغيل الميكروفون' : 'كتم الميكروفون'}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                {/* Leave */}
                <button
                    onClick={handleLeave}
                    className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center border-4 border-black transition-all active:scale-95"
                    title="مغادرة البث"
                >
                    <PhoneOff size={28} />
                </button>

                {/* Camera (teacher only) */}
                {isTeacher && (
                    <button
                        onClick={toggleCamera}
                        className={cn(
                            'w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all active:scale-95',
                            isCameraOff
                                ? 'bg-red-600 border-red-800 text-white'
                                : 'bg-white border-gray-200 text-black hover:bg-gray-100'
                        )}
                        title={isCameraOff ? 'تشغيل الكاميرا' : 'إيقاف الكاميرا'}
                    >
                        {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
                    </button>
                )}

                {/* Chat (UI placeholder — wire to chat state if needed) */}
                <button
                    className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all active:scale-95"
                    title="المحادثة"
                >
                    <MessageSquare size={24} />
                </button>
            </div>
        </div>
    );
};

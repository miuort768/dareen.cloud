/**
 * Classroom.tsx — Production-grade WebRTC Live Classroom
 *
 * Architecture:
 *  - Teacher → initiates 1 peer per student (Mesh, suitable for small groups ≤ 10)
 *  - ICE credentials fetched from server dynamically (TURN + STUN, time-limited HMAC)
 *  - Auto-reconnect on peer drop (3 retries with 5s backoff)
 *  - mountedRef guard → no setState after unmount
 *  - trickle: true for fastest ICE candidate exchange
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    MessageSquare, Users, Loader2, Volume2, WifiOff,
    Signal, SignalLow, SignalMedium, RotateCcw
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { cn } from '../lib/utils';
import { socketService } from '../lib/socket';
import { api } from '../lib/api';
import Peer from 'simple-peer';

// ─── Types ───────────────────────────────────────────────────────────────────
type ConnectionStatus = 'connecting' | 'waiting' | 'connected' | 'reconnecting' | 'failed';

interface IceServerConfig {
    iceServers: RTCIceServer[];
}

// ─── Fallback ICE config (STUN only, used if server fetch fails) ──────────────
const STUN_ONLY_CONFIG: IceServerConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ]
};

// ─── Fetch fresh ICE servers (STUN + TURN) from our backend ──────────────────
async function fetchIceConfig(): Promise<IceServerConfig> {
    try {
        const data = await api.get<IceServerConfig>('/live/turn-credentials');
        if (data?.iceServers?.length) return data;
        return STUN_ONLY_CONFIG;
    } catch {
        console.warn('[Classroom] Could not fetch TURN credentials, falling back to STUN only.');
        return STUN_ONLY_CONFIG;
    }
}

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
    const [retryCount, setRetryCount] = useState(0);

    // ── Refs ──
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peersRef = useRef<Map<string, Peer.Instance>>(new Map());
    const localStreamRef = useRef<MediaStream | null>(null);
    const connectionStatusRef = useRef<ConnectionStatus>('connecting');
    const iceConfigRef = useRef<IceServerConfig>(STUN_ONLY_CONFIG);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const mountedRef = useRef(true);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const retryCountRef = useRef(0);

    const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
    const roomName = `live_session_${id}`;
    const MAX_RETRIES = 3;

    // ── Sync connectionStatus ref ──
    useEffect(() => {
        connectionStatusRef.current = connectionStatus;
    }, [connectionStatus]);

    // ── Mount guard ──
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };
    }, []);

    // ── Live timer ──
    useEffect(() => {
        if (connectionStatus === 'connected') {
            timerRef.current = setInterval(() => {
                if (mountedRef.current) setElapsedSeconds(s => s + 1);
            }, 1000);
        } else {
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [connectionStatus]);

    const formatTime = (s: number) =>
        `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    // ── Sync video elements ──
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(() => {
                if (mountedRef.current) setNeedsInteraction(true);
            });
        }
    }, [remoteStream]);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
            localVideoRef.current.play().catch(() => { });
        }
    }, [localStream]);

    // ── Safely destroy a peer ──
    const destroyPeer = useCallback((peerId: string) => {
        const peer = peersRef.current.get(peerId);
        if (peer) {
            peer.removeAllListeners();
            try { peer.destroy(); } catch { /* already gone */ }
            peersRef.current.delete(peerId);
        }
    }, []);

    // ── Create peer (Teacher → Student) ──
    const createPeer = useCallback((studentId: string, stream: MediaStream) => {
        destroyPeer(studentId);
        const socket = socketService.getSocket();

        const peer = new Peer({
            initiator: true,
            trickle: true,
            config: iceConfigRef.current,
            stream,
        });

        peer.on('signal', signal => {
            socket.emit('teacher_signal', { conversationId: roomName, studentId, signal });
        });
        peer.on('stream', (st: MediaStream) => {
            if (!mountedRef.current) return;
            setRemoteStream(st);
            setConnectionStatus('connected');
            setViewerCount(peersRef.current.size);
            retryCountRef.current = 0;
            setRetryCount(0);
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

    // ── Add peer (Student → Teacher) with auto-reconnect ──
    const addPeer = useCallback((signal: Peer.SignalData, stream: MediaStream) => {
        destroyPeer('teacher');
        const socket = socketService.getSocket();

        const peer = new Peer({
            initiator: false,
            trickle: true,
            config: iceConfigRef.current,
            stream,
        });

        peer.on('signal', (sig: Peer.SignalData) => {
            socket.emit('student_request', {
                conversationId: roomName,
                studentId: currentUser?.id,
                signal: sig,
            });
        });
        peer.on('stream', (st: MediaStream) => {
            if (!mountedRef.current) return;
            setRemoteStream(st);
            setConnectionStatus('connected');
            retryCountRef.current = 0;
            setRetryCount(0);
        });
        peer.on('close', () => {
            peersRef.current.delete('teacher');
            if (!mountedRef.current) return;

            // Auto-reconnect with backoff
            if (retryCountRef.current < MAX_RETRIES) {
                retryCountRef.current += 1;
                setRetryCount(retryCountRef.current);
                setConnectionStatus('reconnecting');
                const delay = retryCountRef.current * 5000; // 5s, 10s, 15s
                console.log(`[Classroom] Reconnecting in ${delay}ms (attempt ${retryCountRef.current}/${MAX_RETRIES})`);
                reconnectTimeoutRef.current = setTimeout(() => {
                    if (mountedRef.current && localStreamRef.current) {
                        socket.emit('student_joined', { conversationId: roomName, studentId: currentUser?.id });
                    }
                }, delay);
            } else {
                setConnectionStatus('failed');
            }
        });
        peer.on('error', (err: Error) => {
            console.warn('[Classroom] Peer error (student):', err.message);
            destroyPeer('teacher');
            if (!mountedRef.current) return;
            if (connectionStatusRef.current === 'connected') {
                // Was connected, treat as disconnect → trigger reconnect via close event
                return;
            }
            setConnectionStatus('failed');
        });

        peer.signal(signal);
        peersRef.current.set('teacher', peer);
    }, [roomName, currentUser?.id, destroyPeer]);

    // ── Main init ──
    useEffect(() => {
        if (!id) return;
        const socket = socketService.getSocket();
        let stream: MediaStream | null = null;

        const init = async () => {
            // Step 1: Fetch TURN credentials
            iceConfigRef.current = await fetchIceConfig();
            console.log('[Classroom] ICE servers:', iceConfigRef.current.iceServers.map(s => s.urls));

            // Step 2: Acquire media
            try {
                const constraints = isTeacher
                    ? { video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, audio: true }
                    : { audio: true, video: false };
                try {
                    stream = await navigator.mediaDevices.getUserMedia(constraints);
                } catch {
                    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                }
            } catch {
                if (mountedRef.current) {
                    setError('لا يمكن الوصول إلى الميكروفون أو الكاميرا.\nيرجى السماح بالأذونات من إعدادات المتصفح ثم أعد تحميل الصفحة.');
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

            // Step 3: Join signaling room
            socket.emit('join_conversation', roomName);

            if (isTeacher) {
                socket.on('student_joined', (data: { studentId: string }) => {
                    if (!mountedRef.current || !localStreamRef.current) return;
                    if (!peersRef.current.has(data.studentId)) {
                        createPeer(data.studentId, localStreamRef.current);
                    }
                });
                socket.on('student_request', (data: { studentId: string; signal: Peer.SignalData }) => {
                    peersRef.current.get(data.studentId)?.signal(data.signal);
                });
                // Broadcast readiness every 5s for late joiners
                intervalRef.current = setInterval(() => {
                    socket.emit('teacher_ready', { conversationId: roomName, teacherId: currentUser?.id });
                }, 5000);

            } else {
                socket.on('teacher_signal', (data: { signal: Peer.SignalData }) => {
                    if (!mountedRef.current || !localStreamRef.current) return;
                    if (!peersRef.current.has('teacher')) {
                        addPeer(data.signal, localStreamRef.current);
                    } else {
                        peersRef.current.get('teacher')?.signal(data.signal);
                    }
                });

                // Poll for teacher every 3s while not connected
                intervalRef.current = setInterval(() => {
                    if (connectionStatusRef.current !== 'connected' &&
                        connectionStatusRef.current !== 'failed' &&
                        mountedRef.current) {
                        socket.emit('student_joined', { conversationId: roomName, studentId: currentUser?.id });
                    }
                }, 3000);
            }
        };

        init().catch(err => {
            console.error('[Classroom] Unexpected init error:', err);
            if (mountedRef.current) {
                setError('حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة.');
                setLoading(false);
            }
        });

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            socket.off('student_joined');
            socket.off('student_request');
            socket.off('teacher_signal');
            stream?.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
            peersRef.current.forEach((_, pid) => destroyPeer(pid));
            peersRef.current.clear();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isTeacher, currentUser?.id]);

    // ── End session in DB (teacher) ──
    const endSessionInDb = useCallback(async () => {
        if (isTeacher && id) {
            try { await api.post(`/live/end/${id}`, {}); } catch { /* non-critical */ }
        }
    }, [isTeacher, id]);

    // ── Leave ──
    const handleLeave = useCallback(async () => {
        if (isTeacher) {
            socketService.getSocket().emit('teacher_stopped', { conversationId: roomName });
            await endSessionInDb();
        }
        navigate(-1);
    }, [isTeacher, roomName, endSessionInDb, navigate]);

    // ── Manual retry (student) ──
    const handleRetry = useCallback(() => {
        retryCountRef.current = 0;
        setRetryCount(0);
        setConnectionStatus('waiting');
        const socket = socketService.getSocket();
        socket.emit('student_joined', { conversationId: roomName, studentId: currentUser?.id });
    }, [roomName, currentUser?.id]);

    // ── Controls ──
    const toggleMute = useCallback(() => {
        if (!localStreamRef.current) return;
        setIsMuted(prev => {
            const next = !prev;
            localStreamRef.current!.getAudioTracks().forEach(t => { t.enabled = !next; });
            return next;
        });
    }, []);

    const toggleCamera = useCallback(() => {
        if (!localStreamRef.current) return;
        setIsCameraOff(prev => {
            const next = !prev;
            localStreamRef.current!.getVideoTracks().forEach(t => { t.enabled = !next; });
            return next;
        });
    }, []);

    // ── Status badge ──
    const statusConfig: Record<ConnectionStatus, { color: string; label: string }> = {
        connecting:   { color: 'bg-yellow-600', label: 'جاري الاتصال...' },
        waiting:      { color: 'bg-yellow-600', label: 'انتظار الاتصال...' },
        reconnecting: { color: 'bg-orange-500', label: `إعادة الاتصال (${retryCount}/${MAX_RETRIES})...` },
        connected:    { color: 'bg-red-600',    label: 'LIVE' },
        failed:       { color: 'bg-slate-600',  label: 'فشل الاتصال' },
    };
    const { color: statusColor, label: statusLabel } = statusConfig[connectionStatus];

    const SignalIcon = connectionStatus === 'connected' ? Signal
        : connectionStatus === 'reconnecting' ? SignalMedium
        : SignalLow;

    // ─────────────────────────────────────────────────────────────────────────
    // Error screen
    // ─────────────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="fixed inset-0 bg-gray-950 text-white flex flex-col items-center justify-center gap-5 p-6 text-center" dir="rtl">
                <WifiOff size={52} className="text-red-500" />
                <p className="font-black text-sm tracking-widest text-red-400 whitespace-pre-line leading-loose">{error}</p>
                <div className="flex gap-3">
                    <button onClick={() => window.location.reload()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 text-xs font-black uppercase rounded-lg transition-colors flex items-center gap-2">
                        <RotateCcw size={14} /> إعادة التحميل
                    </button>
                    <button onClick={() => navigate(-1)}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 text-xs font-black uppercase rounded-lg transition-colors">
                        العودة
                    </button>
                </div>
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
                    <div className={cn('px-3 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors rounded-sm', statusColor)}>
                        <span className={cn('w-1.5 h-1.5 bg-white rounded-full', connectionStatus === 'connected' && 'animate-pulse')} />
                        {statusLabel}
                        {connectionStatus === 'connected' && (
                            <span className="ml-1 font-mono opacity-80">{formatTime(elapsedSeconds)}</span>
                        )}
                    </div>
                    {isTeacher && (
                        <div className="text-white/50 text-xs flex items-center gap-1">
                            <Users size={13} /> {viewerCount}
                        </div>
                    )}
                    <SignalIcon size={14} className={cn(
                        connectionStatus === 'connected' ? 'text-emerald-400'
                        : connectionStatus === 'reconnecting' ? 'text-orange-400'
                        : 'text-white/20'
                    )} />
                </div>
                <button onClick={handleLeave}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded transition-colors flex items-center gap-1.5 text-xs font-black uppercase px-3"
                    title="مغادرة">
                    <PhoneOff size={16} /> مغادرة
                </button>
            </div>

            {/* ── Video area ── */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">

                {/* Teacher — local video (mirrored) */}
                {isTeacher && (
                    <video ref={localVideoRef} autoPlay muted playsInline
                        className="w-full h-full object-contain -scale-x-100" />
                )}

                {/* Student — remote teacher video */}
                {!isTeacher && (
                    <>
                        <video ref={remoteVideoRef} autoPlay playsInline
                            className="w-full h-full object-contain" />

                        {/* Status overlay */}
                        {connectionStatus !== 'connected' && !needsInteraction && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 gap-5">
                                {connectionStatus === 'failed' ? (
                                    <>
                                        <WifiOff size={44} className="text-red-500" />
                                        <p className="text-xs font-black opacity-60 uppercase tracking-widest">
                                            انقطع الاتصال بالمعلمة
                                        </p>
                                        <button onClick={handleRetry}
                                            className="text-[11px] font-black bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg uppercase flex items-center gap-2 transition-colors">
                                            <RotateCcw size={14} /> إعادة المحاولة
                                        </button>
                                    </>
                                ) : connectionStatus === 'reconnecting' ? (
                                    <>
                                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                                        <p className="text-xs font-black opacity-50 uppercase tracking-widest">
                                            جاري إعادة الاتصال... ({retryCount}/{MAX_RETRIES})
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                                        <p className="text-xs font-black opacity-40 uppercase tracking-widest">
                                            جاري الاتصال بالمعلمة...
                                        </p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Autoplay blocked overlay */}
                        {needsInteraction && (
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
                                <button
                                    onClick={() => { setNeedsInteraction(false); remoteVideoRef.current?.play(); }}
                                    className="flex flex-col items-center gap-4 group">
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
                    <div className="absolute inset-0 bg-gray-950 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-9 h-9 text-red-600 animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                            جاري الإعداد...
                        </p>
                    </div>
                )}
            </div>

            {/* ── Controls bar ── */}
            <div className="h-24 bg-black/90 border-t border-white/10 flex items-center justify-center gap-5 px-4 shrink-0">

                {/* Mic */}
                <button onClick={toggleMute}
                    className={cn('w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all active:scale-95',
                        isMuted ? 'bg-red-600 border-red-800 text-white' : 'bg-white border-gray-200 text-black hover:bg-gray-100')}
                    title={isMuted ? 'تشغيل الميكروفون' : 'كتم الميكروفون'}>
                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>

                {/* Leave */}
                <button onClick={handleLeave}
                    className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center border-4 border-black transition-all active:scale-95"
                    title="إنهاء البث">
                    <PhoneOff size={26} />
                </button>

                {/* Camera (teacher only) */}
                {isTeacher && (
                    <button onClick={toggleCamera}
                        className={cn('w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all active:scale-95',
                            isCameraOff ? 'bg-red-600 border-red-800 text-white' : 'bg-white border-gray-200 text-black hover:bg-gray-100')}
                        title={isCameraOff ? 'تشغيل الكاميرا' : 'إيقاف الكاميرا'}>
                        {isCameraOff ? <VideoOff size={22} /> : <Video size={22} />}
                    </button>
                )}

                {/* Chat */}
                <button
                    className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all active:scale-95"
                    title="المحادثة">
                    <MessageSquare size={22} />
                </button>
            </div>
        </div>
    );
};

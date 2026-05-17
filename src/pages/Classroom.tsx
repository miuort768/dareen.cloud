/**
 * Classroom.tsx — Production-grade WebRTC Live Classroom
 *
 * Architecture & Premium Features:
 *  - Teacher → initiates 1 peer per student (Mesh, suitable for small groups ≤ 10)
 *  - ICE credentials fetched from server dynamically (TURN + STUN, time-limited HMAC)
 *  - Screen Sharing (Teacher only) → seamless video track replacement with getDisplayMedia
 *  - Real-time Vector Whiteboard → fully synced, normalized coordinates for perfect scaling across devices
 *  - Picture-in-Picture Video Layout → displays live camera while whiteboard is active
 *  - Auto-reconnect on peer drop (3 retries with 5s backoff)
 *  - mountedRef guard → no setState after unmount
 *  - trickle: true for fastest ICE candidate exchange
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    MessageSquare, Users, Loader2, Volume2, WifiOff,
    Signal, SignalLow, SignalMedium, RotateCcw,
    Monitor, Eraser, Trash2, Edit3
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

interface DrawingPoint {
    x0: number; // normalized coordinate (0 to 1)
    y0: number;
    x1: number;
    y1: number;
    color: string;
    size: number;
}

// ─── Fallback ICE config (STUN only) ─────────────────────────────────────────
const STUN_ONLY_CONFIG: IceServerConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ]
};

// ─── Fetch fresh ICE servers (STUN + TURN) ───────────────────────────────────
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

    // ── Screen Share State ──
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const screenStreamRef = useRef<MediaStream | null>(null);

    // ── Whiteboard State ──
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
    const [penColor, setPenColor] = useState('#EF4444'); // Red accent
    const [penSize, setPenSize] = useState(3);
    const [isEraser, setIsEraser] = useState(false);

    // ── Refs ──
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peersRef = useRef<Map<string, Peer.Instance>>(new Map());
    const connectedStudentsRef = useRef<Set<string>>(new Set());
    const localStreamRef = useRef<MediaStream | null>(null);
    const connectionStatusRef = useRef<ConnectionStatus>('connecting');
    const iceConfigRef = useRef<IceServerConfig>(STUN_ONLY_CONFIG);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const mountedRef = useRef(true);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const retryCountRef = useRef(0);

    // ── Whiteboard Canvas Refs ──
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawingRef = useRef(false);
    const lastPosRef = useRef({ x: 0, y: 0 });

    const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
    const roomName = `live_session_${id}`;
    const MAX_RETRIES = 3;

    // ── Keep connectionStatus in sync ──
    useEffect(() => {
        connectionStatusRef.current = connectionStatus;
    }, [connectionStatus]);

    // ── Mount guard ──
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(t => t.stop());
            }
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
        peer.on('connect', () => {
            console.log(`[Classroom] Peer connected with student: ${studentId}`);
            connectedStudentsRef.current.add(studentId);
            if (mountedRef.current) {
                setConnectionStatus('connected');
                setViewerCount(peersRef.current.size);
            }
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
            connectedStudentsRef.current.delete(studentId);
            peersRef.current.delete(studentId);
            if (mountedRef.current) setViewerCount(peersRef.current.size);
        });
        peer.on('error', (err: Error) => {
            console.warn(`[Classroom] Peer error (teacher→${studentId}):`, err.message);
            connectedStudentsRef.current.delete(studentId);
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
        peer.on('connect', () => {
            console.log('[Classroom] Peer connected with teacher!');
            if (mountedRef.current) {
                setConnectionStatus('connected');
            }
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
                return;
            }
            setConnectionStatus('failed');
        });

        peer.signal(signal);
        peersRef.current.set('teacher', peer);
    }, [roomName, currentUser?.id, destroyPeer]);

    // ── Sync local/remote Whiteboard sizes ──
    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }, []);

    // ── Screen Share logic ──
    const toggleScreenShare = useCallback(async () => {
        if (!isTeacher || !localStreamRef.current) return;

        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: false
                });

                screenStreamRef.current = screenStream;
                setIsScreenSharing(true);

                const screenTrack = screenStream.getVideoTracks()[0];
                const originalCameraTrack = localStreamRef.current.getVideoTracks()[0];

                // Swap video tracks in all active peer connections
                peersRef.current.forEach(peer => {
                    if (originalCameraTrack && screenTrack) {
                        peer.replaceTrack(originalCameraTrack, screenTrack, localStreamRef.current!);
                    }
                });

                // Update local visual feed
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = screenStream;
                }

                // If user stops sharing from the browser native menu bar
                screenTrack.onended = () => {
                    stopScreenShare();
                };

            } catch (err) {
                console.warn('[Classroom] Failed to initiate screen sharing:', err);
            }
        } else {
            stopScreenShare();
        }
    }, [isScreenSharing, isTeacher]);

    const stopScreenShare = useCallback(() => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(t => t.stop());
            screenStreamRef.current = null;
        }

        const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
        peersRef.current.forEach(peer => {
            // Find screen track among simple-peer connections and put back the camera track
            const senders = (peer as any)._pc?.getSenders() || [];
            const videoSender = senders.find((s: any) => s.track && s.track.kind === 'video');
            if (videoSender && cameraTrack) {
                videoSender.replaceTrack(cameraTrack);
            }
        });

        setIsScreenSharing(false);
        if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
        }
    }, []);

    // ── Collaborative Whiteboard Sync logic ──
    const drawLine = useCallback((x0: number, y0: number, x1: number, y1: number, color: string, size: number, emit = true) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate absolute coordinates based on local canvas dimensions
        const absX0 = x0 * canvas.width;
        const absY0 = y0 * canvas.height;
        const absX1 = x1 * canvas.width;
        const absY1 = y1 * canvas.height;

        ctx.beginPath();
        ctx.moveTo(absX0, absY0);
        ctx.lineTo(absX1, absY1);
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.closePath();

        if (emit && isTeacher) {
            const socket = socketService.getSocket();
            socket.emit('drawing', {
                conversationId: roomName,
                x0, y0, x1, y1,
                color,
                size
            });
        }
    }, [isTeacher, roomName]);

    // ── Whiteboard Canvas Clearing ──
    const clearCanvas = useCallback((emit = true) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        if (emit && isTeacher) {
            socketService.getSocket().emit('clear_whiteboard', { conversationId: roomName });
        }
    }, [isTeacher, roomName]);

    // ── Whiteboard Sync Toggle (Teacher only) ──
    const toggleWhiteboard = useCallback(() => {
        if (!isTeacher) return;
        setIsWhiteboardOpen(prev => {
            const next = !prev;
            socketService.getSocket().emit('whiteboard_state', { conversationId: roomName, open: next });
            return next;
        });
    }, [isTeacher, roomName]);

    // ── Drawing Events (Teacher Draw) ──
    const handleDrawingStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isTeacher || !canvasRef.current) return;
        drawingRef.current = true;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        let clientX = 0;
        let clientY = 0;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        lastPosRef.current = {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const handleDrawingMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isTeacher || !drawingRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        let clientX = 0;
        let clientY = 0;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const currentX = clientX - rect.left;
        const currentY = clientY - rect.top;

        // Emit normalized vector values (0.0 to 1.0)
        const x0 = lastPosRef.current.x / canvas.width;
        const y0 = lastPosRef.current.y / canvas.height;
        const x1 = currentX / canvas.width;
        const y1 = currentY / canvas.height;

        const color = isEraser ? '#1E293B' : penColor; // slate-800 matches slate whiteboard bg
        const size = isEraser ? 24 : penSize;

        drawLine(x0, y0, x1, y1, color, size, true);

        lastPosRef.current = { x: currentX, y: currentY };
    };

    const handleDrawingEnd = () => {
        drawingRef.current = false;
    };

    // ── Main init ──
    useEffect(() => {
        if (!id) return;
        const socket = socketService.getSocket();
        let stream: MediaStream | null = null;

        const init = async () => {
            iceConfigRef.current = await fetchIceConfig();

            // Acquire camera/mic
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

            socket.emit('join_conversation', roomName);

            // ── Multi-user socket event listeners ──
            if (isTeacher) {
                socket.on('student_joined', (data: { studentId: string }) => {
                    if (!mountedRef.current || !localStreamRef.current) return;
                    // If student is not successfully connected, or we don't have a peer for them
                    if (!connectedStudentsRef.current.has(data.studentId) || !peersRef.current.has(data.studentId)) {
                        console.log(`[Classroom] Student ${data.studentId} joined/rejoining. Creating new peer connection.`);
                        createPeer(data.studentId, localStreamRef.current);
                    }
                });
                socket.on('student_request', (data: { studentId: string; signal: Peer.SignalData }) => {
                    peersRef.current.get(data.studentId)?.signal(data.signal);
                });
                intervalRef.current = setInterval(() => {
                    socket.emit('teacher_ready', { conversationId: roomName, teacherId: currentUser?.id });
                }, 5000);

            } else {
                // Listen to teacher_ready to start handshaking immediately
                socket.on('teacher_ready', () => {
                    console.log('[Classroom] Teacher is ready, initiating connection...');
                    if (mountedRef.current && localStreamRef.current) {
                        socket.emit('student_joined', { conversationId: roomName, studentId: currentUser?.id });
                    }
                });

                socket.on('teacher_signal', (data: { signal: Peer.SignalData }) => {
                    if (!mountedRef.current || !localStreamRef.current) return;
                    
                    const isOffer = (data.signal as any).type === 'offer';
                    if (isOffer || !peersRef.current.has('teacher')) {
                        console.log('[Classroom] Received fresh teacher offer signal. Re-initializing peer connection.');
                        addPeer(data.signal, localStreamRef.current);
                    } else {
                        peersRef.current.get('teacher')?.signal(data.signal);
                    }
                });

                // Student sync with collaborative whiteboard
                socket.on('whiteboard_state', (data: { open: boolean }) => {
                    if (mountedRef.current) {
                        setIsWhiteboardOpen(data.open);
                    }
                });

                socket.on('drawing', (data: DrawingPoint) => {
                    if (mountedRef.current) {
                        drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.size, false);
                    }
                });

                socket.on('clear_whiteboard', () => {
                    if (mountedRef.current) {
                        clearCanvas(false);
                    }
                });

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

        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            socket.off('student_joined');
            socket.off('student_request');
            socket.off('teacher_signal');
            socket.off('teacher_ready');
            socket.off('whiteboard_state');
            socket.off('drawing');
            socket.off('clear_whiteboard');
            stream?.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
            peersRef.current.forEach((_, pid) => destroyPeer(pid));
            peersRef.current.clear();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isTeacher, currentUser?.id]);

    // Resize canvas whenever state triggers canvas DOM mount
    useEffect(() => {
        if (isWhiteboardOpen) {
            setTimeout(resizeCanvas, 50); // slight delay to let elements mount fully
        }
    }, [isWhiteboardOpen, resizeCanvas]);

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

    // ── Status config ──
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

    return (
        <div className="fixed inset-0 bg-black text-white flex flex-col overflow-hidden select-none" dir="rtl">

            {/* ── Top Bar ── */}
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

            {/* ── Main content area ── */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">

                {/* --- Main View: Interactive Whiteboard overlay --- */}
                {isWhiteboardOpen ? (
                    <div className="absolute inset-0 bg-slate-800 flex flex-col z-20">
                        {/* Canvas tools panel (Teacher only) */}
                        {isTeacher && (
                            <div className="h-12 border-b border-white/10 bg-slate-900 flex items-center justify-between px-4 shrink-0">
                                <div className="flex items-center gap-3">
                                    {/* Colors */}
                                    <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded">
                                        {['#EF4444', '#3B82F6', '#10B981', '#FFFFFF'].map(c => (
                                            <button
                                                key={c}
                                                onClick={() => { setPenColor(c); setIsEraser(false); }}
                                                className={cn("w-5 h-5 rounded-full border transition-transform",
                                                    penColor === c && !isEraser ? "scale-125 border-white" : "border-transparent"
                                                )}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>

                                    {/* Eraser */}
                                    <button
                                        onClick={() => setIsEraser(!isEraser)}
                                        className={cn("p-1.5 rounded transition-colors",
                                            isEraser ? "bg-red-600 text-white" : "bg-white/5 text-white/60 hover:text-white"
                                        )}
                                        title="الممحاة"
                                    >
                                        <Eraser size={16} />
                                    </button>

                                    {/* Pen sizes */}
                                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded">
                                        {[2, 5, 10].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => { setPenSize(s); setIsEraser(false); }}
                                                className={cn("text-[9px] font-bold px-2 py-0.5 rounded transition-colors",
                                                    penSize === s && !isEraser ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                                                )}
                                            >
                                                {s === 2 ? 'رقيق' : s === 5 ? 'متوسط' : 'عريض'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => clearCanvas(true)}
                                        className="p-1.5 bg-white/5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-[10px] font-black uppercase"
                                        title="مسح كامل السبورة"
                                    >
                                        <Trash2 size={14} /> مسح الكل
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Interactive whiteboard canvas */}
                        <div className="flex-1 relative bg-slate-900">
                            <canvas
                                ref={canvasRef}
                                onMouseDown={handleDrawingStart}
                                onMouseMove={handleDrawingMove}
                                onMouseUp={handleDrawingEnd}
                                onMouseLeave={handleDrawingEnd}
                                onTouchStart={handleDrawingStart}
                                onTouchMove={handleDrawingMove}
                                onTouchEnd={handleDrawingEnd}
                                className={cn("absolute inset-0 w-full h-full block cursor-crosshair",
                                    !isTeacher && "pointer-events-none" // Student can only observe
                                )}
                            />
                        </div>
                    </div>
                ) : null}

                {/* --- Main View: Standard Video Streams --- */}
                {isTeacher ? (
                    <video ref={localVideoRef} autoPlay muted playsInline
                        className={cn("w-full h-full object-contain -scale-x-100 transition-opacity",
                            isWhiteboardOpen ? "opacity-0 pointer-events-none absolute" : "opacity-100"
                        )}
                    />
                ) : (
                    <>
                        <video ref={remoteVideoRef} autoPlay playsInline
                            className={cn("w-full h-full object-contain transition-opacity",
                                isWhiteboardOpen ? "opacity-0 pointer-events-none absolute" : "opacity-100"
                            )}
                        />

                        {/* Connection overlays */}
                        {connectionStatus !== 'connected' && !needsInteraction && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 gap-5 z-10">
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

                {/* --- Picture-in-Picture Floating Camera Video Window (Zoom/Teams style) --- */}
                {isWhiteboardOpen && (
                    <div className="absolute bottom-4 left-4 w-40 h-28 bg-slate-950 border-2 border-white/20 rounded shadow-2xl overflow-hidden z-30 transition-all hover:scale-105 active:scale-95">
                        {isTeacher ? (
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full object-cover -scale-x-100 bg-slate-900"
                            />
                        ) : (
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover bg-slate-900"
                            />
                        )}
                        {/* Overlay text */}
                        <div className="absolute top-1 right-1 bg-black/50 px-1 py-0.5 rounded text-[8px] font-black tracking-tight">
                            {isTeacher ? 'أنتِ' : 'المعلمة'}
                        </div>
                    </div>
                )}

                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-gray-950 flex flex-col items-center justify-center gap-4 z-40">
                        <Loader2 className="w-9 h-9 text-red-600 animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                            جاري الإعداد...
                        </p>
                    </div>
                )}
            </div>

            {/* ── Controls Bar ── */}
            <div className="h-24 bg-black/90 border-t border-white/10 flex items-center justify-center gap-5 px-4 shrink-0 z-40">

                {/* Mic */}
                <button onClick={toggleMute}
                    className={cn('w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all active:scale-95',
                        isMuted ? 'bg-red-600 border-red-800 text-white' : 'bg-white border-gray-200 text-black hover:bg-gray-100')}
                    title={isMuted ? 'تشغيل الميكروفون' : 'كتم الميكروفون'}>
                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>

                {/* Screen Share (Teacher only) */}
                {isTeacher && (
                    <button onClick={toggleScreenShare}
                        className={cn('w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all active:scale-95',
                            isScreenSharing ? 'bg-red-600 border-red-800 text-white' : 'bg-white border-gray-200 text-black hover:bg-gray-100')}
                        title={isScreenSharing ? 'إيقاف مشاركة الشاشة' : 'مشاركة الشاشة'}>
                        <Monitor size={22} />
                    </button>
                )}

                {/* Leave */}
                <button onClick={handleLeave}
                    className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center border-4 border-black transition-all active:scale-95"
                    title="إنهاء البث">
                    <PhoneOff size={26} />
                </button>

                {/* Camera (Teacher only) */}
                {isTeacher && (
                    <button onClick={toggleCamera}
                        className={cn('w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all active:scale-95',
                            isCameraOff ? 'bg-red-600 border-red-800 text-white' : 'bg-white border-gray-200 text-black hover:bg-gray-100')}
                        title={isCameraOff ? 'تشغيل الكاميرا' : 'إيقاف الكاميرا'}>
                        {isCameraOff ? <VideoOff size={22} /> : <Video size={22} />}
                    </button>
                )}

                {/* Whiteboard (Teacher only, controls synched for students) */}
                {isTeacher && (
                    <button onClick={toggleWhiteboard}
                        className={cn('w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all active:scale-95',
                            isWhiteboardOpen ? 'bg-indigo-600 border-indigo-800 text-white' : 'bg-white border-gray-200 text-black hover:bg-gray-100')}
                        title={isWhiteboardOpen ? 'إغلاق السبورة' : 'السبورة التفاعلية'}>
                        <Edit3 size={22} />
                    </button>
                )}

                {/* Chat Placeholder */}
                <button
                    className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all active:scale-95"
                    title="المحادثة">
                    <MessageSquare size={22} />
                </button>
            </div>
        </div>
    );
};

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Mic, MicOff, Video, VideoOff, PhoneOff, 
    MessageSquare, Users, Crown, Monitor, Loader2, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { cn } from '../lib/utils';
import Peer from 'peerjs';

// Private PeerJS server config — signaling runs on our own VPS
const PEER_CONFIG = {
    host: window.location.hostname,
    port: window.location.port ? Number(window.location.port) : (window.location.protocol === 'https:' ? 443 : 80),
    path: '/api/peerjs',
    secure: window.location.protocol === 'https:',
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ]
    },
    debug: 1 // Increased debug level for troubleshooting
};

export const Classroom = () => {
    const { id } = useParams();
    const { currentUser } = useApp();
    const navigate = useNavigate();

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewerCount, setViewerCount] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'waiting'>('connecting');

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<Peer | null>(null);
    const callsRef = useRef<Map<string, any>>(new Map());
    const screenTrackRef = useRef<MediaStreamTrack | null>(null);
    const retryTimeoutRef = useRef<any>(null);

    const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

    const attachStream = (videoEl: HTMLVideoElement | null, stream: MediaStream | null) => {
        if (!videoEl || !stream) return;
        if (videoEl.srcObject !== stream) {
            videoEl.srcObject = stream;
        }
        videoEl.play().catch(() => {
            const retry = () => { videoEl.play().catch(() => {}); document.removeEventListener('click', retry); };
            document.addEventListener('click', retry);
        });
    };

    useEffect(() => { attachStream(remoteVideoRef.current, remoteStream); }, [remoteStream]);
    useEffect(() => { attachStream(localVideoRef.current, localStream); }, [localStream]);

    useEffect(() => {
        let peer: Peer | null = null;
        let stream: MediaStream | null = null;

        const init = async () => {
            try {
                // Get media immediately to skip splash screen
                if (isTeacher) {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: { echoCancellation: true, noiseSuppression: true }
                    });
                    stream.getVideoTracks().forEach(t => t.enabled = false);
                } else {
                    // Students only need mic for bidirectional, but we can start with just receiving
                    try {
                        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                    } catch {
                        // Fallback if no mic
                        stream = new MediaStream();
                    }
                }

                setLocalStream(stream);
                setLoading(false); // Hide loader immediately after media check

                const peerId = isTeacher
                    ? `dareen-teacher-${id}`
                    : `dareen-viewer-${currentUser?.id || Math.random().toString(36).slice(2, 9)}`;

                peer = new Peer(peerId, PEER_CONFIG);
                peerRef.current = peer;

                peer.on('open', (myId) => {
                    console.log('[Peer] Connected with ID:', myId);
                    setConnectionStatus('waiting');
                    if (!isTeacher) {
                        callTeacherWithRetry(peer!, stream!);
                    }
                });

                peer.on('error', (err) => {
                    console.error('[Peer] Error:', err.type, err.message);
                    if (err.type === 'peer-unavailable') {
                        setConnectionStatus('waiting');
                    } else if (err.type === 'unavailable-id') {
                        // Teacher ID taken? Maybe refresh
                        if (isTeacher) setError('معرف الغرفة مستخدم بالفعل. يرجى إغلاق أي نوافذ أخرى للبث.');
                    }
                });

                if (isTeacher) {
                    peer.on('call', (incomingCall) => {
                        console.log('[Teacher] Incoming call from:', incomingCall.peer);
                        incomingCall.answer(stream!);
                        callsRef.current.set(incomingCall.peer, incomingCall);
                        setViewerCount(callsRef.current.size);
                        setConnectionStatus('connected');

                        incomingCall.on('close', () => {
                            callsRef.current.delete(incomingCall.peer);
                            setViewerCount(callsRef.current.size);
                        });
                    });
                }
            } catch (err: any) {
                console.error('[Init] Error:', err);
                setError(err.name === 'NotAllowedError' ? 'يرجى السماح بالوصول للكاميرا/الميكروفون.' : err.message);
                setLoading(false);
            }
        };

        const callTeacherWithRetry = (p: Peer, s: MediaStream) => {
            if (!p || p.destroyed) return;
            
            console.log('[Student] Attempting to connect to teacher...');
            const call = p.call(`dareen-teacher-${id}`, s);
            
            if (!call) {
                // If call object creation failed, retry
                retryTimeoutRef.current = setTimeout(() => callTeacherWithRetry(p, s), 3000);
                return;
            }

            call.on('stream', (teacherStream) => {
                console.log('[Student] Received stream');
                setRemoteStream(teacherStream);
                setConnectionStatus('connected');
                if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            });

            call.on('error', (e) => {
                console.error('[Student] Call error, retrying...', e);
                setConnectionStatus('waiting');
                retryTimeoutRef.current = setTimeout(() => callTeacherWithRetry(p, s), 3000);
            });

            call.on('close', () => {
                setRemoteStream(null);
                setConnectionStatus('waiting');
                retryTimeoutRef.current = setTimeout(() => callTeacherWithRetry(p, s), 3000);
            });
        };

        init();

        return () => {
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            stream?.getTracks().forEach(t => t.stop());
            peer?.destroy();
            peerRef.current = null;
        };
    }, [id, isTeacher]);

    const startScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true });
            const screenVideoTrack = screenStream.getVideoTracks()[0];
            screenTrackRef.current = screenVideoTrack;
            setIsScreenSharing(true);

            callsRef.current.forEach((call) => {
                const videoSender = call.peerConnection?.getSenders().find((s: any) => s.track?.kind === 'video');
                if (videoSender) videoSender.replaceTrack(screenVideoTrack);
            });

            const previewStream = new MediaStream([screenVideoTrack]);
            setLocalStream(previewStream);
            screenVideoTrack.onended = () => stopScreenShare();
        } catch (err) { setIsScreenSharing(false); }
    };

    const stopScreenShare = useCallback(() => {
        screenTrackRef.current?.stop();
        screenTrackRef.current = null;
        setIsScreenSharing(false);
        if (localStream) {
            const camTrack = localStream.getVideoTracks()[0];
            if (camTrack) {
                callsRef.current.forEach((call) => {
                    const videoSender = call.peerConnection?.getSenders().find((s: any) => s.track?.kind === 'video');
                    if (videoSender) videoSender.replaceTrack(camTrack);
                });
            }
        }
    }, [localStream]);

    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) { audioTrack.enabled = isMuted; setIsMuted(!isMuted); }
        }
    };

    const toggleCamera = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) { videoTrack.enabled = isCameraOff; setIsCameraOff(!isCameraOff); }
        }
    };

    const handleLeave = () => {
        if (isTeacher) {
            const token = localStorage.getItem('auth_token');
            fetch(`/api/live/end/${id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
        }
        navigate(-1);
    };

    if (error) return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
            <AlertCircle size={48} className="text-red-500 mb-6" />
            <h1 className="text-xl font-black text-white mb-4">خطأ</h1>
            <p className="text-gray-400 mb-8 max-w-md text-sm leading-relaxed">{error}</p>
            <button onClick={() => navigate(-1)} className="bg-white text-black px-10 py-3 font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">العودة</button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-gray-950 text-white flex flex-col overflow-hidden" dir="rtl">
            {/* Header */}
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-black/40 backdrop-blur-xl z-50 shrink-0">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1 text-white text-[10px] font-black uppercase tracking-widest",
                        connectionStatus === 'connected' ? "bg-red-600" : "bg-yellow-600"
                    )}>
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        {connectionStatus === 'connected' ? 'LIVE' : 'بانتظار الاتصال...'}
                    </div>
                    {isTeacher && <div className="flex items-center gap-1.5 text-white/40 text-xs"><Users size={14} /><span>{viewerCount} مشاهد</span></div>}
                </div>
                <button onClick={handleLeave} className="p-2 bg-red-600 hover:bg-red-700 transition-all rounded"><PhoneOff size={18} /></button>
            </div>

            {/* Main video area */}
            <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
                {isTeacher ? (
                    <>
                        <video ref={localVideoRef} autoPlay muted playsInline className={cn("w-full h-full object-contain", !isScreenSharing && !isCameraOff && "-scale-x-100")} />
                        {(isCameraOff && !isScreenSharing) && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950">
                                <Crown size={80} className="text-white/10 mb-4" />
                                <p className="text-white/30 font-black uppercase tracking-widest text-xs">الكاميرا متوقفة — شارك شاشتك للبدء</p>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
                        {connectionStatus !== 'connected' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 text-center px-4">
                                <Loader2 size={48} className="text-red-600 animate-spin mb-6" />
                                <p className="text-white/40 font-black uppercase tracking-widest text-sm">جاري محاولة الاتصال بالمعلمة...</p>
                                <p className="text-white/20 text-xs mt-3">سيظهر البث تلقائياً فور بدء المعلمة</p>
                            </div>
                        )}
                    </>
                )}
                {loading && <div className="absolute inset-0 bg-gray-950 flex items-center justify-center z-40"><Loader2 className="w-10 h-10 text-red-600 animate-spin" /></div>}
            </div>

            {/* Controls */}
            <div className="h-24 bg-black/80 backdrop-blur-2xl border-t border-white/10 flex items-center justify-center gap-5 px-6 shrink-0">
                {isTeacher && (
                    <button onClick={isScreenSharing ? stopScreenShare : startScreenShare} className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all border-4 shadow-xl", isScreenSharing ? "bg-green-600 border-black text-white animate-pulse" : "bg-white text-black border-black hover:scale-110")}><Monitor size={24} /></button>
                )}
                <button onClick={toggleMute} className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all border-4 shadow-xl", isMuted ? "bg-red-600 border-black" : "bg-white text-black border-black hover:scale-110")}>{isMuted ? <MicOff size={24} /> : <Mic size={24} />}</button>
                <button onClick={handleLeave} className="w-16 h-16 bg-red-600 border-4 border-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-2xl"><PhoneOff size={28} /></button>
                {isTeacher && (
                    <button onClick={toggleCamera} className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all border-4 shadow-xl", isCameraOff ? "bg-red-600 border-black" : "bg-white text-black border-black hover:scale-110")}>{isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}</button>
                )}
                <button className="w-14 h-14 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all border-2 border-white/20"><MessageSquare size={24} /></button>
            </div>
        </div>
    );
};

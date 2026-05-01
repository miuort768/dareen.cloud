import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Mic, MicOff, Video, VideoOff, PhoneOff, 
    MessageSquare, Users, Monitor, Loader2, AlertCircle, Volume2
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { cn } from '../lib/utils';
import Peer from 'peerjs';

const PEER_CONFIG = {
    host: window.location.hostname,
    port: window.location.port ? Number(window.location.port) : (window.location.protocol === 'https:' ? 443 : 80),
    path: '/api/peerjs',
    secure: window.location.protocol === 'https:',
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
        ]
    }
};

export const Classroom = () => {
    const { id } = useParams();
    const { currentUser } = useApp();
    const navigate = useNavigate();

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewerCount, setViewerCount] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'waiting'>('connecting');
    const [needsInteraction, setNeedsInteraction] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<Peer | null>(null);
    const callsRef = useRef<Map<string, any>>(new Map());
    const retryTimeoutRef = useRef<any>(null);

    const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

    // Helper to ensure audio is playing
    const forcePlay = (videoEl: HTMLVideoElement | null) => {
        if (!videoEl) return;
        videoEl.play().catch(() => setNeedsInteraction(true));
    };

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            forcePlay(remoteVideoRef.current);
        }
    }, [remoteStream]);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
            localVideoRef.current.play().catch(() => {});
        }
    }, [localStream]);

    const handleStartMedia = () => {
        setNeedsInteraction(false);
        if (remoteVideoRef.current) {
            remoteVideoRef.current.muted = false;
            remoteVideoRef.current.play().catch(console.error);
        }
    };

    useEffect(() => {
        let peer: Peer | null = null;
        let stream: MediaStream | null = null;

        const init = async () => {
            try {
                // 1. Get User Media with specific constraints for better quality
                const constraints = isTeacher 
                    ? { video: { width: 1280, height: 720 }, audio: { echoCancellation: true } }
                    : { audio: true, video: false };
                
                try {
                    stream = await navigator.mediaDevices.getUserMedia(constraints);
                } catch (e) {
                    console.warn("Failed to get full media, trying audio only", e);
                    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                }

                setLocalStream(stream);
                setLoading(false);

                // 2. Initialize Peer
                const peerId = isTeacher ? `dareen-teacher-${id}` : `dareen-viewer-${currentUser?.id || Math.random().toString(36).slice(2, 9)}`;
                peer = new Peer(peerId, PEER_CONFIG);
                peerRef.current = peer;

                peer.on('open', () => {
                    setConnectionStatus(isTeacher ? 'connected' : 'waiting');
                    if (!isTeacher) callTeacher(peer!, stream!);
                });

                peer.on('error', (err) => {
                    console.error("Peer Error:", err.type);
                    if (err.type === 'peer-unavailable') setConnectionStatus('waiting');
                });

                if (isTeacher) {
                    peer.on('call', (call) => {
                        console.log("Teacher receiving call from", call.peer);
                        call.answer(stream!);
                        callsRef.current.set(call.peer, call);
                        setViewerCount(callsRef.current.size);
                        
                        call.on('stream', (studentStream) => {
                            // Teacher hears student
                            setRemoteStream(studentStream);
                        });

                        call.on('close', () => {
                            callsRef.current.delete(call.peer);
                            setViewerCount(callsRef.current.size);
                        });
                    });
                }
            } catch (err: any) {
                setError(`تعذر الوصول للكاميرا أو الميكروفون: ${err.message}`);
                setLoading(false);
            }
        };

        const callTeacher = (p: Peer, s: MediaStream) => {
            if (!p || p.destroyed) return;
            console.log("Student calling teacher...");
            const call = p.call(`dareen-teacher-${id}`, s);
            
            if (call) {
                call.on('stream', (ts) => {
                    console.log("Student received teacher stream");
                    setRemoteStream(ts);
                    setConnectionStatus('connected');
                });
                call.on('close', () => {
                    setConnectionStatus('waiting');
                    retryTimeoutRef.current = setTimeout(() => callTeacher(p, s), 3000);
                });
                call.on('error', () => {
                    retryTimeoutRef.current = setTimeout(() => callTeacher(p, s), 3000);
                });
            } else {
                retryTimeoutRef.current = setTimeout(() => callTeacher(p, s), 3000);
            }
        };

        init();

        return () => {
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            stream?.getTracks().forEach(t => t.stop());
            peer?.destroy();
        };
    }, [id, isTeacher]);

    const startScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            const screenTrack = screenStream.getVideoTracks()[0];
            
            setIsScreenSharing(true);
            
            // Crucial: Keep the audio track from the original mic stream!
            const micTrack = localStream?.getAudioTracks()[0];
            const newLocalStream = new MediaStream([screenTrack]);
            if (micTrack) newLocalStream.addTrack(micTrack);
            setLocalStream(newLocalStream);

            // Replace track for all peers
            callsRef.current.forEach(call => {
                const videoSender = call.peerConnection?.getSenders().find((s: any) => s.track?.kind === 'video');
                if (videoSender) videoSender.replaceTrack(screenTrack);
            });

            screenTrack.onended = () => stopScreenShare();
        } catch (err) {
            console.error("Screen share failed", err);
            setIsScreenSharing(false);
        }
    };

    const stopScreenShare = useCallback(async () => {
        setIsScreenSharing(false);
        // Reset to camera
        try {
            const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const camTrack = camStream.getVideoTracks()[0];
            const micTrack = camStream.getAudioTracks()[0];
            
            setLocalStream(camStream);
            
            callsRef.current.forEach(call => {
                const videoSender = call.peerConnection?.getSenders().find((s: any) => s.track?.kind === 'video');
                const audioSender = call.peerConnection?.getSenders().find((s: any) => s.track?.kind === 'audio');
                if (videoSender) videoSender.replaceTrack(camTrack);
                if (audioSender) audioSender.replaceTrack(micTrack);
            });
        } catch (e) {
            console.error("Failed to restore camera", e);
        }
    }, []);

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(t => t.enabled = isMuted);
            setIsMuted(!isMuted);
        }
    };

    const toggleCamera = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(t => t.enabled = isCameraOff);
            setIsCameraOff(!isCameraOff);
        }
    };

    if (error) return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
            <AlertCircle size={48} className="text-red-500 mb-6" />
            <h1 className="text-xl font-black text-white mb-4">خطأ</h1>
            <p className="text-gray-400 mb-8 max-w-md text-sm">{error}</p>
            <button onClick={() => navigate(-1)} className="bg-white text-black px-10 py-3 font-black">العودة</button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-gray-950 text-white flex flex-col overflow-hidden" dir="rtl">
            {/* Header */}
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-black/40 backdrop-blur-xl z-50">
                <div className="flex items-center gap-3">
                    <div className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-2", connectionStatus === 'connected' ? "bg-red-600" : "bg-yellow-600")}>
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        {connectionStatus === 'connected' ? 'LIVE' : 'جاري الربط...'}
                    </div>
                    {isTeacher && <div className="text-white/40 text-xs flex items-center gap-1"><Users size={14} /> {viewerCount}</div>}
                </div>
                <button onClick={() => navigate(-1)} className="p-2 bg-red-600 rounded"><PhoneOff size={18} /></button>
            </div>

            {/* Video Area */}
            <div className="flex-1 relative bg-black flex items-center justify-center">
                {isTeacher ? (
                    <video ref={localVideoRef} autoPlay muted playsInline className={cn("w-full h-full object-contain", !isScreenSharing && "-scale-x-100")} />
                ) : (
                    <>
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
                        {connectionStatus !== 'connected' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                                <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
                                <p className="text-xs font-black opacity-40 uppercase tracking-widest">بانتظار المعلمة...</p>
                            </div>
                        )}
                        {needsInteraction && (
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
                                <button onClick={handleStartMedia} className="flex flex-col items-center gap-4 group">
                                    <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl group-active:scale-90 transition-transform">
                                        <Volume2 size={32} className="text-white animate-pulse" />
                                    </div>
                                    <p className="font-black text-sm uppercase tracking-widest">انقر لتشغيل الصوت والبث</p>
                                </button>
                            </div>
                        )}
                    </>
                )}
                {loading && <div className="absolute inset-0 bg-gray-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>}
            </div>

            {/* Controls */}
            <div className="h-24 bg-black/90 border-t border-white/10 flex items-center justify-center gap-6 px-4">
                {isTeacher && (
                    <button onClick={isScreenSharing ? stopScreenShare : startScreenShare} className={cn("w-14 h-14 rounded-full flex items-center justify-center border-4", isScreenSharing ? "bg-green-600" : "bg-white text-black")}><Monitor size={24} /></button>
                )}
                <button onClick={toggleMute} className={cn("w-14 h-14 rounded-full flex items-center justify-center border-4", isMuted ? "bg-red-600" : "bg-white text-black")}>{isMuted ? <MicOff size={24} /> : <Mic size={24} />}</button>
                <button onClick={() => navigate(-1)} className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center border-4 border-black"><PhoneOff size={28} /></button>
                {isTeacher && (
                    <button onClick={toggleCamera} className={cn("w-14 h-14 rounded-full flex items-center justify-center border-4", isCameraOff ? "bg-red-600" : "bg-white text-black")}>{isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}</button>
                )}
                <button className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center"><MessageSquare size={24} /></button>
            </div>
        </div>
    );
};

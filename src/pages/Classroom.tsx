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
    host: window.location.hostname, // same domain as the app
    port: window.location.port ? Number(window.location.port) : (window.location.protocol === 'https:' ? 443 : 80),
    path: '/api/peerjs',
    secure: window.location.protocol === 'https:',
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ]
    },
    debug: 0
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
    const callsRef = useRef<Map<string, any>>(new Map()); // peerId -> call
    const screenTrackRef = useRef<MediaStreamTrack | null>(null);

    const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

    // Attach stream to video element safely
    const attachStream = (videoEl: HTMLVideoElement | null, stream: MediaStream | null) => {
        if (!videoEl || !stream) return;
        if (videoEl.srcObject !== stream) {
            videoEl.srcObject = stream;
        }
        videoEl.play().catch(() => {
            // Retry on user interaction
            const retry = () => { videoEl.play().catch(() => {}); document.removeEventListener('click', retry); };
            document.addEventListener('click', retry);
        });
    };

    useEffect(() => {
        attachStream(remoteVideoRef.current, remoteStream);
    }, [remoteStream]);

    useEffect(() => {
        attachStream(localVideoRef.current, localStream);
    }, [localStream]);

    useEffect(() => {
        let peer: Peer | null = null;
        let stream: MediaStream | null = null;

        const init = async () => {
            try {
                if (isTeacher) {
                    // Teacher: get camera + mic
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
                    });
                    // Disable video by default (screen share is primary)
                    stream.getVideoTracks().forEach(t => t.enabled = false);
                } else {
                    // Student/Parent: audio only for joining
                    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                }

                setLocalStream(stream);
                setLoading(false);

                const peerId = isTeacher
                    ? `dareen-teacher-${id}`
                    : `dareen-viewer-${currentUser?.id || Math.random().toString(36).slice(2, 9)}-${Date.now()}`;

                peer = new Peer(peerId, PEER_CONFIG);

                peerRef.current = peer;

                peer.on('open', (myId) => {
                    console.log('[Peer] Connected with ID:', myId);
                    setConnectionStatus('waiting');
                });

                peer.on('error', (err) => {
                    console.error('[Peer] Error:', err.type, err.message);
                    if (err.type === 'unavailable-id') {
                        // ID taken - teacher already exists, just join
                        if (!isTeacher) {
                            setTimeout(() => callTeacher(peer!, stream!), 2000);
                        }
                    } else if (err.type === 'peer-unavailable') {
                        setConnectionStatus('waiting');
                    } else {
                        setError(`خطأ في الاتصال: ${err.type}`);
                    }
                });

                if (isTeacher) {
                    // Teacher waits for incoming calls from students
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
                        incomingCall.on('error', (e) => {
                            console.error('[Teacher] Call error:', e);
                            callsRef.current.delete(incomingCall.peer);
                        });
                    });
                } else {
                    // Student calls the teacher after peer is open
                    peer.on('open', () => {
                        setTimeout(() => callTeacher(peer!, stream!), 1500);
                    });
                }
            } catch (err: any) {
                console.error('[Init] Error:', err);
                if (err.name === 'NotAllowedError') {
                    setError('يرجى السماح بالوصول للكاميرا والميكروفون في إعدادات المتصفح، ثم أعد تحميل الصفحة.');
                } else {
                    setError(`خطأ: ${err.message}`);
                }
                setLoading(false);
            }
        };

        const callTeacher = (peer: Peer, myStream: MediaStream) => {
            console.log('[Student] Calling teacher:', `dareen-teacher-${id}`);
            const call = peer.call(`dareen-teacher-${id}`, myStream);
            if (!call) {
                setError('لم يتم العثور على بث المعلمة. قد تكون الحصة لم تبدأ بعد.');
                return;
            }
            call.on('stream', (teacherStream) => {
                console.log('[Student] Received teacher stream:', teacherStream.getTracks());
                setRemoteStream(teacherStream);
                setConnectionStatus('connected');
            });
            call.on('error', (e) => {
                console.error('[Student] Call error:', e);
                setConnectionStatus('waiting');
            });
            call.on('close', () => {
                console.log('[Student] Call closed');
                setRemoteStream(null);
                setConnectionStatus('waiting');
            });
        };

        init();

        return () => {
            stream?.getTracks().forEach(t => t.stop());
            peer?.destroy();
            peerRef.current = null;
        };
    }, [id, isTeacher]);

    const startScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
                video: { frameRate: 30 },
                audio: true 
            });
            const screenVideoTrack = screenStream.getVideoTracks()[0];
            const screenAudioTrack = screenStream.getAudioTracks()[0];
            screenTrackRef.current = screenVideoTrack;
            setIsScreenSharing(true);

            // Replace video track in all active calls
            callsRef.current.forEach((call) => {
                const senders = call.peerConnection?.getSenders() || [];
                const videoSender = senders.find((s: RTCRtpSender) => s.track?.kind === 'video');
                if (videoSender) videoSender.replaceTrack(screenVideoTrack);
                else call.peerConnection?.addTrack(screenVideoTrack, screenStream);

                if (screenAudioTrack) {
                    const audioSender = senders.find((s: RTCRtpSender) => s.track?.kind === 'audio');
                    if (audioSender) audioSender.replaceTrack(screenAudioTrack);
                }
            });

            // Show screen in local preview
            const previewStream = new MediaStream([screenVideoTrack]);
            if (screenAudioTrack) previewStream.addTrack(screenAudioTrack);
            setLocalStream(previewStream);

            screenVideoTrack.onended = () => stopScreenShare();
        } catch (err: any) {
            if (err.name !== 'NotAllowedError') {
                console.error('[ScreenShare] Error:', err);
            }
            setIsScreenSharing(false);
        }
    };

    const stopScreenShare = useCallback(() => {
        screenTrackRef.current?.stop();
        screenTrackRef.current = null;
        setIsScreenSharing(false);

        // Revert to camera if on
        if (localStream) {
            const camTrack = localStream.getVideoTracks()[0];
            if (camTrack) {
                callsRef.current.forEach((call) => {
                    const videoSender = call.peerConnection?.getSenders()
                        .find((s: RTCRtpSender) => s.track?.kind === 'video');
                    if (videoSender) videoSender.replaceTrack(camTrack);
                });
            }
            if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = isMuted;
                setIsMuted(!isMuted);
            }
        }
    };

    const toggleCamera = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = isCameraOff;
                setIsCameraOff(!isCameraOff);
            }
        }
    };

    const handleLeave = () => {
        if (isTeacher) {
            const token = localStorage.getItem('auth_token');
            fetch(`/api/live/end/${id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => {});
        }
        navigate(-1);
    };

    if (error) return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
            <AlertCircle size={48} className="text-red-500 mb-6" />
            <h1 className="text-xl font-black text-white mb-4">خطأ في الاتصال</h1>
            <p className="text-gray-400 mb-8 max-w-md text-sm leading-relaxed">{error}</p>
            <button onClick={() => navigate(-1)} className="bg-white text-black px-10 py-3 font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                العودة
            </button>
        </div>
    );

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center" dir="rtl">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-6" />
            <p className="text-white/40 font-black uppercase tracking-[0.3em]">جاري الاتصال...</p>
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
                    {isTeacher && (
                        <div className="flex items-center gap-1.5 text-white/40 text-xs">
                            <Users size={14} />
                            <span>{viewerCount} مشاهد</span>
                        </div>
                    )}
                </div>
                <button onClick={handleLeave} className="p-2 bg-red-600 hover:bg-red-700 transition-all rounded">
                    <PhoneOff size={18} />
                </button>
            </div>

            {/* Main video area */}
            <div className="flex-1 relative bg-black overflow-hidden">
                {isTeacher ? (
                    // Teacher sees their own stream (camera or screen share)
                    <>
                        <video
                            ref={localVideoRef}
                            autoPlay muted playsInline
                            className={cn(
                                "w-full h-full object-contain",
                                !isScreenSharing && !isCameraOff && "-scale-x-100"
                            )}
                        />
                        {(isCameraOff && !isScreenSharing) && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950">
                                <Crown size={80} className="text-white/10 mb-4" />
                                <p className="text-white/30 font-black uppercase tracking-widest text-sm">
                                    {isScreenSharing ? 'مشاركة الشاشة جارية' : 'الكاميرا متوقفة — شارك شاشتك للبدء'}
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    // Student sees teacher's stream
                    <>
                        <video
                            ref={remoteVideoRef}
                            autoPlay playsInline
                            className="w-full h-full object-contain"
                        />
                        {connectionStatus !== 'connected' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950">
                                <Loader2 size={48} className="text-red-600 animate-spin mb-6" />
                                <p className="text-white/40 font-black uppercase tracking-widest">بانتظار بث المعلمة...</p>
                                <p className="text-white/20 text-xs mt-2">سيبدأ البث تلقائياً عند بدء المعلمة</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Controls */}
            <div className="h-24 bg-black/80 backdrop-blur-2xl border-t border-white/10 flex items-center justify-center gap-5 px-6 shrink-0">
                {/* Screen Share - Teacher only */}
                {isTeacher && (
                    <button
                        onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                        className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center transition-all border-4 shadow-xl",
                            isScreenSharing
                                ? "bg-green-600 border-black text-white animate-pulse"
                                : "bg-white text-black border-black hover:scale-110"
                        )}
                        title={isScreenSharing ? "إيقاف مشاركة الشاشة" : "مشاركة الشاشة"}
                    >
                        <Monitor size={24} />
                    </button>
                )}

                {/* Mute */}
                <button
                    onClick={toggleMute}
                    className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center transition-all border-4 shadow-xl",
                        isMuted ? "bg-red-600 border-black" : "bg-white text-black border-black hover:scale-110"
                    )}
                    title={isMuted ? "تشغيل الميكروفون" : "كتم الميكروفون"}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                {/* End Call */}
                <button
                    onClick={handleLeave}
                    className="w-16 h-16 bg-red-600 border-4 border-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-2xl"
                >
                    <PhoneOff size={28} />
                </button>

                {/* Camera - Teacher only */}
                {isTeacher && (
                    <button
                        onClick={toggleCamera}
                        className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center transition-all border-4 shadow-xl",
                            isCameraOff ? "bg-red-600 border-black" : "bg-white text-black border-black hover:scale-110"
                        )}
                        title={isCameraOff ? "تشغيل الكاميرا" : "إيقاف الكاميرا"}
                    >
                        {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
                    </button>
                )}

                {/* Chat placeholder */}
                <button className="w-14 h-14 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all border-2 border-white/20">
                    <MessageSquare size={24} />
                </button>
            </div>
        </div>
    );
};

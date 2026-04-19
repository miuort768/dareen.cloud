import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Mic, MicOff, Video, VideoOff, PhoneOff, 
    MessageSquare, Settings, Users, Share, 
    Crown, Monitor
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import Peer from 'peerjs';

export const Classroom = () => {
    const { id } = useParams(); 
    const { currentUser } = useApp();
    const navigate = useNavigate();
    
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(true); // Default to Camera OFF
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const myVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<Peer | null>(null);
    const callRef = useRef<any>(null);

    useEffect(() => {
        let currentPeer: Peer | null = null;
        let currentStream: MediaStream | null = null;

        const initMedia = async () => {
            try {
                // High-quality Audio constraints
                const constraints = {
                    video: true,
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                };
                
                const initialStream = await navigator.mediaDevices.getUserMedia(constraints);
                
                // Disable video tracks immediately if camera is off
                initialStream.getVideoTracks().forEach(t => t.enabled = !isCameraOff);
                
                currentStream = initialStream;
                setStream(initialStream);
                setLoading(false);

                const peerId = currentUser?.role === 'teacher' ? `teacher-${id}` : `student-${currentUser?.id || Math.random().toString(36).substr(2, 9)}`;
                currentPeer = new Peer(peerId);
                peerRef.current = currentPeer;

                currentPeer.on('call', (call) => {
                    callRef.current = call;
                    call.answer(initialStream);
                    call.on('stream', (userRemoteStream) => {
                        console.log("📡 Remote stream received (Call Answer)");
                        handleRemoteStream(userRemoteStream);
                    });
                });

                if (currentUser?.role === 'student') {
                    setTimeout(() => {
                        const call = peerRef.current?.call(`teacher-${id}`, initialStream);
                        if (call) {
                            callRef.current = call;
                            call.on('stream', (userRemoteStream) => {
                                console.log("📡 Remote stream received (Student Call)");
                                handleRemoteStream(userRemoteStream);
                            });
                        }
                    }, 3000);
                }
            } catch (err: any) {
                console.error("Media Error:", err);
                setError("يرجى السماح بالوصول للميكروفون والكاميرا للمتابعة");
                setLoading(false);
            }
        };

        const handleRemoteStream = (userRemoteStream: MediaStream) => {
            setRemoteStream(userRemoteStream);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = userRemoteStream;
                remoteVideoRef.current.muted = false;
                remoteVideoRef.current.volume = 1.0;
                
                // Track debugger
                userRemoteStream.getAudioTracks().forEach(track => {
                    console.log(`🎵 Remote Audio Track: ${track.label}, Enabled: ${track.enabled}, ReadyState: ${track.readyState}`);
                    track.enabled = true; // Force enable
                });

                remoteVideoRef.current.play().catch(e => {
                    console.error("Auto-play failed", e);
                    // Standard browser fix: re-try on any click
                    const retryPlay = () => {
                        remoteVideoRef.current?.play();
                        document.removeEventListener('click', retryPlay);
                    };
                    document.addEventListener('click', retryPlay);
                });
            }
        };

        initMedia();

        return () => {
            currentStream?.getTracks().forEach(track => track.stop());
            currentPeer?.destroy();
        };
    }, [id, currentUser]);

    const startScreenShare = async () => {
        try {
            // 1. Get Screen Stream
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            setIsScreenSharing(true);
            
            // 2. Combine Screen Video + Microphone Audio
            const micTrack = stream?.getAudioTracks()[0];
            const combinedStream = new MediaStream([screenStream.getVideoTracks()[0]]);
            if (micTrack) combinedStream.addTrack(micTrack);
            
            // Update UI mirror
            if (myVideoRef.current) myVideoRef.current.srcObject = combinedStream;
            
            // 3. Update Existing Call or Start New
            if (callRef.current && callRef.current.peerConnection) {
                const videoTrack = screenStream.getVideoTracks()[0];
                const senders = callRef.current.peerConnection.getSenders();
                const videoSender = senders.find((s: any) => s.track?.kind === 'video');
                
                if (videoSender) {
                    videoSender.replaceTrack(videoTrack);
                } else {
                    // If no video sender existed, we must add it. This often requires a new call in PeerJS.
                    // For maximum compatibility, let's re-call the students or trigger a signal.
                    peerRef.current?.call(`student-${id}`, combinedStream); // Fallback recall
                }
            }

            screenStream.getVideoTracks()[0].onended = () => {
                setIsScreenSharing(false);
                // Revert to audio only
                if (stream) {
                    if (myVideoRef.current) myVideoRef.current.srcObject = stream;
                    const videoSender = callRef.current?.peerConnection?.getSenders().find((s: any) => s.track?.kind === 'video');
                    if (videoSender) videoSender.replaceTrack(null);
                }
            };
        } catch (err) {
            console.error("Screen share error:", err);
            setIsScreenSharing(false);
        }
    };

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleCamera = async () => {
        try {
            if (isCameraOff) {
                // Try to get video stream if we don't have it
                const videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(videoStream);
                if (myVideoRef.current) myVideoRef.current.srcObject = videoStream;
                
                // Replace audio/video tracks in call
                if (callRef.current?.peerConnection) {
                    videoStream.getTracks().forEach(track => {
                        const sender = callRef.current.peerConnection.getSenders().find((s: any) => s.track.kind === track.kind);
                        if (sender) sender.replaceTrack(track);
                        else callRef.current.peerConnection.addTrack(track, videoStream);
                    });
                }
                setIsCameraOff(false);
            } else {
                stream?.getVideoTracks().forEach(t => t.stop());
                setIsCameraOff(true);
            }
        } catch (err) {
            console.error("Camera access error:", err);
            alert("فشل الوصول للكاميرا. يرجى التأكد من الأذونات.");
        }
    };

    if (error) return (
        <div className="min-h-full bg-gray-950 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
            <div className="w-16 h-16 bg-rose-600 mb-6 flex items-center justify-center border-4 border-gray-950 shadow-[4px_4px_0px_0px_white]">
                <VideoOff size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white italic mb-4 uppercase tracking-tighter">خطأ في الكاميرا أو الميكروفون</h1>
            <p className="text-gray-400 text-sm max-w-xs mb-8">{error}</p>
            <button onClick={() => navigate(-1)} className="bg-white text-gray-950 px-8 py-3 font-black uppercase text-xs border-4 border-gray-950 shadow-[6px_6px_0px_0px_#444]">العودة للخلف</button>
        </div>
    );

    if (loading) return (
        <div className="min-h-full bg-gray-950 flex flex-col items-center justify-center" dir="rtl">
            <div className="relative w-16 h-16 mb-8">
                <div className="absolute inset-0 border-4 border-white/10" />
                <div className="absolute inset-0 border-4 border-primary-600 border-t-transparent animate-spin" />
            </div>
            <p className="text-white/20 font-black italic uppercase tracking-[0.3em]">جاري تهيئة الغرفة المباشرة...</p>
        </div>
    );

    if (currentUser?.role === 'student') {
        return (
            <div className="fixed inset-0 bg-gray-950 flex flex-col z-[2000] overflow-hidden" dir="rtl">
                {/* ══════════════ STUDENT HEADER ══════════════ */}
                <div className="h-16 bg-white/5 border-b border-white/10 flex items-center justify-between px-6 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center animate-pulse border-2 border-white/20">
                            <span className="text-[10px] font-black text-white">LIVE</span>
                        </div>
                        <h2 className="text-white font-black text-sm uppercase tracking-tighter italic">بث مباشر من المعلمة</h2>
                    </div>
                </div>

                {/* ══════════════ MAIN FOCUS: TEACHER SCREEN ══════════════ */}
                <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                    {remoteStream ? (
                        <video 
                            ref={remoteVideoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border-4 border-white/10 animate-spin-slow">
                                <Monitor size={48} className="text-white/20" />
                            </div>
                            <p className="text-white/40 font-black uppercase text-xs tracking-widest animate-pulse">بانتظار بدء الشرح من المعلمة...</p>
                        </div>
                    )}

                    {/* Minimalist Local Preview (Optional, only if camera is ON) */}
                    {!isCameraOff && (
                        <div className="absolute bottom-6 right-6 w-40 h-24 border-4 border-gray-950 shadow-2xl overflow-hidden bg-gray-900 ring-2 ring-white/10 scale-x-[-1]">
                            <video 
                                ref={myVideoRef} 
                                autoPlay 
                                muted 
                                playsInline 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </div>

                {/* ══════════════ FOCUS CONTROL BAR ══════════════ */}
                <div className="h-28 bg-gray-950/90 backdrop-blur-2xl flex items-center justify-center px-10 border-t-2 border-white/10 gap-8">
                    <button 
                        onClick={toggleMute}
                        className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-all border-4 shadow-xl",
                            isMuted ? "bg-red-600 border-gray-950 text-white" : "bg-white border-gray-950 text-gray-950 hover:scale-110"
                        )}
                    >
                        {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
                    </button>
                    
                    <button 
                        onClick={toggleCamera}
                        className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-all border-4 shadow-xl",
                            isCameraOff ? "bg-red-600 border-gray-950 text-white" : "bg-white border-gray-950 text-gray-950 hover:scale-110"
                        )}
                    >
                        {isCameraOff ? <VideoOff size={28} /> : <Video size={28} />}
                    </button>

                    <button 
                        onClick={() => navigate(-1)}
                        className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center border-8 border-gray-950 shadow-2xl hover:scale-110 active:scale-95 transition-all group"
                    >
                        <PhoneOff size={36} className="group-hover:rotate-[135deg] transition-transform" />
                    </button>

                    <button className="w-16 h-16 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all border-4 border-gray-900 shadow-xl border-white/20">
                        <MessageSquare size={28} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-gray-950 text-white flex flex-col font-black italic md:animate-in md:fade-in md:duration-500" dir="rtl">
            {/* Header */}
            <div className="h-16 border-b-4 border-white/10 flex items-center justify-between px-6 bg-gray-950/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-600 border-2 border-gray-950 flex items-center justify-center shadow-[3px_3px_0px_0px_white]">
                        <Crown size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg leading-none uppercase tracking-tighter">الغرفة الدراسية المباشرة</h2>
                        <p className="text-[10px] text-gray-400 font-bold">بث آمن ومستقر بواسطة دارين</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-[10px] text-primary-400">المستخدم الحالي</span>
                        <span className="text-xs">{currentUser?.name}</span>
                    </div>
                    <button className="p-2 hover:bg-white/5 transition-colors border border-white/10">
                        <Users size={20} />
                    </button>
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 transition-colors border border-white/10 text-rose-500">
                        <PhoneOff size={20} />
                    </button>
                </div>
            </div>

            {/* Main Video Area */}
            <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden relative">
                {/* Large Remote Video or Placeholder */}
                <div className="lg:col-span-3 bg-gray-900 border-4 border-white/5 relative overflow-hidden flex items-center justify-center group">
                    <video 
                        ref={remoteVideoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover"
                    />
                    {!remoteStream && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 animate-pulse">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <Users size={48} className="text-white/20" />
                            </div>
                            <p className="text-lg text-white/40 uppercase tracking-[0.2em]">بانتظار الطرف الآخر...</p>
                        </div>
                    )}
                    
                    {/* Bottom Status Overlay */}
                    <div className="absolute bottom-6 left-6 flex items-center gap-3">
                        <div className="bg-gray-950/80 backdrop-blur-md border border-white/20 px-4 py-2 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                            <span className="text-[10px] uppercase tracking-widest">مباشر الآن</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar area */}
                <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar">
                    {/* My Video */}
                    <div className="aspect-video bg-gray-900 border-4 border-primary-600/30 relative overflow-hidden shadow-2xl group">
                        <video 
                            ref={myVideoRef} 
                            autoPlay 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover -scale-x-100"
                        />
                        <div className="absolute top-2 right-2 bg-gray-950/80 px-2 py-0.5 text-[8px] border border-white/20 uppercase">
                            أنت (المعاينة)
                        </div>
                    </div>

                    {/* Quick Tools */}
                    <div className="bg-white/5 border border-white/10 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h5 className="text-[10px] uppercase font-black text-gray-500">أدوات التحكم</h5>
                            <Settings size={14} className="text-gray-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {currentUser?.role === 'teacher' && (
                                <button 
                                    onClick={startScreenShare}
                                    className={cn(
                                        "h-12 flex flex-col items-center justify-center border border-white/10 text-[9px] gap-1 transition-colors",
                                        isScreenSharing ? "bg-emerald-600 text-white border-emerald-400" : "bg-white/5 hover:bg-white/10"
                                    )}
                                >
                                    <Share size={16} /> 
                                    {isScreenSharing ? "جاري المشاركة" : "مشاركة الشاشة"}
                                </button>
                            )}
                            <button className="bg-white/5 hover:bg-white/10 h-12 flex flex-col items-center justify-center border border-white/10 text-[9px] gap-1">
                                <MessageSquare size={16} /> الدردشة
                            </button>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="flex-1 bg-primary-600/10 border-4 border-primary-600/20 p-6 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-primary-600 flex items-center justify-center mb-4">
                            <Monitor size={24} />
                        </div>
                        <h4 className="text-sm mb-2 uppercase">مشاركة الشاشة</h4>
                        <p className="text-[10px] text-gray-400 font-bold italic leading-relaxed">المعلمة ستقوم بمشاركة شاشتها معك للشرح المباشر.</p>
                    </div>
                </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="h-24 bg-gray-950/90 backdrop-blur-xl border-t-4 border-white/10 flex items-center justify-center gap-6">
                <button 
                    onClick={toggleMute}
                    className={cn(
                        "w-14 h-14 flex items-center justify-center transition-all border-4",
                        isMuted ? "bg-rose-600 border-gray-950 text-white" : "bg-white border-gray-950 text-gray-950 hover:scale-110 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                    )}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                
                <button 
                    onClick={toggleCamera}
                    className={cn(
                        "w-14 h-14 flex items-center justify-center transition-all border-4",
                        isCameraOff ? "bg-rose-600 border-gray-950 text-white" : "bg-white border-gray-950 text-gray-950 hover:scale-110 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                    )}
                >
                    {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
                </button>
                
                <button 
                    onClick={() => navigate(-1)}
                    className="w-14 h-14 bg-rose-600 border-4 border-gray-950 text-white flex items-center justify-center hover:scale-110 shadow-[4px_4px_0px_0px_rgba(224,36,36,0.3)] transition-all"
                >
                    <PhoneOff size={24} />
                </button>
            </div>
        </div>
    );
};

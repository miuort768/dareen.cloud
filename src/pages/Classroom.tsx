import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Mic, MicOff, Video, VideoOff, PhoneOff, 
    MessageSquare, Users, Crown, Monitor, Loader2, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import Peer from 'peerjs';

export const Classroom = () => {
    const { id } = useParams(); // Session ID
    const { currentUser } = useApp();
    const navigate = useNavigate();
    
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewerCount, setViewerCount] = useState(0);
    
    const myVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<Peer | null>(null);
    const callsRef = useRef<any[]>([]); // For Teacher: Track all student calls
    const singleCallRef = useRef<any>(null); // For Student: Track single teacher call

    useEffect(() => {
        let currentPeer: Peer | null = null;
        let currentStream: MediaStream | null = null;

        const initMedia = async () => {
            try {
                const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
                
                // If student/parent, we don't necessarily need their camera/mic unless they want to interact
                // For a broadcast system, we can start with empty stream for viewers to save bandwidth/privacy
                let initialStream: MediaStream;
                
                if (isTeacher) {
                    initialStream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: { echoCancellation: true, noiseSuppression: true }
                    });
                    // Initially disable video if isCameraOff is true
                    initialStream.getVideoTracks().forEach(t => t.enabled = !isCameraOff);
                } else {
                    // Students join with audio only or nothing for now to simplify
                    initialStream = await navigator.mediaDevices.getUserMedia({
                        video: false,
                        audio: true
                    });
                }
                
                currentStream = initialStream;
                setStream(initialStream);
                setLoading(false);

                // Peer ID Setup
                // Teacher: Fixed ID based on session
                // Student: Unique ID
                const peerId = isTeacher ? `teacher-stream-${id}` : `viewer-${currentUser?.id || Math.random().toString(36).substr(2, 9)}`;
                currentPeer = new Peer(peerId);
                peerRef.current = currentPeer;

                currentPeer.on('open', (id) => {
                    console.log('Peer ID Open:', id);
                });

                if (isTeacher) {
                    // TEACHER LOGIC: Accept calls from multiple students
                    currentPeer.on('call', (call) => {
                        console.log('Receiving call from student...');
                        call.answer(currentStream!); // Send teacher's stream (camera or screen)
                        callsRef.current.push(call);
                        setViewerCount(prev => prev + 1);
                        
                        call.on('close', () => {
                            callsRef.current = callsRef.current.filter(c => c !== call);
                            setViewerCount(prev => Math.max(0, prev - 1));
                        });
                    });
                } else {
                    // STUDENT/PARENT LOGIC: Call the teacher
                    // Delay slightly to ensure teacher peer is ready
                    setTimeout(() => {
                        const call = currentPeer?.call(`teacher-stream-${id}`, initialStream);
                        if (call) {
                            singleCallRef.current = call;
                            call.on('stream', (teacherStream) => {
                                console.log("📡 Teacher stream received");
                                handleRemoteStream(teacherStream);
                            });
                            call.on('error', (err) => {
                                console.error('Call error:', err);
                                setError("فشل الاتصال بالمعلمة. قد يكون البث قد انتهى.");
                            });
                        }
                    }, 2000);
                }
            } catch (err: any) {
                console.error("Media Error:", err);
                setError("يرجى السماح بالوصول للميكروفون والكاميرا للمشاركة في البث.");
                setLoading(false);
            }
        };

        const handleRemoteStream = (userRemoteStream: MediaStream) => {
            setRemoteStream(userRemoteStream);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = userRemoteStream;
                remoteVideoRef.current.play().catch(e => console.error("Play error:", e));
            }
        };

        initMedia();

        return () => {
            currentStream?.getTracks().forEach(track => track.stop());
            currentPeer?.destroy();
            if (currentUser?.role === 'teacher') {
                api.post(`/live/end/${id}`).catch(() => {});
            }
        };
    }, [id, currentUser]);

    const startScreenShare = async () => {
        if (currentUser?.role !== 'teacher' && currentUser?.role !== 'admin') return;
        
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            setIsScreenSharing(true);
            
            const screenTrack = screenStream.getVideoTracks()[0];
            
            // Replace track for all active student calls
            callsRef.current.forEach(call => {
                const videoSender = call.peerConnection.getSenders().find((s: any) => s.track?.kind === 'video');
                if (videoSender) {
                    videoSender.replaceTrack(screenTrack);
                }
            });

            // Local preview
            if (myVideoRef.current) {
                myVideoRef.current.srcObject = screenStream;
            }

            screenTrack.onended = () => {
                stopScreenShare();
            };
        } catch (err) {
            console.error("Screen share error:", err);
            setIsScreenSharing(false);
        }
    };

    const stopScreenShare = () => {
        setIsScreenSharing(false);
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            callsRef.current.forEach(call => {
                const videoSender = call.peerConnection.getSenders().find((s: any) => s.track?.kind === 'video');
                if (videoSender) videoSender.replaceTrack(videoTrack);
            });
            if (myVideoRef.current) myVideoRef.current.srcObject = stream;
        }
    };

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleCamera = () => {
        if (stream && stream.getVideoTracks().length > 0) {
            const newState = !isCameraOff;
            stream.getVideoTracks()[0].enabled = !newState;
            setIsCameraOff(newState);
        }
    };

    if (error) return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
            <div className="w-16 h-16 bg-red-600/20 text-red-600 rounded-full flex items-center justify-center mb-6">
                <AlertCircle size={32} />
            </div>
            <h1 className="text-2xl font-black text-white mb-4">خطأ في الاتصال</h1>
            <p className="text-gray-400 mb-8 max-w-md">{error}</p>
            <button onClick={() => navigate(-1)} className="bg-white text-black px-10 py-3 font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">العودة للخلف</button>
        </div>
    );

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center" dir="rtl">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-6" />
            <p className="text-white/40 font-black uppercase tracking-[0.3em]">جاري الاتصال بالبث المباشر...</p>
        </div>
    );

    const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

    return (
        <div className="fixed inset-0 bg-gray-950 text-white flex flex-col overflow-hidden" dir="rtl">
            {/* Top Navigation */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/40 backdrop-blur-xl z-50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-none">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">LIVE STREAM</span>
                    </div>
                    <h2 className="text-sm font-black hidden md:block">البث المباشر لأكاديمية دارين</h2>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                        <Users size={16} />
                        <span className="font-bold">{viewerCount} مشاهد</span>
                    </div>
                    <button onClick={() => navigate(-1)} className="p-2 bg-red-600 hover:bg-red-700 transition-all">
                        <PhoneOff size={20} />
                    </button>
                </div>
            </div>

            {/* Main Streaming Area */}
            <div className="flex-1 relative flex flex-col lg:flex-row">
                <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                    {isTeacher ? (
                        <div className="w-full h-full relative">
                            <video 
                                ref={myVideoRef} 
                                autoPlay 
                                muted 
                                playsInline 
                                className={cn("w-full h-full object-contain", !isScreenSharing && "-scale-x-100")}
                            />
                            {isCameraOff && !isScreenSharing && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950">
                                    <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border-4 border-white/10 mb-6">
                                        <Crown size={64} className="text-white/10" />
                                    </div>
                                    <p className="text-white/40 font-black uppercase tracking-widest">الكاميرا متوقفة</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full relative">
                            {remoteStream ? (
                                <video 
                                    ref={remoteVideoRef} 
                                    autoPlay 
                                    playsInline 
                                    className="w-full h-full object-contain shadow-2xl"
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950">
                                    <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-6" />
                                    <p className="text-white/40 font-black uppercase tracking-widest">بانتظار بث المعلمة...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Local Small Preview for Teacher */}
                    {isTeacher && isScreenSharing && (
                        <div className="absolute bottom-6 right-6 w-64 aspect-video border-4 border-gray-950 shadow-2xl bg-gray-900 z-50">
                             <div className="absolute top-2 left-2 bg-red-600 text-[8px] px-2 py-0.5 font-black uppercase">عرض المعلمة</div>
                             <video 
                                autoPlay 
                                muted 
                                playsInline 
                                className="w-full h-full object-cover"
                                ref={(el) => { if (el) el.srcObject = stream; }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Controls Bar */}
            <div className="h-28 bg-black/60 backdrop-blur-2xl border-t border-white/10 flex items-center justify-center gap-6 px-6">
                {isTeacher && (
                    <button 
                        onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                        className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-all border-4",
                            isScreenSharing ? "bg-red-600 border-black" : "bg-white text-black border-black hover:scale-110"
                        )}
                    >
                        {isScreenSharing ? <VideoOff size={28} /> : <Monitor size={28} />}
                    </button>
                )}

                <button 
                    onClick={toggleMute}
                    className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center transition-all border-4",
                        isMuted ? "bg-red-600 border-black" : "bg-white text-black border-black hover:scale-110"
                    )}
                >
                    {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
                </button>

                {isTeacher && (
                    <button 
                        onClick={toggleCamera}
                        className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-all border-4",
                            isCameraOff ? "bg-red-600 border-black" : "bg-white text-black border-black hover:scale-110"
                        )}
                    >
                        {isCameraOff ? <Video size={28} /> : <VideoOff size={28} />}
                    </button>
                )}

                <button className="w-16 h-16 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all border-2 border-white/20">
                    <MessageSquare size={28} />
                </button>
            </div>
        </div>
    );
};

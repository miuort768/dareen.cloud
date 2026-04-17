import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Mic, MicOff, Video, VideoOff, PhoneOff, 
    MessageSquare, Settings, Users, Share, 
    Crown, User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import Peer from 'peerjs';

export const Classroom = () => {
    const { id } = useParams(); // This is the studentId/roomSuffix
    const { currentUser } = useApp();
    const navigate = useNavigate();
    
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    
    const myVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<Peer | null>(null);

    useEffect(() => {
        // Initialize Media
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(myStream => {
                setStream(myStream);
                if (myVideoRef.current) myVideoRef.current.srcObject = myStream;
                
                // Initialize Peer
                const peerId = currentUser?.role === 'teacher' ? `teacher-${id}` : `student-${currentUser?.id}`;
                const peer = new Peer(peerId);
                peerRef.current = peer;

                peer.on('open', (id) => console.log('My peer ID is: ' + id));

                // If student, they will likely "Call" or wait to be called
                // If teacher, they wait for connections or initiate
                
                peer.on('call', (call) => {
                    call.answer(myStream);
                    call.on('stream', (userRemoteStream) => {
                        setRemoteStream(userRemoteStream);
                        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = userRemoteStream;
                    });
                });

                if (currentUser?.role === 'student') {
                    // Try calling teacher
                    setTimeout(() => {
                        const call = peer.call(`teacher-${id}`, myStream);
                        call.on('stream', (userRemoteStream) => {
                            setRemoteStream(userRemoteStream);
                            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = userRemoteStream;
                        });
                    }, 2000);
                }
            })
            .catch(err => console.error("Failed to get stream", err));

        return () => {
            stream?.getTracks().forEach(track => track.stop());
            peerRef.current?.destroy();
        };
    }, []);

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleCamera = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = isCameraOff;
            setIsCameraOff(!isCameraOff);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col font-black italic">
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
                    <button className="p-2 hover:bg-white/5 transition-colors border border-white/10 text-rose-500">
                        <PhoneOff size={20} onClick={() => navigate(-1)} />
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

                {/* Sidebar area: Chat, Self Video, Participants */}
                <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar">
                    {/* My Video */}
                    <div className="aspect-video bg-gray-900 border-4 border-primary-600/30 relative overflow-hidden shadow-2xl overflow-hidden group">
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
                            <button className="bg-white/5 hover:bg-white/10 h-12 flex flex-col items-center justify-center border border-white/10 text-[9px] gap-1">
                                <Share size={16} /> مشاركة
                            </button>
                            <button className="bg-white/5 hover:bg-white/10 h-12 flex flex-col items-center justify-center border border-white/10 text-[9px] gap-1">
                                <MessageSquare size={16} /> الدردشة
                            </button>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="flex-1 bg-primary-600/10 border-4 border-primary-600/20 p-6 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-primary-600 flex items-center justify-center mb-4">
                            <User size={24} />
                        </div>
                        <h4 className="text-sm mb-2 uppercase">انضباط الحصة</h4>
                        <p className="text-[10px] text-gray-400 font-bold italic leading-relaxed">يرجى التأكد من هدوء المكان ووضوح الإضاءة للحصول على أفضل تجربة تعليمية.</p>
                    </div>
                </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="h-24 bg-gray-950/90 backdrop-blur-xl border-t-4 border-white/10 flex items-center justify-center gap-6">
                <button 
                    onClick={toggleMute}
                    className={cn(
                        "w-14 h-14 flex items-center justify-center transition-all border-4",
                        isMuted ? "bg-rose-600 border-gray-950 text-white" : "bg-white border-gray-950 text-gray-950 hover:scale-110 active:scale-95 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                    )}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                
                <button 
                    onClick={toggleCamera}
                    className={cn(
                        "w-14 h-14 flex items-center justify-center transition-all border-4",
                        isCameraOff ? "bg-rose-600 border-gray-950 text-white" : "bg-white border-gray-950 text-gray-950 hover:scale-110 active:scale-95 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                    )}
                >
                    {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
                </button>
                
                <button 
                    onClick={() => navigate(-1)}
                    className="w-14 h-14 bg-rose-600 border-4 border-gray-950 text-white flex items-center justify-center hover:scale-110 active:scale-95 shadow-[4px_4px_0px_0px_rgba(224,36,36,0.3)] transition-all"
                >
                    <PhoneOff size={24} />
                </button>
            </div>
        </div>
    );
};

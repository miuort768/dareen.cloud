import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { X, ScreenShare, ScreenShareOff, Mic, MicOff, Maximize2, Minimize2 } from 'lucide-react';
import { socketService } from '../../../lib/socket';
import { cn } from '../../../lib/utils';
import type { User } from '../../../types/auth';

interface MeetingRoomProps {
    conversationId: string;
    currentUser: User;
    isTeacher: boolean;
    onClose: () => void;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({
    conversationId,
    currentUser,
    isTeacher,
    onClose
}) => {
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const socket = socketService.getSocket();

    const streamRef = useRef<MediaStream | null>(null);
    const peerRef = useRef<Peer | null>(null);

    // 1. Initialize Peer once with STUN servers for better connectivity
    useEffect(() => {
        const peerInstance = new Peer({
            config: {
                'iceServers': [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                ]
            }
        });
        peerRef.current = peerInstance;

        peerInstance.on('open', (id) => {
            console.log('✅ PeerJS Connected. ID:', id);
            // If I'm late to the party and already sharing (rare but possible), announce
            // This check uses the current state of isSharing, which might not be fully up-to-date
            // if the component just mounted and isSharing was true from a previous render.
            // The primary announcement happens in startSharing.
            if (isTeacher && isSharing && streamRef.current) {
                socket.emit('start_meeting', {
                    conversationId,
                    teacherId: currentUser.id,
                    teacherName: currentUser.name,
                    peerId: id
                });
            }
        });

        peerInstance.on('call', (call) => {
            console.log('📞 Incoming call from student...');
            if (isTeacher && streamRef.current) {
                console.log('📤 Sending stream to student');
                call.answer(streamRef.current);
            } else {
                call.answer();
            }

            call.on('stream', (remote) => {
                console.log('📡 Teacher received remote stream (student audio)');
                setRemoteStream(remote);
            });
        });

        peerInstance.on('error', (err) => {
            console.error('❌ PeerJS Error:', err.type, err.message);
        });

        return () => {
            peerInstance.destroy();
            peerRef.current = null;
        };
    }, [currentUser.id]); // Only re-init if user changes

    // 2. Handle Socket Listeners and Broadcasts
    useEffect(() => {
        if (!socket) return;

        const handleRequestStatus = (data: any) => {
            if (isTeacher && data.conversationId === conversationId && streamRef.current && peerRef.current?.id) {
                console.log('🙋 Student requested status. Re-broadcasting peerId.');
                socket.emit('start_meeting', {
                    conversationId,
                    teacherId: currentUser.id,
                    teacherName: currentUser.name,
                    peerId: peerRef.current.id
                });
            }
        };

        const handleStarted = (data: any) => {
            if (!isTeacher && data.conversationId === conversationId && data.peerId && peerRef.current) {
                console.log('🚀 Teacher sharing detected! Calling Teacher ID:', data.peerId);
                // A MediaStream is needed for the call, even if empty, to establish the connection
                const call = peerRef.current.call(data.peerId, new MediaStream());
                call.on('stream', (remote) => {
                    console.log('🎬 GREAT SUCCESS! Remote stream received from teacher.');
                    setRemoteStream(remote);
                });

                call.on('error', (err) => {
                    console.error('❌ Call error:', err);
                });
            }
        };

        socket.on('request_meeting_status', handleRequestStatus);
        socket.on('meeting_started', handleStarted);

        if (!isTeacher) {
            console.log('🔍 Requesting meeting status from teacher...');
            // Request status in case it started before I opened the UI
            socket.emit('request_meeting_status', { conversationId });
        }

        return () => {
            socket.off('request_meeting_status', handleRequestStatus);
            socket.off('meeting_started', handleStarted);
            streamRef.current?.getTracks().forEach(track => track.stop());
            if (isTeacher) {
                console.log('⏹️ Ending meeting broadcast');
                socket.emit('end_meeting', { conversationId });
            }
        };
    }, [conversationId, isTeacher, socket, currentUser.id, currentUser.name]); // Added currentUser.id/name for handleRequestStatus

    const startSharing = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            streamRef.current = screenStream;
            setIsSharing(true);

            if (videoRef.current) {
                videoRef.current.srcObject = screenStream;
            }

            // Immediately notify everyone that I am now sharing
            if (peerRef.current?.id) {
                socket.emit('start_meeting', {
                    conversationId,
                    teacherId: currentUser.id,
                    teacherName: currentUser.name,
                    peerId: peerRef.current.id
                });
            }
        } catch (err) {
            console.error("Error sharing screen:", err);
        }
    };

    const stopSharing = () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setIsSharing(false);
        socket.emit('end_meeting', { conversationId });
    };

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    return (
        <div className="fixed inset-0 z-[200000] bg-black/95 flex flex-col">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-black uppercase tracking-[2px] text-sm">حصة مباشرة - {isTeacher ? 'المعلم' : 'طالب/ولي أمر'}</span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className="p-2 text-white/70 hover:text-white transition-colors"
                    >
                        {isFullScreen ? <Minimize2 /> : <Maximize2 />}
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-none transition-all flex items-center gap-2 font-bold px-4"
                    >
                        <X size={20} />
                        <span>إنهاء الحصة</span>
                    </button>
                </div>
            </div>

            {/* Main Viewport */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden p-4">
                {isTeacher ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                        {isSharing ? (
                            <div className="relative w-full h-full max-w-5xl bg-gray-900 shadow-2xl overflow-hidden border-2 border-primary-500 rounded-2xl">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-[10px] font-black uppercase">جارِ مشاركة الشاشة</div>
                            </div>
                        ) : (
                            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto border-2 border-primary-600/40">
                                    <ScreenShare size={48} className="text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white mb-2">لبدء الحصة، شارك شاشتك</h3>
                                    <p className="text-gray-400 max-w-sm mx-auto">سيتمكن الطلاب من رؤية ما تشرحه على شاشتك بوضوح تام.</p>
                                </div>
                                <button
                                    onClick={startSharing}
                                    className="bg-primary-600 hover:bg-primary-700 text-white font-black py-4 px-10 rounded-none shadow-[0_10px_20px_rgba(79,70,229,0.3)] transition-all active:scale-95"
                                >
                                    ابدأ مشاركة الشاشة الآن
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                        {remoteStream ? (
                            <div className="relative w-full h-full max-w-5xl bg-gray-900 shadow-2xl overflow-hidden border-2 border-emerald-500 rounded-2xl">
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 text-[10px] font-black uppercase">بث مباشر من المعلم</div>
                            </div>
                        ) : (
                            <div className="text-center space-y-8">
                                <div className="relative w-24 h-24 mx-auto">
                                    <div className="absolute inset-0 border-4 border-primary-600/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-t-primary-600 rounded-full animate-spin"></div>
                                </div>
                                <div className="animate-pulse space-y-3">
                                    <h3 className="text-xl font-black text-white">بانتظار بدء المعلم للشرح...</h3>
                                    <p className="text-gray-400 text-sm">ستظهر الشاشة هنا تلقائياً فور بدء البث.</p>
                                </div>

                                <button
                                    onClick={() => socket.emit('request_meeting_status', { conversationId })}
                                    className="text-[11px] font-black text-primary-500 border border-primary-500/30 px-6 py-2 hover:bg-primary-500/10 transition-all uppercase tracking-widest"
                                >
                                    إعادة محاولة الاتصال
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="h-20 bg-black/60 backdrop-blur-xl border-t border-white/10 flex items-center justify-center gap-8 px-6">
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                        isMuted ? "bg-red-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
                    )}
                >
                    {isMuted ? <MicOff /> : <Mic />}
                </button>

                {isTeacher && (
                    <button
                        onClick={isSharing ? stopSharing : startSharing}
                        className={cn(
                            "px-8 h-12 font-bold flex items-center gap-3 transition-all",
                            isSharing ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
                        )}
                    >
                        {isSharing ? <ScreenShareOff /> : <ScreenShare />}
                        <span>{isSharing ? 'إيقاف المشاركة' : 'مشاركة الشاشة'}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

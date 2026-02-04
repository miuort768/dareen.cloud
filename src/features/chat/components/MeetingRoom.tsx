import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { X, ScreenShare, ScreenShareOff, Maximize2, Minimize2, Share2 } from 'lucide-react';
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
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const socket = socketService.getSocket();

    const [connectionStatus, setConnectionStatus] = useState<'initializing' | 'connecting' | 'connected' | 'failed'>('initializing');
    const streamRef = useRef<MediaStream | null>(null);
    const peerRef = useRef<Peer | null>(null);

    const activeCallsRef = useRef<Record<string, any>>({});

    // Play video manually (for browser autoplay restrictions)
    const handlePlayVideo = async () => {
        console.log('🚀 [DARIN-MEETING] Play button clicked!');
        if (!remoteVideoRef.current) {
            console.error('🚀 [DARIN-MEETING] Video ref is null!');
            return;
        }

        if (!remoteVideoRef.current.srcObject) {
            console.error('🚀 [DARIN-MEETING] No srcObject on video!');
            return;
        }

        try {
            console.log('🚀 [DARIN-MEETING] Setting volume and playing...');
            remoteVideoRef.current.volume = 1.0;
            remoteVideoRef.current.muted = false;
            await remoteVideoRef.current.play();
            setIsPlaying(true);
            console.log('🚀 [DARIN-MEETING] ✅ Video/Audio playing successfully!');
        } catch (err: any) {
            console.error('🚀 [DARIN-MEETING] ❌ Play failed:', err.message, err);
            alert('حدثت مشكلة في تشغيل الفيديو: ' + err.message);
        }
    };

    // 1. Initialize Peer once with STUN servers
    useEffect(() => {
        console.log('🚀 [DARIN-MEETING] Initializing PeerJS...');
        const peerInstance = new Peer({
            config: {
                'iceServers': [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                    { urls: 'stun:stun.services.mozilla.com' }
                ]
            }
        });
        peerRef.current = peerInstance;

        peerInstance.on('open', (id) => {
            console.log('🚀 [DARIN-MEETING] My Peer ID:', id);
            setConnectionStatus('connecting');

            // If I'm a student, tell teacher I'm ready to receive
            if (!isTeacher) {
                console.log('🚀 [DARIN-MEETING] Student ID ready, asking teacher to CALL ME');
                socket.emit('request_meeting_status', {
                    conversationId,
                    studentPeerId: id,
                    studentName: currentUser.name
                });
            }
        });

        // Listen for incoming calls (Teacher calling Students)
        peerInstance.on('call', (call) => {
            console.log('🚀 [DARIN-MEETING] Incoming call received from:', call.peer);

            if (!isTeacher) {
                // Student answers teacher's call
                call.answer();
                call.on('stream', (remote) => {
                    console.log('🚀 [DARIN-MEETING] STREAM RECEIVED FROM TEACHER!');
                    setRemoteStream(remote);
                    setConnectionStatus('connected');
                });
            } else {
                // If teacher receives a call, answer with stream
                if (streamRef.current) {
                    console.log('🚀 [DARIN-MEETING] Answering student call with stream');
                    call.answer(streamRef.current);
                } else {
                    call.answer();
                }
            }
        });

        peerInstance.on('error', (err) => {
            console.error('❌ [DARIN-MEETING] PeerJS Error:', err.type, err.message);
        });

        return () => {
            Object.values(activeCallsRef.current).forEach((call: any) => call.close());
            peerInstance.destroy();
            peerRef.current = null;
        };
    }, [currentUser.id]);

    // 2. Handle Socket Listeners and Broadcasts
    useEffect(() => {
        if (!socket) return;

        const handleRequestStatus = (data: any) => {
            if (isTeacher && isSharing && streamRef.current && peerRef.current) {
                if (data.studentPeerId && data.conversationId === conversationId) {
                    console.log(`🚀 [DARIN-MEETING] Student joined, CALLING them: ${data.studentPeerId}`);
                    const call = peerRef.current.call(data.studentPeerId, streamRef.current);
                    activeCallsRef.current[data.studentPeerId] = call;

                    call.on('close', () => {
                        delete activeCallsRef.current[data.studentPeerId];
                    });
                }
            }
        };

        const handleStarted = (data: any) => {
            if (!isTeacher && data.conversationId === conversationId && peerRef.current?.id) {
                console.log('🚀 [DARIN-MEETING] Teacher active, asking for call...');
                socket.emit('request_meeting_status', {
                    conversationId,
                    studentPeerId: peerRef.current.id,
                    studentName: currentUser.name
                });
            }
        };

        socket.on('request_meeting_status', handleRequestStatus);
        socket.on('meeting_started', handleStarted);

        return () => {
            socket.off('request_meeting_status', handleRequestStatus);
            socket.off('meeting_started', handleStarted);
            streamRef.current?.getTracks().forEach(track => track.stop());
            if (isTeacher) {
                console.log('🚀 [DARIN-MEETING] Cleaning up meeting');
                socket.emit('end_meeting', { conversationId });
            }
        };
    }, [conversationId, isTeacher, isSharing, socket, currentUser.id, currentUser.name]);

    // 3. Student Auto-Retry: Keep requesting until stream received
    useEffect(() => {
        if (!isTeacher && !remoteStream && peerRef.current?.id) {
            console.log('🚀 [DARIN-MEETING] Starting student auto-retry...');
            const retryInterval = setInterval(() => {
                console.log('🚀 [DARIN-MEETING] Student auto-requesting status...');
                socket.emit('request_meeting_status', {
                    conversationId,
                    studentPeerId: peerRef.current?.id,
                    studentName: currentUser.name
                });
            }, 2000);

            return () => clearInterval(retryInterval);
        }
    }, [isTeacher, remoteStream, conversationId, currentUser.name]);

    const startSharing = async () => {
        try {
            console.log('🚀 [DARIN-MEETING] Starting screen share...');
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            streamRef.current = screenStream;
            setIsSharing(true);
            setConnectionStatus('connected'); // Teacher is now live

            if (videoRef.current) {
                videoRef.current.srcObject = screenStream;
            }

            // Immediately notify everyone that I am now sharing
            if (peerRef.current?.id) {
                console.log('🚀 [DARIN-MEETING] Broadcasting start_meeting to all students');
                socket.emit('start_meeting', {
                    conversationId,
                    teacherId: currentUser.id,
                    teacherName: currentUser.name,
                    peerId: peerRef.current.id
                });
            }
        } catch (err) {
            console.error("Error sharing screen:", err);
            setConnectionStatus('failed');
        }
    };

    const stopSharing = () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setIsSharing(false);
        socket.emit('end_meeting', { conversationId });
    };

    // Update video srcObject when stream arrives (but don't auto-play)
    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            console.log('🚀 [DARIN-MEETING] Setting srcObject on video element');
            remoteVideoRef.current.srcObject = remoteStream;
            console.log('🚀 [DARIN-MEETING] srcObject set. Ready for manual play.');
        }
    }, [remoteStream]);

    return (
        <div className="fixed inset-0 z-[200000] bg-black/95 flex flex-col">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-3 h-3 rounded-full animate-pulse",
                            connectionStatus === 'connected' ? "bg-emerald-500" : "bg-red-500"
                        )}></div>
                        <span className="text-white font-black uppercase tracking-[2px] text-xs">
                            {isTeacher ? 'بث المعلم' : 'متابعة الحصة'}
                            <span className="mx-2 opacity-40">|</span>
                            <span className={cn(
                                "text-[10px]",
                                connectionStatus === 'connected' ? "text-emerald-400" : "text-yellow-400"
                            )}>
                                {connectionStatus === 'initializing' && 'جاري التهيئة...'}
                                {connectionStatus === 'connecting' && 'جاري الاتصال...'}
                                {connectionStatus === 'connected' && 'متصل الآن'}
                                {connectionStatus === 'failed' && 'فشل الاتصال'}
                            </span>
                        </span>
                    </div>
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
                        <span>إنهاء</span>
                    </button>
                </div>
            </div>

            {/* Main Viewport */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden p-4">
                {isTeacher ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                        {isSharing ? (
                            <div className="relative w-full h-full max-w-6xl bg-gray-900 shadow-2xl overflow-hidden border-2 border-primary-500 rounded-2xl">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-tighter shadow-lg">جارِ مشاركة الشاشة</div>
                            </div>
                        ) : (
                            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto border-2 border-primary-600/40">
                                    <ScreenShare size={48} className="text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white mb-2">لبدء الحصة، شارك شاشتك</h3>
                                    <p className="text-gray-400 max-w-sm mx-auto">سيتمكن الطلاب من رؤية ما تشرحه على شاشتك بصوت وصورة واضحة.</p>
                                </div>
                                <button
                                    onClick={startSharing}
                                    className="bg-primary-600 hover:bg-primary-700 text-white font-black py-4 px-10 rounded-none shadow-[0_10px_20px_rgba(79,70,229,0.3)] transition-all active:scale-95 flex items-center gap-3 mx-auto"
                                >
                                    <ScreenShare size={20} />
                                    ابدأ مشاركة الشاشة الآن
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                        {remoteStream ? (
                            <div className="relative w-full h-full max-w-6xl bg-gray-900 shadow-2xl overflow-hidden border-2 border-emerald-500 rounded-2xl">
                                <video
                                    ref={remoteVideoRef}
                                    playsInline
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-tighter shadow-lg">بث مباشر من المعلم</div>

                                {!isPlaying && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                        <button
                                            onClick={handlePlayVideo}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-6 px-12 rounded-2xl shadow-2xl transition-all active:scale-95 flex flex-col items-center gap-4"
                                        >
                                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                                                <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
                                            </div>
                                            <span className="text-2xl">اضغط لبدء مشاهدة الحصة</span>
                                            <span className="text-sm opacity-80">(الصوت + الفيديو)</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center space-y-8 max-w-md">
                                <div className="relative w-32 h-32 mx-auto">
                                    <div className="absolute inset-0 border-8 border-primary-600/10 rounded-full"></div>
                                    <div className="absolute inset-0 border-8 border-t-primary-600 rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ScreenShare size={40} className="text-primary-600 animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-white tracking-tight">بانتظار وصول إشارة المعلم...</h3>
                                    <p className="text-gray-400 font-medium leading-relaxed">
                                        تأكد أن المعلم قد بدأ بمشاركة شاشته بالفعل. المزامنة تتم تلقائياً فور توفر البث.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => {
                                            setConnectionStatus('connecting');
                                            socket.emit('request_meeting_status', { conversationId });
                                        }}
                                        className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-4 px-8 rounded-none transition-all flex items-center justify-center gap-3"
                                    >
                                        <Share2 size={18} />
                                        إعادة محاولة الربط
                                    </button>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center">
                                        الحالة الحالية: {connectionStatus}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="h-20 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-center gap-8 px-6 relative z-10">
                {isTeacher && (
                    <button
                        onClick={isSharing ? stopSharing : startSharing}
                        className={cn(
                            "px-8 h-12 font-bold flex items-center gap-3 transition-all rounded-lg",
                            isSharing ? "bg-red-600 hover:bg-red-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        )}
                    >
                        {isSharing ? <ScreenShareOff /> : <ScreenShare />}
                        <span>{isSharing ? 'إيقاف المشاركة' : 'مشاركة الشاشة'}</span>
                    </button>
                )}

                {!isTeacher && remoteStream && (
                    <div className="text-gray-400 text-sm font-bold">
                        💡 تأكد من رفع صوت جهازك لسماع الشرح
                    </div>
                )}
            </div>
        </div>
    );
};

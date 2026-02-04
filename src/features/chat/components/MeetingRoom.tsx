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
    const [peer, setPeer] = useState<Peer | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const socket = socketService.getSocket();

    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const peerInstance = new Peer();

        peerInstance.on('open', (id) => {
            console.log('Peer ID initialized:', id);
            // If teacher is already sharing, let's announce it
            if (isTeacher && isSharing) {
                socket.emit('start_meeting', {
                    conversationId,
                    teacherId: currentUser.id,
                    teacherName: currentUser.name,
                    peerId: id
                });
            }
        });

        peerInstance.on('call', (call) => {
            console.log('Receiving call from student...');
            // IMPORTANT: Teacher must answer with the stream they are sharing
            if (isTeacher && streamRef.current) {
                call.answer(streamRef.current);
            } else {
                call.answer(); // Just answer if no stream (student-to-teacher cases)
            }

            call.on('stream', (remote) => {
                setRemoteStream(remote);
            });
        });

        // Teacher: Listen for students requesting status
        if (isTeacher) {
            socket.on('request_meeting_status', (data: any) => {
                if (data.conversationId === conversationId && streamRef.current && peerInstance.id) {
                    socket.emit('start_meeting', {
                        conversationId,
                        teacherId: currentUser.id,
                        teacherName: currentUser.name,
                        peerId: peerInstance.id
                    });
                }
            });
        }

        setPeer(peerInstance);

        return () => {
            peerInstance.destroy();
            streamRef.current?.getTracks().forEach(track => track.stop());
            if (isTeacher) socket.emit('end_meeting', { conversationId });
            socket.off('request_meeting_status');
        };
    }, [isTeacher, conversationId, currentUser.id, currentUser.name, isSharing]); // Added dependencies for isSharing, currentUser

    const startSharing = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            streamRef.current = screenStream;
            setStream(screenStream);
            setIsSharing(true);

            if (videoRef.current) {
                videoRef.current.srcObject = screenStream;
            }

            // Immediately notify everyone that I am now sharing
            if (peer?.id) {
                socket.emit('start_meeting', {
                    conversationId,
                    teacherId: currentUser.id,
                    teacherName: currentUser.name,
                    peerId: peer.id
                });
            }
        } catch (err) {
            console.error("Error sharing screen:", err);
        }
    };

    const stopSharing = () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setStream(null);
        setIsSharing(false);
        socket.emit('end_meeting', { conversationId });
    };

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    useEffect(() => {
        if (!isTeacher && peer) {
            const handleStarted = (data: any) => {
                if (data.peerId && data.conversationId === conversationId) {
                    console.log('Teacher sharing detected, establishing connection...');
                    const call = peer.call(data.peerId, new MediaStream());
                    call.on('stream', (remote) => {
                        console.log('Remote stream received successfully!');
                        setRemoteStream(remote);
                    });
                }
            };

            socket.on('meeting_started', handleStarted);
            // Request status in case it started before I opened the UI
            socket.emit('request_meeting_status', { conversationId });

            return () => {
                socket.off('meeting_started', handleStarted);
            };
        }
    }, [peer, isTeacher, conversationId]); // Added conversationId to dependencies

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
                            <div className="relative w-full h-full max-w-5xl bg-gray-900 shadow-2xl overflow-hidden border-2 border-primary-500">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
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
                            <div className="relative w-full h-full max-w-5xl bg-gray-900 shadow-2xl overflow-hidden border-2 border-emerald-500">
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 text-[10px] font-black uppercase">بث مباشر من المعلم</div>
                            </div>
                        ) : (
                            <div className="text-center space-y-6">
                                <div className="w-20 h-20 border-4 border-primary-600/30 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
                                <div className="animate-pulse">
                                    <h3 className="text-xl font-black text-white">بانتظار بدء المعلم للشرح...</h3>
                                    <p className="text-gray-400">ستظهر الشاشة هنا تلقائياً فور بدء البث.</p>
                                </div>
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

import React, { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import { X, ScreenShare, Volume2, AlertCircle, Video, Monitor, VideoOff } from 'lucide-react';
import { socketService } from '../../../lib/socket';
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
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [status, setStatus] = useState<'waiting' | 'connecting' | 'connected' | 'error'>('waiting');
    const [errorMsg, setErrorMsg] = useState('');

    const videoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<SimplePeer.Instance | null>(null);
    const socket = socketService.getSocket();

    // TEACHER: Start Video Call (Camera)
    const startVideoCall = async () => {
        try {
            setStatus('connecting');
            const videoStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            setStream(videoStream);
            setIsSharing(true);

            if (videoRef.current) {
                videoRef.current.srcObject = videoStream;
                videoRef.current.play();
            }

            setStatus('connected');
            socket.emit('teacher_ready', { 
                conversationId, 
                teacherId: currentUser.id,
                teacherName: currentUser.name,
                type: 'video'
            });

        } catch (err: any) {
            console.error('Failed to start video call:', err);
            setStatus('error');
            setErrorMsg('فشل فتح الكاميرا. تأكد من منح الأذونات.');
        }
    };

    // TEACHER: Share screen
    const startScreenShare = async () => {
        try {
            setStatus('connecting');
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            setStream(screenStream);
            setIsSharing(true);

            if (videoRef.current) {
                videoRef.current.srcObject = screenStream;
                videoRef.current.play();
            }

            // Track ended listener
            screenStream.getVideoTracks()[0].onended = () => {
                stopScreenShare();
            };

            setStatus('connected');
            // Notify all students
            socket.emit('teacher_ready', { 
                conversationId, 
                teacherId: currentUser.id,
                teacherName: currentUser.name,
                type: 'screen'
            });

        } catch (err: any) {
            console.error('Failed to start screen share:', err);
            setStatus('error');
            setErrorMsg('فشل بدء مشاركة الشاشة.');
        }
    };

    const stopScreenShare = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setIsSharing(false);
        setStatus('waiting');
        socket.emit('teacher_stopped', { conversationId });
    };

    // TEACHER: Handle student connection requests
    useEffect(() => {
        if (!isTeacher || !socket || !stream) return;

        const handleStudentRequest = (data: { studentId: string; signal: SimplePeer.SignalData }) => {
            if (data.studentId && stream) {
                console.log('📞 Teacher: Student requesting connection:', data.studentId);

                // Create peer as "initiator=false" since student initiated
                const peer = new SimplePeer({
                    initiator: false,
                    stream: stream,
                    trickle: false,
                    config: {
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' }
                        ]
                    }
                });

                peer.on('signal', (signal: any) => {
                    console.log('📡 Teacher: Sending signal to student:', data.studentId);
                    socket.emit('teacher_signal', {
                        conversationId,
                        studentId: data.studentId,
                        signal
                    });
                });

                peer.on('error', (err: any) => {
                    console.error('❌ Teacher peer error:', err);
                });

                // Accept student's signal
                peer.signal(data.signal);
                peerRef.current = peer;
            }
        };

        socket.on('student_request', handleStudentRequest);

        return () => {
            socket.off('student_request', handleStudentRequest);
        };
    }, [isTeacher, socket, stream, conversationId]);

    // STUDENT: Connect to teacher
    useEffect(() => {
        if (isTeacher || !socket) return;

        const handleTeacherReady = () => {
            console.log('✅ Student: Teacher is ready, initiating connection...');
            setStatus('connecting');

            // Create peer as initiator
            const peer = new SimplePeer({
                initiator: true,
                trickle: false,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' }
                    ]
                }
            });

            peer.on('signal', (signal) => {
                console.log('📡 Student: Sending connection request to teacher');
                socket.emit('student_request', {
                    conversationId,
                    studentId: currentUser.id,
                    signal
                });
            });

            peer.on('stream', (remoteStream) => {
                console.log('🎬 Student: Received stream from teacher!');
                setStream(remoteStream);
                setStatus('connected');

                if (videoRef.current) {
                    videoRef.current.srcObject = remoteStream;
                    videoRef.current.play().catch(err => {
                        console.error('Play error:', err);
                        // Silently handle autoplay restrictions
                    });
                }
            });

            peer.on('error', (err) => {
                console.error('❌ Student peer error:', err);
                setStatus('error');
                setErrorMsg('فشل الاتصال بالمعلم. جرب إعادة المحاولة.');
            });

            // Handle teacher's response
            const handleTeacherSignal = (data: { signal: SimplePeer.SignalData }) => {
                console.log('📡 Student: Received signal from teacher');
                peer.signal(data.signal);
            };

            socket.on('teacher_signal', handleTeacherSignal);
            peerRef.current = peer;

            return () => {
                socket.off('teacher_signal', handleTeacherSignal);
            };
        };

        const handleTeacherStopped = () => {
            console.log('⚠️ Student: Teacher stopped sharing');
            setStatus('waiting');
            setStream(null);
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
        };

        socket.on('teacher_ready', handleTeacherReady);
        socket.on('teacher_stopped', handleTeacherStopped);

        // Request current status
        socket.emit('student_joined', { conversationId, studentId: currentUser.id });

        return () => {
            socket.off('teacher_ready', handleTeacherReady);
            socket.off('teacher_stopped', handleTeacherStopped);
            if (peerRef.current) {
                peerRef.current.destroy();
            }
        };
    }, [isTeacher, socket, conversationId, currentUser.id]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (peerRef.current) {
                peerRef.current.destroy();
            }
            if (isTeacher) {
                socket.emit('teacher_stopped', { conversationId });
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[200000] bg-black flex flex-col">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-gradient-to-r from-primary-600 to-primary-700">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' :
                        status === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                            status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                        }`} />
                    <span className="text-white font-bold text-sm">
                        {status === 'connected' && '🟢 متصل'}
                        {status === 'connecting' && '🟡 جاري الاتصال...'}
                        {status === 'waiting' && '⚪ في الانتظار'}
                        {status === 'error' && '🔴 خطأ في الاتصال'}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
                >
                    <X size={18} />
                    <span>إنهاء</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                {/* TEACHER VIEW */}
                {isTeacher && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                        {!isSharing ? (
                            <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                                <div className="flex gap-4 justify-center">
                                    <div className="w-24 h-24 bg-primary-600/20 rounded-full flex items-center justify-center border-4 border-primary-600/40">
                                        <Video size={48} className="text-primary-600" />
                                    </div>
                                    <div className="w-24 h-24 bg-emerald-600/20 rounded-full flex items-center justify-center border-4 border-emerald-600/40">
                                        <Monitor size={48} className="text-emerald-600" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black text-white mb-3">مركز البث المباشر</h2>
                                    <p className="text-gray-400 max-w-md mx-auto leading-relaxed font-bold">
                                        اختر نوع البث للبدء بالتواصل مع الطلاب فوراً
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
                                    <button
                                        onClick={startVideoCall}
                                        className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black py-5 px-8 rounded-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 text-lg group"
                                    >
                                        <Video size={24} className="group-hover:animate-bounce" />
                                        فتح الكاميرا
                                    </button>
                                    <button
                                        onClick={startScreenShare}
                                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black py-5 px-8 rounded-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 text-lg group"
                                    >
                                        <Monitor size={24} className="group-hover:animate-pulse" />
                                        مشاركة الشاشة
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative w-full h-full max-w-6xl">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-contain bg-black/50 rounded-2xl shadow-2xl border-2 border-primary-500/50"
                                />
                                <div className="absolute top-6 left-6 bg-red-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-2xl flex items-center gap-3 animate-pulse">
                                    <div className="w-3 h-3 bg-white rounded-full" />
                                    جاري البث المباشر
                                </div>
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                                    <button
                                        onClick={stopScreenShare}
                                        className="bg-red-600 hover:bg-red-700 text-white font-black py-4 px-10 rounded-2xl shadow-2xl transition-all flex items-center gap-2"
                                    >
                                        <VideoOff size={20} />
                                        إيقاف البث
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* STUDENT VIEW */}
                {!isTeacher && (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        {status === 'connected' && stream ? (
                            <div className="relative w-full h-full max-w-6xl">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-contain bg-black rounded-xl shadow-2xl border-2 border-primary-500"
                                />
                                <div className="absolute top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2">
                                    <Volume2 size={16} />
                                    بث مباشر من المعلم
                                </div>
                            </div>
                        ) : status === 'error' ? (
                            <div className="text-center space-y-6 max-w-md">
                                <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mx-auto border-4 border-red-600/40">
                                    <AlertCircle size={48} className="text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white mb-3">حدث خطأ</h2>
                                    <p className="text-gray-400 leading-relaxed mb-6">{errorMsg}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
                                    >
                                        إعادة المحاولة
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-6">
                                <div className="relative w-32 h-32 mx-auto">
                                    <div className="absolute inset-0 border-8 border-primary-600/20 rounded-full" />
                                    <div className="absolute inset-0 border-8 border-t-primary-600 rounded-full animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ScreenShare size={40} className="text-primary-600 animate-pulse" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white mb-3">بانتظار المعلم...</h2>
                                    <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                                        سيبدأ البث تلقائياً عندما يبدأ المعلم بمشاركة شاشته
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

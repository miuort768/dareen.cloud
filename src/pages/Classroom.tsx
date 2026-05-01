import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Mic, MicOff, Video, VideoOff, PhoneOff, 
    MessageSquare, Users, Loader2, Volume2
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { cn } from '../lib/utils';
import { socketService } from '../lib/socket';
import Peer from 'simple-peer';

const ICE_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ]
};

export const Classroom = () => {
    const { id } = useParams();
    const { currentUser } = useApp();
    const navigate = useNavigate();

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [loading, setLoading] = useState(true);
    const [viewerCount, setViewerCount] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'waiting'>('connecting');
    const [needsInteraction, setNeedsInteraction] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peersRef = useRef<Map<string, Peer.Instance>>(new Map());
    const socket = socketService.getSocket();

    const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
    const roomName = `live_session_${id}`;

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(() => setNeedsInteraction(true));
        }
    }, [remoteStream]);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
            localVideoRef.current.play().catch(() => {});
        }
    }, [localStream]);

    useEffect(() => {
        let stream: MediaStream | null = null;
        let interval: any = null;

        const init = async () => {
            try {
                const constraints = isTeacher 
                    ? { video: { width: 1280, height: 720 }, audio: true }
                    : { audio: true, video: false };
                
                try {
                    stream = await navigator.mediaDevices.getUserMedia(constraints);
                } catch {
                    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                }
                setLocalStream(stream);
                setLoading(false);
                setConnectionStatus('waiting');

                socket.emit('join_conversation', roomName);

                if (isTeacher) {
                    socket.on('student_joined', (data) => {
                        if (!peersRef.current.has(data.studentId)) {
                            createPeer(data.studentId, stream!);
                        }
                    });

                    socket.on('student_request', (data) => {
                        peersRef.current.get(data.studentId)?.signal(data.signal);
                    });

                    interval = setInterval(() => {
                        socket.emit('teacher_ready', { conversationId: roomName, teacherId: currentUser?.id });
                    }, 5000);

                } else {
                    socket.on('teacher_signal', (data) => {
                        if (!peersRef.current.has('teacher')) {
                            addPeer(data.signal, stream!);
                        } else {
                            peersRef.current.get('teacher')?.signal(data.signal);
                        }
                    });

                    interval = setInterval(() => {
                        if (connectionStatus !== 'connected') {
                            socket.emit('student_joined', { conversationId: roomName, studentId: currentUser?.id });
                        }
                    }, 3000);
                }
            } catch {
                setLoading(false);
            }
        };

        const createPeer = (studentId: string, s: MediaStream) => {
            const peer = new Peer({ initiator: true, trickle: false, config: ICE_CONFIG, stream: s });
            peer.on('signal', signal => {
                socket.emit('teacher_signal', { conversationId: roomName, studentId, signal });
            });
            peer.on('stream', st => { setRemoteStream(st); setConnectionStatus('connected'); });
            peer.on('close', () => { peersRef.current.delete(studentId); setViewerCount(peersRef.current.size); });
            peersRef.current.set(studentId, peer);
            setViewerCount(peersRef.current.size);
        };

        const addPeer = (signal: any, s: MediaStream) => {
            const peer = new Peer({ initiator: false, trickle: false, config: ICE_CONFIG, stream: s });
            peer.on('signal', sig => {
                socket.emit('student_request', { conversationId: roomName, studentId: currentUser?.id, signal: sig });
            });
            peer.on('stream', st => { setRemoteStream(st); setConnectionStatus('connected'); });
            peer.signal(signal);
            peersRef.current.set('teacher', peer);
        };

        init();

        return () => {
            clearInterval(interval);
            socket.off('student_joined');
            socket.off('student_request');
            socket.off('teacher_signal');
            stream?.getTracks().forEach(t => t.stop());
            peersRef.current.forEach(p => p.destroy());
        };
    }, [id, isTeacher, currentUser?.id, socket, roomName, connectionStatus]);

    const handleLeave = () => { navigate(-1); };

    return (
        <div className="fixed inset-0 bg-black text-white flex flex-col overflow-hidden" dir="rtl">
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-gray-900/50 backdrop-blur-xl z-50">
                <div className="flex items-center gap-3">
                    <div className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-2", connectionStatus === 'connected' ? "bg-red-600" : "bg-yellow-600")}>
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        {connectionStatus === 'connected' ? 'LIVE' : 'جاري الربط...'}
                    </div>
                    {isTeacher && <div className="text-white/40 text-xs flex items-center gap-1"><Users size={14} /> {viewerCount}</div>}
                </div>
                <button onClick={handleLeave} className="p-2 bg-red-600 rounded"><PhoneOff size={18} /></button>
            </div>

            <div className="flex-1 relative bg-black flex items-center justify-center">
                {isTeacher ? (
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-contain -scale-x-100" />
                ) : (
                    <>
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
                        {connectionStatus !== 'connected' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                                <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
                                <p className="text-xs font-black opacity-40 uppercase tracking-widest">جاري محاولة الاتصال...</p>
                            </div>
                        )}
                        {needsInteraction && (
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
                                <button onClick={() => { setNeedsInteraction(false); remoteVideoRef.current?.play(); }} className="flex flex-col items-center gap-4 group">
                                    <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
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

            <div className="h-24 bg-black/90 border-t border-white/10 flex items-center justify-center gap-6 px-4">
                <button onClick={() => { if (localStream) { localStream.getAudioTracks().forEach(t => t.enabled = isMuted); setIsMuted(!isMuted); } }} className={cn("w-14 h-14 rounded-full flex items-center justify-center border-4", isMuted ? "bg-red-600" : "bg-white text-black")}>{isMuted ? <MicOff size={24} /> : <Mic size={24} />}</button>
                <button onClick={handleLeave} className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center border-4 border-black"><PhoneOff size={28} /></button>
                {isTeacher && (
                    <button onClick={() => { if (localStream) { localStream.getVideoTracks().forEach(t => t.enabled = isCameraOff); setIsCameraOff(!isCameraOff); } }} className={cn("w-14 h-14 rounded-full flex items-center justify-center border-4", isCameraOff ? "bg-red-600" : "bg-white text-black")}>{isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}</button>
                )}
                <button className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center"><MessageSquare size={24} /></button>
            </div>
        </div>
    );
};

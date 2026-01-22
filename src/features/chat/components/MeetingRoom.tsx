import React, { useEffect, useRef, useState } from 'react';
import { X, Monitor, MonitorOff, Play, Users, Shield } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { socketService } from '../../../lib/socket';
import type { User } from '../../../types/auth';

interface MeetingRoomProps {
    conversationId: string;
    currentUser: User;
    onClose: () => void;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({ conversationId, currentUser, onClose }) => {
    const [hasJoined, setHasJoined] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
    const [participantsCount, setParticipantsCount] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});
    const socket = socketService.getSocket();

    const isHost = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

    // 1. تنظيف عند الإغلاق
    useEffect(() => {
        return () => {
            streamRef.current?.getTracks().forEach(t => t.stop());
            Object.values(peersRef.current).forEach(pc => pc.close());
            socket.off('signal');
            socket.off('peer_ready');
            socket.off('user_left');
        };
    }, []);

    // 2. ربط الفيديو بالعنصر المرئي
    useEffect(() => {
        if (videoRef.current && activeStream) {
            videoRef.current.srcObject = activeStream;
            videoRef.current.play().catch(e => console.warn("Autoplay block:", e));
        }
    }, [activeStream]);

    // 3. منطق الدخول للمنصة
    const handleJoin = () => {
        setHasJoined(true);
        socket.emit('join_conversation', conversationId);

        // إعداد مستمعي الإشارات (Signaling)
        socket.on('signal', async ({ from, signal }) => {
            let pc = peersRef.current[from];

            if (signal.type === 'offer') {
                if (!pc) pc = createPeerConnection(from);
                await pc.setRemoteDescription(new RTCSessionDescription(signal));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('signal', { to: from, signal: answer });
            } else if (signal.type === 'answer') {
                if (pc) await pc.setRemoteDescription(new RTCSessionDescription(signal));
            } else if (signal.candidate) {
                if (pc) await pc.addIceCandidate(new RTCIceCandidate(signal));
            }
        });

        socket.on('peer_ready', (data) => {
            if (data.userId !== currentUser.id) {
                setParticipantsCount(prev => prev + 1);
                if (isHost && isScreenSharing) {
                    initiateCall(socket.id!); // Host calls anyone who joins
                }
            }
        });

        socket.on('user_left', () => setParticipantsCount(prev => Math.max(0, prev - 1)));
    };

    const createPeerConnection = (id: string) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peersRef.current[id] = pc;

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('signal', { to: id, signal: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            if (!isHost) {
                setActiveStream(event.streams[0]);
            }
        };

        if (isHost && streamRef.current) {
            streamRef.current.getTracks().forEach(track => pc.addTrack(track, streamRef.current!));
        }

        return pc;
    };

    const initiateCall = async (targetId: string) => {
        const pc = createPeerConnection(targetId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('signal', { to: targetId, signal: offer });
    };

    const handleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                const stream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: "always" } as any,
                    audio: true
                });
                streamRef.current = stream;
                setActiveStream(stream);
                setIsScreenSharing(true);

                // تحديث جميع الاتصالات الحالية بالبث الجديد
                Object.entries(peersRef.current).forEach(async ([id, pc]) => {
                    const senders = pc.getSenders();
                    stream.getTracks().forEach(track => {
                        const sender = senders.find(s => s.track?.kind === track.kind);
                        if (sender) sender.replaceTrack(track);
                        else pc.addTrack(track, stream);
                    });

                    // إعادة إرسال Offer لتحديث المسارات
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket.emit('signal', { to: id, signal: offer });
                });

                stream.getVideoTracks()[0].onended = () => stopScreenShare();
            } else {
                stopScreenShare();
            }
        } catch (err) { console.error(err); }
    };

    const stopScreenShare = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setActiveStream(null);
        setIsScreenSharing(false);
    };

    if (!hasJoined) {
        return (
            <div className="fixed inset-0 z-[600] bg-black/98 flex items-center justify-center p-4">
                <div className="bg-[#0a0a0a] p-12 rounded-[2.5rem] border border-white/5 text-center max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-primary-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary-500/20 shadow-inner">
                        <Shield className="text-primary-500" size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-3 tracking-tighter italic">بث المنصة المباشر</h2>
                    <p className="text-gray-500 text-sm mb-10 leading-relaxed font-medium">نظام اجتماعات داخلي مشفر بالكامل وآمن لمستخدمي "دارين" فقط</p>

                    <button
                        onClick={handleJoin}
                        className="w-full py-5 bg-primary-600 hover:bg-primary-500 text-white font-black text-xl rounded-2xl transition-all shadow-xl shadow-primary-900/40 active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Play fill="currentColor" size={20} /> انضمام الآن
                    </button>

                    <button onClick={onClose} className="mt-6 text-gray-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">إغلاق</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[600] bg-[#050505] flex flex-col overflow-hidden font-sans">
            {/* Minimal Header */}
            <div className="h-14 flex items-center justify-between px-8 bg-black/40 border-b border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", activeStream ? "bg-rose-500 animate-pulse" : "bg-gray-700")} />
                        <span className="text-white font-black text-[10px] tracking-widest uppercase italic">Internal Platform Stream</span>
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold">
                        <Users size={12} /> {participantsCount + 1} متصلين حالياً
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
            </div>

            {/* Broadcast Stage */}
            <div className="flex-1 relative flex items-center justify-center p-4 lg:p-8">
                {!activeStream ? (
                    <div className="text-center space-y-6">
                        <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/5 animate-pulse">
                            <Monitor size={48} className="text-gray-800" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white italic">في انتظار المعلمة</h3>
                            <p className="text-gray-500 text-xs font-medium">هذا البث خاص وحصري لمستخدمي المنصة</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.7)] border border-white/5 relative group">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted={isHost}
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute top-8 left-8 bg-black/60 backdrop-blur-2xl px-5 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-pulse" />
                            <span className="text-white font-black text-[10px] uppercase tracking-wider">LIVE • شاشة المعلمة</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Platform Controls */}
            {isHost && (
                <div className="h-28 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-center gap-8 shadow-2xl">
                    <button
                        onClick={handleScreenShare}
                        className={cn(
                            "flex items-center gap-4 px-12 py-5 rounded-2xl font-black transition-all active:scale-95 shadow-xl",
                            isScreenSharing ? "bg-rose-600 text-white shadow-rose-900/20" : "bg-primary-600 text-white shadow-primary-900/20"
                        )}
                    >
                        {isScreenSharing ? <MonitorOff size={28} /> : <Monitor size={28} />}
                        <span className="text-xl tracking-tight">{isScreenSharing ? "إيقاف البث" : "بدء مشاركة الشاشة للطالب"}</span>
                    </button>

                    <button onClick={onClose} className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all border border-white/5">
                        إنهاء الحصة
                    </button>
                </div>
            )}
        </div>
    );
};

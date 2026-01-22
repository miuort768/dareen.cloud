import React, { useEffect, useRef, useState } from 'react';
import { X, Monitor, MonitorOff, Play, Shield, Users, Radio, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { socketService } from '../../../lib/socket';
import type { User } from '../../../types/auth';

interface MeetingRoomProps {
    conversationId: string;
    currentUser: User;
    onClose: () => void;
}

/**
 * نظام دارين للبث المباشر (إصدار سيادي)
 * مبني بالكامل على WebRTC الخام لضمان الخصوصية والسرعة
 */
export const MeetingRoom: React.FC<MeetingRoomProps> = ({ conversationId, currentUser, onClose }) => {
    // Session State
    const [hasJoined, setHasJoined] = useState(false);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [participants, setParticipants] = useState<string[]>([]);

    // Media State
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    // Connection Management
    const peersRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});
    const socket = socketService.getSocket();
    const videoRef = useRef<HTMLVideoElement>(null);

    const isHost = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

    const iceConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
        ]
    };

    // 1. تنظيف الموارد عند الإغلاق
    useEffect(() => {
        return () => {
            stopAllStreams();
            Object.values(peersRef.current).forEach(pc => pc.close());
            socket.off('signal');
            socket.off('peer_ready');
            socket.off('user_left');
            socket.off('request_screen_share_status');
        };
    }, []);

    const stopAllStreams = () => {
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
        setIsBroadcasting(false);
    };

    // 2. معالجة الفيديو
    useEffect(() => {
        if (videoRef.current) {
            if (isHost && localStreamRef.current) {
                videoRef.current.srcObject = localStreamRef.current;
            } else if (!isHost && remoteStream) {
                videoRef.current.srcObject = remoteStream;
            }
        }
    }, [isBroadcasting, remoteStream, hasJoined]);

    // 3. منطق الدخول
    const handleJoin = () => {
        setHasJoined(true);
        socket.emit('join_conversation', conversationId);

        // إعداد مستمعي Socket.io للربط
        setupSignaling();

        // إعلام الجميع بانضمامي
        socket.emit('peer_ready', {
            conversationId,
            userId: currentUser.id,
            userName: currentUser.name,
            role: isHost ? 'host' : 'student'
        });
    };

    const setupSignaling = () => {
        // استقبال إشارات الـ WebRTC (Offer, Answer, ICE)
        socket.on('signal', async ({ from, signal }) => {
            console.log(`Received signal from ${from}:`, signal.type || 'ICE');

            let pc = peersRef.current[from];

            if (signal.type === 'offer') {
                pc = createPeer(from);
                await pc.setRemoteDescription(new RTCSessionDescription(signal));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('signal', { to: from, signal: answer });
            }
            else if (signal.type === 'answer') {
                if (pc) await pc.setRemoteDescription(new RTCSessionDescription(signal));
            }
            else if (signal.candidate) {
                if (pc) await pc.addIceCandidate(new RTCIceCandidate(signal)).catch(e => console.warn(e));
            }
        });

        // طالب جديد انضم - إذا كنت المعلمة وبدأ البث، اتصل به
        socket.on('peer_ready', (data) => {
            if (data.userId !== currentUser.id) {
                setParticipants(prev => [...new Set([...prev, data.socketId])]);
                if (isHost && isBroadcasting && data.socketId) {
                    callUser(data.socketId);
                }
            }
        });

        socket.on('user_left', (data) => {
            if (peersRef.current[data.socketId]) {
                peersRef.current[data.socketId].close();
                delete peersRef.current[data.socketId];
            }
            setParticipants(prev => prev.filter(id => id !== data.socketId));
        });
    };

    const createPeer = (socketId: string) => {
        const pc = new RTCPeerConnection(iceConfig);
        peersRef.current[socketId] = pc;

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit('signal', { to: socketId, signal: e.candidate });
            }
        };

        pc.ontrack = (e) => {
            console.log("Receiving track from peer...");
            if (!isHost) setRemoteStream(e.streams[0]);
        };

        // إذا كانت المعلمة، أرسل البث المحفوظ
        if (isHost && localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        return pc;
    };

    const callUser = async (socketId: string) => {
        console.log(`Calling user: ${socketId}`);
        const pc = createPeer(socketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('signal', { to: socketId, signal: offer });
    };

    const startBroadcast = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'always' } as any,
                audio: true
            });
            localStreamRef.current = stream;
            setIsBroadcasting(true);

            // إبلاغ جميع الطلاب المنضمين ببدء البث
            socket.emit('screen_share_status', { conversationId, isSharing: true });

            // إعادة الاتصال بكل المشاركين لإرسال البث الجديد
            participants.forEach(id => callUser(id));

            stream.getVideoTracks()[0].onended = () => stopBroadcast();
        } catch (err) {
            console.error("Failed to start broadcast:", err);
        }
    };

    const stopBroadcast = () => {
        stopAllStreams();
        socket.emit('screen_share_status', { conversationId, isSharing: false });
        // إغلاق جميع قنوات البث
        Object.values(peersRef.current).forEach(pc => pc.close());
        peersRef.current = {};
    };

    // --- الـ UI ---

    if (!hasJoined) {
        return (
            <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6">
                <div className="bg-[#0c0c0c] p-12 rounded-[3.5rem] border border-white/5 text-center max-w-xl w-full shadow-[0_0_150px_rgba(0,0,0,0.9)] animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-primary-600/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-primary-500/20 rotate-3">
                        <Shield className="text-primary-500" size={44} />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4 tracking-tighter italic">DARIN STREAM</h2>
                    <p className="text-gray-500 text-lg mb-12 font-medium leading-relaxed">
                        أهلاً بك في نظام البث المباشر الجديد. هذا النظام مبني خصيصاً لضمان أفضل جودة ومشاركة للشاشة داخل المنصة.
                    </p>

                    <button
                        onClick={handleJoin}
                        className="w-full py-6 bg-primary-600 hover:bg-primary-500 text-white font-black text-2xl rounded-3xl transition-all shadow-[0_20px_40px_rgba(37,99,235,0.3)] active:scale-[0.98] flex items-center justify-center gap-4 group"
                    >
                        <Play fill="currentColor" size={24} className="group-hover:translate-x-1 transition-transform" />
                        دخول الحصة الآن
                    </button>

                    <button onClick={onClose} className="mt-8 text-gray-600 hover:text-white font-black text-xs uppercase tracking-[0.2em] transition-colors underline-offset-8 hover:underline">إغلاق</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[600] bg-[#050505] flex flex-col overflow-hidden">
            {/* Elegant Top Bar */}
            <div className="h-16 flex items-center justify-between px-10 bg-black/50 border-b border-white/5 relative z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className={cn("w-2.5 h-2.5 rounded-full", isBroadcasting || remoteStream ? "bg-rose-500 animate-pulse" : "bg-gray-700")} />
                        <span className="text-white font-black text-[11px] tracking-widest uppercase italic">Broadcast Center</span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-3 text-gray-500 text-[11px] font-bold">
                        <Users size={14} />
                        <span>{participants.length + 1} متواجدون</span>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="p-2.5 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-90"
                >
                    <X size={22} />
                </button>
            </div>

            {/* Content Stage */}
            <div className="flex-1 relative flex items-center justify-center p-6 lg:p-12 overflow-hidden">
                {!(isBroadcasting || (remoteStream && !isHost)) ? (
                    <div className="text-center space-y-8 animate-in fade-in duration-1000">
                        <div className="w-32 h-32 bg-white/[0.02] rounded-[3.5rem] flex items-center justify-center mx-auto border border-white/5 relative">
                            <Monitor size={64} className="text-gray-900" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 size={32} className="text-primary-600 animate-spin" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-3xl font-black text-white italic tracking-tight">في انتظار بدء الشرح</h3>
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">سيظهر البث هنا فور قيام المعلمة بمشاركة شاشتها</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full max-w-7xl bg-black rounded-[3rem] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.8)] border border-white/5 relative group">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted={isHost}
                            className="w-full h-full object-contain"
                        />

                        {/* Overlay Elements */}
                        <div className="absolute top-10 left-10 flex flex-col gap-4">
                            <div className="bg-black/60 backdrop-blur-3xl px-6 py-3 rounded-[1.5rem] border border-white/10 flex items-center gap-4 transition-transform group-hover:scale-105">
                                <div className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.5)]" />
                                <span className="text-white font-black text-xs uppercase tracking-widest">
                                    {isHost ? "شاشتك قيد البث الآن" : "بث مباشر من المعلمة"}
                                </span>
                            </div>

                            <div className="bg-primary-600/20 backdrop-blur-3xl px-4 py-2 rounded-xl border border-primary-500/20 flex items-center gap-2 w-fit opacity-0 group-hover:opacity-100 transition-opacity">
                                <Radio size={14} className="text-primary-400" />
                                <span className="text-[10px] text-primary-300 font-bold uppercase tracking-tighter">HD Stream • Low Latency</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Dashboard Controls (Host Only) */}
            {isHost && (
                <div className="h-32 bg-[#080808] border-t border-white/5 flex items-center justify-center gap-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                    <button
                        onClick={isBroadcasting ? stopBroadcast : startBroadcast}
                        className={cn(
                            "flex items-center gap-5 px-16 py-6 rounded-[2rem] font-black transition-all active:scale-95 shadow-2xl group",
                            isBroadcasting
                                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40"
                                : "bg-primary-600 hover:bg-primary-500 text-white shadow-primary-900/40"
                        )}
                    >
                        {isBroadcasting ? (
                            <MonitorOff size={32} className="group-hover:rotate-12 transition-transform" />
                        ) : (
                            <Monitor size={32} className="group-hover:scale-110 transition-transform" />
                        )}
                        <span className="text-2xl tracking-tighter">
                            {isBroadcasting ? "إيقاف البث" : "بدء مشاركة الشاشة للطالب"}
                        </span>
                    </button>

                    <button
                        onClick={onClose}
                        className="px-12 py-6 bg-white/[0.03] hover:bg-white/[0.08] text-white font-black text-lg rounded-[2rem] transition-all border border-white/5"
                    >
                        إنهاء الحصة
                    </button>
                </div>
            )}
        </div>
    );
};

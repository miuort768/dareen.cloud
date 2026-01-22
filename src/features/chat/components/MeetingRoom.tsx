import React, { useEffect, useRef, useState } from 'react';
import { X, Monitor, MonitorOff, Play, Shield, Users, Radio, Loader2, SignalHigh } from 'lucide-react';
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
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [participants, setParticipants] = useState<{ socketId: string, name: string }[]>([]);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});
    const socket = socketService.getSocket();

    const isHost = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

    // 🌐 قمة الاحترافية: قائمة خوادم ICE عالمية لضمان تخطي جدران الحماية
    const rtcConfig: RTCConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
            // ملاحظة: للوصول لنسبة نجاح 100% على شبكات الموبايل (4G)، 
            // يفضل المعلمة إضافة TURN server (مثل Twilio) في المستقبل.
        ],
        iceCandidatePoolSize: 10,
    };

    useEffect(() => {
        return () => {
            stopAllResources();
        };
    }, []);

    const stopAllResources = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        Object.values(peersRef.current).forEach(pc => {
            pc.onicecandidate = null;
            pc.ontrack = null;
            pc.close();
        });
        peersRef.current = {};
        socket.off('signal');
        socket.off('peer_ready');
        socket.off('request_screen_share_status');
        socket.off('user_left');
    };

    useEffect(() => {
        if (videoRef.current) {
            if (isHost && streamRef.current) {
                videoRef.current.srcObject = streamRef.current;
            } else if (!isHost && remoteStream) {
                videoRef.current.srcObject = remoteStream;
            }
        }
    }, [isBroadcasting, remoteStream, hasJoined]);

    const handleJoin = () => {
        setHasJoined(true);
        setConnectionStatus('connecting');
        socket.emit('join_conversation', conversationId);

        setupSignaling();

        socket.emit('peer_ready', {
            conversationId,
            userId: currentUser.id,
            userName: currentUser.name,
            role: isHost ? 'host' : 'student'
        });
    };

    const setupSignaling = () => {
        socket.on('signal', async ({ from, signal }) => {
            let pc = peersRef.current[from];

            try {
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
                    if (pc) await pc.addIceCandidate(new RTCIceCandidate(signal));
                }
            } catch (err) {
                console.error("Signaling error:", err);
            }
        });

        socket.on('peer_ready', (data) => {
            if (data.userId !== currentUser.id) {
                setParticipants(prev => {
                    if (prev.find(p => p.socketId === data.socketId)) return prev;
                    return [...prev, { socketId: data.socketId!, name: data.userName }];
                });

                if (isHost && isBroadcasting && data.socketId) {
                    // ننتظر قليلاً ليصبح سويكت الطالب جاهزاً تماماً لاستلام العرض
                    setTimeout(() => initiateCall(data.socketId!), 1000);
                }
            }
        });

        socket.on('user_left', (data) => {
            if (peersRef.current[data.socketId]) {
                peersRef.current[data.socketId].close();
                delete peersRef.current[data.socketId];
            }
            setParticipants(prev => prev.filter(p => p.socketId !== data.socketId));
        });

        // طلب البث وإعادة المحاولة التلقائية
        if (!isHost) {
            const interval = setInterval(() => {
                if (connectionStatus !== 'connected') {
                    console.log("Student: Requesting stream status...");
                    socket.emit('request_screen_share_status', { conversationId });
                }
            }, 3000);
            return () => clearInterval(interval);
        } else {
            // المعلمة: إذا بدأت البث، نرسل إشارة دورية لكل الطلاب غير المتصلين
            const interval = setInterval(() => {
                if (isBroadcasting) {
                    participants.forEach(p => {
                        if (!peersRef.current[p.socketId] || peersRef.current[p.socketId].connectionState !== 'connected') {
                            initiateCall(p.socketId);
                        }
                    });
                }
            }, 5000);
            return () => clearInterval(interval);
        }
    };

    const createPeer = (socketId: string) => {
        if (peersRef.current[socketId]) {
            peersRef.current[socketId].close();
        }

        const pc = new RTCPeerConnection(rtcConfig);
        peersRef.current[socketId] = pc;

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit('signal', { to: socketId, signal: e.candidate });
            }
        };

        pc.onconnectionstatechange = () => {
            if ((pc.connectionState as string) === 'connected') setConnectionStatus('connected');
            if (pc.connectionState === 'failed') setConnectionStatus('failed');
        };

        pc.ontrack = (e) => {
            console.log("Stream received from host!");
            if (!isHost) {
                setRemoteStream(e.streams[0]);
                setConnectionStatus('connected');
            }
        };

        if (isHost && streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, streamRef.current!);
            });
        }

        return pc;
    };

    const initiateCall = async (socketId: string) => {
        const pc = createPeer(socketId);
        const offer = await pc.createOffer({
            offerToReceiveVideo: !isHost,
            offerToReceiveAudio: !isHost
        });
        await pc.setLocalDescription(offer);
        socket.emit('signal', { to: socketId, signal: offer });
    };

    const startBroadcast = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                    displaySurface: 'monitor',
                    frameRate: 30
                } as any,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            streamRef.current = stream;
            setIsBroadcasting(true);

            // الاتصال بجميع الطلاب المتواجدين حالياً
            participants.forEach(p => initiateCall(p.socketId));

            stream.getVideoTracks()[0].onended = () => stopBroadcast();
        } catch (err) {
            console.error("Failed to Capture Screen:", err);
        }
    };

    const stopBroadcast = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setIsBroadcasting(false);
        setRemoteStream(null);
        // إغلاق كل الاتصالات لبدء جلسة نظيفة المرة القادمة
        Object.values(peersRef.current).forEach(pc => pc.close());
        peersRef.current = {};
    };

    // --- RENDER ---

    if (!hasJoined) {
        return (
            <div className="fixed inset-0 z-[600] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4">
                <div className="bg-[#0a0a0a] p-12 rounded-[3.5rem] border border-white/5 text-center max-w-md w-full shadow-2xl animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-primary-600/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-primary-500/20">
                        <Shield className="text-primary-500" size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-3 italic">Darin Private Stream</h2>
                    <p className="text-gray-500 text-sm mb-12 font-medium">نظام اجتماعات داخلي آمن، يعمل بخصوصية تامة داخل منصتكم</p>

                    <button
                        onClick={handleJoin}
                        className="w-full py-5 bg-primary-600 hover:bg-primary-500 text-white font-black text-xl rounded-2xl transition-all shadow-xl shadow-primary-900/40 active:scale-95 flex items-center justify-center gap-3 group"
                    >
                        <Play fill="currentColor" size={20} className="group-hover:translate-x-1 transition-transform" />
                        دخول الحصة
                    </button>

                    <button onClick={onClose} className="mt-6 text-gray-600 hover:text-white font-bold text-xs tracking-widest transition-colors uppercase">إغلاق</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[600] bg-[#050505] flex flex-col overflow-hidden font-sans">
            {/* Elegant Header */}
            <div className="h-14 flex items-center justify-between px-8 bg-black/40 border-b border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", (isBroadcasting || remoteStream) ? "bg-rose-500 animate-pulse" : "bg-gray-700")} />
                        <span className="text-white font-black text-[10px] tracking-widest uppercase italic border-r border-white/10 pr-6 mr-6">Internal Stream</span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-500 text-[10px] font-black uppercase tracking-tighter">
                        <Users size={12} className="text-primary-500" />
                        <span>{participants.length + 1} متواجدون الآن</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {connectionStatus === 'connected' && <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"><SignalHigh size={12} /> اتصال مستقر</div>}
                    {connectionStatus === 'connecting' && <div className="flex items-center gap-1.5 text-yellow-500 text-[10px] font-bold bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20"><Loader2 size={12} className="animate-spin" /> جاري الربط...</div>}
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
                </div>
            </div>

            {/* Stage */}
            <div className="flex-1 relative flex items-center justify-center p-6 lg:p-10">
                {!(isBroadcasting || (remoteStream && !isHost)) ? (
                    <div className="text-center space-y-8 animate-in fade-in duration-700">
                        <div className="w-28 h-28 bg-white/[0.02] rounded-[3rem] flex items-center justify-center mx-auto border border-white/5 overflow-hidden relative">
                            <Monitor size={56} className="text-gray-900" />
                            <div className="absolute inset-0 bg-gradient-to-t from-primary-600/10 to-transparent" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black text-white italic tracking-tight">في انتظار شرح المعلمة</h3>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Private Educational Channel</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full max-w-7xl bg-black rounded-[2.5rem] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.8)] border border-white/5 relative group">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted={isHost}
                            className="w-full h-full object-contain"
                        />

                        {/* Overlay */}
                        <div className="absolute top-8 left-8 flex flex-col gap-4">
                            <div className="bg-black/60 backdrop-blur-3xl px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-4 transition-transform group-hover:scale-105">
                                <Radio size={16} className="text-rose-500 animate-pulse" />
                                <span className="text-white font-black text-xs uppercase tracking-widest">
                                    {isHost ? "أنت تبث شاشتك الآن" : "بث مباشر من المعلمة"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            {isHost && (
                <div className="h-28 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-center gap-8 shadow-2xl relative z-50">
                    <button
                        onClick={isBroadcasting ? stopBroadcast : startBroadcast}
                        className={cn(
                            "flex items-center gap-5 px-16 py-5 rounded-2xl font-black transition-all active:scale-95 shadow-2xl group",
                            isBroadcasting
                                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40"
                                : "bg-primary-600 hover:bg-primary-500 text-white shadow-primary-900/40"
                        )}
                    >
                        {isBroadcasting ? <MonitorOff size={32} /> : <Monitor size={32} className="group-hover:scale-110 transition-transform" />}
                        <span className="text-2xl tracking-tighter">
                            {isBroadcasting ? "إيقاف المشاركة" : "بدء مشاركة الشاشة للطالب"}
                        </span>
                    </button>

                    <button onClick={onClose} className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all border border-white/5 uppercase text-sm tracking-widest">
                        إغلاق
                    </button>
                </div>
            )}
        </div>
    );
};

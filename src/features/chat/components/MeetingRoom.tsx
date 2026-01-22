import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import type { MediaConnection } from 'peerjs';
import { X, Monitor, MonitorOff, Play, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
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
    const [isConnecting, setIsConnecting] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
    const [retryCount, setRetryCount] = useState(0);

    const peerRef = useRef<Peer | null>(null);
    const callsRef = useRef<{ [key: string]: MediaConnection }>({});
    const videoRef = useRef<HTMLVideoElement>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const socket = socketService.getSocket();

    const isHost = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

    useEffect(() => {
        return () => {
            screenStreamRef.current?.getTracks().forEach(t => t.stop());
            peerRef.current?.destroy();
            socket.off('peer_ready');
            socket.off('request_screen_share_status');
            socket.off('request_current_status');
        };
    }, []);

    useEffect(() => {
        if (videoRef.current && activeStream) {
            console.log("Binding stream to video element...");
            videoRef.current.srcObject = activeStream;
            videoRef.current.play().catch(e => {
                console.error("Play failed:", e);
                // Fallback: Try with muted if autoplay is blocked
                if (videoRef.current) {
                    videoRef.current.muted = true;
                    videoRef.current.play();
                }
            });
        }
    }, [activeStream]);

    const handleJoin = async () => {
        setIsConnecting(true);
        setConnectionStatus('connecting');

        try {
            const hostname = window.location.hostname;
            const currentPort = window.location.port;

            // DYNAMIC PORT LOGIC:
            // If we're on 3005, backend is 3001
            // If we're on domain (no port or 443), backend is 443/peerjs
            let peerPort: number;
            if (currentPort === '3005' || currentPort === '5173') {
                peerPort = 3001;
            } else if (!currentPort || currentPort === '443') {
                peerPort = 443;
            } else {
                peerPort = 3001; // Default fallback for other dev ports
            }

            const peerConfig = {
                host: hostname,
                port: peerPort,
                path: '/peerjs/myapp',
                secure: window.location.protocol === 'https:' || peerPort === 443,
                config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
            };

            console.log("Connecting to PeerJS with config:", peerConfig);

            const peerId = `${currentUser.id}_${Date.now()}`;
            const peer = new Peer(peerId, peerConfig);
            peerRef.current = peer;

            peer.on('open', (id) => {
                console.log("Peer connected with ID:", id);
                setConnectionStatus('connected');
                socket.emit('peer_ready', {
                    conversationId,
                    peerId: id,
                    userId: currentUser.id,
                    role: isHost ? 'host' : 'student',
                    userName: currentUser.name
                });

                if (isHost) {
                    socket.emit('meeting_started', conversationId);
                } else {
                    socket.emit('request_screen_share_status', { conversationId, requesterPeerId: id });
                }
            });

            peer.on('error', (err) => {
                console.error("PeerJS Connection Error:", err.type, err.message);
                setConnectionStatus('error');
            });

            peer.on('call', (call) => {
                console.log("Incoming call detected...");
                call.answer();
                call.on('stream', (rs) => {
                    console.log("Remote stream arrived!");
                    setActiveStream(rs);
                });
            });

            socket.on('peer_ready', (data) => {
                if (isHost && isScreenSharing && screenStreamRef.current && data.peerId !== peer.id) {
                    const call = peer.call(data.peerId, screenStreamRef.current);
                    callsRef.current[data.peerId] = call;
                }
            });

            socket.on('request_screen_share_status', (data) => {
                if (isHost && isScreenSharing && screenStreamRef.current && data.requesterPeerId) {
                    const call = peer.call(data.requesterPeerId, screenStreamRef.current);
                    callsRef.current[data.requesterPeerId] = call;
                }
            });

            setHasJoined(true);
        } catch (err) {
            console.error("Initialization failed:", err);
            setConnectionStatus('error');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                const stream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: "always" } as any,
                    audio: true
                });
                screenStreamRef.current = stream;
                setActiveStream(stream);
                setIsScreenSharing(true);

                socket.emit('screen_share_status', { conversationId, isSharing: true, peerId: peerRef.current?.id });
                socket.emit('request_current_status', { conversationId });

                stream.getVideoTracks()[0].onended = () => stopScreenShare();
            } else {
                stopScreenShare();
            }
        } catch (err) {
            console.error("Screen share prompt failed:", err);
        }
    };

    const stopScreenShare = () => {
        screenStreamRef.current?.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
        setActiveStream(null);
        setIsScreenSharing(false);
        socket.emit('screen_share_status', { conversationId, isSharing: false, peerId: peerRef.current?.id });
        Object.values(callsRef.current).forEach(call => call.close());
        callsRef.current = {};
    };

    // Auto-request retry mechanism for students
    useEffect(() => {
        if (hasJoined && !isHost && !activeStream) {
            const timer = setInterval(() => {
                console.log("Retrying screen request...");
                socket.emit('request_screen_share_status', { conversationId, requesterPeerId: peerRef.current?.id });
                setRetryCount(prev => prev + 1);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [hasJoined, isHost, activeStream]);

    if (!hasJoined) {
        return (
            <div className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center p-4">
                <div className="bg-[#111] p-10 rounded-[2.5rem] border border-white/10 text-center max-w-md w-full shadow-2xl">
                    <div className="w-20 h-20 bg-primary-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Play className="text-primary-500 fill-current" size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">بث الحصة</h2>
                    <p className="text-gray-500 mb-8">اضغط للانضمام إلى البث المباشر</p>
                    <button onClick={handleJoin} disabled={isConnecting} className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary-900/40">
                        {isConnecting ? <Loader2 className="animate-spin mx-auto" /> : "انضمام الآن"}
                    </button>
                    <button onClick={onClose} className="mt-4 text-gray-500 hover:text-white transition-colors text-sm uppercase font-bold tracking-widest">إغلاق</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[500] bg-[#050505] flex flex-col overflow-hidden">
            <div className="h-14 flex items-center justify-between px-6 bg-black/50 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", activeStream ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
                    <span className="text-white font-black text-[10px] tracking-tighter uppercase italic">Live Broadcast</span>
                </div>
                {connectionStatus === 'error' && (
                    <div className="flex items-center gap-2 text-rose-500 text-[10px] font-bold">
                        <AlertCircle size={14} /> خطأ في الاتصال - حاول التنشيط
                    </div>
                )}
                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2 text-gray-500 hover:text-white flex items-center gap-1 text-[10px] font-bold"
                    >
                        <RefreshCw size={14} /> تحديث الاتصال
                    </button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
                </div>
            </div>

            <div className="flex-1 relative flex items-center justify-center p-4 lg:p-6">
                {!activeStream ? (
                    <div className="text-center space-y-6 max-w-sm">
                        <div className="relative mx-auto w-20 h-20">
                            <Monitor size={80} className="text-gray-900 absolute inset-0 opacity-20" />
                            <Loader2 size={32} className="text-primary-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white">في انتظار البث</h3>
                            <p className="text-gray-500 text-xs leading-relaxed">جاري محاولة التقاط شاشة المعلمة (محاولة #{retryCount})</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 relative group">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted={isHost}
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-white font-black text-[10px] uppercase">بث مباشر عالي الجودة</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isHost && (
                <div className="h-28 bg-black/80 backdrop-blur-3xl border-t border-white/10 flex items-center justify-center gap-6">
                    <button
                        onClick={handleScreenShare}
                        className={cn(
                            "group flex items-center gap-4 px-12 py-5 rounded-2xl font-black transition-all active:scale-95 shadow-2xl",
                            isScreenSharing ? "bg-rose-600 text-white" : "bg-primary-600 text-white"
                        )}
                    >
                        {isScreenSharing ? <MonitorOff size={32} /> : <Monitor size={32} className="group-hover:scale-110 transition-transform" />}
                        <span className="text-xl">{isScreenSharing ? "إيقاف البث" : "بدء مشاركة الشاشة للطالب"}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

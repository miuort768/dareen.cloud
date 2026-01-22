import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import type { MediaConnection } from 'peerjs';
import { X, Monitor, MonitorOff, Play, Loader2, AlertCircle } from 'lucide-react';
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

    // Effect to bind stream to video element
    useEffect(() => {
        if (videoRef.current && activeStream) {
            videoRef.current.srcObject = activeStream;
            videoRef.current.play().catch(e => console.warn("Autoplay block:", e));
        }
    }, [activeStream]);

    const handleJoin = async () => {
        setIsConnecting(true);
        setConnectionStatus('connecting');
        try {
            const isLocal = window.location.hostname === 'localhost';
            const peerConfig = {
                host: window.location.hostname,
                port: isLocal ? 3001 : 443,
                path: '/peerjs/myapp',
                secure: window.location.protocol === 'https:' || !isLocal,
                config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
            };

            const peerId = `${currentUser.id}_${Date.now()}`;
            const peer = new Peer(peerId, peerConfig);
            peerRef.current = peer;

            peer.on('open', (id) => {
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
                console.error("PeerJS Error:", err);
                setConnectionStatus('error');
            });

            peer.on('call', (call) => {
                call.answer();
                call.on('stream', (rs) => {
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

            socket.on('request_current_status', () => {
                if (peerRef.current?.id) {
                    socket.emit('peer_ready', {
                        conversationId,
                        peerId: peerRef.current.id,
                        userId: currentUser.id,
                        role: isHost ? 'host' : 'student',
                        userName: currentUser.name
                    });
                }
            });

            setHasJoined(true);
        } catch (err) {
            console.error(err);
            setConnectionStatus('error');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                // Fixed TS error with 'as any'
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
                    <button onClick={onClose} className="mt-4 text-gray-500 hover:text-white transition-colors">إلغاء</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[500] bg-[#050505] flex flex-col overflow-hidden">
            <div className="h-14 flex items-center justify-between px-6 bg-black/50 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", activeStream ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
                    <span className="text-white font-bold text-xs tracking-widest uppercase italic">Live Broadcast</span>
                    <span className="text-[10px] text-gray-500 font-mono hidden md:inline">{currentUser.name} ({isHost ? 'Host' : 'Student'})</span>
                </div>
                {connectionStatus === 'error' && (
                    <div className="flex items-center gap-2 text-rose-500 text-[10px] font-bold">
                        <AlertCircle size={14} /> خطأ في الاتصال
                    </div>
                )}
                <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 relative flex items-center justify-center p-4 lg:p-8">
                {!activeStream ? (
                    <div className="text-center space-y-6 max-w-sm">
                        <div className="relative mx-auto w-24 h-24">
                            <Monitor size={96} className="text-gray-900 absolute inset-0" />
                            <Loader2 size={32} className="text-primary-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white">في انتظار شاشة المعلمة</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">بمجرد بدء المعلمة لمشاركة الشرح، سيظهر لك الفيديو هنا تلقائياً</p>
                        </div>
                        {!isHost && (
                            <button
                                onClick={() => socket.emit('request_screen_share_status', { conversationId, requesterPeerId: peerRef.current?.id })}
                                className="text-primary-500 text-xs font-bold hover:underline"
                            >
                                طلب البث يدوياً
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.7)] border border-white/5 relative group">
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
                <div className="h-28 bg-black/80 backdrop-blur-2xl border-t border-white/10 flex items-center justify-center gap-6">
                    <button
                        onClick={handleScreenShare}
                        className={cn(
                            "group flex items-center gap-4 px-12 py-5 rounded-2xl font-black transition-all active:scale-95 shadow-2xl",
                            isScreenSharing ? "bg-rose-600 text-white" : "bg-primary-600 text-white"
                        )}
                    >
                        {isScreenSharing ? <MonitorOff size={32} /> : <Monitor size={32} className="group-hover:scale-110 transition-transform" />}
                        <span className="text-xl">{isScreenSharing ? "إيقاف البث الآن" : "بدء مشاركة الشاشة للطالب"}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

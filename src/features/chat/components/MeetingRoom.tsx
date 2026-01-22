import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import type { MediaConnection } from 'peerjs';
import { X, Monitor, MonitorOff, Play, Users } from 'lucide-react';
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

    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<{ [key: string]: MediaStream }>({});

    const peerRef = useRef<Peer | null>(null);
    const callsRef = useRef<{ [key: string]: MediaConnection }>({});
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const socket = socketService.getSocket();

    const isHost = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

    useEffect(() => {
        return () => {
            screenStream?.getTracks().forEach(t => t.stop());
            peerRef.current?.destroy();
            socket.off('peer_ready');
            socket.off('screen_share_status');
        };
    }, []);

    const handleJoin = async () => {
        setIsConnecting(true);
        try {
            const isLocal = window.location.hostname === 'localhost';
            const peerPort = isLocal ? 3001 : 443;
            const peerId = `${currentUser.id}_${Date.now()}`;

            const peer = new Peer(peerId, {
                host: '/',
                port: peerPort,
                path: '/peerjs/myapp',
                secure: window.location.protocol === 'https:' || !isLocal,
                config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
            });

            peerRef.current = peer;

            peer.on('open', (id) => {
                socket.emit('peer_ready', {
                    conversationId,
                    peerId: id,
                    userId: currentUser.id,
                    role: isHost ? 'host' : 'student',
                    userName: currentUser.name
                });
                if (isHost) socket.emit('meeting_started', conversationId);
                socket.emit('request_screen_share_status', { conversationId, requesterPeerId: id });
            });

            // Handle incoming calls (mostly for students receiving the stream)
            peer.on('call', (call) => {
                call.answer(); // Students don't send anything back
                callsRef.current[call.peer] = call;
                call.on('stream', (rs) => {
                    setRemoteStreams(prev => ({ ...prev, [call.peer]: rs }));
                });

                const pc = (call as any).peerConnection as RTCPeerConnection;
                if (pc) {
                    pc.ontrack = () => {
                        const newStream = new MediaStream();
                        pc.getReceivers().forEach(r => r.track && newStream.addTrack(r.track));
                        setRemoteStreams(prev => ({ ...prev, [call.peer]: newStream }));
                    };
                }
            });

            // Handle new users joining
            socket.on('peer_ready', (data) => {
                if (data.userId !== currentUser.id && isHost && screenStream) {
                    const call = peer.call(data.peerId, screenStream);
                    callsRef.current[data.peerId] = call;
                }
            });

            socket.on('screen_share_status', (data) => {
                if (data.isSharing === false) {
                    setRemoteStreams({});
                }
            });

            socket.on('user_left', (data: any) => {
                if (callsRef.current[data.peerId]) {
                    callsRef.current[data.peerId].close();
                    delete callsRef.current[data.peerId];
                }
                setRemoteStreams(prev => {
                    const ns = { ...prev };
                    delete ns[data.peerId];
                    return ns;
                });
            });

            setHasJoined(true);
        } catch (err) {
            console.error(err);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                setScreenStream(stream);
                setIsScreenSharing(true);

                if (localVideoRef.current) localVideoRef.current.srcObject = stream;

                // Call all existing peers with the screen stream
                socket.emit('request_current_status', { conversationId });

                socket.emit('screen_share_status', {
                    conversationId,
                    isSharing: true,
                    peerId: peerRef.current?.id
                });

                stream.getVideoTracks()[0].onended = () => stopScreenShare();
            } else {
                stopScreenShare();
            }
        } catch (err) { console.error(err); }
    };

    const stopScreenShare = () => {
        screenStream?.getTracks().forEach(t => t.stop());
        setScreenStream(null);
        setIsScreenSharing(false);
        socket.emit('screen_share_status', { conversationId, isSharing: false, peerId: peerRef.current?.id });
        setRemoteStreams({});
    };

    // Auto-call late joiners if already sharing
    useEffect(() => {
        if (isHost && isScreenSharing && screenStream) {
            const handleRequest = (data: any) => {
                if (peerRef.current && data.requesterPeerId) {
                    peerRef.current.call(data.requesterPeerId, screenStream);
                }
            };
            socket.on('request_screen_share_status', handleRequest);
            return () => { socket.off('request_screen_share_status', handleRequest); };
        }
    }, [isHost, isScreenSharing, screenStream]);

    if (!hasJoined) {
        return (
            <div className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center p-4">
                <div className="bg-[#111] p-10 rounded-[2.5rem] border border-white/10 text-center max-w-md w-full animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-primary-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Play className="text-primary-500 fill-current" size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">بث الحصة</h2>
                    <p className="text-gray-500 mb-8">اضغط للانضمام إلى البث المباشر للمعلمة</p>
                    <button onClick={handleJoin} disabled={isConnecting} className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50">
                        {isConnecting ? "جاري الدخول..." : "انضمام الآن"}
                    </button>
                    <button onClick={onClose} className="mt-4 text-gray-500 hover:text-white transition-colors">إلغاء</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[500] bg-[#050505] flex flex-col overflow-hidden">
            <div className="h-14 flex items-center justify-between px-6 bg-black/50 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                    <span className="text-white font-bold text-xs tracking-widest uppercase italic">Live Stream</span>
                </div>
                <button onClick={onClose} className="p-2 text-gray-500 hover:text-white"><X size={20} /></button>
            </div>

            <div className="flex-1 relative flex items-center justify-center p-4 lg:p-10">
                {(() => {
                    const activeStream = isHost ? screenStream : Object.values(remoteStreams)[0];

                    if (!activeStream) {
                        return (
                            <div className="flex flex-col items-center gap-6 text-center">
                                <Monitor size={80} className="text-gray-900" />
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-white">في انتظار شاشة المعلمة</h3>
                                    <p className="text-gray-500">سيبدأ البث المباشر فور قيام المعلمة بمشاركة شاشتها</p>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div className="w-full h-full bg-black rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 relative">
                            <video
                                ref={isHost ? localVideoRef : (el) => { if (el) el.srcObject = activeStream; }}
                                autoPlay
                                playsInline
                                className="w-full h-full object-contain"
                            />
                            <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                                <Users size={14} className="text-primary-400" />
                                <span className="text-white font-bold text-xs">بث مباشر الآن</span>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {isHost && (
                <div className="h-28 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-center gap-6">
                    <button
                        onClick={handleScreenShare}
                        className={cn(
                            "flex items-center gap-4 px-10 py-5 rounded-2xl font-black transition-all active:scale-95 shadow-2xl",
                            isScreenSharing ? "bg-rose-600 text-white" : "bg-primary-600 text-white"
                        )}
                    >
                        {isScreenSharing ? <MonitorOff size={28} /> : <Monitor size={28} />}
                        <span className="text-lg">{isScreenSharing ? "إيقاف البث" : "بدء مشاركة الشاشة للطالب"}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

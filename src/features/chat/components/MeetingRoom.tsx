import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { Video, VideoOff, Mic, MicOff, Maximize2, Minimize, Square, X } from 'lucide-react';
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
    const [isFloating, setIsFloating] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<{ [key: string]: MediaStream }>({});
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [hosts, setHosts] = useState<Set<string>>(new Set());

    const [position, setPosition] = useState({ x: 24, y: 24 });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef<{ startX: number; startY: number; startPos: { x: number; y: number } } | null>(null);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const previewVideoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<Peer | null>(null);
    const callsRef = useRef<{ [key: string]: any }>({});
    const socket = socketService.getSocket();

    const isHost = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

    useEffect(() => {
        if (hasJoined) return;
        const getPreviewStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: { echoCancellation: true, noiseSuppression: true }
                });
                setLocalStream(stream);
                if (previewVideoRef.current) previewVideoRef.current.srcObject = stream;
            } catch (err) { console.error("Preview failed", err); }
        };
        getPreviewStream();
        return () => { if (!hasJoined) localStream?.getTracks().forEach(t => t.stop()); };
    }, [hasJoined]);

    const handleJoin = async () => {
        setIsConnecting(true);
        try {
            let stream = localStream;
            if (!stream) {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: { echoCancellation: true, noiseSuppression: true }
                });
                setLocalStream(stream);
            }

            const initPeer = async () => {
                try {
                    const peer = new Peer(`${currentUser.id}_${conversationId}`);
                    peerRef.current = peer;

                    peer.on('open', (id) => {
                        socket.emit('peer_ready', {
                            conversationId,
                            peerId: id,
                            userId: currentUser.id,
                            role: isHost ? 'host' : 'student',
                            userName: currentUser.name
                        });
                    });

                    peer.on('call', (call) => {
                        if (stream) {
                            call.answer(stream);
                            const meta = (call as any).metadata || {};
                            if (meta.role === 'host') setHosts(prev => new Set(prev).add(call.peer));
                            call.on('stream', (rs) => setRemoteStreams(prev => ({ ...prev, [call.peer]: rs })));
                        }
                    });

                    socket.on('peer_ready', ({ peerId, userId, role }) => {
                        if (userId !== currentUser.id && stream) {
                            const call = peer.call(peerId, stream, {
                                metadata: { role: isHost ? 'host' : 'student', name: currentUser.name }
                            });
                            if (role === 'host') setHosts(prev => new Set(prev).add(peerId));
                            call.on('stream', (rs) => setRemoteStreams(prev => ({ ...prev, [peerId]: rs })));
                            callsRef.current[peerId] = call;
                        }
                    });

                    peer.on('error', (err) => {
                        console.error('Peer error:', err);
                        setIsConnecting(false);
                    });

                } catch (err) {
                    console.error('Peer init failed', err);
                    setIsConnecting(false);
                }
            };

            socket.emit('join_conversation', conversationId);
            await initPeer();
            setHasJoined(true);
        } catch (err) {
            console.error("Failed to get media stream on join", err);
            alert("يرجى السماح بالوصول إلى الكاميرا والميكروفون للانضمام.");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleCloseFull = () => {
        if (isHost && socket) {
            socket.emit('meeting_ended', conversationId);
        }
        onClose();
    };

    const toggleMute = () => { if (localStream) { localStream.getAudioTracks().forEach(t => t.enabled = !t.enabled); setIsMuted(!isMuted); } };
    const toggleVideo = () => { if (localStream) { localStream.getVideoTracks().forEach(t => t.enabled = !t.enabled); setIsVideoOff(!isVideoOff); } };

    const handleDragStart = (clientX: number, clientY: number) => {
        if (!isFloating) return;
        setIsDragging(true);
        dragRef.current = { startX: clientX, startY: clientY, startPos: { ...position } };
    };

    const handleMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX, e.clientY);
    const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY);

    useEffect(() => {
        const handleMove = (clientX: number, clientY: number) => {
            if (!isDragging || !dragRef.current) return;
            const deltaX = dragRef.current.startX - clientX;
            const deltaY = dragRef.current.startY - clientY;
            setPosition({
                x: Math.max(10, dragRef.current.startPos.x + deltaX),
                y: Math.max(10, dragRef.current.startPos.y + deltaY)
            });
        };
        const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
        const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
        const onEnd = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onEnd);
            window.addEventListener('touchmove', onTouchMove);
            window.addEventListener('touchend', onEnd);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onEnd);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onEnd);
        };
    }, [isDragging]);

    const handleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: "always", width: 1920, height: 1080 } as any,
                    audio: true
                });
                const videoTrack = screenStream.getVideoTracks()[0];
                Object.values(callsRef.current).forEach(call => {
                    const pc = (call as any).peerConnection;
                    if (pc) {
                        const sender = pc.getSenders().find((s: any) => s.track?.kind === 'video');
                        if (sender) sender.replaceTrack(videoTrack);
                    }
                });
                if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
                videoTrack.onended = () => stopScreenShare();
                setIsScreenSharing(true);
            } else { stopScreenShare(); }
        } catch (err) { console.error("Screen share error", err); }
    };

    const stopScreenShare = () => {
        if (localStream && localVideoRef.current) {
            const vt = localStream.getVideoTracks()[0];
            Object.values(callsRef.current).forEach(call => {
                const pc = (call as any).peerConnection;
                if (pc) {
                    const sender = pc.getSenders().find((s: any) => s.track?.kind === 'video');
                    if (sender) sender.replaceTrack(vt);
                }
            });
            localVideoRef.current.srcObject = localStream;
            setIsScreenSharing(false);
        }
    };

    useEffect(() => {
        if (hasJoined && localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
    }, [hasJoined, localStream]);

    useEffect(() => {
        return () => {
            localStream?.getTracks().forEach(t => t.stop());
            peerRef.current?.destroy();
            socket.off('peer_ready');
        };
    }, []);

    if (!hasJoined) {
        return (
            <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-4xl bg-[#111] rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 flex flex-col lg:flex-row animate-in zoom-in duration-500">
                    <div className="flex-1 p-6 lg:p-10 bg-black relative">
                        <div className="aspect-video w-full rounded-3xl overflow-hidden bg-gray-950 border border-white/5 relative group">
                            <video ref={previewVideoRef} autoPlay muted playsInline className={cn("w-full h-full object-cover scale-x-[-1]", isVideoOff && "hidden")} />
                            {isVideoOff && <div className="w-full h-full flex items-center justify-center bg-gray-900"><VideoOff size={64} className="text-gray-800" /></div>}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        </div>
                        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-5">
                            <button onClick={toggleMute} className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl", isMuted ? "bg-rose-600 text-white" : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md")}>{isMuted ? <MicOff size={24} /> : <Mic size={24} />}</button>
                            <button onClick={toggleVideo} className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl", isVideoOff ? "bg-rose-600 text-white" : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md")}>{isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}</button>
                        </div>
                    </div>
                    <div className="w-full lg:w-96 p-10 flex flex-col justify-center text-center gap-8 bg-[#0a0a0a]">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-white tracking-tight">غرفة الانتظار</h2>
                            <p className="text-gray-500 font-bold text-sm">تأكد من إعدادات الصوت والصورة</p>
                        </div>
                        <div className="space-y-4">
                            <button
                                onClick={handleJoin}
                                disabled={isConnecting}
                                className={cn(
                                    "w-full py-5 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl shadow-2xl shadow-primary-600/40 transition-all text-xl active:scale-95 disabled:opacity-70 disabled:cursor-wait",
                                    isConnecting && "animate-pulse"
                                )}
                            >
                                {isConnecting ? "جاري الاتصال..." : "انضمام الآن"}
                            </button>
                            <button onClick={handleCloseFull} className="w-full py-3 text-gray-400 hover:text-white font-black text-xs uppercase tracking-[0.2em] transition-colors border border-white/5 rounded-xl hover:bg-white/5">إلغاء الأمر</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            style={isFloating ? {
                bottom: `${position.y}px`,
                right: `${position.x}px`,
                width: 'min(calc(100vw - 32px), 420px)',
                height: 'min(calc(100vh - 100px), 260px)'
            } : { inset: 0 }}
            className={cn(
                "fixed z-[500] bg-[#050505] flex flex-col transition-all duration-300 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden",
                isFloating ? "rounded-[2.5rem] border border-white/10 ring-1 ring-white/20 cursor-move" : "p-0"
            )}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            <div className={cn("flex items-center justify-between px-8 py-5 bg-black/80 backdrop-blur-2xl border-b border-white/5", isFloating && "hidden")}>
                <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-rose-500/40 rounded-full" />
                    </div>
                    <span className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Live Session Active</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsFloating(!isFloating)} className="p-2.5 text-gray-500 hover:text-white transition-all hover:bg-white/5 rounded-xl hidden lg:block"><Minimize size={20} /></button>
                    <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2.5 text-gray-500 hover:text-white transition-all hover:bg-white/5 rounded-xl"><Maximize2 size={20} /></button>
                </div>
            </div>

            <div className="flex-1 relative bg-black">
                <div className="w-full h-full flex items-center justify-center p-4 lg:p-0">
                    {Object.entries(remoteStreams).length > 0 ? (
                        Object.entries(remoteStreams).map(([peerId, stream]) => {
                            if (!hosts.has(peerId) && !isHost) return null;
                            return <div key={peerId} className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl"><VideoPlayer stream={stream} /></div>;
                        })
                    ) : (
                        <div className="w-full h-full relative flex items-center justify-center">
                            {isHost ? (
                                <video ref={localVideoRef} autoPlay muted playsInline className={cn("w-full h-full object-contain max-h-[85vh]", isVideoOff && "hidden", "scale-x-[-1]")} />
                            ) : (
                                <div className="text-center flex flex-col items-center gap-8 p-10 animate-in fade-in zoom-in duration-700">
                                    <div className="w-24 h-24 bg-primary-600/10 rounded-[2rem] flex items-center justify-center animate-bounce shadow-2xl ring-1 ring-primary-500/20">
                                        <Video size={44} className="text-primary-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-white font-black text-2xl tracking-tight">في انتظار المعلمة...</h4>
                                        <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">سيبدأ البث قريباً</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {isFloating && (
                    <div className="absolute top-5 right-5 flex gap-2.5">
                        <button onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onClick={() => setIsFloating(false)} className="w-10 h-10 rounded-2xl bg-black/80 hover:bg-black text-white flex items-center justify-center shadow-2xl border border-white/10 transition-all active:scale-95"><Square size={18} /></button>
                        <button onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onClick={handleCloseFull} className="w-10 h-10 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl transition-all active:scale-95"><X size={18} /></button>
                    </div>
                )}
            </div>

            {!isFloating && (
                <div className="h-24 lg:h-28 bg-black/95 backdrop-blur-2xl border-t border-white/10 flex items-center justify-between px-4 lg:px-16 pb-4 lg:pb-0 safe-area-pb absolute bottom-0 left-0 right-0 z-[600]">
                    <div className="flex items-center gap-3 lg:gap-5">
                        <button onClick={toggleMute} className={cn("w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg border", isMuted ? "bg-rose-600 border-rose-500 text-white" : "bg-white/10 border-white/5 hover:bg-white/20 text-white")}>{isMuted ? <MicOff size={20} className="lg:w-6 lg:h-6" /> : <Mic size={20} className="lg:w-6 lg:h-6" />}</button>
                        <button onClick={toggleVideo} className={cn("w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg border", isVideoOff ? "bg-rose-600 border-rose-500 text-white" : "bg-white/10 border-white/5 hover:bg-white/20 text-white")}>{isVideoOff ? <VideoOff size={20} className="lg:w-6 lg:h-6" /> : <Video size={20} className="lg:w-6 lg:h-6" />}</button>
                    </div>

                    <div className="flex items-center gap-3">
                        {isHost && (
                            <button
                                onClick={handleScreenShare}
                                className={cn(
                                    "hidden lg:flex px-8 py-4 font-black rounded-2xl text-[11px] uppercase tracking-[0.2em] border transition-all active:scale-95 shadow-lg",
                                    isScreenSharing
                                        ? "bg-sky-600/20 border-sky-500 text-sky-400 shadow-sky-600/10"
                                        : "bg-white/5 border-white/5 text-white hover:bg-white/10"
                                )}
                            >
                                {isScreenSharing ? 'إيقاف المشاركة' : 'مشاركة الشاشة'}
                            </button>
                        )}
                        <button onClick={handleCloseFull} className="px-6 lg:px-12 py-3 lg:py-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl transition-all shadow-2xl shadow-rose-600/40 text-xs lg:text-sm active:scale-95 uppercase tracking-widest whitespace-nowrap">
                            {isHost ? 'إنهاء الحصة' : 'مغادرة'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const VideoPlayer = ({ stream }: { stream: MediaStream }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, [stream]);
    return <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />;
};

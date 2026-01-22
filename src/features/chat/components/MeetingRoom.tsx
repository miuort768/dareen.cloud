import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import type { MediaConnection } from 'peerjs';
import { Video, VideoOff, Mic, MicOff, Maximize2, Minimize, X, UserX, Monitor, MonitorOff } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { socketService } from '../../../lib/socket';
import type { User } from '../../../types/auth';

interface MeetingRoomProps {
    conversationId: string;
    currentUser: User;
    onClose: () => void;
}

interface RemoteStatus {
    isMuted: boolean;
    isVideoOff: boolean;
    isScreenSharing?: boolean;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({ conversationId, currentUser, onClose }) => {
    // Session State
    const [hasJoined, setHasJoined] = useState(false);
    const [isFloating, setIsFloating] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // Media State
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<{ [key: string]: MediaStream }>({});
    const [remoteStatus, setRemoteStatus] = useState<{ [key: string]: RemoteStatus }>({});

    // Device Settings
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedAudioId, setSelectedAudioId] = useState<string>('');
    const [selectedVideoId, setSelectedVideoId] = useState<string>('');

    // Controls
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    // Floating Window Dragging
    const [position, setPosition] = useState({ x: 24, y: 24 });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef<{ startX: number; startY: number; startPos: { x: number; y: number } } | null>(null);

    // Refs
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const previewVideoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<Peer | null>(null);
    const callsRef = useRef<{ [key: string]: MediaConnection }>({});
    const socket = socketService.getSocket();

    const isHost = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

    // 1. Device Enumeration
    useEffect(() => {
        const getDevices = async () => {
            try {
                const deviceInfos = await navigator.mediaDevices.enumerateDevices();
                const audio = deviceInfos.filter(d => d.kind === 'audioinput');
                const video = deviceInfos.filter(d => d.kind === 'videoinput');
                setAudioDevices(audio);
                setVideoDevices(video);
                if (audio.length > 0) setSelectedAudioId(audio[0].deviceId);
                if (video.length > 0) setSelectedVideoId(video[0].deviceId);
            } catch (err) {
                console.error("Error listing devices", err);
            }
        };
        getDevices();
    }, []);

    // Re-fetch devices to get labels after permission is granted
    useEffect(() => {
        if (!localStream) return;
        const getDevices = async () => {
            try {
                const deviceInfos = await navigator.mediaDevices.enumerateDevices();
                setAudioDevices(deviceInfos.filter(d => d.kind === 'audioinput'));
                setVideoDevices(deviceInfos.filter(d => d.kind === 'videoinput'));
            } catch (err) { console.error(err); }
        };
        getDevices();
    }, [localStream]);

    // 2. Preview Stream (Waiting Room)
    useEffect(() => {
        if (hasJoined) return;
        const getPreview = async () => {
            if (!selectedAudioId || !selectedVideoId) return;
            try {
                if (localStream) {
                    localStream.getTracks().forEach(t => t.stop());
                }
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: { deviceId: { exact: selectedAudioId }, echoCancellation: true, noiseSuppression: true },
                    video: { deviceId: { exact: selectedVideoId } }
                });
                setLocalStream(stream);
                if (previewVideoRef.current) previewVideoRef.current.srcObject = stream;

                // Reset mute/video states for new stream
                // setIsMuted(false); 
                // setIsVideoOff(false); 
                // Don't reset, user might have toggled them in waiting room

                // Apply current mute preference to new stream
                stream.getAudioTracks().forEach(t => t.enabled = !isMuted);
                stream.getVideoTracks().forEach(t => t.enabled = !isVideoOff);

            } catch (err) {
                console.error("Preview failed", err);
            }
        };
        getPreview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAudioId, selectedVideoId, hasJoined]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            localStream?.getTracks().forEach(t => t.stop());
            peerRef.current?.destroy();
            socket.off('peer_ready');
            socket.off('media_status_change');
            socket.off('kick_user');
        };
    }, []);

    // 3. Socket Listeners for Controls
    useEffect(() => {
        const onMediaStatusChange = (data: { conversationId: string, peerId: string, isMuted?: boolean, isVideoOff?: boolean }) => {
            if (data.conversationId !== conversationId) return;
            setRemoteStatus(prev => ({
                ...prev,
                [data.peerId]: {
                    isMuted: data.isMuted ?? prev[data.peerId]?.isMuted ?? false,
                    isVideoOff: data.isVideoOff ?? prev[data.peerId]?.isVideoOff ?? false
                }
            }));
        };

        const onScreenShareStatus = (data: { conversationId: string, peerId: string, isSharing: boolean }) => {
            if (data.conversationId !== conversationId) return;
            setRemoteStatus(prev => ({
                ...prev,
                [data.peerId]: {
                    ...prev[data.peerId],
                    isScreenSharing: data.isSharing,
                    // valid fallback if status entry doesn't exist yet
                    isMuted: prev[data.peerId]?.isMuted ?? false,
                    isVideoOff: prev[data.peerId]?.isVideoOff ?? false
                }
            }));
        };

        const onKickUser = (data: { conversationId: string, targetPeerId: string }) => {
            if (data.conversationId === conversationId && peerRef.current?.id === data.targetPeerId) {
                handleCloseFull();
                alert("تم إخراجك من الاجتماع بواسطة المعلم.");
            }
        };

        const onUserLeft = (data: { peerId: string }) => {
            console.log("User left:", data.peerId);
            if (callsRef.current[data.peerId]) {
                callsRef.current[data.peerId].close();
                delete callsRef.current[data.peerId];
            }
            setRemoteStreams(prev => {
                const newStreams = { ...prev };
                delete newStreams[data.peerId];
                return newStreams;
            });
            setRemoteStatus(prev => {
                const newStatus = { ...prev };
                delete newStatus[data.peerId];
                return newStatus;
            });
        };

        const onRequestStatus = (_data: { requesterPeerId: string }) => {
            if (peerRef.current?.id) {
                socket.emit('media_status_change', {
                    conversationId,
                    peerId: peerRef.current.id,
                    isMuted,
                    isVideoOff
                });

                // NEW: Also send screen share status
                if (isScreenSharing) {
                    socket.emit('screen_share_status', {
                        conversationId,
                        peerId: peerRef.current.id,
                        isSharing: true
                    });
                }
            }
        };

        const onRequestScreenShareStatus = (_data: { conversationId: string, requesterPeerId: string }) => {
            if (_data.conversationId !== conversationId) return;
            // If I'm currently sharing my screen, notify the requester
            if (peerRef.current?.id && isScreenSharing) {
                socket.emit('screen_share_status', {
                    conversationId,
                    peerId: peerRef.current.id,
                    isSharing: true
                });
            }
        };

        socket.on('media_status_change', onMediaStatusChange);
        socket.on('screen_share_status', onScreenShareStatus);
        socket.on('kick_user', onKickUser);
        socket.on('user_left', onUserLeft);
        socket.on('request_current_status', onRequestStatus);
        socket.on('request_screen_share_status', onRequestScreenShareStatus);

        return () => {
            socket.off('media_status_change', onMediaStatusChange);
            socket.off('screen_share_status', onScreenShareStatus);
            socket.off('kick_user', onKickUser);
            socket.off('user_left', onUserLeft);
            socket.off('request_current_status', onRequestStatus);
            socket.off('request_screen_share_status', onRequestScreenShareStatus);
        };
    }, [conversationId, socket, isMuted, isVideoOff, isScreenSharing]);


    // 4. Join Logic
    const handleJoin = async () => {
        setIsConnecting(true);
        try {
            // Re-acquire stream to be sure (or just use localStream)
            // Ideally use localStream if active.
            let stream = localStream;
            if (!stream || !stream.active) {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: { deviceId: selectedAudioId ? { exact: selectedAudioId } : undefined },
                    video: { deviceId: selectedVideoId ? { exact: selectedVideoId } : undefined }
                });
                setLocalStream(stream);
            }

            const initPeer = async () => {
                const peerId = `${currentUser.id}_${conversationId}_${Math.floor(Math.random() * 1000)}`;

                // Determine API URL for PeerServer (Assuming same host as frontend or specific API URL)
                // In production, this should match your API_BASE_URL host
                const peerConfig: any = {
                    host: '/',
                    port: (window.location.port && window.location.hostname === 'localhost') ? 3001 : 443,
                    path: '/peerjs/myapp',
                    secure: window.location.protocol === 'https:',
                    config: {
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:global.stun.twilio.com:3478' }
                        ]
                    },
                    debug: 3
                };

                const peer = new Peer(peerId, peerConfig);
                peerRef.current = peer;

                peer.on('open', (id) => {
                    socket.emit('peer_ready', {
                        conversationId,
                        peerId: id,
                        userId: currentUser.id,
                        role: isHost ? 'host' : 'student',
                        userName: currentUser.name
                    });

                    // Vital: If I am the host, tell the server the meeting is LIVE.
                    // This ensures that even after a server restart or page refresh,
                    // the meeting status is restored and late joiners are notified.
                    if (isHost) {
                        socket.emit('meeting_started', conversationId);
                    }

                    // Broadcast initial status
                    socket.emit('media_status_change', {
                        conversationId,
                        peerId: id,
                        isMuted,
                        isVideoOff
                    });

                    // NEW: Request current screen share status from all peers
                    // This is CRITICAL for late joiners to see ongoing screen shares
                    socket.emit('request_screen_share_status', {
                        conversationId,
                        requesterPeerId: id
                    });
                });

                peer.on('call', (call) => {
                    console.log("Incoming call from:", call.peer);
                    call.answer(stream || undefined);
                    callsRef.current[call.peer] = call; // Store incoming call reference

                    // Listen for the initial stream
                    call.on('stream', (rs) => {
                        console.log("Received stream from:", call.peer);
                        setRemoteStreams(prev => ({ ...prev, [call.peer]: rs }));
                    });

                    // **CRITICAL FIX**: Listen for track changes (e.g., screen share)
                    // When the remote peer replaces a track, this event fires
                    const pc = (call as any).peerConnection as RTCPeerConnection;
                    if (pc) {
                        pc.addEventListener('track', (event: RTCTrackEvent) => {
                            console.log("🔄 Track changed for", call.peer, "- Kind:", event.track.kind);

                            // Create a new MediaStream with the updated tracks
                            const newStream = new MediaStream();
                            pc.getReceivers().forEach((receiver: RTCRtpReceiver) => {
                                if (receiver.track) {
                                    newStream.addTrack(receiver.track);
                                }
                            });

                            console.log("📺 Updated stream for", call.peer, "with tracks:", newStream.getTracks().map(t => t.kind));
                            setRemoteStreams(prev => ({ ...prev, [call.peer]: newStream }));
                        });
                    }
                });

                peer.on('disconnected', () => {
                    console.log("Peer disconnected, reconnecting...");
                    peer.reconnect();
                });

                socket.on('peer_ready', ({ peerId, userId }) => {
                    if (userId !== currentUser.id) {
                        // Determine which stream to send: camera or current screen
                        const streamToSend = (isScreenSharing && localVideoRef.current?.srcObject instanceof MediaStream)
                            ? localVideoRef.current.srcObject
                            : (localStream || undefined);

                        const call = peer.call(peerId, streamToSend as MediaStream, {
                            metadata: { role: isHost ? 'host' : 'student', name: currentUser.name }
                        });


                        call.on('stream', (rs) => {
                            console.log("Received stream from:", peerId);
                            setRemoteStreams(prev => ({ ...prev, [peerId]: rs }));
                        });

                        // **CRITICAL FIX**: Listen for track changes on outgoing calls too
                        const pc = (call as any).peerConnection as RTCPeerConnection;
                        if (pc) {
                            pc.addEventListener('track', (event: RTCTrackEvent) => {
                                console.log("🔄 Track changed for", peerId, "- Kind:", event.track.kind);

                                const newStream = new MediaStream();
                                pc.getReceivers().forEach((receiver: RTCRtpReceiver) => {
                                    if (receiver.track) {
                                        newStream.addTrack(receiver.track);
                                    }
                                });

                                console.log("📺 Updated stream for", peerId, "with tracks:", newStream.getTracks().map(t => t.kind));
                                setRemoteStreams(prev => ({ ...prev, [peerId]: newStream }));
                            });
                        }

                        callsRef.current[peerId] = call;
                    }
                });
            };

            socket.emit('join_conversation', conversationId);
            await initPeer();
            setHasJoined(true);
        } catch (err) {
            console.error("Join error", err);
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

    // Actions
    const toggleMute = () => {
        if (localStream) {
            const newState = !isMuted;
            localStream.getAudioTracks().forEach(t => t.enabled = !newState);
            setIsMuted(newState);
            if (peerRef.current?.id) {
                socket.emit('media_status_change', {
                    conversationId,
                    peerId: peerRef.current.id,
                    isMuted: newState
                });
            }
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const newState = !isVideoOff;
            localStream.getVideoTracks().forEach(t => t.enabled = !newState);
            setIsVideoOff(newState);
            if (peerRef.current?.id) {
                socket.emit('media_status_change', {
                    conversationId,
                    peerId: peerRef.current.id,
                    isVideoOff: newState
                });
            }
        }
    };

    const handleKickUser = (targetPeerId: string) => {
        if (!isHost) return;
        if (confirm("هل أنت متأكد من رغبتك في إخراج هذا المستخدم؟")) {
            socket.emit('kick_user', { conversationId, targetPeerId });
        }
    };

    const handleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                console.log("Starting screen share...");
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: "always" } as any,
                    audio: true
                });
                const videoTrack = screenStream.getVideoTracks()[0];

                console.log("Screen stream obtained, track:", videoTrack);
                console.log("Number of active calls:", Object.keys(callsRef.current).length);
                console.log("Calls:", Object.keys(callsRef.current));

                let successCount = 0;
                let failCount = 0;

                Object.entries(callsRef.current).forEach(([peerId, call]) => {
                    console.log(`Processing call for peer: ${peerId}`);
                    const pc = (call as any).peerConnection as RTCPeerConnection;
                    if (pc) {
                        console.log(`PeerConnection exists for ${peerId}`);
                        const sender = pc.getSenders().find((s: any) => s.track?.kind === 'video');
                        if (sender) {
                            console.log(`Replacing video track for ${peerId}...`);
                            sender.replaceTrack(videoTrack)
                                .then(() => {
                                    console.log(`✅ Successfully replaced track for ${peerId}`);
                                    successCount++;
                                })
                                .catch((err: any) => {
                                    console.error(`❌ Failed to replace track for ${peerId}:`, err);
                                    failCount++;
                                });
                        } else {
                            console.warn(`No video sender found for ${peerId}`);
                            failCount++;
                        }
                    } else {
                        console.warn(`No peer connection for ${peerId}`);
                        failCount++;
                    }
                });

                console.log(`Screen share track replacement: ${successCount} succeeded, ${failCount} failed`);

                if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
                videoTrack.onended = () => stopScreenShare();
                setIsScreenSharing(true);

                // Notify all participants via socket
                socket.emit('screen_share_status', {
                    conversationId,
                    isSharing: true,
                    userId: currentUser.id,
                    peerId: peerRef.current?.id
                });

                // Force video on for screen share
                if (isVideoOff) toggleVideo();

            } else {
                stopScreenShare();
            }
        } catch (err) {
            console.error("Screen share error", err);
        }
    };

    const stopScreenShare = () => {
        console.log("Stopping screen share...");
        if (localStream && localVideoRef.current) {
            const vt = localStream.getVideoTracks()[0];
            Object.entries(callsRef.current).forEach(([peerId, call]) => {
                const pc = (call as any).peerConnection as RTCPeerConnection;
                if (pc) {
                    const sender = pc.getSenders().find((s: any) => s.track?.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(vt)
                            .then(() => console.log(`✅ Reverted to camera for ${peerId}`))
                            .catch((err: any) => console.error(`❌ Failed to revert for ${peerId}:`, err));
                    }
                }
            });
            localVideoRef.current.srcObject = localStream;
            setIsScreenSharing(false);

            // Notify all participants via socket
            socket.emit('screen_share_status', {
                conversationId,
                isSharing: false,
                userId: currentUser.id,
                peerId: peerRef.current?.id
            });
        }
    };

    // Drag Logic (Unchanged generally, compacted)
    const handleDragStart = (cx: number, cy: number) => {
        if (!isFloating) return;
        setIsDragging(true);
        dragRef.current = { startX: cx, startY: cy, startPos: { ...position } };
    };
    useEffect(() => {
        const move = (cx: number, cy: number) => {
            if (!isDragging || !dragRef.current) return;
            const dx = dragRef.current.startX - cx;
            const dy = dragRef.current.startY - cy;
            setPosition({
                x: Math.max(10, dragRef.current.startPos.x + dx),
                y: Math.max(10, dragRef.current.startPos.y + dy)
            });
        };
        const mm = (e: MouseEvent) => move(e.clientX, e.clientY);
        const mu = () => setIsDragging(false);
        if (isDragging) { window.addEventListener('mousemove', mm); window.addEventListener('mouseup', mu); }
        return () => { window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu); };
    }, [isDragging]);


    // Render Waiting Room
    if (!hasJoined) {
        return (
            <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-5xl bg-[#111] rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 flex flex-col lg:flex-row animate-in zoom-in duration-500">

                    {/* Preview Area */}
                    <div className="flex-1 p-6 lg:p-8 bg-black relative flex flex-col">
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-900 border border-white/5 relative group shrink-0">
                            <video ref={previewVideoRef} autoPlay muted playsInline className={cn("w-full h-full object-cover scale-x-[-1]", isVideoOff && "hidden")} />
                            {isVideoOff && <div className="w-full h-full flex items-center justify-center bg-gray-800"><VideoOff size={64} className="text-gray-600" /></div>}

                            {/* Controls Overlay */}
                            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-4">
                                <button onClick={() => setIsMuted(!isMuted)} className={cn("p-4 rounded-xl transition-all", isMuted ? "bg-rose-600 text-white" : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md")}>
                                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                                </button>
                                <button onClick={() => setIsVideoOff(!isVideoOff)} className={cn("p-4 rounded-xl transition-all", isVideoOff ? "bg-rose-600 text-white" : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md")}>
                                    {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Device Settings Section */}
                        <div className="mt-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">الميكروفون</label>
                                    <div className="relative">
                                        <select
                                            value={selectedAudioId}
                                            onChange={(e) => setSelectedAudioId(e.target.value)}
                                            className="w-full bg-[#1a1a1a] text-white border border-white/10 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                                        >
                                            {audioDevices.map(device => (
                                                <option key={device.deviceId} value={device.deviceId}>{device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}</option>
                                            ))}
                                        </select>
                                        <Mic size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">الكاميرا</label>
                                    <div className="relative">
                                        <select
                                            value={selectedVideoId}
                                            onChange={(e) => setSelectedVideoId(e.target.value)}
                                            className="w-full bg-[#1a1a1a] text-white border border-white/10 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                                        >
                                            {videoDevices.map(device => (
                                                <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${device.deviceId.slice(0, 5)}...`}</option>
                                            ))}
                                        </select>
                                        <Video size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Join Actions */}
                    <div className="w-full lg:w-80 bg-[#0a0a0a] p-8 flex flex-col justify-center border-l border-white/5">
                        <div className="text-center space-y-2 mb-8">
                            <h2 className="text-2xl font-black text-white">غرفة الانتظار</h2>
                            <p className="text-gray-500 text-sm">جاهز للانضمام؟</p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleJoin}
                                disabled={isConnecting}
                                className={cn(
                                    "w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait",
                                    isConnecting && "animate-pulse"
                                )}
                            >
                                {isConnecting ? "جاري الاتصال..." : "انضمام الآن"}
                            </button>
                            <button onClick={handleCloseFull} className="w-full py-3 text-gray-400 hover:text-white font-bold text-sm bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Active Meeting Render
    return (
        <div
            style={isFloating ? {
                bottom: `${position.y}px`, right: `${position.x}px`,
                width: '400px', height: '225px'
            } : { inset: 0 }}
            className={cn(
                "fixed z-[500] bg-[#050505] flex flex-col transition-all duration-300 shadow-2xl overflow-hidden",
                isFloating ? "rounded-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] cursor-move" : "w-screen h-screen"
            )}
            onMouseDown={(e) => isFloating && handleDragStart(e.clientX, e.clientY)}
        >
            {/* Header (Floating only) */}
            {isFloating && (
                <div className="absolute top-4 right-4 z-50 flex gap-2">
                    <button onMouseDown={e => e.stopPropagation()} onClick={() => setIsFloating(false)} className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-lg backdrop-blur-md border border-white/10"><Maximize2 size={16} /></button>
                    <button onMouseDown={e => e.stopPropagation()} onClick={handleCloseFull} className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md"><X size={16} /></button>
                </div>
            )}

            {/* Header (Full only) */}
            {!isFloating && (
                <div className="h-16 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md border-b border-white/5 absolute top-0 left-0 right-0 z-50">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
                        <span className="text-white font-bold text-sm tracking-widest">LIVE SESSION</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsFloating(true)} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Minimize size={20} /></button>
                    </div>
                </div>
            )}

            {/* Video Grid */}
            <div className={cn("flex-1 bg-[#050505] p-4 flex items-center justify-center overflow-hidden", isFloating ? "p-0" : "")}>
                {/* Student View: Teacher Video Large + Own Video Small */}
                {!isHost && Object.keys(remoteStreams).length > 0 ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Teacher's Video (Large, Centered) */}
                        {Object.entries(remoteStreams).map(([peerId, stream]) => {
                            const status = remoteStatus[peerId] || { isMuted: false, isVideoOff: false, isScreenSharing: false };
                            return (
                                <div key={peerId} className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                                    <VideoPlayer stream={stream} isVideoOff={status.isVideoOff} isScreenSharing={status.isScreenSharing} />
                                    <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm font-bold border border-white/20 flex items-center gap-2 shadow-lg">
                                        المعلمة
                                        {status.isMuted && <MicOff size={14} className="text-rose-400" />}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Student's Own Video (Small PiP) */}
                        <div className="absolute bottom-4 left-4 w-48 aspect-video bg-[#111] rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
                            <video ref={localVideoRef} autoPlay muted playsInline className={cn("w-full h-full object-cover scale-x-[-1]", isVideoOff && "hidden")} />
                            {isVideoOff && <div className="absolute inset-0 flex items-center justify-center bg-[#151515]"><UserX size={24} className="text-gray-700" /></div>}
                            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-white text-[10px] font-bold border border-white/20">
                                أنت
                                {isMuted && <MicOff size={10} className="inline text-rose-400 ml-1" />}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Host/Teacher View: Grid Layout */
                    <div className={cn("grid gap-4 w-full h-full",
                        Object.keys(remoteStreams).length === 0 ? "grid-cols-1" :
                            Object.keys(remoteStreams).length === 1 ? "grid-cols-2" :
                                "grid-cols-2 md:grid-cols-3"
                    )}>
                        {/* Local User */}
                        <div className="relative bg-[#111] rounded-2xl overflow-hidden border border-white/5 group">
                            <video ref={localVideoRef} autoPlay muted playsInline className={cn("w-full h-full object-cover scale-x-[-1]", isVideoOff && "hidden")} />
                            {isVideoOff && <div className="absolute inset-0 flex items-center justify-center bg-[#151515]"><UserX size={48} className="text-gray-700" /></div>}
                            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold border border-white/10 flex items-center gap-2">
                                You {isHost && "(Host)"}
                                {isMuted && <MicOff size={12} className="text-rose-500" />}
                            </div>
                        </div>

                        {/* Remote Users */}
                        {Object.entries(remoteStreams).map(([peerId, stream]) => {
                            const status = remoteStatus[peerId] || { isMuted: false, isVideoOff: false, isScreenSharing: false };
                            return (
                                <div key={peerId} className="relative bg-[#111] rounded-2xl overflow-hidden border border-white/5 group shadow-2xl">
                                    <VideoPlayer stream={stream} isVideoOff={status.isVideoOff} isScreenSharing={status.isScreenSharing} />

                                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold border border-white/10 flex items-center gap-2">
                                        Student
                                        {status.isMuted && <MicOff size={12} className="text-rose-500" />}
                                    </div>

                                    {/* Host Controls Overlay */}
                                    {isHost && !isFloating && (
                                        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleKickUser(peerId)}
                                                className="p-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-lg"
                                                title="إخراج من الاجتماع"
                                            >
                                                <UserX size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom Controls (Full only) */}
            {!isFloating && (
                <div className="h-24 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-center gap-4 px-6 z-50">
                    <button onClick={toggleMute} className={cn("p-4 rounded-2xl transition-all shadow-lg", isMuted ? "bg-rose-600 text-white" : "bg-[#1a1a1a] text-white hover:bg-[#252525]")} title="الصوت">
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                    <button onClick={toggleVideo} className={cn("p-4 rounded-2xl transition-all shadow-lg", isVideoOff ? "bg-rose-600 text-white" : "bg-[#1a1a1a] text-white hover:bg-[#252525]")} title="الكاميرا">
                        {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                    </button>

                    {isHost && (
                        <button onClick={handleScreenShare} className={cn("p-4 rounded-2xl transition-all shadow-lg hidden md:block", isScreenSharing ? "bg-primary-600 text-white" : "bg-[#1a1a1a] text-white hover:bg-[#252525]")} title="مشاركة الشاشة">
                            {isScreenSharing ? <MonitorOff size={24} /> : <Monitor size={24} />}
                        </button>
                    )}

                    <div className="w-px h-10 bg-white/10 mx-2" />

                    {/* Reconnect Button - Lifesaver for connection issues */}
                    <button
                        onClick={() => {
                            if (confirm('هل تريد إعادة تأسيس الاتصال؟')) {
                                window.location.reload();
                            }
                        }}
                        className="p-4 rounded-2xl bg-[#1a1a1a] text-yellow-500 hover:bg-[#252525] transition-all shadow-lg"
                        title="إعادة الاتصال"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21h5v-5" /></svg>
                    </button>

                    <button onClick={handleCloseFull} className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-900/20 active:scale-95 transition-all uppercase tracking-wider text-sm">
                        {isHost ? 'إنهاء الاجتماع' : 'مغادرة'}
                    </button>
                </div>
            )}
        </div>
    );
};

// Robust Video Player to prevent "Black Screen" issues
const VideoPlayer = ({ stream, isVideoOff, isScreenSharing }: { stream: MediaStream, isVideoOff: boolean, isScreenSharing?: boolean }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const videoEl = videoRef.current;
        if (videoEl && stream) {
            videoEl.srcObject = stream;

            // Force play attempt
            const attemptPlay = async () => {
                try {
                    await videoEl.play();
                    setIsLoading(false);
                } catch (err) {
                    console.warn("Autoplay blocked, retrying...", err);
                    setIsLoading(false); // Remove loader even if failed, controls might work
                }
            };

            // Event listeners to track actual playback state
            const onPlaying = () => setIsLoading(false);
            const onWaiting = () => setIsLoading(true);

            videoEl.addEventListener('playing', onPlaying);
            videoEl.addEventListener('waiting', onWaiting);
            videoEl.addEventListener('loadedmetadata', attemptPlay);

            return () => {
                videoEl.removeEventListener('playing', onPlaying);
                videoEl.removeEventListener('waiting', onWaiting);
                videoEl.removeEventListener('loadedmetadata', attemptPlay);
            };
        }
    }, [stream]);

    return (
        <div className="w-full h-full relative bg-gray-950">
            {/* Loading Spinner / Black Screen Fallback */}
            {isLoading && !isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#111]">
                    <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            <video
                ref={videoRef}
                autoPlay
                playsInline
                className={cn(
                    "w-full h-full transition-opacity duration-500",
                    isScreenSharing ? "object-contain bg-black" : "object-cover",
                    isLoading ? "opacity-0" : "opacity-100",
                    isVideoOff && "hidden"
                )}
            />

            {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#151515] z-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center animate-in zoom-in duration-300">
                            <VideoOff size={32} className="text-gray-600" />
                        </div>
                        <p className="text-gray-500 font-medium text-sm">الكاميرا مغلقة</p>
                    </div>
                </div>
            )}
        </div>
    );
};

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Monitor, Mic, MicOff, Edit2, Eraser, MousePointer2, Volume2 } from 'lucide-react';
import { socketService } from '../../../lib/socket';

interface VirtualClassroomProps {
    roomID: string;
    userName: string;
    onClose: () => void;
    isTeacher: boolean;
}

export const VirtualClassroom: React.FC<VirtualClassroomProps> = ({ roomID, userName, onClose, isTeacher }) => {
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const remoteAudioContainerRef = useRef<HTMLDivElement>(null);
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const localStream = useRef<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isMuted, setIsMuted] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawMode, setDrawMode] = useState<'pen' | 'eraser' | 'cursor'>('cursor');
    const [hasRemoteStream, setHasRemoteStream] = useState(false);
    const [micActive, setMicActive] = useState(false);

    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    const toggleLocalMute = useCallback((muted: boolean) => {
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(track => {
                track.enabled = !muted;
            });
        }
        setIsMuted(muted);
        setMicActive(!muted);
    }, []);

    const createPeerConnection = useCallback((targetSocketId: string) => {
        console.log("🕸️ Creating PeerConnection for:", targetSocketId);
        const pc = new RTCPeerConnection(configuration);
        peerConnections.current.set(targetSocketId, pc);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketService.getSocket().emit('ice-candidate', {
                    roomID,
                    candidate: event.candidate,
                    to: targetSocketId
                });
            }
        };

        // Add local tracks (Audio is vital)
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => {
                pc.addTrack(track, localStream.current!);
            });
        }

        pc.ontrack = (event) => {
            console.log("🎵 Received track:", event.track.kind, "from", targetSocketId);

            if (event.track.kind === 'video') {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    setHasRemoteStream(true);
                    remoteVideoRef.current.play().catch(e => console.error("Video play error:", e));
                }
            } else if (event.track.kind === 'audio') {
                // For audio, we create a hidden audio element to ensure it plays regardless of video
                let audioElem = document.getElementById(`audio_${targetSocketId}`) as HTMLAudioElement;
                if (!audioElem) {
                    audioElem = document.createElement('audio');
                    audioElem.id = `audio_${targetSocketId}`;
                    audioElem.autoplay = true;
                    remoteAudioContainerRef.current?.appendChild(audioElem);
                }
                audioElem.srcObject = event.streams[0];
                audioElem.play().catch(e => console.error("Audio play error:", e));
            }
        };

        return pc;
    }, [roomID]);

    // Initial Mic Setup
    useEffect(() => {
        const initMic = async () => {
            try {
                console.log("🎤 Requesting Microphone access...");
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });
                localStream.current = stream;
                setMicActive(true);
                console.log("✅ Microphone active");
            } catch (err) {
                console.error("❌ Mic access denied:", err);
                alert("يرجى إعطاء صلاحية الميكروفون لتتمكن من التواصل");
            }
        };
        initMic();
    }, []);

    const startScreenShare = async () => {
        try {
            console.log("🖥️ Requesting Screen Share...");
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            if (localStream.current) {
                // Keep audio tracks, replace/add video tracks
                const videoTrack = screenStream.getVideoTracks()[0];

                // Remove old video tracks
                localStream.current.getVideoTracks().forEach(t => {
                    localStream.current?.removeTrack(t);
                    t.stop();
                });

                localStream.current.addTrack(videoTrack);

                // Update all existing connections
                peerConnections.current.forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(videoTrack);
                    } else {
                        pc.addTrack(videoTrack, localStream.current!);
                    }
                });
            }

            setIsSharing(true);

            // Re-negotiate
            const socket = socketService.getSocket();
            for (const [targetId, pc] of peerConnections.current.entries()) {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('offer', { to: targetId, offer, roomID });
            }
        } catch (err) {
            console.error("Screen share error:", err);
        }
    };

    useEffect(() => {
        const socket = socketService.getSocket();
        socket.emit('join_class', roomID);

        socket.on('request_stream', async (data: any) => {
            const pc = createPeerConnection(data.from);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('offer', { to: data.from, offer, roomID });
        });

        socket.on('offer', async (data: any) => {
            const pc = peerConnections.current.get(data.from) || createPeerConnection(data.from);
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('answer', { to: data.from, answer });
        });

        socket.on('answer', async (data: any) => {
            const pc = peerConnections.current.get(data.from);
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
        });

        socket.on('ice-candidate', async (data: any) => {
            const pc = peerConnections.current.get(data.from);
            if (pc) {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(e => { });
            }
        });

        // Trigger first connection
        socket.emit('request_stream', { roomID });

        return () => {
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            socket.off('request_stream');
            localStream.current?.getTracks().forEach(t => t.stop());
            peerConnections.current.forEach(pc => pc.close());
            if (remoteAudioContainerRef.current) remoteAudioContainerRef.current.innerHTML = '';
        };
    }, [roomID, createPeerConnection]);

    // Drawing Logic
    const startDrawing = () => { if (drawMode !== 'cursor') setIsDrawing(true); };
    const stopDrawing = () => { setIsDrawing(false); canvasRef.current?.getContext('2d')?.beginPath(); };
    const draw = (e: any) => {
        if (!isDrawing || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d')!;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
        ctx.lineWidth = drawMode === 'eraser' ? 25 : 4;
        ctx.lineCap = 'round';
        ctx.strokeStyle = drawMode === 'eraser' ? '#000' : '#10b981';
        ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col font-sans select-none overflow-hidden animate-in fade-in">
            {/* Hidden Audio Container */}
            <div ref={remoteAudioContainerRef} className="hidden" />

            {/* Header */}
            <div className="h-16 px-6 bg-[#111b21] border-b border-gray-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Monitor className="text-emerald-500" size={24} />
                        {micActive && !isMuted && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-sm tracking-tight">فصل دارين المباشر</h2>
                        <p className="text-gray-400 text-[10px] flex items-center gap-1">
                            {isTeacher ? 'المعلمة' : 'الطالب'} : {userName}
                            {micActive && !isMuted && <Volume2 size={10} className="text-emerald-500 animate-bounce" />}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isTeacher && (
                        <div className="flex bg-gray-950 rounded-lg p-1 border border-gray-800">
                            <button onClick={() => setDrawMode('cursor')} className={`p-2 rounded-md ${drawMode === 'cursor' ? 'text-white bg-emerald-600' : 'text-gray-500'}`}><MousePointer2 size={16} /></button>
                            <button onClick={() => setDrawMode('pen')} className={`p-2 rounded-md ${drawMode === 'pen' ? 'text-white bg-emerald-600' : 'text-gray-500'}`}><Edit2 size={16} /></button>
                            <button onClick={() => setDrawMode('eraser')} className={`p-2 rounded-md ${drawMode === 'eraser' ? 'text-white bg-emerald-600' : 'text-gray-500'}`}><Eraser size={16} /></button>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        {isTeacher && !isSharing && (
                            <button onClick={startScreenShare} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-black text-[10px] uppercase shadow-lg active:scale-95">بدء الشرح</button>
                        )}

                        <button
                            onClick={() => toggleLocalMute(!isMuted)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all ${isMuted ? 'bg-rose-600/20 border-rose-500/50 text-rose-500' : 'bg-gray-800 border-gray-700 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]'}`}
                        >
                            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>

                        <button onClick={onClose} className="w-10 h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center justify-center shadow-lg transition-colors border border-rose-500/20">
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Video View */}
            <div className="flex-1 relative bg-[#0b141a] flex items-center justify-center">
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                />

                {!isTeacher && !hasRemoteStream && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b141a] z-30">
                        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent animate-spin rounded-full mb-6"></div>
                        <h3 className="text-white font-black text-lg mb-2">جاري الاتصال بالمعلمة</h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest text-center">تأكد من سماحك بفتح المايكروفون للشرح</p>
                    </div>
                )}

                {isTeacher && !isSharing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b141a] z-30 text-center px-6">
                        <div className="w-24 h-24 bg-emerald-600/10 rounded-full flex items-center justify-center mb-6 border border-emerald-600/20 shadow-2xl">
                            <Monitor className="text-emerald-500" size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">الفصل جاهز</h3>
                        <p className="text-gray-500 text-sm font-medium max-w-sm mb-8">يمكنك الآن التحدث مع الطلاب وبدء مشاركة الشاشة.</p>
                        <button onClick={startScreenShare} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-black text-sm shadow-xl shadow-emerald-600/20 active:scale-95">بدء مشاركة الشاشة</button>
                    </div>
                )}

                {isTeacher && isSharing && (
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseOut={stopDrawing}
                        className={`absolute inset-0 z-40 ${drawMode === 'cursor' ? 'pointer-events-none' : 'cursor-crosshair'}`}
                        width={window.innerWidth}
                        height={window.innerHeight - 64}
                    />
                )}
            </div>

            {/* Footer */}
            <div className="h-10 bg-[#111b21] border-t border-gray-800 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${micActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        {micActive ? 'الميكروفون متصل' : 'بانتظار تفعيل الميكروفون'}
                    </span>
                </div>
            </div>
        </div>
    );
};

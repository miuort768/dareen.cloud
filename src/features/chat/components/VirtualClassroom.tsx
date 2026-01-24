import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Monitor, Mic, MicOff, Edit2, Eraser, Volume2, Maximize2, Minimize2, Move } from 'lucide-react';
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

    // UI States
    const [isMini, setIsMini] = useState(false);
    const [toolbarPos, setToolbarPos] = useState({ x: 20, y: 80 });
    const [isDragging, setIsDragging] = useState(false);

    const configuration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }]
    };

    const toggleLocalMute = useCallback((muted: boolean) => {
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(track => { track.enabled = !muted; });
        }
        setIsMuted(muted);
        setMicActive(!muted);
    }, []);

    const createPeerConnection = useCallback((targetSocketId: string) => {
        const pc = new RTCPeerConnection(configuration);
        peerConnections.current.set(targetSocketId, pc);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketService.getSocket().emit('ice-candidate', { roomID, candidate: event.candidate, to: targetSocketId });
            }
        };

        if (localStream.current) {
            localStream.current.getTracks().forEach(track => { pc.addTrack(track, localStream.current!); });
        }

        pc.ontrack = (event) => {
            if (event.track.kind === 'video') {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    setHasRemoteStream(true);
                    remoteVideoRef.current.play().catch(() => { });
                }
            } else if (event.track.kind === 'audio') {
                let audioElem = document.getElementById(`audio_${targetSocketId}`) as HTMLAudioElement;
                if (!audioElem) {
                    audioElem = document.createElement('audio');
                    audioElem.id = `audio_${targetSocketId}`;
                    audioElem.autoplay = true;
                    audioElem.muted = false;
                    audioElem.volume = 1.0;
                    remoteAudioContainerRef.current?.appendChild(audioElem);
                }
                audioElem.srcObject = event.streams[0];
                audioElem.play().catch(() => { });
            }
        };

        return pc;
    }, [roomID]);

    useEffect(() => {
        const initMic = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
                });
                localStream.current = stream;
                setMicActive(true);
            } catch (err) {
                console.error("Mic error:", err);
            }
        };
        initMic();
    }, []);

    const startScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            if (localStream.current) {
                const videoTrack = screenStream.getVideoTracks()[0];
                localStream.current.getVideoTracks().forEach(t => { localStream.current?.removeTrack(t); t.stop(); });
                localStream.current.addTrack(videoTrack);
                peerConnections.current.forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) sender.replaceTrack(videoTrack);
                    else pc.addTrack(videoTrack, localStream.current!);
                });
            }
            setIsSharing(true);
            const socket = socketService.getSocket();
            for (const [targetId, pc] of peerConnections.current.entries()) {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('offer', { to: targetId, offer, roomID });
            }
        } catch (err) {
            console.error("Share error:", err);
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
            if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        });
        socket.on('ice-candidate', async (data: any) => {
            const pc = peerConnections.current.get(data.from);
            if (pc) await pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(() => { });
        });
        socket.emit('request_stream', { roomID });

        return () => {
            socket.off('offer'); socket.off('answer'); socket.off('ice-candidate'); socket.off('request_stream');
            localStream.current?.getTracks().forEach(t => t.stop());
            peerConnections.current.forEach(pc => pc.close());
        };
    }, [roomID, createPeerConnection]);

    // Draggable Logic
    const handleDrag = (e: any) => {
        if (!isDragging) return;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        setToolbarPos({ x: clientX - 20, y: clientY - 20 });
    };

    // Drawing Logic
    const getCoordinates = (e: any) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        return {
            x: Math.round(clientX - rect.left),
            y: Math.round(clientY - rect.top)
        };
    };

    const startDrawing = (e: any) => {
        if (drawMode === 'cursor') return;
        setIsDrawing(true);
        const { x, y } = getCoordinates(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    };

    const draw = (e: any) => {
        if (!isDrawing || !canvasRef.current || drawMode === 'cursor') return;
        const ctx = canvasRef.current.getContext('2d')!;
        const { x, y } = getCoordinates(e);
        ctx.lineWidth = drawMode === 'eraser' ? 30 : 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = drawMode === 'eraser' ? '#000' : '#10b981';
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    return (
        <div
            className={`fixed inset-0 z-[100] flex flex-col font-sans select-none overflow-hidden transition-all duration-500 ${isMini ? 'pointer-events-none' : 'bg-black'}`}
            onMouseMove={handleDrag}
            onMouseUp={() => setIsDragging(false)}
            onTouchMove={handleDrag}
            onTouchEnd={() => setIsDragging(false)}
        >
            <div ref={remoteAudioContainerRef} className="hidden" />

            {/* Draggable Floating Controller */}
            <div
                style={{ left: `${toolbarPos.x}px`, top: `${toolbarPos.y}px` }}
                className={`absolute z-[120] pointer-events-auto flex items-center gap-2 p-2 bg-[#111b21]/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl transition-all ${isDragging ? 'scale-105 opacity-80' : ''}`}
            >
                <div
                    onMouseDown={() => setIsDragging(true)}
                    onTouchStart={() => setIsDragging(true)}
                    className="p-2 cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300"
                >
                    <Move size={18} />
                </div>

                <div className="h-8 w-px bg-gray-700 mx-1"></div>

                <button
                    onClick={() => toggleLocalMute(!isMuted)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isMuted ? 'bg-rose-600/20 text-rose-500 border border-rose-500/30' : 'bg-emerald-600/10 text-emerald-500 border border-emerald-500/30'}`}
                    title="الميكروفون"
                >
                    {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                {isTeacher && (
                    <>
                        <button
                            onClick={startScreenShare}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${isSharing ? 'bg-blue-600/20 text-blue-500 border-blue-500/30' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                            title="مشاركة الشاشة"
                        >
                            <Monitor size={18} />
                        </button>

                        <div className="flex bg-gray-900/50 rounded-xl p-0.5 border border-gray-800">
                            <button onClick={() => setDrawMode('pen')} className={`p-2 rounded-lg ${drawMode === 'pen' ? 'text-white bg-emerald-600' : 'text-gray-500'}`}><Edit2 size={16} /></button>
                            <button onClick={() => setDrawMode('eraser')} className={`p-2 rounded-lg ${drawMode === 'eraser' ? 'text-white bg-emerald-600' : 'text-gray-500'}`}><Eraser size={16} /></button>
                        </div>
                    </>
                )}

                <div className="h-8 w-px bg-gray-700 mx-1"></div>

                <button
                    onClick={() => setIsMini(!isMini)}
                    className="w-10 h-10 bg-gray-800 text-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-700 hover:text-white transition-all"
                    title={isMini ? "تكبير الواجهة" : "تصغير الواجهة"}
                >
                    {isMini ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                </button>

                <button onClick={onClose} className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
                    <X size={18} />
                </button>
            </div>

            {/* Main Content */}
            {!isMini && (
                <div className="flex-1 relative flex items-center justify-center">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />

                    {!isTeacher && !hasRemoteStream && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b141a]">
                            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent animate-spin rounded-full mb-6"></div>
                            <h3 className="text-white font-black text-lg mb-2">في انتظار المعلمة...</h3>
                        </div>
                    )}

                    {isTeacher && !isSharing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b141a] text-center px-6">
                            <h3 className="text-2xl font-black text-white mb-2">جاهزة لبدء الحصة؟</h3>
                            <p className="text-gray-500 text-sm mb-8">الميكروفون يعمل الآن. اضغطي على زر الشاشة في اللوحة العائمة لبدء الشرح.</p>
                        </div>
                    )}

                    {isTeacher && isSharing && (
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseOut={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className={`absolute inset-0 z-40 ${drawMode === 'cursor' ? 'pointer-events-none' : 'cursor-crosshair'}`}
                            width={window.innerWidth} height={window.innerHeight}
                        />
                    )}
                </div>
            )}

            {/* Minimal Brand Footer */}
            {!isMini && (
                <div className="h-8 bg-[#111b21] border-t border-gray-800 px-6 flex items-center justify-between text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                    <span>Darin Smart Classroom</span>
                    <div className="flex items-center gap-2">
                        <Volume2 size={10} className={micActive && !isMuted ? 'text-emerald-500' : 'text-gray-700'} />
                        {userName}
                    </div>
                </div>
            )}
        </div>
    );
};

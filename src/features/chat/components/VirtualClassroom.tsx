import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Monitor, Mic, MicOff, Edit2, Eraser, Volume2, Maximize2, Minimize2, Move, RefreshCw, AlertCircle } from 'lucide-react';
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
    const [micStatus, setMicStatus] = useState<'requesting' | 'ready' | 'denied' | 'error'>('requesting');

    // UI States
    const [isMini, setIsMini] = useState(false);
    const [toolbarPos, setToolbarPos] = useState({ x: 20, y: 80 });
    const [isDragging, setIsDragging] = useState(false);

    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
        ]
    };

    // --- FORCE RENEGOTIATION ---
    const renegotiateAll = useCallback(async () => {
        const socket = socketService.getSocket();
        for (const [targetId, pc] of peerConnections.current.entries()) {
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('offer', { to: targetId, offer, roomID });
            } catch (e) {
                console.error("Renegotiation failed for:", targetId, e);
            }
        }
    }, [roomID]);

    // --- ENHANCED MIC INITIALIZATION ---
    const initMic = useCallback(async (force = false) => {
        if (localStream.current && !force) return true;

        // Stop old tracks if forcing
        if (force && localStream.current) {
            localStream.current.getTracks().forEach(t => t.stop());
        }

        setMicStatus('requesting');
        try {
            console.log("🎤 [System] Initializing Microphone...");
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000
                }
            });

            localStream.current = stream;
            setMicStatus('ready');

            // Apply tracks to all peer connections
            peerConnections.current.forEach(pc => {
                stream.getAudioTracks().forEach(track => {
                    const audioSender = pc.getSenders().find(s => s.track?.kind === 'audio');
                    if (audioSender) {
                        audioSender.replaceTrack(track);
                    } else {
                        pc.addTrack(track, stream);
                    }
                });
            });

            if (force) renegotiateAll();

            console.log("✅ [System] Microphone Ready");
            return true;
        } catch (err: any) {
            console.error("❌ [System] Microphone Failed:", err);
            setMicStatus(err.name === 'NotAllowedError' ? 'denied' : 'error');
            return false;
        }
    }, [renegotiateAll]);

    useEffect(() => {
        initMic();
        return () => {
            localStream.current?.getTracks().forEach(t => t.stop());
        };
    }, [initMic]);

    const toggleLocalMute = useCallback((muted: boolean) => {
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(track => {
                track.enabled = !muted;
            });
        }
        setIsMuted(muted);
    }, []);

    const createPeerConnection = useCallback((targetSocketId: string) => {
        console.log("🕸️ [WebRTC] New Connection:", targetSocketId);
        const pc = new RTCPeerConnection(configuration);
        peerConnections.current.set(targetSocketId, pc);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketService.getSocket().emit('ice-candidate', { roomID, candidate: event.candidate, to: targetSocketId });
            }
        };

        if (localStream.current) {
            localStream.current.getTracks().forEach(track => {
                pc.addTrack(track, localStream.current!);
            });
        }

        pc.ontrack = (event) => {
            console.log(`🎵 [WebRTC] Track: ${event.track.kind} from ${targetSocketId}`);
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
                    audioElem.volume = 1.0;
                    remoteAudioContainerRef.current?.appendChild(audioElem);
                }
                audioElem.srcObject = event.streams[0];

                // Force play on every interaction just in case
                const forcePlay = () => {
                    audioElem.play().catch(() => { });
                    document.removeEventListener('click', forcePlay);
                    document.removeEventListener('touchstart', forcePlay);
                };
                document.addEventListener('click', forcePlay);
                document.addEventListener('touchstart', forcePlay);
                audioElem.play().catch(() => { });
            }
        };

        return pc;
    }, [roomID]);

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
            socketService.getSocket().emit('start_class', { roomID });
            renegotiateAll();
        } catch (err) {
            console.error("Share error:", err);
        }
    };

    const handleExit = useCallback(() => {
        if (isTeacher) socketService.getSocket().emit('end_class', { roomID });
        onClose();
    }, [isTeacher, roomID, onClose]);

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

        socket.on('class_ended', () => handleExit());

        socket.emit('request_stream', { roomID });

        return () => {
            socket.off('offer'); socket.off('answer'); socket.off('ice-candidate'); socket.off('request_stream'); socket.off('class_ended');
            peerConnections.current.forEach(pc => pc.close());
        };
    }, [roomID, createPeerConnection, handleExit]);

    // UI Handle Drag
    const handleDrag = (e: any) => {
        if (!isDragging) return;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        setToolbarPos({ x: clientX - 25, y: clientY - 25 });
    };

    const getCoordinates = (e: any) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        return { x: Math.round(clientX - rect.left), y: Math.round(clientY - rect.top) };
    };

    return (
        <div
            className={`fixed inset-0 z-[100] flex flex-col font-sans select-none overflow-hidden transition-all duration-500 ${isMini ? 'pointer-events-none' : 'bg-black'}`}
            onMouseMove={handleDrag} onMouseUp={() => setIsDragging(false)} onTouchMove={handleDrag} onTouchEnd={() => setIsDragging(false)}
        >
            <div ref={remoteAudioContainerRef} className="hidden" />

            {micStatus !== 'ready' && !isMini && (
                <div className="absolute inset-0 z-[150] bg-[#0c141a] flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-500">
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                        <Mic className="text-emerald-500" size={48} />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4">جاري تشغيل الصوت</h3>
                    <p className="text-gray-400 max-w-sm mb-10 leading-relaxed font-medium">
                        يرجى السماح بالوصول للميكروفون من المتصفح للبدء. إذا ظهر لك طلب، اضغط على "Allow" أو "سماح".
                    </p>
                    <button onClick={() => initMic(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-4 rounded-2xl font-black flex items-center gap-3 shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all">
                        تفعيل الميكروفون الآن
                    </button>
                    <button onClick={onClose} className="mt-6 text-gray-500 font-bold hover:text-white transition-colors">إغلاق الفصل</button>
                </div>
            )}

            <div
                style={{ left: `${toolbarPos.x}px`, top: `${toolbarPos.y}px` }}
                className={`absolute z-[120] pointer-events-auto flex items-center gap-2 p-3 bg-[#111b21]/95 backdrop-blur-3xl border border-white/5 rounded-3xl shadow-2xl transition-transform ${isDragging ? 'scale-110' : ''}`}
            >
                <div onMouseDown={() => setIsDragging(true)} onTouchStart={() => setIsDragging(true)} className="p-2 cursor-grab active:cursor-grabbing text-gray-500 hover:text-white transition-colors">
                    <Move size={20} />
                </div>

                <div className="h-10 w-px bg-white/10 mx-1"></div>

                <button
                    onClick={() => toggleLocalMute(!isMuted)}
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg ${isMuted ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'}`}
                >
                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>

                {isTeacher && (
                    <>
                        <button onClick={startScreenShare} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg ${isSharing ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                            <Monitor size={22} />
                        </button>
                        <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
                            <button onClick={() => setDrawMode('pen')} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${drawMode === 'pen' ? 'bg-emerald-600 text-white' : 'text-gray-500'}`}><Edit2 size={18} /></button>
                            <button onClick={() => setDrawMode('eraser')} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${drawMode === 'eraser' ? 'bg-rose-500 text-white' : 'text-gray-500'}`}><Eraser size={18} /></button>
                        </div>
                    </>
                )}

                <div className="h-10 w-px bg-white/10 mx-1"></div>

                <button onClick={() => initMic(true)} className="w-12 h-12 bg-white/5 text-gray-400 hover:text-emerald-500 rounded-2xl flex items-center justify-center transition-all" title="تحديث الصوت">
                    <RefreshCw size={22} className={micStatus === 'requesting' ? 'animate-spin' : ''} />
                </button>

                <button onClick={() => setIsMini(!isMini)} className="w-12 h-12 bg-white/5 text-gray-400 hover:text-white rounded-2xl flex items-center justify-center transition-all">
                    {isMini ? <Maximize2 size={22} /> : <Minimize2 size={22} />}
                </button>

                <button onClick={handleExit} className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all">
                    <X size={22} />
                </button>
            </div>

            {!isMini && (
                <div className="flex-1 relative flex items-center justify-center bg-[#0b141a]">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />

                    {!isTeacher && !hasRemoteStream && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b141a] z-10">
                            <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent animate-spin rounded-full mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]"></div>
                            <h3 className="text-white font-black text-2xl mb-2 tracking-tight">بانتظار عرض المعلمة</h3>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em] opacity-60">سيتم تفعيل الشاشة فور بدء الجلسة</p>
                        </div>
                    )}

                    {isTeacher && !isSharing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111b21] z-20 text-center px-8">
                            <div className="w-28 h-28 bg-emerald-600/5 rounded-full flex items-center justify-center mb-8 border border-emerald-600/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
                                <Monitor className="text-emerald-500 opacity-80" size={60} />
                            </div>
                            <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">جاهزة للبدء؟</h3>
                            <p className="text-gray-400 text-base max-w-sm mb-12 leading-relaxed font-medium">قمت بتفعيل الميكروفون بنجاح. ابدئي الآن بمشاركة الشاشة ليراكي الطلاب.</p>
                            <button onClick={startScreenShare} className="bg-emerald-600 hover:bg-emerald-700 text-white px-14 py-5 rounded-2xl font-black text-lg shadow-[0_20px_40px_rgba(16,185,129,0.3)] active:scale-95 transition-all">ابدأ البث الآن</button>
                        </div>
                    )}

                    {isTeacher && isSharing && (
                        <canvas ref={canvasRef}
                            onMouseDown={(e) => { if (drawMode !== 'cursor') setIsDrawing(true); const { x, y } = getCoordinates(e); const ctx = canvasRef.current?.getContext('2d'); if (ctx) { ctx.beginPath(); ctx.moveTo(x, y); } }}
                            onMouseMove={(e) => { if (!isDrawing || !canvasRef.current || drawMode === 'cursor') return; const ctx = canvasRef.current.getContext('2d')!; const { x, y } = getCoordinates(e); ctx.lineWidth = drawMode === 'eraser' ? 45 : 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = drawMode === 'eraser' ? '#000' : '#10b981'; ctx.lineTo(x, y); ctx.stroke(); }}
                            onMouseUp={() => setIsDrawing(false)}
                            onTouchStart={(e) => { if (drawMode !== 'cursor') setIsDrawing(true); const { x, y } = getCoordinates(e); const ctx = canvasRef.current?.getContext('2d'); if (ctx) { ctx.beginPath(); ctx.moveTo(x, y); } }}
                            onTouchMove={(e) => { if (!isDrawing || !canvasRef.current || drawMode === 'cursor') return; const ctx = canvasRef.current.getContext('2d')!; const { x, y } = getCoordinates(e); ctx.lineWidth = drawMode === 'eraser' ? 45 : 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = drawMode === 'eraser' ? '#000' : '#10b981'; ctx.lineTo(x, y); ctx.stroke(); }}
                            onTouchEnd={() => setIsDrawing(false)}
                            className={`absolute inset-0 z-40 ${drawMode === 'cursor' ? 'pointer-events-none' : 'cursor-crosshair'}`}
                            width={window.innerWidth} height={window.innerHeight} />
                    )}
                </div>
            )}

            {!isMini && (
                <div className="h-10 bg-[#111b21] border-t border-white/5 px-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <div className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-widest">
                            <Volume2 size={12} className={!isMuted ? 'text-emerald-500' : ''} />
                            {userName}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

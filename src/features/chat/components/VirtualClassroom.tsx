import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Monitor, Mic, MicOff, Edit2, Eraser, Volume2, Maximize2, Minimize2, Move, RefreshCw } from 'lucide-react';
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
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }]
    };

    // --- RE-ENGINEERED MIC DETECTION ---
    const initMic = useCallback(async () => {
        setMicStatus('requesting');
        try {
            console.log("🎤 Requesting mic for:", userName);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            localStream.current = stream;
            setMicStatus('ready');

            // If we are already in calls, we should add our track to them
            peerConnections.current.forEach(pc => {
                stream.getAudioTracks().forEach(track => {
                    pc.addTrack(track, stream);
                });
            });

            console.log("✅ Microphone initialized successfully");
            return true;
        } catch (err: any) {
            console.error("❌ Mic access error:", err);
            if (err.name === 'NotAllowedError') setMicStatus('denied');
            else setMicStatus('error');
            return false;
        }
    }, [userName]);

    useEffect(() => {
        initMic();
    }, [initMic]);

    const toggleLocalMute = useCallback((muted: boolean) => {
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(track => { track.enabled = !muted; });
        }
        setIsMuted(muted);
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

    const startScreenShare = async () => {
        if (micStatus !== 'ready') {
            const retry = await initMic();
            if (!retry) return alert("يرجى تشغيل الميكروفون أولاً للمتابعة");
        }

        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            if (localStream.current) {
                const videoTrack = screenStream.getVideoTracks()[0];
                // Remove old screenshare tracks but keep mic
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

            // Broadcast that the class has started
            socket.emit('start_class', { roomID });

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

        socket.on('class_ended', () => {
            console.log("🚫 Class ended by teacher");
            onClose();
        });

        // Always request stream when entering
        socket.emit('request_stream', { roomID });

        return () => {
            socket.off('offer'); socket.off('answer'); socket.off('ice-candidate'); socket.off('request_stream');
            socket.off('class_ended');
            localStream.current?.getTracks().forEach(t => t.stop());
            peerConnections.current.forEach(pc => pc.close());
        };
    }, [roomID, createPeerConnection, onClose]);

    const handleExit = () => {
        if (isTeacher) {
            socketService.getSocket().emit('end_class', { roomID });
        }
        onClose();
    };

    // UI Handle Drag
    const handleDrag = (e: any) => {
        if (!isDragging) return;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        setToolbarPos({ x: clientX - 25, y: clientY - 25 });
    };

    // Drawing Logic
    const getCoordinates = (e: any) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        return { x: Math.round(clientX - rect.left), y: Math.round(clientY - rect.top) };
    };

    const startDrawing = (e: any) => {
        if (drawMode === 'cursor') return;
        setIsDrawing(true);
        const { x, y } = getCoordinates(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) { ctx.beginPath(); ctx.moveTo(x, y); }
    };

    const draw = (e: any) => {
        if (!isDrawing || !canvasRef.current || drawMode === 'cursor') return;
        const ctx = canvasRef.current.getContext('2d')!;
        const { x, y } = getCoordinates(e);
        ctx.lineWidth = drawMode === 'eraser' ? 35 : 5;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.strokeStyle = drawMode === 'eraser' ? '#000' : '#10b981';
        ctx.lineTo(x, y); ctx.stroke();
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

            {/* ERROR UI: MIC NOT DETECTED */}
            {micStatus !== 'ready' && !isMini && (
                <div className="absolute inset-0 z-[150] bg-[#0b141a] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                    <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20">
                        <MicOff className="text-rose-500" size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4">يجب تفعيل الميكروفون</h3>
                    <p className="text-gray-400 max-w-sm mb-8 leading-relaxed">
                        عذراً، لم نتمكن من الوصول للميكروفون. يرجى السماح للمتصفح باستخدام الميكروفون لتتمكن من التواصل داخل الفصل الدراسي.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => initMic()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
                        >
                            <RefreshCw size={18} className={micStatus === 'requesting' ? 'animate-spin' : ''} />
                            إعادة المحاولة
                        </button>
                        <button onClick={onClose} className="bg-gray-800 text-white px-8 py-3 rounded-xl font-bold">إغلاق</button>
                    </div>
                </div>
            )}

            {/* Draggable Control Bar */}
            <div
                style={{ left: `${toolbarPos.x}px`, top: `${toolbarPos.y}px` }}
                className={`absolute z-[120] pointer-events-auto flex items-center gap-2 p-2.5 bg-[#111b21]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-shadow ${isDragging ? 'shadow-none' : ''}`}
            >
                <div onMouseDown={() => setIsDragging(true)} onTouchStart={() => setIsDragging(true)} className="p-2 cursor-grab active:cursor-grabbing text-gray-500 hover:text-white transition-colors">
                    <Move size={20} />
                </div>

                <div className="h-10 w-px bg-white/10 mx-1"></div>

                <button
                    onClick={() => toggleLocalMute(!isMuted)}
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg ${isMuted ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}
                >
                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>

                {isTeacher && (
                    <>
                        <button
                            onClick={startScreenShare}
                            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${isSharing ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-white/5'}`}
                        >
                            <Monitor size={22} />
                        </button>
                        <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
                            <button onClick={() => setDrawMode('pen')} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${drawMode === 'pen' ? 'bg-emerald-600 text-white shadow-inner' : 'text-gray-500'}`}><Edit2 size={18} /></button>
                            <button onClick={() => setDrawMode('eraser')} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${drawMode === 'eraser' ? 'bg-rose-500 text-white shadow-inner' : 'text-gray-500'}`}><Eraser size={18} /></button>
                        </div>
                    </>
                )}

                <div className="h-10 w-px bg-white/10 mx-1"></div>

                <button onClick={() => setIsMini(!isMini)} className="w-12 h-12 bg-white/5 text-gray-400 hover:text-white rounded-2xl flex items-center justify-center transition-all">
                    {isMini ? <Maximize2 size={22} /> : <Minimize2 size={22} />}
                </button>

                <button onClick={handleExit} className="w-12 h-12 bg-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white rounded-2xl flex items-center justify-center transition-all">
                    <X size={22} />
                </button>
            </div>

            {/* Main Area */}
            {!isMini && (
                <div className="flex-1 relative flex items-center justify-center bg-[#0b141a]">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />

                    {!isTeacher && !hasRemoteStream && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b141a]">
                            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent animate-spin rounded-full mb-6"></div>
                            <h3 className="text-white font-black text-xl mb-2">في انتظار شاشة المعلمة</h3>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">تأكد من أن الميكروفون لديك مفعل</p>
                        </div>
                    )}

                    {isTeacher && !isSharing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b141a] text-center px-6">
                            <div className="w-24 h-24 bg-emerald-600/10 rounded-full flex items-center justify-center mb-6 border border-emerald-600/20 shadow-2xl">
                                <Mic className="text-emerald-500" size={48} />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-2">تعرفنا على الميكروفون بنجاح!</h3>
                            <p className="text-gray-400 text-sm max-w-sm mb-10 leading-relaxed font-medium">
                                الطلاب الآن يمكنهم سماعك بوضوح. اضغطي على زر "مشاركة الشاشة" في الشريط العائم للبدء في الشرح.
                            </p>
                            <button onClick={startScreenShare} className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all">ابدأ مشاركة الشاشة الآن</button>
                        </div>
                    )}

                    {isTeacher && isSharing && (
                        <canvas
                            ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                            className={`absolute inset-0 z-40 ${drawMode === 'cursor' ? 'pointer-events-none' : 'cursor-crosshair'}`}
                            width={window.innerWidth} height={window.innerHeight}
                        />
                    )}
                </div>
            )}

            {/* Native Status Tracker */}
            {!isMini && (
                <div className="h-10 bg-[#111b21] border-t border-white/5 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Live Session</span>
                        <div className="h-4 w-px bg-white/10 mx-1"></div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase">
                            <Volume2 size={12} className="text-emerald-500" />
                            {userName}
                        </div>
                    </div>
                    <div className="text-[10px] text-gray-600 font-black tracking-widest uppercase">Darin Intelligent Hub</div>
                </div>
            )}
        </div>
    );
};

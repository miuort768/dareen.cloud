import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Monitor, Mic, MicOff, Edit2, Eraser, MousePointer2 } from 'lucide-react';
import { socketService } from '../../../lib/socket';

interface VirtualClassroomProps {
    roomID: string;
    userName: string;
    onClose: () => void;
    isTeacher: boolean;
}

export const VirtualClassroom: React.FC<VirtualClassroomProps> = ({ roomID, userName, onClose, isTeacher }) => {
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const localStream = useRef<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isMuted, setIsMuted] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawMode, setDrawMode] = useState<'pen' | 'eraser' | 'cursor'>('cursor');
    const [hasRemoteStream, setHasRemoteStream] = useState(false);

    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    // --- Helper to toggle local tracks ---
    const toggleLocalMute = useCallback((muted: boolean) => {
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(track => {
                track.enabled = !muted;
            });
        }
        setIsMuted(muted);
    }, []);

    const createPeerConnection = useCallback((targetSocketId: string) => {
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

        // Add local tracks (Audio always, Video if teacher is sharing)
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => {
                pc.addTrack(track, localStream.current!);
            });
        }

        pc.ontrack = (event) => {
            console.log("🎥 Received track:", event.track.kind);
            if (remoteVideoRef.current) {
                // If it's a new stream, attach it
                if (remoteVideoRef.current.srcObject !== event.streams[0]) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    setHasRemoteStream(true);
                }
                remoteVideoRef.current.play().catch(e => console.warn("Autoplay wait:", e));
            }
        };

        return pc;
    }, [roomID]);

    // Initial Mic Setup for everyone
    useEffect(() => {
        const initMic = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                localStream.current = stream;
                // If already in a call, we'd need to add/replace tracks, 
                // but since we do PC creation on demand, it's fine.
            } catch (err) {
                console.error("Mic access denied:", err);
            }
        };
        initMic();
    }, []);

    const startScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });

            // Add screen tracks to localStream
            if (localStream.current) {
                // Remove old video tracks if any
                localStream.current.getVideoTracks().forEach(t => {
                    localStream.current?.removeTrack(t);
                    t.stop();
                });

                screenStream.getTracks().forEach(track => {
                    localStream.current?.addTrack(track);
                    // Add to all existing peer connections
                    peerConnections.current.forEach(pc => {
                        pc.addTrack(track, localStream.current!);
                    });
                });
            } else {
                localStream.current = screenStream;
            }

            setIsSharing(true);

            // Re-negotiation: Send new offers to everyone
            const socket = socketService.getSocket();
            for (const [targetId, pc] of peerConnections.current.entries()) {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('offer', { to: targetId, offer, roomID });
            }

            // If no one is here yet, the next joiner will get it via request_stream
        } catch (err) {
            console.error("Screen share error:", err);
        }
    };

    useEffect(() => {
        const socket = socketService.getSocket();
        socket.emit('join_class', roomID);

        socket.on('request_stream', async (data: any) => {
            console.log("Request from:", data.from);
            const pc = createPeerConnection(data.from);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('offer', { to: data.from, offer, roomID });
        });

        socket.on('offer', async (data: any) => {
            console.log("Offer from:", data.from);
            const pc = peerConnections.current.get(data.from) || createPeerConnection(data.from);
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('answer', { to: data.from, answer });
        });

        socket.on('answer', async (data: any) => {
            console.log("Answer from:", data.from);
            const pc = peerConnections.current.get(data.from);
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
        });

        socket.on('ice-candidate', async (data: any) => {
            const pc = peerConnections.current.get(data.from);
            if (pc) {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });

        // Auto-notify others I've joined
        socket.emit('request_stream', { roomID });

        return () => {
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            socket.off('request_stream');
            localStream.current?.getTracks().forEach(t => t.stop());
            peerConnections.current.forEach(pc => pc.close());
        };
    }, [roomID, createPeerConnection]);

    // Drawing Logic (Teacher only)
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
        <div className="fixed inset-0 z-[100] bg-black flex flex-col font-sans select-none overflow-hidden">
            {/* Native Header */}
            <div className="h-16 px-6 bg-[#111b21] border-b border-gray-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Monitor className="text-emerald-500" size={24} />
                    <div>
                        <h2 className="text-white font-bold text-sm tracking-tight">فصل دارين المباشر</h2>
                        <p className="text-gray-400 text-[10px]">{isTeacher ? `المعلمة: ${userName}` : `الطالب: ${userName}`}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isTeacher && (
                        <div className="flex bg-gray-950 rounded-lg p-1 border border-gray-800">
                            <button onClick={() => setDrawMode('cursor')} className={`p-2 rounded-md ${drawMode === 'cursor' ? 'text-white bg-emerald-600 shadow-lg' : 'text-gray-500 hover:text-gray-300'}`} title="المؤشر"><MousePointer2 size={16} /></button>
                            <button onClick={() => setDrawMode('pen')} className={`p-2 rounded-md ${drawMode === 'pen' ? 'text-white bg-emerald-600 shadow-lg' : 'text-gray-500 hover:text-gray-300'}`} title="القلم"><Edit2 size={16} /></button>
                            <button onClick={() => setDrawMode('eraser')} className={`p-2 rounded-md ${drawMode === 'eraser' ? 'text-white bg-emerald-600 shadow-lg' : 'text-gray-500 hover:text-gray-300'}`} title="الممحاة"><Eraser size={16} /></button>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        {isTeacher && !isSharing && (
                            <button onClick={startScreenShare} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-black text-[10px] uppercase shadow-lg transition-transform active:scale-95">بدء الشرح</button>
                        )}

                        <button
                            onClick={() => toggleLocalMute(!isMuted)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all ${isMuted ? 'bg-rose-600/20 border-rose-500/50 text-rose-500' : 'bg-gray-800 border-gray-700 text-gray-300'}`}
                            title={isMuted ? "تشغيل المايك" : "كتم المايك"}
                        >
                            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>

                        <button onClick={onClose} className="w-10 h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center justify-center shadow-lg transition-colors border border-rose-500/20" title="خروج">
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative bg-[#0b141a] flex items-center justify-center">
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain pointer-events-none"
                />

                {!isTeacher && !hasRemoteStream && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b141a] z-30">
                        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent animate-spin rounded-full mb-6"></div>
                        <h3 className="text-white font-black text-lg mb-2">في انتظار المعلمة</h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest text-center max-w-[200px]">سيبدأ الشرح فور قيام المعلمة بمشاركة شاشتها</p>
                    </div>
                )}

                {isTeacher && !isSharing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b141a] z-30 text-center px-6">
                        <div className="w-24 h-24 bg-emerald-600/10 rounded-full flex items-center justify-center mb-6 border border-emerald-600/20 shadow-2xl">
                            <Monitor className="text-emerald-500" size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">جاهزة لبدء الشرح؟</h3>
                        <p className="text-gray-500 text-sm font-medium max-w-sm mb-8">اضغطي على زر "بدء الشرح" في الأعلى لاختيار الشاشة والبدء فوراً.</p>
                        <button onClick={startScreenShare} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-black text-sm shadow-xl shadow-emerald-600/20 transition-all active:scale-95">بدء مشاركة الشاشة</button>
                    </div>
                )}

                {/* Drawing Over Screen (Teacher only) */}
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
                        width={window.innerWidth}
                        height={window.innerHeight - 104} // Accounting for header/footer
                    />
                )}
            </div>

            {/* Footer Status */}
            <div className="h-10 bg-[#111b21] border-t border-gray-800 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${isSharing || hasRemoteStream ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`}></span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        {isSharing || hasRemoteStream ? 'البث مستمر حالياً' : 'جاهز للاتصال'}
                    </span>
                    <p className="text-gray-700 text-[10px] font-bold">|</p>
                    <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">
                        {isMuted ? 'المايك مكتوم' : 'المايك يعمل'}
                    </p>
                </div>
                <div className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">
                    Darin Smart Classroom v1.2
                </div>
            </div>
        </div>
    );
};

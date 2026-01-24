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
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const pc = useRef<RTCPeerConnection | null>(null);
    const localStream = useRef<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isMuted, setIsMuted] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawMode, setDrawMode] = useState<'pen' | 'eraser' | 'cursor'>('cursor');

    // WebRTC Configuration
    const configuration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };

    const setupPeerConnection = useCallback(() => {
        pc.current = new RTCPeerConnection(configuration);
        const socket = socketService.getSocket();

        pc.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { roomID, candidate: event.candidate });
            }
        };

        pc.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        if (localStream.current) {
            localStream.current.getTracks().forEach(track => {
                pc.current?.addTrack(track, localStream.current!);
            });
        }
    }, [roomID]);

    const startStream = async () => {
        try {
            // 1. Get Screen + Audio
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            // 2. Get Mic Audio separately for better mixing
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Combine
            const combined = new MediaStream([
                ...screenStream.getVideoTracks(),
                ...audioStream.getAudioTracks()
            ]);

            localStream.current = combined;
            if (localVideoRef.current) localVideoRef.current.srcObject = combined;

            setIsSharing(true);
            setupPeerConnection();

            // Create Offer
            const offer = await pc.current?.createOffer();
            await pc.current?.setLocalDescription(offer);
            socketService.getSocket().emit('offer', { roomID, offer });

        } catch (err) {
            console.error("Error starting stream:", err);
            onClose();
        }
    };

    useEffect(() => {
        const socket = socketService.getSocket();
        socket.emit('join_class', roomID);

        socket.on('offer', async (data: any) => {
            if (isTeacher) return; // Teachers don't receive offers
            setupPeerConnection();
            await pc.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.current?.createAnswer();
            await pc.current?.setLocalDescription(answer);
            socket.emit('answer', { to: data.from, answer });
        });

        socket.on('answer', async (data: any) => {
            await pc.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
        });

        socket.on('ice-candidate', async (data: any) => {
            try {
                await pc.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (e) {
                console.error("Error adding ice candidate", e);
            }
        });

        return () => {
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            localStream.current?.getTracks().forEach(t => t.stop());
            pc.current?.close();
        };
    }, [roomID, isTeacher, setupPeerConnection]);

    // Drawing Logic
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (drawMode === 'cursor') return;
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const ctx = canvasRef.current?.getContext('2d');
        ctx?.beginPath(); // Reset path
    };

    const draw = (e: any) => {
        if (!isDrawing || !canvasRef.current || drawMode === 'cursor') return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.lineWidth = drawMode === 'eraser' ? 20 : 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = drawMode === 'eraser' ? '#0b141a' : '#10b981';

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#0b141a] flex flex-col font-sans select-none">
            {/* Native Header */}
            <div className="h-16 px-6 bg-[#111b21] border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Monitor className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className="text-white font-black text-sm uppercase tracking-wider">بث دارين المباشر</h2>
                        <p className="text-emerald-500 text-[10px] font-bold">
                            {isTeacher ? `أهلاً معلمة ${userName} (بث مستقل)` : `متابعة الشرح مع المعلمة`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isTeacher && (
                        <div className="flex items-center bg-gray-900 rounded-full px-2 py-1 border border-gray-800 gap-1">
                            <button
                                onClick={() => setDrawMode('cursor')}
                                className={`p-2 rounded-full transition-all ${drawMode === 'cursor' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
                            >
                                <MousePointer2 size={16} />
                            </button>
                            <button
                                onClick={() => setDrawMode('pen')}
                                className={`p-2 rounded-full transition-all ${drawMode === 'pen' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => setDrawMode('eraser')}
                                className={`p-2 rounded-full transition-all ${drawMode === 'eraser' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
                            >
                                <Eraser size={16} />
                            </button>
                        </div>
                    )}

                    {!isSharing && isTeacher ? (
                        <button
                            onClick={startStream}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-none font-black text-xs shadow-lg flex items-center gap-2"
                        >
                            <Monitor size={16} />
                            ابدأ مشاركة الشاشة
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className={`w-10 h-10 rounded-none flex items-center justify-center border transition-all ${isMuted ? 'bg-rose-600 border-rose-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300'}`}
                            >
                                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-none flex items-center justify-center transition-all shadow-lg"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Video / Stream Area */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                {!isSharing && isTeacher && (
                    <div className="text-center p-8 max-w-md animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-emerald-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-600/20">
                            <Monitor className="text-emerald-500" size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">مستعدة لبث الشاشة؟</h3>
                        <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed">بمجرد الضغط على الزر، يمكنك اختيار الشاشة التي تريدين شرحها لطلابك مباشرة وبخصوصية تامة.</p>
                    </div>
                )}

                {/* The Stream View */}
                <video
                    ref={isTeacher ? localVideoRef : remoteVideoRef}
                    autoPlay
                    playsInline
                    muted={isTeacher || isMuted}
                    className="w-full h-full object-contain bg-black"
                />

                {/* Drawing Canvas Overlay (Teacher Only) */}
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
                        className={`absolute inset-0 z-20 w-full h-full ${drawMode === 'cursor' ? 'pointer-events-none' : 'cursor-crosshair'}`}
                        width={window.innerWidth}
                        height={window.innerHeight}
                    />
                )}
            </div>

            {/* Footer Status */}
            <div className="h-10 bg-[#111b21] border-t border-gray-800 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isSharing ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`}></span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {isSharing ? 'البث مباشر حالياً' : 'في انتظار بدء البث'}
                    </span>
                </div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    Darren Intelligent Streaming System v1.0
                </div>
            </div>
        </div>
    );
};

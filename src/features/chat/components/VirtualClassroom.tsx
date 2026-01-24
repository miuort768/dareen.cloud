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

        if (isTeacher && localStream.current) {
            localStream.current.getTracks().forEach(track => {
                pc.addTrack(track, localStream.current!);
            });
        } else {
            pc.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    setHasRemoteStream(true);
                    remoteVideoRef.current.play().catch(console.error);
                }
            };
        }

        return pc;
    }, [roomID, isTeacher]);

    const startStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
            const combined = new MediaStream([...stream.getVideoTracks(), ...mic.getAudioTracks()]);

            localStream.current = combined;
            if (localVideoRef.current) localVideoRef.current.srcObject = combined;
            setIsSharing(true);

            // Notify everyone in the room that I'm starting
            socketService.getSocket().emit('offer', { roomID, offer: null }); // Signal start
        } catch (err) {
            console.error("Stream access denied", err);
        }
    };

    useEffect(() => {
        const socket = socketService.getSocket();
        socket.emit('join_class', roomID);

        socket.on('request_stream', async (data: any) => {
            if (isTeacher && localStream.current) {
                const pc = createPeerConnection(data.from);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('offer', { to: data.from, offer });
            }
        });

        socket.on('offer', async (data: any) => {
            if (!isTeacher) {
                const pc = createPeerConnection(data.from);
                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('answer', { to: data.from, answer });
            }
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
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });

        // Auto-request for students
        if (!isTeacher) {
            socket.emit('request_stream', { roomID });
        }

        return () => {
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            socket.off('request_stream');
            localStream.current?.getTracks().forEach(t => t.stop());
            peerConnections.current.forEach(pc => pc.close());
        };
    }, [roomID, isTeacher, createPeerConnection]);

    // Drawing
    const startDrawing = (e: any) => { if (drawMode !== 'cursor') setIsDrawing(true); };
    const stopDrawing = () => { setIsDrawing(false); canvasRef.current?.getContext('2d')?.beginPath(); };
    const draw = (e: any) => {
        if (!isDrawing || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d')!;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.lineWidth = drawMode === 'eraser' ? 20 : 3;
        ctx.strokeStyle = drawMode === 'eraser' ? '#000' : '#10b981';
        ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col font-sans">
            <div className="h-16 px-6 bg-[#111b21] border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Monitor className="text-emerald-500" size={24} />
                    <div>
                        <h2 className="text-white font-bold text-sm">بث دارين المباشر</h2>
                        <p className="text-gray-400 text-[10px]">{isTeacher ? 'وضع الشرح' : 'وضع المشاهدة'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isTeacher && (
                        <div className="flex bg-gray-900 rounded-lg p-1">
                            <button onClick={() => setDrawMode('cursor')} className={`p-2 ${drawMode === 'cursor' ? 'text-white bg-emerald-600' : 'text-gray-500'}`}><MousePointer2 size={16} /></button>
                            <button onClick={() => setDrawMode('pen')} className={`p-2 ${drawMode === 'pen' ? 'text-white bg-emerald-600' : 'text-gray-500'}`}><Edit2 size={16} /></button>
                            <button onClick={() => setDrawMode('eraser')} className={`p-2 ${drawMode === 'eraser' ? 'text-white bg-emerald-600' : 'text-gray-500'}`}><Eraser size={16} /></button>
                        </div>
                    )}
                    {isTeacher && !isSharing ? (
                        <button onClick={startStream} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase">بدء الشرح</button>
                    ) : (
                        <button onClick={() => setIsMuted(!isMuted)} className={`w-10 h-10 flex items-center justify-center rounded-lg ${isMuted ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>
                    )}
                    <button onClick={onClose} className="w-10 h-10 bg-gray-800 text-white rounded-lg flex items-center justify-center"><X size={20} /></button>
                </div>
            </div>

            <div className="flex-1 relative bg-black flex items-center justify-center">
                <video ref={isTeacher ? localVideoRef : remoteVideoRef} autoPlay playsInline muted={isTeacher || isMuted} className="max-w-full max-h-full" />
                {!isTeacher && !hasRemoteStream && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-950/80">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
                            <p className="text-white font-bold">في انتظار شاشة المعلمة...</p>
                        </div>
                    </div>
                )}
                {isTeacher && isSharing && (
                    <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                        className={`absolute inset-0 z-20 ${drawMode === 'cursor' ? 'pointer-events-none' : 'cursor-crosshair'}`} width={window.innerWidth} height={window.innerHeight} />
                )}
            </div>
        </div>
    );
};

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Monitor, Mic, MicOff, Maximize2, Minimize2, Move, RefreshCw, Volume2 } from 'lucide-react';
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
    const remoteAudioContainerRef = useRef<HTMLDivElement>(null);
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const localStream = useRef<MediaStream | null>(null);

    const [isMuted, setIsMuted] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [hasRemoteStream, setHasRemoteStream] = useState(false);
    const [micStatus, setMicStatus] = useState<'requesting' | 'ready' | 'denied' | 'error'>('requesting');

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

    // --- RE-NEGOTIATION ---
    const renegotiateAll = useCallback(async () => {
        const socket = socketService.getSocket();
        for (const [targetId, pc] of peerConnections.current.entries()) {
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('offer', { to: targetId, offer, roomID });
            } catch (e) {
                console.error("Renegotiation failed:", e);
            }
        }
    }, [roomID]);

    // --- MIC HANDLING ---
    const initMic = useCallback(async (force = false) => {
        if (localStream.current && !force) return true;

        if (force && localStream.current) {
            localStream.current.getTracks().forEach(t => t.stop());
            localStream.current = null;
        }

        setMicStatus('requesting');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
                video: false
            });

            localStream.current = stream;
            setMicStatus('ready');

            peerConnections.current.forEach(pc => {
                stream.getAudioTracks().forEach(track => {
                    const sender = pc.getSenders().find(s => s.track?.kind === 'audio');
                    if (sender) sender.replaceTrack(track);
                    else pc.addTrack(track, stream);
                });
            });

            if (force) renegotiateAll();
            return true;
        } catch (err: any) {
            console.error("Mic Error:", err);
            setMicStatus(err.name === 'NotAllowedError' ? 'denied' : 'error');
            return false;
        }
    }, [renegotiateAll]);

    useEffect(() => {
        initMic();
        return () => {
            localStream.current?.getTracks().forEach(t => t.stop());
            peerConnections.current.forEach(pc => pc.close());
        };
    }, [initMic]);

    const createPeerConnection = useCallback((targetSocketId: string) => {
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
                    audioElem.setAttribute('playsinline', 'true');
                    remoteAudioContainerRef.current?.appendChild(audioElem);
                }
                audioElem.srcObject = event.streams[0];
                audioElem.play().catch(() => {
                    console.log("Audio autoplay blocked, needs interaction");
                });
            }
        };

        return pc;
    }, [roomID]);

    const startScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            if (localStream.current) {
                const videoTrack = screenStream.getVideoTracks()[0];
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = screenStream;
                }
                localStream.current.getVideoTracks().forEach(t => { localStream.current?.removeTrack(t); t.stop(); });
                localStream.current.addTrack(videoTrack);

                peerConnections.current.forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) sender.replaceTrack(videoTrack);
                    else pc.addTrack(videoTrack, localStream.current!);
                });

                videoTrack.onended = () => {
                    setIsSharing(false);
                    socketService.getSocket().emit('end_class', { roomID });
                    if (localVideoRef.current) localVideoRef.current.srcObject = null;
                };
            }
            setIsSharing(true);
            socketService.getSocket().emit('start_class', { roomID });
            renegotiateAll();
        } catch (err) {
            console.error(err);
        }
    };

    const handleExit = useCallback(() => {
        if (isTeacher) socketService.getSocket().emit('end_class', { roomID });
        onClose();
    }, [isTeacher, roomID, onClose]);

    useEffect(() => {
        const socket = socketService.getSocket();
        socket.emit('join_class', roomID);

        socket.on('request_stream', (data: any) => {
            const pc = createPeerConnection(data.from);
            pc.createOffer().then(offer => {
                pc.setLocalDescription(offer);
                socket.emit('offer', { to: data.from, offer, roomID });
            });
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

        return () => {
            socket.off('offer'); socket.off('answer'); socket.off('ice-candidate'); socket.off('request_stream'); socket.off('class_ended');
        };
    }, [roomID, createPeerConnection, handleExit]);

    const handlePlayAudio = () => {
        if (remoteAudioContainerRef.current) {
            const audios = remoteAudioContainerRef.current.querySelectorAll('audio');
            audios.forEach(a => a.play().catch(() => { }));
        }
    };

    return (
        <div
            className={`fixed inset-0 z-[100] flex flex-col font-sans select-none overflow-hidden transition-all duration-500 ${isMini ? 'pointer-events-none' : 'bg-black'}`}
            onMouseMove={(e) => { if (isDragging) setToolbarPos({ x: e.clientX - 25, y: e.clientY - 25 }); }}
            onMouseUp={() => setIsDragging(false)}
        >
            <div ref={remoteAudioContainerRef} className="hidden" />

            {micStatus !== 'ready' && !isMini && (
                <div className="absolute inset-0 z-[150] bg-[#0c141a] flex flex-col items-center justify-center p-10 text-center">
                    <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mb-8 border border-rose-500/20">
                        <MicOff className="text-rose-500 animate-pulse" size={48} />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4">يجب تفعيل الميكروفون</h3>
                    <p className="text-gray-400 max-w-sm mb-10 leading-relaxed font-semibold">نأسف، لا يمكن بدء الاجتماع بدون الميكروفون. يرجى الضغط على زر "سماح" في المتصفح.</p>
                    <div className="flex flex-col gap-4 w-full max-w-xs">
                        <button onClick={() => initMic(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black text-lg shadow-2xl active:scale-95 transition-all">محاولة التفعيل الآن</button>
                        <button onClick={onClose} className="text-gray-500 font-bold hover:text-white transition-colors">إلغاء</button>
                    </div>
                </div>
            )}

            <div
                style={{ left: `${toolbarPos.x}px`, top: `${toolbarPos.y}px` }}
                className={`absolute z-[120] pointer-events-auto flex items-center gap-2 p-3 bg-[#111b21]/95 backdrop-blur-3xl border border-white/5 rounded-3xl shadow-2xl transition-transform ${isDragging ? 'scale-110 shadow-none' : ''}`}
            >
                <div onMouseDown={() => setIsDragging(true)} className="p-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-white">
                    <Move size={20} />
                </div>

                <button onClick={() => { localStream.current?.getAudioTracks().forEach(t => t.enabled = isMuted); setIsMuted(!isMuted); }} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${isMuted ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white shadow-lg'}`}>
                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>

                {isTeacher && (
                    <button onClick={startScreenShare} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg ${isSharing ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                        <Monitor size={22} />
                    </button>
                )}

                <div className="h-10 w-px bg-white/10 mx-1"></div>

                <button onClick={handlePlayAudio} className="w-12 h-12 bg-white/5 text-gray-400 hover:text-emerald-500 rounded-2xl flex items-center justify-center transition-all" title="تنشيط الصوت">
                    <Volume2 size={22} />
                </button>

                <button onClick={() => initMic(true)} className="w-12 h-12 bg-white/5 text-gray-400 hover:text-emerald-500 rounded-2xl flex items-center justify-center transition-all" title="تحديث الميكروفون">
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
                <div className="flex-1 relative flex items-center justify-center bg-[#0b141a]" onClick={handlePlayAudio}>
                    {isTeacher && isSharing ? (
                        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
                    ) : (
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
                    )}

                    {!isTeacher && !hasRemoteStream && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b141a] z-10 transition-all">
                            <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent animate-spin rounded-full mb-8"></div>
                            <h3 className="text-white font-black text-2xl mb-2 tracking-tight">بانتظار عرض المعلمة</h3>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.4em] opacity-60">سيتم تفعيل الشاشة تلقائياً</p>
                            <button onClick={handlePlayAudio} className="mt-8 bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-xl text-sm font-bold border border-white/10">لا تسمع صوتاً؟ اضغط هنا</button>
                        </div>
                    )}

                    {isTeacher && !isSharing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d141a] z-20 text-center px-8">
                            <div className="w-32 h-32 bg-emerald-600/10 rounded-full flex items-center justify-center mb-10 border border-emerald-600/20 shadow-2xl">
                                <Monitor className="text-emerald-500" size={64} />
                            </div>
                            <h3 className="text-5xl font-black text-white mb-6 tracking-tighter">أهلاً بكِ في الفصل الذكي!</h3>
                            <p className="text-gray-400 text-lg max-w-sm mb-14 leading-relaxed font-semibold">الميكروفون متصل. اضغطي على الزر لبدء مشاركة الشاشة مع الطلاب.</p>
                            <button onClick={startScreenShare} className="bg-emerald-600 hover:bg-emerald-700 text-white px-16 py-6 rounded-2xl font-black text-xl shadow-2xl active:scale-95 transition-all">بدء مشاركة الشاشة</button>
                        </div>
                    )}
                </div>
            )}

            {!isMini && (
                <div className="h-10 bg-[#111b21] border-t border-white/5 px-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                            <Volume2 size={12} className={!isMuted ? 'text-emerald-500' : ''} />
                            {userName}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

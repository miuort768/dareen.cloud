import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Monitor, Mic, MicOff, Maximize2, Minimize2, Move, RefreshCw } from 'lucide-react';
import { socketService } from '../../../lib/socket';

interface VirtualClassroomProps {
    roomID: string;
    userName: string;
    onClose: () => void;
    isTeacher: boolean;
}

export const VirtualClassroom: React.FC<VirtualClassroomProps> = ({ roomID, onClose, isTeacher }) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const remoteAudioContainerRef = useRef<HTMLDivElement>(null);
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const localStream = useRef<MediaStream | null>(null);

    const [isMuted, setIsMuted] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [hasRemoteStream, setHasRemoteStream] = useState(false);
    const [micStatus, setMicStatus] = useState<'requesting' | 'ready' | 'denied' | 'error'>('requesting');
    const [debugInfo, setDebugInfo] = useState<string>('');

    // UI States
    const [isMini, setIsMini] = useState(false);
    const [toolbarPos, setToolbarPos] = useState({ x: 20, y: 80 });
    const [isDragging, setIsDragging] = useState(false);

    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' }
        ]
    };

    const addLog = (msg: string) => {
        console.log(`[Classroom] ${msg}`);
        setDebugInfo(prev => `${new Date().toLocaleTimeString()}: ${msg}\n${prev}`.slice(0, 500));
    };

    // --- RE-NEGOTIATION ---
    const renegotiateAll = useCallback(async () => {
        addLog("Renegotiating with all peers...");
        const socket = socketService.getSocket();
        for (const [targetId, pc] of peerConnections.current.entries()) {
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('offer', { to: targetId, offer, roomID });
                addLog(`Offer sent to ${targetId}`);
            } catch {
                addLog(`Offer failed for ${targetId}`);
            }
        }
    }, [roomID]);

    // --- MIC & MEDIA INIT ---
    const initMic = useCallback(async (force = false) => {
        if (localStream.current && !force) return true;

        if (force && localStream.current) {
            localStream.current.getTracks().forEach(t => t.stop());
            localStream.current = null;
        }

        setMicStatus('requesting');
        addLog("Requesting microphone access...");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            localStream.current = stream;
            setMicStatus('ready');
            addLog("Microphone access granted.");

            // Re-bind to peers
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
            addLog(`Microphone error: ${err.name}`);
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

    const createPeerConnection = useCallback((targetSocketId: string) => {
        addLog(`Creating PeerConnection for ${targetSocketId}`);
        const pc = new RTCPeerConnection(configuration);
        peerConnections.current.set(targetSocketId, pc);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketService.getSocket().emit('ice-candidate', { roomID, candidate: event.candidate, to: targetSocketId });
            }
        };

        pc.onconnectionstatechange = () => {
            addLog(`PC State for ${targetSocketId}: ${pc.connectionState}`);
        };

        if (localStream.current) {
            localStream.current.getTracks().forEach(track => {
                pc.addTrack(track, localStream.current!);
            });
        }

        pc.ontrack = (event) => {
            addLog(`Track received: ${event.track.kind} from ${targetSocketId}`);
            if (event.track.kind === 'video') {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    setHasRemoteStream(true);
                    remoteVideoRef.current.play().catch(() => addLog("Remote video play blocked"));
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
                audioElem.play().catch(() => {
                    addLog("Audio play blocked - waiting for click");
                });
            }
        };

        return pc;
    }, [roomID]);

    const startScreenShare = async () => {
        addLog("Starting screen share...");
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            addLog("Screen stream acquired.");

            if (localStream.current) {
                const videoTrack = screenStream.getVideoTracks()[0];

                // Show local preview for teacher
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = screenStream;
                    localVideoRef.current.play().catch(() => { });
                }

                localStream.current.getVideoTracks().forEach(t => { localStream.current?.removeTrack(t); t.stop(); });
                localStream.current.addTrack(videoTrack);

                peerConnections.current.forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) sender.replaceTrack(videoTrack);
                    else pc.addTrack(videoTrack, localStream.current!);
                });

                videoTrack.onended = () => {
                    addLog("Screen share ended by user.");
                    setIsSharing(false);
                    socketService.getSocket().emit('end_class', { roomID });
                    if (localVideoRef.current) localVideoRef.current.srcObject = null;
                };
            }

            setIsSharing(true);
            socketService.getSocket().emit('start_class', { roomID });
            renegotiateAll();
        } catch {
            addLog("Screen share cancelled/failed.");
        }
    };

    const handleExit = useCallback(() => {
        addLog("Exiting classroom...");
        if (isTeacher) socketService.getSocket().emit('end_class', { roomID });
        onClose();
    }, [isTeacher, roomID, onClose]);

    useEffect(() => {
        const socket = socketService.getSocket();
        socket.emit('join_class', roomID);

        socket.on('request_stream', (data: any) => {
            addLog(`Stream requested by ${data.from}`);
            const pc = createPeerConnection(data.from);
            pc.createOffer().then(offer => {
                pc.setLocalDescription(offer);
                socket.emit('offer', { to: data.from, offer, roomID });
            });
        });

        socket.on('offer', async (data: any) => {
            addLog(`Offer received from ${data.from}`);
            const pc = peerConnections.current.get(data.from) || createPeerConnection(data.from);
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('answer', { to: data.from, answer });
        });

        socket.on('answer', async (data: any) => {
            addLog(`Answer received from ${data.from}`);
            const pc = peerConnections.current.get(data.from);
            if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        });

        socket.on('ice-candidate', async (data: any) => {
            const pc = peerConnections.current.get(data.from);
            if (pc) await pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(() => { });
        });

        socket.on('class_ended', () => {
            addLog("Class ended signal received.");
            handleExit();
        });

        socket.emit('request_stream', { roomID });

        return () => {
            socket.off('offer'); socket.off('answer'); socket.off('ice-candidate'); socket.off('request_stream'); socket.off('class_ended');
            peerConnections.current.forEach(pc => pc.close());
        };
    }, [roomID, createPeerConnection, handleExit]);

    // Dragging logic
    const handleDrag = (e: any) => {
        if (!isDragging) return;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        setToolbarPos({ x: clientX - 25, y: clientY - 25 });
    };

    return (
        <div
            className={`fixed inset-0 z-[100] flex flex-col font-sans select-none overflow-hidden transition-all duration-500 ${isMini ? 'pointer-events-none' : 'bg-black'}`}
            onMouseMove={handleDrag} onMouseUp={() => setIsDragging(false)} onTouchMove={handleDrag} onTouchEnd={() => setIsDragging(false)}
        >
            <div ref={remoteAudioContainerRef} className="hidden" />

            {/* ERROR / PERMISSION UI */}
            {micStatus !== 'ready' && !isMini && (
                <div className="absolute inset-0 z-[150] bg-[#0c141a] flex flex-col items-center justify-center p-10 text-center">
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                        <Mic className="text-emerald-500 animate-pulse" size={48} />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4 tracking-tight">إعدادات الصوت والمعلمة</h3>
                    <p className="text-gray-400 max-w-sm mb-10 leading-relaxed font-semibold">
                        يرجى تأكيد تفعيل الميكروفون من متصفح اللابتوب. إذا كان هناك "قفل" بجانب الرابط، تأكدي من الضغط عليه وتفعيل الميكروفون.
                    </p>
                    <div className="flex flex-col gap-4 w-full max-w-xs">
                        <button onClick={() => initMic(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black text-lg shadow-2xl active:scale-95 transition-all">تفعيل الآن</button>
                        <button onClick={onClose} className="text-gray-500 font-bold hover:text-white transition-colors">إغلاق</button>
                    </div>
                    {debugInfo && (
                        <pre className="mt-8 p-4 bg-black/50 text-[10px] text-emerald-500/50 text-left w-full max-w-md rounded-xl max-h-40 overflow-auto font-mono">
                            {debugInfo}
                        </pre>
                    )}
                </div>
            )}

            {/* Draggable Toolbar */}
            <div
                style={{ left: `${toolbarPos.x}px`, top: `${toolbarPos.y}px` }}
                className={`absolute z-[120] pointer-events-auto flex items-center gap-2 p-3 bg-[#111b21]/95 backdrop-blur-3xl border border-white/5 rounded-3xl shadow-2xl transition-transform ${isDragging ? 'scale-110 shadow-none' : ''}`}
            >
                <div onMouseDown={() => setIsDragging(true)} onTouchStart={() => setIsDragging(true)} className="p-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-white">
                    <Move size={20} />
                </div>

                <button onClick={() => { localStream.current?.getAudioTracks().forEach(t => t.enabled = isMuted); setIsMuted(!isMuted); }} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${isMuted ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'}`}>
                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>

                {isTeacher && (
                    <button onClick={startScreenShare} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${isSharing ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'}`}>
                        <Monitor size={22} />
                    </button>
                )}

                <div className="h-10 w-px bg-white/10 mx-1"></div>

                <button onClick={() => initMic(true)} className="w-12 h-12 bg-white/5 text-gray-400 hover:text-emerald-500 rounded-2xl flex items-center justify-center transition-all" title="تنشيط الصوت">
                    <RefreshCw size={22} className={micStatus === 'requesting' ? 'animate-spin' : ''} />
                </button>

                <button onClick={() => setIsMini(!isMini)} className="w-12 h-12 bg-white/5 text-gray-400 hover:text-white rounded-2xl flex items-center justify-center transition-all">
                    {isMini ? <Maximize2 size={22} /> : <Minimize2 size={22} />}
                </button>

                <button onClick={handleExit} className="w-12 h-12 bg-rose-600/90 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all">
                    <X size={22} />
                </button>
            </div>

            {/* Main Surface */}
            {!isMini && (
                <div className="flex-1 relative flex items-center justify-center bg-[#0b141a]">
                    {/* Remote Video (For Students) / Local Preview (For Teacher) */}
                    {isTeacher && isSharing ? (
                        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-contain mirror-none" />
                    ) : (
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
                    )}

                    {!isTeacher && !hasRemoteStream && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b141a] z-10 transition-all">
                            <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent animate-spin rounded-full mb-8 shadow-2xl shadow-emerald-500/10"></div>
                            <h3 className="text-white font-black text-2xl mb-2 tracking-tight">جارٍ الاتصال بالمعلمة...</h3>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.4em] opacity-60">سيتم تفعيل الشاشة تلقائياً</p>
                        </div>
                    )}

                    {isTeacher && !isSharing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d141a] z-20 text-center px-8 border-[10px] border-emerald-600/5">
                            <div className="w-32 h-32 bg-emerald-600/10 rounded-full flex items-center justify-center mb-10 border border-emerald-600/20 shadow-2xl">
                                <Monitor className="text-emerald-500" size={64} />
                            </div>
                            <h3 className="text-5xl font-black text-white mb-6 tracking-tighter">أهلاً بكِ جيهان!</h3>
                            <p className="text-gray-400 text-lg max-w-sm mb-14 leading-relaxed font-semibold">الميكروفون متصل بنجاح. بمجرد الضغط على البدء سيتم فتح نافذة لاختيار الشاشة التي ترغبين في شرحها.</p>
                            <button onClick={startScreenShare} className="bg-emerald-600 hover:bg-emerald-700 text-white px-16 py-6 rounded-2xl font-black text-xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] active:scale-95 transition-all">بدء مشاركة الشاشة الآن</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Monitor, Mic, MicOff, Maximize2, Minimize2, Move, RefreshCw, Volume2, ShieldCheck } from 'lucide-react';
import { socketService } from '../../../lib/socket';
import { cn } from '../../../lib/utils';

interface VirtualClassroomProps {
    roomID: string;
    userName: string;
    onClose: () => void;
    isTeacher: boolean;
}

/**
 * دأرين للفصل الذكي - Virtual Classroom v3.0
 * تصميم متطور ونظام اتصالات فائق الاستقرار
 */
export const VirtualClassroom: React.FC<VirtualClassroomProps> = ({ roomID, userName, onClose, isTeacher }) => {
    // --- Refs ---
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const remoteAudioContainerRef = useRef<HTMLDivElement>(null);
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const localStream = useRef<MediaStream | null>(null);
    const socket = socketService.getSocket();

    // --- State ---
    const [isMuted, setIsMuted] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [hasRemoteStream, setHasRemoteStream] = useState(false);
    const [micStatus, setMicStatus] = useState<'requesting' | 'ready' | 'denied' | 'error'>('requesting');
    const [connectionLog, setConnectionLog] = useState<string[]>([]);

    // UI State
    const [isMini, setIsMini] = useState(false);
    const [toolbarPos, setToolbarPos] = useState({ x: 20, y: 80 });
    const [isDragging, setIsDragging] = useState(false);

    // --- WebRTC Config ---
    const RTC_CONFIG = {
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
        setConnectionLog(prev => [msg, ...prev].slice(0, 5));
    };

    // --- Media Management ---

    // 1. Initialize Microphone
    const initMicrophone = useCallback(async (force = false) => {
        if (localStream.current && !force) return true;

        if (force && localStream.current) {
            localStream.current.getTracks().forEach(t => t.stop());
            localStream.current = null;
        }

        setMicStatus('requesting');
        addLog("🎤 جاري طلب الوصول للميكروفون...");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    channelCount: 1
                }
            });

            localStream.current = stream;
            setMicStatus('ready');
            addLog("✅ الميكروفون جاهز");

            // Update all existing connections with the new track
            peerConnections.current.forEach(pc => {
                const audioTrack = stream.getAudioTracks()[0];
                const sender = pc.getSenders().find(s => s.track?.kind === 'audio');
                if (sender) sender.replaceTrack(audioTrack);
                else pc.addTrack(audioTrack, stream);
            });

            return true;
        } catch (err: any) {
            addLog(`❌ فشل الوصول للميكروفون: ${err.name}`);
            setMicStatus(err.name === 'NotAllowedError' ? 'denied' : 'error');
            return false;
        }
    }, []);

    // 2. Screen Sharing (Teacher Only)
    const toggleScreenShare = async () => {
        if (isSharing) {
            // Stop sharing
            setIsSharing(false);
            if (localVideoRef.current) localVideoRef.current.srcObject = null;
            addLog("⏹️ تم إيقاف المشاركة");
            return;
        }

        addLog("🖥️ جاري بدء مشاركة الشاشة...");
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { width: 1920, height: 1080, frameRate: 30 },
                audio: true
            });

            if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;

            const videoTrack = screenStream.getVideoTracks()[0];

            // Handle user clicking "Stop Sharing" from browser bar
            videoTrack.onended = () => {
                setIsSharing(false);
                addLog("⏹️ توقفت المشاركة من المتصفح");
                if (localVideoRef.current) localVideoRef.current.srcObject = null;
            };

            // Inject video track into all peer connections
            peerConnections.current.forEach(pc => {
                const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                if (sender) sender.replaceTrack(videoTrack);
                else pc.addTrack(videoTrack, screenStream);
            });

            setIsSharing(true);
            socket.emit('start_class', { roomID });
            addLog("🚀 بدأ البث للطلاب");

            // Trigger renegotiation
            for (const [targetId, pc] of peerConnections.current.entries()) {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('offer', { to: targetId, offer, roomID });
            }

        } catch (err) {
            addLog("❌ تم إلغاء مشاركة الشاشة");
        }
    };

    // --- WebRTC Logic ---

    const createPC = useCallback((targetId: string) => {
        if (peerConnections.current.has(targetId)) return peerConnections.current.get(targetId)!;

        addLog(`🕸️ إنشاء اتصال جديد مع: ${targetId}`);
        const pc = new RTCPeerConnection(RTC_CONFIG);
        peerConnections.current.set(targetId, pc);

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit('ice-candidate', { roomID, candidate: e.candidate, to: targetId });
            }
        };

        pc.onconnectionstatechange = () => {
            addLog(`📡 حالة الاتصال مع ${targetId}: ${pc.connectionState}`);
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                peerConnections.current.delete(targetId);
            }
        };

        // Add Mic + Screen Tracks if available
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => {
                pc.addTrack(track, localStream.current!);
            });
        }

        pc.ontrack = (e) => {
            addLog(`🎵 استلام مسار جديد: ${e.track.kind}`);
            if (e.track.kind === 'video') {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = e.streams[0];
                    setHasRemoteStream(true);
                    remoteVideoRef.current.play().catch(() => { });
                }
            } else if (e.track.kind === 'audio') {
                let audio = document.getElementById(`audio_${targetId}`) as HTMLAudioElement;
                if (!audio) {
                    audio = document.createElement('audio');
                    audio.id = `audio_${targetId}`;
                    audio.autoplay = true;
                    audio.volume = 1.0;
                    audio.setAttribute('playsinline', 'true');
                    remoteAudioContainerRef.current?.appendChild(audio);
                }
                audio.srcObject = e.streams[0];
                audio.play().catch(() => addLog("⚠️ الصوت محظور من المتصفح، اضغط لتشغيله"));
            }
        };

        return pc;
    }, [roomID]);

    // --- Effects & Lifecycle ---

    useEffect(() => {
        initMicrophone();

        socket.on('request_stream', async (data: any) => {
            const pc = createPC(data.from);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('offer', { to: data.from, offer, roomID });
        });

        socket.on('offer', async (data: any) => {
            const pc = createPC(data.from);
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
            addLog("🛑 انتهى الفصل بواسطة المعلمة");
            onClose();
        });

        socket.emit('join_class', roomID);
        socket.emit('request_stream', { roomID });

        return () => {
            socket.off('offer'); socket.off('answer'); socket.off('ice-candidate');
            socket.off('request_stream'); socket.off('class_ended');
            peerConnections.current.forEach(pc => pc.close());
            localStream.current?.getTracks().forEach(t => t.stop());
        };
    }, [roomID, createPC, initMicrophone, onClose]);

    // --- Handlers ---

    const forceAudioResume = () => {
        if (remoteAudioContainerRef.current) {
            const audios = remoteAudioContainerRef.current.querySelectorAll('audio');
            audios.forEach(a => a.play().catch(() => { }));
            addLog("🔊 تم محاولة تشغيل الصوت يدوياً");
        }
    };

    const handleTeacherExit = () => {
        if (window.confirm('هل أنت متأكد من إنهاء الفصل لجميع الطلاب؟')) {
            socket.emit('end_class', { roomID });
            onClose();
        }
    };

    return (
        <div
            className={cn(
                "fixed inset-0 z-[100] flex flex-col font-sans select-none overflow-hidden transition-all duration-700 bg-[#070b0e]",
                isMini ? "pointer-events-none scale-90 opacity-0" : "opacity-100"
            )}
            dir="rtl"
        >
            <div ref={remoteAudioContainerRef} className="hidden" />

            {/* --- SETUP SCREEN / PERMISSION --- */}
            {micStatus !== 'ready' && !isMini && (
                <div
                    className="absolute inset-0 z-[200] bg-[#070b0e] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500"
                    onClick={forceAudioResume}
                >
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                        {micStatus === 'requesting' ? (
                            <RefreshCw className="text-emerald-500 animate-spin" size={48} />
                        ) : (
                            <MicOff className="text-rose-500" size={48} />
                        )}
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4">خطوة واحدة للبدء</h3>
                    <p className="text-gray-400 max-w-sm mb-12 leading-relaxed text-lg font-medium">
                        يرجى السماح بالوصول للميكروفون من متصفحك. هذه الخطوة ضرورية لضمان سماع الصوت بشكل صحيح داخل الفصل.
                    </p>
                    <div className="flex flex-col gap-4 w-full max-w-xs">
                        <button
                            onClick={() => initMicrophone(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black text-xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <ShieldCheck size={24} />
                            تفعيل الميكروفون
                        </button>
                        <button onClick={onClose} className="text-gray-500 font-bold hover:text-white transition-colors">إغلاق الفصل</button>
                    </div>
                </div>
            )}

            {/* --- TOOLBAR --- */}
            <div
                style={{ left: `${toolbarPos.x}px`, top: `${toolbarPos.y}px` }}
                className={cn(
                    "absolute z-[150] pointer-events-auto flex items-center gap-2 p-3 bg-[#1a2329]/95 backdrop-blur-3xl border border-white/5 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-transform duration-300",
                    isDragging ? "scale-105 cursor-grabbing" : "cursor-grab"
                )}
                onMouseDown={() => setIsDragging(true)}
                onTouchStart={() => setIsDragging(true)}
                onMouseMove={(e) => { if (isDragging) setToolbarPos({ x: e.clientX - 25, y: e.clientY - 25 }); }}
                onMouseUp={() => setIsDragging(false)}
            >
                <div className="p-2 text-gray-500 group-hover:text-white"><Move size={20} /></div>

                <div className="h-10 w-px bg-white/10 mx-1"></div>

                {/* Mic Toggle */}
                <button
                    onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); if (localStream.current) localStream.current.getAudioTracks().forEach(t => t.enabled = isMuted); }}
                    className={cn(
                        "w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg",
                        isMuted ? "bg-rose-500 text-white" : "bg-emerald-600 text-white"
                    )}
                >
                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>

                {/* Sharing Toggle (Teacher Only) */}
                {isTeacher && (
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleScreenShare(); }}
                        className={cn(
                            "w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg",
                            isSharing ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400 hover:text-white border border-white/5"
                        )}
                    >
                        <Monitor size={22} />
                    </button>
                )}

                <div className="h-10 w-px bg-white/10 mx-1"></div>

                {/* Manual Audio Resume */}
                <button
                    onClick={(e) => { e.stopPropagation(); forceAudioResume(); }}
                    className="w-12 h-12 bg-white/5 text-gray-400 hover:text-emerald-500 rounded-2xl flex items-center justify-center transition-all"
                    title="تنشيط الصوت"
                >
                    <Volume2 size={22} />
                </button>

                {/* Refresh System */}
                <button
                    onClick={(e) => { e.stopPropagation(); initMicrophone(true); }}
                    className="w-12 h-12 bg-white/5 text-gray-400 hover:text-blue-500 rounded-2xl flex items-center justify-center transition-all"
                >
                    <RefreshCw size={22} className={micStatus === 'requesting' ? 'animate-spin' : ''} />
                </button>

                <div className="h-10 w-px bg-white/10 mx-1"></div>

                <button
                    onClick={(e) => { e.stopPropagation(); setIsMini(!isMini); }}
                    className="w-12 h-12 bg-white/5 text-gray-400 hover:text-white rounded-2xl flex items-center justify-center transition-all"
                >
                    {isMini ? <Maximize2 size={22} /> : <Minimize2 size={22} />}
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); isTeacher ? handleTeacherExit() : onClose(); }}
                    className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                >
                    <X size={22} />
                </button>
            </div>

            {/* --- MAIN SURFACE --- */}
            <div
                className="flex-1 relative flex items-center justify-center"
                onClick={forceAudioResume}
            >
                {/* Surface for Teacher sharing her screen */}
                {isTeacher && isSharing ? (
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
                ) : (
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
                )}

                {/* Student: Waiting State */}
                {!isTeacher && !hasRemoteStream && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070b0e] z-10 p-6">
                        <div className="w-20 h-20 border-[3px] border-emerald-500/20 border-t-emerald-500 animate-spin rounded-full mb-10"></div>
                        <h3 className="text-white font-black text-3xl mb-4 tracking-tight">بانتظار بدء الشرح</h3>
                        <p className="text-gray-500 text-base max-w-xs text-center leading-relaxed">بمجرد قيام المعلمة بمشاركة شاشتها، سيظهر لك المحتوى هنا تلقائياً.</p>
                        <button
                            onClick={forceAudioResume}
                            className="mt-12 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl text-sm font-bold flex items-center gap-2 transition-all"
                        >
                            <Volume2 size={16} />
                            إذا كان الصوت لا يعمل، اضغط هنا
                        </button>
                    </div>
                )}

                {/* Teacher: Ready State */}
                {isTeacher && !isSharing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070b0e] z-20 text-center px-8 border-[1rem] border-emerald-600/5">
                        <div className="w-40 h-40 bg-emerald-600/10 rounded-full flex items-center justify-center mb-10 border border-emerald-600/10 shadow-[0_0_80px_rgba(16,185,129,0.1)]">
                            <Monitor className="text-emerald-500 opacity-80" size={80} />
                        </div>
                        <h1 className="text-5xl font-black text-white mb-6">مرحباً بكِ في الفصل</h1>
                        <p className="text-gray-400 text-xl max-w-md mb-14 leading-relaxed">
                            الميكروفون متصل. لبدء مشاركة الدروس مع طلابك، اضغطي على زر البدء أدناه.
                        </p>
                        <button
                            onClick={toggleScreenShare}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-20 py-6 rounded-[2rem] font-black text-2xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] active:scale-95 transition-all"
                        >
                            بدء مشاركة الشاشة
                        </button>
                    </div>
                )}

                {/* Connection Logs (Debug overlay - subtle) */}
                <div className="absolute bottom-14 right-6 text-[10px] text-gray-600 font-mono text-right pointer-events-none opacity-50">
                    {connectionLog.map((log, i) => <div key={i}>{log}</div>)}
                </div>
            </div>

            {/* --- STATUS FOOTER --- */}
            {!isMini && (
                <div className="h-12 bg-[#12191d] border-t border-white/5 px-8 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                            <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest leading-none">مباشر الآن</span>
                        </div>
                        <div className="h-4 w-px bg-white/10"></div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                            <Volume2 size={12} className={!isMuted ? 'text-emerald-500' : ''} />
                            {userName}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-tighter">
                        DAREEN V3.0 • SECURE P2P
                    </div>
                </div>
            )}
        </div>
    );
};

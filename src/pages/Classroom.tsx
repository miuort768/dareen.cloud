import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    LiveKitRoom,
    RoomAudioRenderer,
    useConnectionState,
    useRoomContext,
    useTracks,
    ParticipantTile,
    ControlBar,
} from '@livekit/components-react';
import { Track, ConnectionState } from 'livekit-client';
import '@livekit/components-styles';

import { PhoneOff, Loader2, Users, Edit3 } from 'lucide-react';
import { useCurrentUser } from '../context/AppContext';
import { api } from '../lib/api';
import { socketService } from '../lib/socket';
import { Whiteboard } from '../components/ui/Whiteboard';
import { cn } from '../lib/utils';

// --- Custom Top Bar Component ---
const ClassroomTopBar = ({ isTeacher, onLeave, toggleWhiteboard, isWhiteboardOpen }: { isTeacher: boolean; onLeave: () => void; toggleWhiteboard: () => void; isWhiteboardOpen: boolean }) => {
    const connectionState = useConnectionState();
    const room = useRoomContext();
    const [participantCount, setParticipantCount] = useState(0);

    useEffect(() => {
        if (!room) return;
        const updateCount = () => {
            setParticipantCount(room.numParticipants);
        };
        room.on('participantConnected', updateCount);
        room.on('participantDisconnected', updateCount);
        updateCount();
        return () => {
            room.off('participantConnected', updateCount);
            room.off('participantDisconnected', updateCount);
        };
    }, [room]);

    const statusConfig: Record<string, { color: string; label: string }> = {
        [ConnectionState.Connecting]: { color: 'bg-yellow-600', label: 'جاري الاتصال...' },
        [ConnectionState.Connected]: { color: 'bg-red-600', label: 'LIVE' },
        [ConnectionState.Reconnecting]: { color: 'bg-orange-500', label: 'إعادة الاتصال...' },
        [ConnectionState.Disconnected]: { color: 'bg-slate-600', label: 'مفصول' },
    };

    const { color: statusColor, label: statusLabel } = statusConfig[connectionState] || statusConfig[ConnectionState.Disconnected];

    return (
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-gray-900/90 backdrop-blur-xl z-50 shrink-0">
            <div className="flex items-center gap-3">
                <div className={cn('px-3 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 rounded-sm transition-colors', statusColor)}>
                    <span className={cn('w-1.5 h-1.5 bg-white rounded-full', connectionState === ConnectionState.Connected && 'animate-pulse')} />
                    {statusLabel}
                </div>
                {isTeacher && (
                    <div className="text-white/50 text-xs flex items-center gap-1">
                        <Users size={13} /> {participantCount}
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-3">
                {isTeacher && (
                    <button
                        onClick={toggleWhiteboard}
                        className={cn("p-2 transition-colors flex items-center gap-1.5 text-xs font-black uppercase px-3 rounded", 
                            isWhiteboardOpen ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-white/10 hover:bg-white/20 text-white"
                        )}
                    >
                        <Edit3 size={16} /> السبورة
                    </button>
                )}
                <button onClick={onLeave}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded transition-colors flex items-center gap-1.5 text-xs font-black uppercase px-3 text-white"
                >
                    <PhoneOff size={16} /> مغادرة
                </button>
            </div>
        </div>
    );
};

// --- Custom Video Layout ---
const ClassroomVideoLayout = ({ isTeacher }: { isTeacher: boolean }) => {
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: !isTeacher }
    );

    return (
        <div className="flex-1 flex flex-col p-4 gap-4 bg-black">
            <div className="flex-1 flex gap-4 justify-center items-center">
                {tracks.map((track) => (
                    <div key={track.participant.identity + track.source} className="w-full h-full max-w-5xl rounded-xl overflow-hidden border border-white/10 relative">
                        <ParticipantTile trackRef={track} />
                        {track.source === Track.Source.ScreenShare && (
                            <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-md text-xs font-black shadow-lg">
                                مشاركة شاشة
                            </div>
                        )}
                    </div>
                ))}
                {tracks.length === 0 && !isTeacher && (
                    <div className="text-center text-white/50 space-y-4">
                        <Loader2 size={32} className="mx-auto animate-spin" />
                        <p className="font-bold">بانتظار بث المعلم...</p>
                    </div>
                )}
            </div>
            {isTeacher && (
                <div className="shrink-0 flex justify-center pb-4">
                    <ControlBar controls={{ camera: true, microphone: true, screenShare: true, leave: false, chat: false }} />
                </div>
            )}
        </div>
    );
};


export const Classroom = () => {
    const { id } = useParams<{ id: string }>();
    const currentUser = useCurrentUser();
    const navigate = useNavigate();

    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);

    const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
    const roomName = `live_session_${id}`;

    const configuredUrl = import.meta.env.VITE_LIVEKIT_URL;
    const serverUrl = configuredUrl || `ws://${window.location.hostname}:7880`;

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await api.get<{ token: string }>(`/live/token?room=${roomName}`);
                setToken(response.token);
            } catch (err) {
                console.error('Failed to fetch LiveKit token:', err);
                setError('فشل الحصول على تصريح دخول الغرفة.');
            }
        };

        if (id) fetchToken();
    }, [id, roomName]);

    useEffect(() => {
        const socket = socketService.getSocket();
        
        socket.emit('join_conversation', roomName);

        socket.on('whiteboard_state', (data: { open: boolean }) => {
            setIsWhiteboardOpen(data.open);
        });

        return () => {
            socket.off('whiteboard_state');
            socket.emit('leave_conversation', roomName);
        };
    }, [roomName]);

    const endSessionInDb = useCallback(async () => {
        if (isTeacher && id) {
            try { await api.post(`/live/end/${id}`, {}); } catch { /* non-critical */ }
        }
    }, [isTeacher, id]);

    const handleLeave = useCallback(async () => {
        if (isTeacher) {
            socketService.getSocket().emit('teacher_stopped', { conversationId: roomName });
            await endSessionInDb();
        }
        navigate(-1);
    }, [isTeacher, roomName, endSessionInDb, navigate]);

    // End session when teacher closes the tab
    useEffect(() => {
        if (!isTeacher) return;
        const handleBeforeUnload = () => {
            socketService.getSocket().emit('teacher_stopped', { conversationId: roomName });
            navigator.sendBeacon(`/api/live/end/${id}`, '{}');
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isTeacher, roomName, id]);

    // Connection timeout: if LiveKit doesn't connect within 20s, show error
    const [connectionTimeout, setConnectionTimeout] = useState(false);
    useEffect(() => {
        if (!token) return;
        const t = setTimeout(() => setConnectionTimeout(true), 20000);
        return () => clearTimeout(t);
    }, [token]);

    const toggleWhiteboard = useCallback(() => {
        if (!isTeacher) return;
        setIsWhiteboardOpen(prev => {
            const next = !prev;
            socketService.getSocket().emit('whiteboard_state', { conversationId: roomName, open: next });
            return next;
        });
    }, [isTeacher, roomName]);

    if (error) {
        return (
            <div className="fixed inset-0 bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center" dir="rtl">
                <p className="font-black text-red-400 mb-6">{error}</p>
                <button onClick={() => navigate(-1)} className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-black text-sm transition-colors">
                    العودة
                </button>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center" dir="rtl">
                <Loader2 size={48} className="animate-spin text-indigo-500 mb-4" />
                <p className="font-black animate-pulse">جاري الاتصال بالغرفة...</p>
            </div>
        );
    }

    if (connectionTimeout) {
        return (
            <div className="fixed inset-0 bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center" dir="rtl">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl">🔌</span>
                </div>
                <p className="font-black text-xl mb-2">تعذر الاتصال بخادم البث المباشر</p>
                <p className="text-slate-400 text-sm mb-8 max-w-md">تأكد من أن خادم LiveKit شغال على المنفذ 7880. للدعم الفني، تواصل مع مسؤول النظام.</p>
                <div className="flex gap-3">
                    <button onClick={() => navigate(-1)} className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-xl font-black text-sm transition-colors">
                        العودة
                    </button>
                    <button onClick={() => window.location.reload()} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl font-black text-sm transition-colors">
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black flex flex-col overflow-hidden" dir="rtl">
            <LiveKitRoom
                video={isTeacher}
                audio={isTeacher}
                token={token}
                serverUrl={serverUrl}
                data-lk-theme="default"
                className="flex-1 flex flex-col overflow-hidden"
            >
                <ClassroomTopBar 
                    isTeacher={isTeacher} 
                    roomName={roomName} 
                    onLeave={handleLeave} 
                    toggleWhiteboard={toggleWhiteboard}
                    isWhiteboardOpen={isWhiteboardOpen}
                />
                
                <div className="flex-1 relative flex">
                    <ClassroomVideoLayout isTeacher={isTeacher} />
                    
                    <Whiteboard 
                        isTeacher={isTeacher} 
                        roomName={roomName} 
                        isOpen={isWhiteboardOpen} 
                    />
                </div>
                
                <RoomAudioRenderer />
            </LiveKitRoom>
        </div>
    );
};

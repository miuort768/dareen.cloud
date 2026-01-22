import React, { useEffect, useState } from 'react';
import { X, Play, Loader2, ShieldCheck, Video } from 'lucide-react';
import { socketService } from '../../../lib/socket';
import type { User } from '../../../types/auth';

interface MeetingRoomProps {
    conversationId: string;
    currentUser: User;
    onClose: () => void;
}

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({ conversationId, currentUser, onClose }) => {
    const [hasJoined, setHasJoined] = useState(false);
    const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
    const socket = socketService.getSocket();
    const isHost = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

    // 1. Load Jitsi Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => setIsJitsiLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
            if (isHost) socket.emit('meeting_ended', conversationId);
        };
    }, []);

    // 2. Initialize Jitsi meeting
    const startMeeting = () => {
        setHasJoined(true);

        // Wait for next tick to ensure container is in DOM
        setTimeout(() => {
            const domain = 'meet.jit.si';
            const options = {
                roomName: `Dareen_Edu_${conversationId}`,
                width: '100%',
                height: '100%',
                parentNode: document.querySelector('#jitsi-container'),
                userInfo: {
                    displayName: currentUser.name,
                    email: currentUser.email || ''
                },
                configOverwrite: {
                    startWithAudioMuted: false,
                    startWithVideoMuted: true, // Teachers can turn it on if they want
                    enableWelcomePage: false,
                    prejoinPageEnabled: false,
                    disableDeepLinking: true,
                    // Screen sharing settings
                    enableLayerSuspension: true,
                    disableSelfView: false,
                },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat',
                        'settings', 'raisehand', 'videoquality', 'filmstrip',
                        'tileview', 'shortcuts', 'mute-everyone', 'security'
                    ],
                    SETTINGS_SECTIONS: ['devices', 'language', 'profile', 'calendar'],
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                }
            };

            const api = new window.JitsiMeetExternalAPI(domain, options);

            // Notify other participants via socket
            if (isHost) {
                socket.emit('meeting_started', conversationId);
            }

            api.addEventListener('videoConferenceLeft', () => {
                onClose();
            });
        }, 100);
    };

    if (!hasJoined) {
        return (
            <div className="fixed inset-0 z-[500] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4">
                <div className="bg-[#111] p-12 rounded-[3rem] border border-white/10 text-center max-w-lg w-full shadow-[0_0_150px_rgba(0,0,0,0.8)] animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-primary-600/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary-500/20">
                        <Video className="text-primary-500" size={40} />
                    </div>

                    <div className="space-y-4 mb-10">
                        <h2 className="text-4xl font-black text-white tracking-tight">النظام الجديد للحصص</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            تم تحديث النظام ليوفر لك أفضل جودة بث واستقرار تام في مشاركة الشاشة.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-10 text-right">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <ShieldCheck className="text-emerald-500 mb-2" size={20} />
                            <div className="text-white font-bold text-sm">اتصال آمن</div>
                            <div className="text-gray-500 text-[10px]">تشفير كامل للبيانات</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <Monitor className="text-primary-500 mb-2" size={20} />
                            <div className="text-white font-bold text-sm">جودة 4K</div>
                            <div className="text-gray-500 text-[10px]">بث شاشة ومشاركة مستقرة</div>
                        </div>
                    </div>

                    <button
                        onClick={startMeeting}
                        disabled={!isJitsiLoaded}
                        className="w-full py-5 bg-primary-600 hover:bg-primary-500 text-white font-black text-xl rounded-2xl transition-all shadow-2xl shadow-primary-600/30 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                    >
                        {!isJitsiLoaded ? (
                            <><Loader2 className="animate-spin" /> جاري التحميل...</>
                        ) : (
                            <><Play fill="currentColor" /> انضمام الآن</>
                        )}
                    </button>

                    <button onClick={onClose} className="mt-6 text-gray-500 hover:text-white font-bold text-sm transition-colors">إغلاق النافذة</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[500] bg-black flex flex-col">
            <div className="h-14 bg-black/90 border-b border-white/5 flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                    <span className="text-white font-black text-[10px] tracking-widest uppercase italic">Dareen EDU - Professional Stream</span>
                </div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"><X size={20} /></button>
            </div>

            {/* Jitsi Meeting Container */}
            <div id="jitsi-container" className="flex-1 bg-black" />
        </div>
    );
};

// Types check
import { Monitor } from 'lucide-react';

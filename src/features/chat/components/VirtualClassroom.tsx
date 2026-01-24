import React, { useEffect, useRef, useState } from 'react';
import { X, RotateCw, Monitor } from 'lucide-react';

interface VirtualClassroomProps {
    roomID: string;
    userName: string;
    onClose: () => void;
    isTeacher: boolean;
}

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

export const VirtualClassroom: React.FC<VirtualClassroomProps> = ({ roomID, userName, onClose, isTeacher }) => {
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const apiRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Load Jitsi script
        const script = document.createElement('script');
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = () => {
            if (jitsiContainerRef.current) {
                const domain = "meet.jit.si";
                const buttons = [
                    'microphone',
                    'desktop', // Screen sharing - The most important button
                    'chat',
                    'raisehand',
                    'settings',
                    'tileview',
                    'fullscreen',
                    isTeacher ? 'whiteboard' : ''
                ].filter(Boolean);

                const options = {
                    roomName: `Darin_Institute_${roomID}`,
                    width: '100%',
                    height: '100%',
                    parentNode: jitsiContainerRef.current,
                    userInfo: {
                        displayName: userName
                    },
                    configOverwrite: {
                        startWithAudioMuted: false,
                        startWithVideoMuted: true,
                        prejoinPageEnabled: false,
                        disableDeepLinking: true,
                        enableWelcomePage: false,
                        enableClosePage: false,
                        toolbarButtons: buttons,
                        // Screen sharing specific optimizations
                        desktopSharingFrameRate: { min: 15, max: 30 },
                        enableVideoOut: false,
                        enableLocalVideo: false,
                    },
                    interfaceConfigOverwrite: {
                        DEFAULT_BACKGROUND: '#0b141a',
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_WATERMARK_FOR_GUESTS: false,
                        SHOW_BRAND_WATERMARK: false,
                        BRAND_WATERMARK_LINK: '',
                        JITSI_WATERMARK_LINK: '',
                        MOBILE_APP_PROMO: false,
                        // Customizing interface to look more like part of the platform
                        TOOLBAR_BUTTONS: buttons, // Duplicate for compatibility
                        SETTINGS_SECTIONS: ['devices', 'language', 'profile'], // Hide camera settings if possible
                    }
                };
                apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

                apiRef.current.addEventListeners({
                    videoConferenceJoined: () => {
                        setIsLoading(false);
                        // If teacher, auto-request screen share (optional, maybe better manually)
                    },
                    readyToClose: () => {
                        onClose();
                    }
                });
            }
        };
        document.body.appendChild(script);

        return () => {
            if (apiRef.current) apiRef.current.dispose();
            document.body.removeChild(script);
        };
    }, [roomID, userName, onClose, isTeacher]);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-500">
            {/* Header / Controls Overlay */}
            <div className="absolute top-0 left-0 right-0 h-16 px-6 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-[110] pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg border border-emerald-500/30">
                        <Monitor className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className="text-white font-black text-sm lg:text-base leading-tight uppercase tracking-widest">فصل دارين الذكي</h2>
                        <p className="text-emerald-400 text-[10px] font-bold">بث مباشر - {isTeacher ? 'وضع المعلمة' : 'وضع الطالب'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 pointer-events-auto">
                    {isMobile && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-full">
                            <RotateCw size={14} className="animate-pulse" />
                            <span className="text-[10px] font-bold whitespace-nowrap">قم بتدوير الهاتف</span>
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl border border-rose-500/30"
                        title="إغلاق الحصة"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Hint for Screen Sharing (Teacher side) */}
            {isTeacher && isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-[105] bg-gray-950 px-6 text-center">
                    <div className="max-w-md space-y-6">
                        <div className="w-20 h-20 bg-emerald-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 animate-pulse">
                            <Monitor className="text-emerald-500" size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-white">جاري تجهيز فصلك الذكي...</h3>
                        <p className="text-gray-400 font-medium">سيتم فتح الواجهة الآن، يرجى الضغط على زر "مشاركة الشاشة" للبدء في الشرح.</p>
                        <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 animate-[loading_1.5s_infinite]" style={{ width: '40%' }}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Container for Jitsi */}
            <div ref={jitsiContainerRef} className="flex-1 w-screen h-screen mt-0 overflow-hidden" />

            {/* Watermark Overlay (Brand focus) */}
            <div className="absolute bottom-6 right-6 z-[110] pointer-events-none opacity-40">
                <p className="text-white font-black text-xs uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full border border-white/10">Darin Institute</p>
            </div>

            <style>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(250%); }
                }
            `}</style>
        </div>
    );
};

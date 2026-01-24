import React, { useEffect, useRef, useState } from 'react';
import { X, RotateCw, Monitor, Mic, MicOff } from 'lucide-react';

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
    const [isMuted, setIsMuted] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleShareScreen = () => {
        apiRef.current?.executeCommand('toggleShareScreen');
    };

    const handleToggleAudio = () => {
        apiRef.current?.executeCommand('toggleAudio');
        setIsMuted(!isMuted);
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = () => {
            if (jitsiContainerRef.current) {
                const domain = "meet.jit.si";
                const options = {
                    roomName: `Darin_Class_${roomID}`,
                    width: '100%',
                    height: '100%',
                    parentNode: jitsiContainerRef.current,
                    userInfo: { displayName: userName },
                    configOverwrite: {
                        startWithAudioMuted: false,
                        startWithVideoMuted: true,
                        prejoinPageEnabled: false,
                        disableDeepLinking: true,
                        enableWelcomePage: false,
                        enableClosePage: false,
                        toolbarButtons: [], // Hide their toolbar to use OURS for simplicity
                    },
                    interfaceConfigOverwrite: {
                        DEFAULT_BACKGROUND: '#0b141a',
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_WATERMARK_FOR_GUESTS: false,
                        SHOW_BRAND_WATERMARK: false,
                        MOBILE_APP_PROMO: false,
                        TOOLBAR_BUTTONS: [],
                        SETTINGS_SECTIONS: [],
                    }
                };
                apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

                apiRef.current.addEventListeners({
                    videoConferenceJoined: () => setIsLoading(false),
                    screenSharingStatusChanged: (e: any) => setIsSharing(e.on),
                    readyToClose: () => onClose()
                });
            }
        };
        document.body.appendChild(script);
        return () => {
            if (apiRef.current) apiRef.current.dispose();
            const s = document.querySelector('script[src*="jitsi"]');
            if (s) s.remove();
        };
    }, [roomID, userName, onClose]);

    return (
        <div className="fixed inset-0 z-[100] bg-[#0b141a] flex flex-col animate-in fade-in">
            {/* Header / Our Own Simple Controls */}
            <div className="h-16 px-4 bg-[#111b21] border-b border-gray-800 flex items-center justify-between z-[110]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <Monitor className="text-white" size={18} />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-sm">فصل دارين المباشر</h2>
                        <p className="text-gray-400 text-[10px]">{isTeacher ? 'أنت المعلمة' : 'أنت الطالب'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isTeacher && !isLoading && (
                        <>
                            <button
                                onClick={handleShareScreen}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs transition-all ${isSharing ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
                                    }`}
                            >
                                <Monitor size={14} />
                                <span>{isSharing ? 'إيقاف الشاشة' : 'مشاركة الشاشة'}</span>
                            </button>
                            <button
                                onClick={handleToggleAudio}
                                className="w-9 h-9 bg-gray-700 text-white rounded-lg flex items-center justify-center"
                            >
                                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>
                        </>
                    )}

                    <button
                        onClick={onClose}
                        className="w-9 h-9 bg-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white rounded-lg flex items-center justify-center transition-all"
                        title="إغلاق الحصة"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Jitsi Area */}
            <div className="flex-1 relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-[#0b141a] flex items-center justify-center z-50">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400 text-sm font-bold">جاري فتح الفصل...</p>
                        </div>
                    </div>
                )}
                <div ref={jitsiContainerRef} className="w-full h-full" />
            </div>

            {isMobile && !isSharing && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-4 py-2 rounded-full text-[10px] font-bold flex items-center gap-2 z-[120]">
                    <RotateCw size={12} className="animate-spin" />
                    يرجى قلب الهاتف للوضعية العرضية
                </div>
            )}
        </div>
    );
};

import { useState, useEffect, useRef } from 'react';
import { ExternalLink, X, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentUser } from '../../context/AppContext';
import { socketService } from '../../lib/socket';

interface CallData {
    teacherName: string;
    subject: string;
    meetingUrl: string;
    meetingProvider: string;
}

const PROVIDER_NAMES: Record<string, string> = {
    google_meet: 'Google Meet',
    zoom: 'Zoom',
    custom: 'رابط مخصص',
};

export const SessionCallAlert = () => {
    const currentUser = useCurrentUser();
    const [callData, setCallData] = useState<CallData | null>(null);
    const [show, setShow] = useState(false);
    const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!notificationAudioRef.current) {
            notificationAudioRef.current = new Audio('/notification.ogg');
        }
        const audio = notificationAudioRef.current;

        const socket = socketService.getSocket();
        if (!socket || (currentUser?.role !== 'student' && currentUser?.role !== 'parent')) return;

        const handleInvite = (data: CallData) => {
            setCallData(data);
            setShow(true);
            audio.currentTime = 0;
            audio.play().catch((e) => console.warn(e));
        };

        const handleEnded = () => {
            setShow(false);
            setCallData(null);
        };

        socket.on('session_invite', handleInvite);
        socket.on('session_ended', handleEnded);

        return () => {
            socket.off('session_invite', handleInvite);
            socket.off('session_ended', handleEnded);
        };
    }, [currentUser]);

    if (!show || !callData) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="fixed bottom-16 end-4 start-4 md:end-auto md:start-8 md:bottom-8 z-[1000] md:w-[400px]"
            >
                <div className="bg-card border-4 border-border shadow-[10px_10px_0px_0px_var(--bg-shadow)] p-1 overflow-hidden">
                    <div className="bg-primary p-3 flex justify-between items-center border-b-2 border-border">
                        <div className="flex items-center gap-2 text-on-primary">
                            <BellRing size={20} className="animate-bounce" />
                            <span className="font-medium italic text-sm">تنبيه حصة مباشرة!</span>
                        </div>
                        <button onClick={() => setShow(false)} className="text-on-primary hover:rotate-90 transition-transform" aria-label="إغلاق">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-5">
                        <div className="text-start mb-4">
                            <h4 className="font-medium text-main text-base mb-1">المعلمة {callData.teacherName} بانتظارك!</h4>
                            <p className="text-micro text-muted font-normal mb-1 uppercase tracking-tighter">الحصة: {callData.subject}</p>
                            <p className="text-micro font-bold text-primary">
                                عبر {PROVIDER_NAMES[callData.meetingProvider] || callData.meetingProvider}
                            </p>
                        </div>
                        
                        <div className="flex gap-2">
                            <a
                                href={callData.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-primary text-on-primary py-2 px-4 border-2 border-border shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all font-medium text-xs flex items-center justify-center gap-2"
                            >
                                انضم للحصة <ExternalLink size={14} />
                            </a>
                            <button 
                                onClick={() => setShow(false)}
                                className="px-4 py-2 border-2 border-border font-normal text-xs hover:bg-surface transition-colors"
                            >
                                لاحقاً
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-background h-1 w-full overflow-hidden">
                        <motion.div 
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 60, ease: "linear" }}
                            className="h-full bg-primary"
                        />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

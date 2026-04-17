import { useState, useEffect } from 'react';
import { Video, X, BellRing, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';

export const SessionCallAlert = () => {
    const { currentUser } = useApp();
    const [callData, setCallData] = useState<any>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        let socket = (window as any).socket;
        let retryCount = 0;
        let timeoutId: any;

        const setupListeners = () => {
            socket = (window as any).socket;
            if (!socket && retryCount < 10) {
                retryCount++;
                timeoutId = setTimeout(setupListeners, 1000);
                return;
            }

            if (!socket || currentUser?.role !== 'student') return;

            const handleInvite = (data: any) => {
                console.log("📞 [Socket] SessionCallAlert: Received session invite", data);
                setCallData(data);
                setShow(true);
                
                // Play audio alert
                const audio = new Audio('/notification.mp3');
                audio.play().catch(() => console.log("Audio play blocked"));
            };

            socket.on('session_invite', handleInvite);
            
            socket.on('session_ended', () => {
                setShow(false);
                setCallData(null);
            });

            return () => {
                socket.off('session_invite', handleInvite);
                socket.off('session_ended');
            };
        };

        const cleanup = setupListeners();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (cleanup) cleanup();
        };
    }, [currentUser]);

    if (!show || !callData) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="fixed bottom-16 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[1000] md:w-[400px]"
            >
                <div className="bg-white border-4 border-gray-950 shadow-[10px_10px_0px_0px_black] p-1 overflow-hidden">
                    <div className="bg-primary-600 p-3 flex justify-between items-center border-b-2 border-gray-950">
                        <div className="flex items-center gap-2 text-white">
                            <BellRing size={20} className="animate-bounce" />
                            <span className="font-black italic text-sm">تنبيه حصة مباشرة!</span>
                        </div>
                        <button onClick={() => setShow(false)} className="text-white hover:rotate-90 transition-transform">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-5 flex gap-4">
                        <div className="w-16 h-16 bg-gray-950 text-white flex items-center justify-center border-2 border-primary-400 shrink-0">
                            <Video size={32} />
                        </div>
                        <div className="flex-1 text-right">
                            <h4 className="font-black text-gray-950 text-base mb-1">المعلمة {callData.teacherName} بانتظارك!</h4>
                            <p className="text-[10px] text-gray-500 font-bold mb-4 uppercase tracking-tighter">الحصة: {callData.subject}</p>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        if (currentUser?.id) {
                                            window.location.href = `/classroom/${currentUser.id}`;
                                        }
                                    }}
                                    className="flex-1 bg-primary-600 text-white py-2 px-4 border-2 border-gray-950 shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all font-black text-xs flex items-center justify-center gap-2"
                                >
                                    انضم الآن <ArrowRight size={14} />
                                </button>
                                <button 
                                    onClick={() => setShow(false)}
                                    className="px-4 py-2 border-2 border-gray-950 font-bold text-xs hover:bg-gray-50 transition-colors"
                                >
                                    لاحقاً
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 h-1 w-full overflow-hidden">
                        <motion.div 
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 60, ease: "linear" }}
                            className="h-full bg-primary-600"
                        />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, X, BellRing, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentUser } from '../../context/AppContext';
import { socketService } from '../../lib/socket';

interface CallData {
    teacherName: string;
    subject: string;
    sessionId: string;
}

export const SessionCallAlert = () => {
    const currentUser = useCurrentUser();
    const navigate = useNavigate();
    const [callData, setCallData] = useState<CallData | null>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const socket = socketService.getSocket();
        if (!socket || currentUser?.role !== 'student') return;

        const handleInvite = (data: CallData) => {
            setCallData(data);
            setShow(true);
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {});
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
                className="fixed bottom-16 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[1000] md:w-[400px]"
            >
                <div className="bg-white border-4 border-gray-950 shadow-[10px_10px_0px_0px_black] p-1 overflow-hidden">
                    <div className="bg-primary-600 p-3 flex justify-between items-center border-b-2 border-gray-950">
                        <div className="flex items-center gap-2 text-white">
                            <BellRing size={20} className="animate-bounce" />
                            <span className="font-medium italic text-sm">تنبيه حصة مباشرة!</span>
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
                            <h4 className="font-medium text-gray-950 text-base mb-1">المعلمة {callData.teacherName} بانتظارك!</h4>
                            <p className="text-[10px] text-gray-500 font-normal mb-4 uppercase tracking-tighter">الحصة: {callData.subject}</p>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        if (callData?.sessionId) {
                                            navigate(`/classroom/${callData.sessionId}`);
                                        }
                                    }}
                                    className="flex-1 bg-primary-600 text-white py-2 px-4 border-2 border-gray-950 shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all font-medium text-xs flex items-center justify-center gap-2"
                                >
                                    انضم الآن <ArrowRight size={14} />
                                </button>
                                <button 
                                    onClick={() => setShow(false)}
                                    className="px-4 py-2 border-2 border-gray-950 font-normal text-xs hover:bg-gray-50 transition-colors"
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

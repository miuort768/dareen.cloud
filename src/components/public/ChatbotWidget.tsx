import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Send, Loader2, MinusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { socketService } from '../../lib/socket';
import { useApp } from '../../context/useApp';

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
}

interface ChatbotProps {
    forcedOpen?: boolean;
    onClose?: () => void;
}

export const ChatbotWidget = ({ forcedOpen, onClose }: ChatbotProps) => {
    const { chatbotEnabled, chatbotName, chatbotWelcomeMsg } = useApp();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [guestInfo, setGuestInfo] = useState<{ guestId: string; conversationId: string; guestName: string } | null>(null);
    const [registration, setRegistration] = useState({ name: '', phone: '' });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const QUICK_REPLIES = [
        "الاستفسار عن الأسعار",
        "طلب دعم فني",
        "حجز حصة تجريبية",
        "متابعة حضور طالبي"
    ];

    // Initial load from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('darin_guest_chat');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setGuestInfo(parsed);
                fetchMessages(parsed.conversationId);
            } catch (e) {
                localStorage.removeItem('darin_guest_chat');
            }
        }
    }, [chatbotWelcomeMsg, chatbotName]); // Re-fetch or add welcome message when context loads

    // Socket listeners
    useEffect(() => {
        if (!guestInfo?.conversationId) return;

        socketService.getSocket().emit('join_conversation', guestInfo.conversationId);

        const handleNewMessage = (msg: Message) => {
            if (msg.senderId !== guestInfo.guestId) {
                setMessages(prev => [...prev, msg]);
                if (!isOpen) {
                    setUnreadCount(prev => prev + 1);
                    try {
                        const audio = new Audio('/sounds/notification.mp3');
                        audio.play().catch(() => {});
                    } catch (e) {}
                }
            }
        };

        socketService.getSocket().on('new_message', handleNewMessage);

        return () => {
            socketService.getSocket().off('new_message', handleNewMessage);
            socketService.getSocket().emit('leave_conversation', guestInfo.conversationId);
        };
    }, [guestInfo?.conversationId, guestInfo?.guestId, isOpen]);

    useEffect(() => {
        scrollToBottom();
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [messages, isOpen]);

    useEffect(() => {
        if (forcedOpen) {
            setIsOpen(true);
            setIsMinimized(false);
        }
    }, [forcedOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async (convId: string) => {
        try {
            const data = await api.get<Message[]>(`/public-chat/messages/${convId}`);
            
            // Always prepend the welcome message if no real messages exist or for context
            let allMessages = data;
            if (chatbotWelcomeMsg) {
                const botWelcome: Message = {
                    id: 'welcome',
                    senderId: 'bot',
                    senderName: chatbotName || 'دارين بوت',
                    content: chatbotWelcomeMsg,
                    timestamp: new Date().toISOString()
                };
                // Make sure we don't duplicate it if already exists
                allMessages = [botWelcome, ...data.filter(m => m.id !== 'welcome')];
            }
            
            setMessages(allMessages);
        } catch (e) {
            console.error('Failed to fetch messages', e);
        }
    };

    const handleInit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (guestInfo) return;
        if (!registration.name.trim() || !registration.phone.trim()) return;

        setIsLoading(true);
        try {
            const data = await api.post<any>('/public-chat/init', {
                name: registration.name.trim(),
                phone: registration.phone.trim()
            });
            setGuestInfo(data);
            localStorage.setItem('darin_guest_chat', JSON.stringify(data));
            
            // Add automated welcome message if requested
            if (chatbotWelcomeMsg) {
                setMessages([{
                    id: 'welcome',
                    senderId: 'bot',
                    senderName: chatbotName || 'دارين بوت',
                    content: chatbotWelcomeMsg,
                    timestamp: new Date().toISOString()
                }]);
            }
        } catch (e) {
            console.error('Init failed', e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent, directText?: string) => {
        e?.preventDefault();
        const text = directText || inputText.trim();
        if (!text || !guestInfo) return;

        if (!directText) setInputText('');

        const pendingMsg: Message = {
            id: Date.now().toString(),
            senderId: guestInfo.guestId,
            senderName: guestInfo.guestName,
            content: text,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, pendingMsg]);

        try {
            await api.post('/public-chat/message', {
                guestId: guestInfo.guestId,
                conversationId: guestInfo.conversationId,
                guestName: guestInfo.guestName,
                text
            });
        } catch (e) {
            console.error('Message send failed', e);
        }
    };

    const allowedPaths = ['/', '/courses', '/about', '/contact'];
    const isAllowedPage = allowedPaths.includes(location.pathname);

    // If not manually triggered via forcedOpen, respect the settings and path restrictions
    if (!forcedOpen && (!chatbotEnabled || !isAllowedPage)) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={cn(
                            "mb-4 w-[380px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-950 shadow-2xl overflow-hidden flex flex-col pointer-events-auto border dark:border-slate-800 transition-all duration-300",
                            isMinimized ? "h-16" : "h-[500px]"
                        )}
                        style={{ borderRadius: '1.5rem' }}
                    >
                        {/* Header */}
                        <div className="bg-primary-600 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 overflow-hidden p-1">
                                    <img src="/chatbot-icon.png" alt="Bot" className="w-full h-full object-contain drop-shadow-md" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-sm uppercase tracking-tight">{chatbotName || 'دارين بوت'}</h3>
                                    <p className="text-white/70 text-[10px] font-bold">نشط الآن للمساعدة</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                                >
                                    <MinusCircle size={18} />
                                </button>
                                <button 
                                    onClick={() => {
                                        setIsOpen(false);
                                        if (onClose) onClose();
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Chat Body */}
                        {!isMinimized && (
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
                                    {!guestInfo ? (
                                        <form onSubmit={handleInit} className="h-full flex flex-col justify-center p-6 space-y-5 animate-in fade-in duration-300">
                                            <div className="text-center space-y-2 mb-2">
                                                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-800/50 shadow-inner p-2">
                                                    <img src="/chatbot-icon.png" alt="Chat" className="w-full h-full object-contain drop-shadow-lg animate-pulse" />
                                                </div>
                                                <h4 className="font-black text-slate-900 dark:text-white text-lg">أهلاً بك في منصة دارين</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">لخدمتك بشكل أفضل، نرجو تزويدنا ببياناتك</p>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div>
                                                    <input 
                                                        type="text" 
                                                        required
                                                        value={registration.name}
                                                        onChange={(e) => setRegistration({...registration, name: e.target.value})}
                                                        placeholder="الاسم الكريم" 
                                                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <input 
                                                        type="tel" 
                                                        required
                                                        dir="ltr"
                                                        value={registration.phone}
                                                        onChange={(e) => setRegistration({...registration, phone: e.target.value})}
                                                        placeholder="رقم الهاتف / الواتساب" 
                                                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-left text-slate-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            <button 
                                                type="submit"
                                                disabled={isLoading || !registration.name.trim() || !registration.phone.trim()}
                                                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                                            >
                                                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'ابدأ المحادثة الآن'}
                                            </button>
                                        </form>
                                    ) : (
                                        <>
                                            {messages.map((msg, idx) => (
                                                <div 
                                                    key={msg.id || idx}
                                                    className={cn(
                                                        "flex flex-col max-w-[85%]",
                                                        msg.senderId === guestInfo.guestId ? "ml-auto items-end" : "mr-auto items-start font-arabic-bold"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm border border-transparent",
                                                        msg.senderId === guestInfo.guestId 
                                                            ? "bg-gradient-to-br from-emerald-600 to-teal-500 text-white rounded-tr-sm shadow-emerald-500/20" 
                                                            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-gray-100 dark:border-slate-700 rounded-tl-sm"
                                                    )}>
                                                        {msg.content}
                                                    </div>
                                                    <span className="text-[9px] mt-1 opacity-50 font-mono">
                                                        {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </>
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="bg-white dark:bg-slate-950 border-t dark:border-slate-800/80 p-3 flex flex-col gap-3">
                                    {guestInfo && (
                                        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 pt-0.5">
                                            {QUICK_REPLIES.map((reply, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSendMessage(undefined, reply)}
                                                    className="shrink-0 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 rounded-full text-[10px] font-black transition-colors whitespace-nowrap"
                                                >
                                                    {reply}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <form 
                                        onSubmit={(e) => handleSendMessage(e)}
                                        className="flex gap-2 items-center"
                                    >
                                        <input 
                                            type="text"
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            disabled={!guestInfo}
                                            placeholder="اكتب رسالتك هنا..."
                                            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 dark:text-white disabled:opacity-50 transition-all"
                                        />
                                        <button 
                                            type="submit"
                                            disabled={!inputText.trim() || !guestInfo}
                                            className="w-11 h-11 shrink-0 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl flex items-center justify-center hover:from-emerald-700 hover:to-teal-600 transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20"
                                        >
                                            <Send size={18} className="rtl:-scale-x-100" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setIsOpen(true);
                        setIsMinimized(false);
                    }}
                    className="w-14 h-14 flex items-center justify-center pointer-events-auto relative group hover:scale-110 transition-transform cursor-pointer"
                >
                    <img src="/chatbot-icon.png" alt="Chat" className="w-full h-full object-contain drop-shadow-2xl" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 w-6 h-6 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full text-[10px] text-white font-black flex items-center justify-center animate-bounce z-10">
                            {unreadCount}
                        </span>
                    )}
                    <span className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full text-[10px] font-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">!</span>
                    
                    {/* Tooltip */}
                    <div className="absolute right-20 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        {chatbotName || 'تحدث مع دارين'}
                    </div>
                </motion.button>
            )}
        </div>
    );
};

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, MinusCircle } from 'lucide-react';
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

export const ChatbotWidget = () => {
    const { chatbotEnabled, chatbotName, chatbotWelcomeMsg } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [guestInfo, setGuestInfo] = useState<{ guestId: string; conversationId: string; guestName: string } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
    }, []);

    // Socket listeners
    useEffect(() => {
        if (!guestInfo?.conversationId) return;

        socketService.getSocket().emit('join_conversation', guestInfo.conversationId);

        const handleNewMessage = (msg: Message) => {
            if (msg.senderId !== guestInfo.guestId) {
                setMessages(prev => [...prev, msg]);
                if (!isOpen) {
                    // Play notification sound or show badge
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
    }, [messages, isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async (convId: string) => {
        try {
            const data = await api.get<Message[]>(`/public-chat/messages/${convId}`);
            setMessages(data);
        } catch (e) {
            console.error('Failed to fetch messages', e);
        }
    };

    const handleInit = async () => {
        if (guestInfo) return;
        setIsLoading(true);
        try {
            const data = await api.post<any>('/public-chat/init');
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

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim() || !guestInfo) return;

        const text = inputText.trim();
        setInputText('');

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

    if (!chatbotEnabled) return null;

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
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                                    <Bot className="text-white" size={24} />
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
                                    onClick={() => setIsOpen(false)}
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
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                                            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 animate-bounce">
                                                <MessageCircle size={32} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 dark:text-white mb-1">ابدأ المحادثة</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">فريقنا جاهز للرد على استفساراتك فوراً</p>
                                            </div>
                                            <button 
                                                onClick={handleInit}
                                                disabled={isLoading}
                                                className="w-full py-3 bg-primary-600 text-white font-black rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'فتح شات مباشر'}
                                            </button>
                                        </div>
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
                                                        "px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm",
                                                        msg.senderId === guestInfo.guestId 
                                                            ? "bg-primary-600 text-white rounded-tr-none" 
                                                            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border dark:border-slate-700 rounded-tl-none"
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
                                <form 
                                    onSubmit={handleSendMessage}
                                    className="p-3 bg-white dark:bg-slate-950 border-t dark:border-slate-800 flex gap-2 items-center"
                                >
                                    <input 
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        disabled={!guestInfo}
                                        placeholder="اكتب رسالتك هنا..."
                                        className="flex-1 bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-white disabled:opacity-50"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!inputText.trim() || !guestInfo}
                                        className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 transition-all disabled:opacity-50 shadow-lg shadow-primary-500/10"
                                    >
                                        <Send size={18} className="rtl:rotate-180" />
                                    </button>
                                </form>
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
                    className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-2xl pointer-events-auto relative group hover:bg-primary-700 transition-colors"
                >
                    <MessageCircle size={32} />
                    <span className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full text-[10px] font-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">!</span>
                    
                    {/* Tooltip */}
                    <div className="absolute right-20 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        {chatbotName || 'تحدث مع دارين'}
                    </div>
                </motion.button>
            )}
        </div>
    );
};

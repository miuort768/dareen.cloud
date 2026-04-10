import React, { useRef, useEffect, useState } from 'react';
import { 
    Send, Smile, MoreVertical, Edit2, Trash2, ChevronRight, 
    CheckCheck, Video, Mic, ArrowDown, Sparkles, MessageSquare, RefreshCw,
    Zap, Rocket, ShieldCheck, Gamepad2
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useChatContext } from '../../../context/ChatContext';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import type { Conversation, ChatMessage } from '../../../types/chat.types';
import type { User } from '../../../types/auth';
import { socketService } from '../../../lib/socket';
import { MeetingRoom } from './MeetingRoom';

interface ChatWindowProps {
    selectedConv: Conversation;
    messages: ChatMessage[];
    newMessage: string;
    setNewMessage: (val: string) => void;
    handleSendMessage: (e: React.FormEvent) => void;
    isSending: boolean;
    currentUser: User | null;
    setSelectedConv: (val: Conversation | null) => void;
    openGroupSettings: () => void;
    confirmDeleteConversation: (conv: Conversation) => void;
    showMoreMenu: boolean;
    setShowMoreMenu: (val: boolean) => void;
    menuRef: React.RefObject<HTMLDivElement>;
    setTyping: (convId: string, isTyping: boolean, name: string) => void;
}

const QUICK_REPLIES = [
    "شكراً لك 🙏",
    "تم الاستلام 👍",
    "سأقوم بمراجعة الطلب",
    "يرجى العلم بموعد الحصة",
    "أهلاً بك",
    "بالتأكيد"
];

export const ChatWindow: React.FC<ChatWindowProps> = ({
    selectedConv,
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    isSending,
    currentUser,
    setSelectedConv,
    openGroupSettings,
    confirmDeleteConversation,
    showMoreMenu,
    setShowMoreMenu,
    menuRef,
    setTyping
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const { typingUsers } = useChatContext();
    const isChatOnly = currentUser?.role === 'chat_user';
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMeeting, setShowMeeting] = useState(false);
    const [activeMeeting, setActiveMeeting] = useState<any>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const socket = socketService.getSocket();

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const isFarUp = scrollHeight - scrollTop - clientHeight > 300;
        setShowScrollBottom(isFarUp);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.closest('.emoji-toggle-btn')) return;
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Meeting Listeners
    useEffect(() => {
        if (!socket) return;
        const handleMeetingStarted = (data: any) => {
            if (data.conversationId === selectedConv.id) setActiveMeeting(data);
        };
        const handleMeetingEnded = (data: any) => {
            if (data.conversationId === selectedConv.id) {
                setActiveMeeting(null);
                setShowMeeting(false);
            }
        };
        socket.on('meeting_started', handleMeetingStarted);
        socket.on('meeting_ended', handleMeetingEnded);
        return () => {
            socket.off('meeting_started', handleMeetingStarted);
            socket.off('meeting_ended', handleMeetingEnded);
        };
    }, [selectedConv.id, socket]);

    const onEmojiClick = (emojiData: any) => {
        setNewMessage(newMessage + emojiData.emoji);
    };

    const typingInThisConv = typingUsers.filter(u => u.conversationId === selectedConv.id);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "flex-1 flex flex-col bg-white dark:bg-[#0b141a] overflow-hidden lg:rounded-none lg:border-l-8 lg:border-y-8 border-gray-950 relative",
                !isChatOnly && "pb-[80px] lg:pb-0"
            )}
        >
            {/* Brutalist Pattern Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.1] z-0" 
                 style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '40px 40px' }} />

            {showMeeting && currentUser && (
                <MeetingRoom
                    conversationId={selectedConv.id}
                    currentUser={currentUser}
                    isTeacher={currentUser.role === 'admin' || currentUser.role === 'teacher'}
                    onClose={() => setShowMeeting(false)}
                />
            )}

            {/* Premium Header - Brutalist Skewed Style */}
            <div className="h-20 lg:h-24 shrink-0 border-b-4 border-gray-950 flex items-center justify-between bg-white dark:bg-[#111b21] sticky top-0 z-50 px-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-full bg-primary-600/10 -skew-x-12 translate-x-10 pointer-events-none"></div>
                
                <div className="relative z-10 flex items-center gap-4">
                    <button
                        onClick={() => setSelectedConv(null)}
                        className="lg:hidden p-2 -mr-2 bg-gray-950 text-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_#ef4444]"
                    >
                        <ChevronRight size={20} />
                    </button>

                    <div className="relative group cursor-pointer" onClick={() => selectedConv.isGroup && openGroupSettings()}>
                        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gray-950 text-white border-2 border-gray-950 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] flex items-center justify-center transform group-hover:rotate-6 transition-transform overflow-hidden">
                            <img src={selectedConv.isGroup ? "/group-avatar.png" : "/chat-avatar.jpg"} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-[#111b21] rounded-none shadow-[2px_2px_0px_0px_black] animate-pulse"></div>
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            {selectedConv.isGroup && <ShieldCheck size={14} className="text-primary-600" />}
                            <h2 className="font-black text-gray-950 dark:text-white leading-tight truncate text-base lg:text-xl tracking-tighter uppercase italic">
                                {selectedConv.displayName}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {typingInThisConv.length > 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 border border-emerald-500 flex items-center gap-2"
                                >
                                    <div className="flex gap-1">
                                        {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-emerald-500 animate-bounce" style={{ animationDelay: `${i*0.1}s` }} />)}
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest italic">جاري الكتابة...</span>
                                </motion.div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-gray-950" />
                                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-[2px]">Communication Active</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="hidden md:flex gap-2">
                         <div className="px-3 py-1.5 bg-gray-950 text-white text-[9px] font-black uppercase border-b-2 border-primary-500 italic">Secure Line</div>
                    </div>
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className="w-12 h-12 flex items-center justify-center bg-white border-4 border-gray-950 shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                        >
                            <MoreVertical size={24} className="text-gray-950" />
                        </button>
                        <AnimatePresence>
                            {showMoreMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="absolute top-full left-0 mt-4 w-64 bg-white border-4 border-gray-950 shadow-[10px_10px_0px_0px_black] z-[100] p-2"
                                >
                                    <div className="space-y-1">
                                        {selectedConv.isGroup && (currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
                                            <button
                                                onClick={() => { openGroupSettings(); setShowMoreMenu(false); }}
                                                className="w-full text-right px-4 py-4 text-xs font-black text-gray-950 hover:bg-primary-50 border-2 border-transparent hover:border-gray-950 transition-all flex items-center gap-3 uppercase"
                                            >
                                                <Edit2 size={16} className="text-primary-600" />
                                                إعدادات المجموعة
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { confirmDeleteConversation(selectedConv); setShowMoreMenu(false); }}
                                            className="w-full text-right px-4 py-4 text-xs font-black text-rose-600 hover:bg-rose-50 border-2 border-transparent hover:border-gray-950 transition-all flex items-center gap-3 uppercase"
                                        >
                                            <Trash2 size={16} />
                                            حذف السجل
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Mission Critical Call Bar */}
            <div className="shrink-0 flex justify-start px-6 py-4 bg-gray-50 border-b-4 border-gray-950 relative z-40">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <motion.button
                        whileHover={{ rotate: -1, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowMeeting(true)}
                        className={cn(
                            "relative px-10 py-4 border-4 border-gray-950 font-black uppercase text-sm italic tracking-widest flex items-center gap-4 transition-all w-full md:w-auto justify-center",
                            activeMeeting 
                                ? "bg-emerald-500 text-white shadow-[6px_6px_0px_0px_#064e3b]" 
                                : "bg-primary-600 text-white shadow-[6px_6px_0px_0px_#7f1d1d]"
                        )}
                    >
                        {activeMeeting ? <Rocket size={20} className="animate-bounce" /> : <Gamepad2 size={20} />}
                        {activeMeeting ? 'الالتحاق بالمهمة (حصة مباشرة)' : 'إطلاق حصة تعليمية'}
                        <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </motion.button>

                    {activeMeeting && (
                        <div className="hidden lg:flex items-center gap-3 bg-white border-4 border-gray-950 px-6 py-3 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]">
                            <Zap size={18} className="text-emerald-500 fill-current animate-pulse" />
                            <span className="text-xs font-black text-gray-950 uppercase italic tracking-tighter">الحصة مفعلة الآن بواسطة: {activeMeeting.teacherName}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-8 bg-transparent custom-scrollbar relative z-10"
            >
                <div className="relative space-y-12">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-300 select-none grayscale opacity-30">
                            <MessageSquare size={120} strokeWidth={4} />
                            <h2 className="text-4xl font-black uppercase tracking-tighter mt-6 italic">Secure Channel Established</h2>
                            <p className="font-bold border-2 border-gray-300 px-4 py-1 mt-4">بداية مشفرة للمحادثة</p>
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === currentUser?.id;
                                const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

                                return (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, x: isMe ? -20 : 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={msg.id || idx} 
                                        className={cn(
                                            "flex flex-col",
                                            isMe ? "items-start" : "items-end"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex items-start gap-4 max-w-[90%] lg:max-w-[80%]",
                                            isMe ? "flex-row" : "flex-row-reverse"
                                        )}>
                                            <div className={cn(
                                                "p-5 border-4 border-gray-950 relative overflow-hidden transition-transform hover:-rotate-1 duration-300",
                                                isMe
                                                    ? "bg-white text-gray-950 shadow-[6px_6px_0px_0px_#ef4444]"
                                                    : "bg-gray-950 text-white shadow-[6px_6px_0px_0px_#3b82f6]"
                                            )}>
                                                {/* Card Accents */}
                                                <div className={cn("absolute top-0 right-0 w-full h-1", isMe ? "bg-rose-500" : "bg-blue-500")} />
                                                
                                                {!isMe && showAvatar && (
                                                    <span className="block text-[11px] font-black text-blue-400 mb-2 leading-none uppercase tracking-widest italic border-b border-white/20 pb-2">
                                                        {msg.senderName}
                                                    </span>
                                                )}
                                                {isMe && showAvatar && (
                                                     <span className="block text-[11px] font-black text-rose-500 mb-2 leading-none uppercase tracking-widest italic border-b border-gray-100 pb-2">
                                                        SENDER: YOU
                                                    </span>
                                                )}

                                                <p className="text-[15px] lg:text-[17px] leading-[1.6] whitespace-pre-wrap font-black tracking-tight">
                                                    {msg.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) => (
                                                        part.match(/^https?:\/\/[^\s]+$/) ? (
                                                            <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-inherit underline decoration-4 underline-offset-4 hover:opacity-70 break-all transition-opacity">
                                                                {part}
                                                            </a>
                                                        ) : part
                                                    ))}
                                                </p>
                                                
                                                <div className={cn(
                                                    "flex items-center gap-3 mt-4 justify-end",
                                                    isMe ? "text-gray-400" : "text-gray-500"
                                                )}>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                                        {format(new Date(msg.timestamp), 'HH:mm', { locale: ar })}
                                                    </span>
                                                    {isMe && <CheckCheck size={16} className="text-rose-500 font-black" />}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>

                <AnimatePresence>
                    {showScrollBottom && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => scrollToBottom()}
                            className="fixed bottom-36 left-12 w-14 h-14 bg-gray-950 text-white shadow-[6px_6px_0px_0px_#ef4444] flex items-center justify-center border-2 border-white z-[200] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            <ArrowDown size={28} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* High-Action Input Area */}
            <div className="p-6 bg-gray-50 border-t-8 border-gray-950 shrink-0 relative z-30">
                <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
                    {QUICK_REPLIES.map(reply => (
                        <button
                            key={reply}
                            onClick={() => setNewMessage(reply)}
                            className="shrink-0 px-6 py-2.5 bg-white border-4 border-gray-950 text-[11px] font-black text-gray-950 hover:bg-gray-950 hover:text-white hover:rotate-3 transition-all uppercase italic shadow-[3px_3px_0px_0px_black]"
                        >
                            {reply}
                        </button>
                    ))}
                </div>

                {showEmojiPicker && (
                    <div className="absolute bottom-full left-10 mb-6 z-[200]" ref={emojiPickerRef}>
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            className="border-8 border-gray-950 shadow-[15px_15px_0px_0px_black] overflow-hidden"
                        >
                            <EmojiPicker
                                onEmojiClick={onEmojiClick}
                                theme={document.documentElement.classList.contains('dark') ? Theme.DARK : Theme.LIGHT}
                                autoFocusSearch={false}
                                previewConfig={{ showPreview: false }}
                                width={350}
                                height={400}
                            />
                        </motion.div>
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-stretch gap-6 max-w-[1400px] mx-auto h-20">
                    <div className="flex-1 flex items-center gap-4 bg-white border-8 border-gray-950 px-6 shadow-[10px_10px_0px_0px_black] focus-within:shadow-none focus-within:translate-x-1 focus-within:translate-y-1 transition-all">
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={cn(
                                "w-12 h-12 flex items-center justify-center border-4 border-gray-950 transition-all emoji-toggle-btn",
                                showEmojiPicker ? "bg-rose-500 text-white" : "text-gray-400 hover:text-gray-950 hover:bg-yellow-400"
                            )}
                        >
                            <Smile size={28} />
                        </button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                if (currentUser) setTyping(selectedConv.id, e.target.value.length > 0, currentUser.name);
                            }}
                            placeholder="ارسل تعليماتك أو رسالتك للزملاء..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-black py-4 text-gray-950 placeholder-gray-300 italic"
                        />
                        <button type="button" className="text-gray-400 hover:text-gray-950 hover:rotate-12 transition-all">
                            <Mic size={26} />
                        </button>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className={cn(
                            "w-24 border-8 border-gray-950 flex items-center justify-center transition-all shadow-[10px_10px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1",
                            newMessage.trim()
                                ? "bg-primary-600 text-white"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed grayscale"
                        )}
                    >
                        {isSending ? (
                            <RefreshCw className="animate-spin" size={32} />
                        ) : (
                            <Send size={32} className="transform -rotate-12" />
                        )}
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );
};

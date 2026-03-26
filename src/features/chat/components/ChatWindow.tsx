import React, { useRef, useEffect, useState } from 'react';
import { 
    Send, Smile, MoreVertical, Edit2, Trash2, ChevronRight, 
    CheckCheck, Video, Mic, ArrowDown, Sparkles, MessageSquare, RefreshCw
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
                "flex-1 flex flex-col bg-white dark:bg-[#0b141a] overflow-hidden lg:rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/50 relative",
                !isChatOnly && "pb-[80px] lg:pb-0"
            )}
        >
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px]" />
            </div>

            {showMeeting && currentUser && (
                <MeetingRoom
                    conversationId={selectedConv.id}
                    currentUser={currentUser}
                    isTeacher={currentUser.role === 'admin' || currentUser.role === 'teacher'}
                    onClose={() => setShowMeeting(false)}
                />
            )}

            {/* Chat Header */}
            <div className="h-16 lg:h-20 shrink-0 border-b border-gray-100 dark:border-gray-800/20 flex items-center justify-between bg-white/40 dark:bg-[#0b141a]/40 backdrop-blur-xl sticky top-0 z-50 px-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedConv(null)}
                        className="lg:hidden p-2 -mr-2 text-gray-500 hover:text-primary-600 transition-colors active:scale-95"
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div className="relative group cursor-pointer" onClick={() => selectedConv.isGroup && openGroupSettings()}>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 dark:border-gray-700 transition-all group-hover:rotate-3 group-hover:scale-110 overflow-hidden">
                            <img src={selectedConv.isGroup ? "/group-avatar.png" : "/chat-avatar.jpg"} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#0b141a] rounded-full shadow-sm animate-pulse"></div>
                    </div>

                    <div className="min-w-0 flex-1">
                        <h2 className="font-black text-[#111b21] dark:text-[#e9edef] leading-tight truncate text-sm lg:text-lg tracking-tight">
                            {selectedConv.displayName}
                        </h2>
                        <div className="flex items-center gap-1.5 h-4">
                            {typingInThisConv.length > 0 ? (
                                <motion.p 
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[11px] text-emerald-500 font-black italic flex items-center gap-1"
                                >
                                    <Sparkles size={10} />
                                    {typingInThisConv.length === 1
                                        ? `${typingInThisConv[0].userName} يكتب الان...`
                                        : `${typingInThisConv.length} اشخاص يكتبون...`}
                                </motion.p>
                            ) : (
                                <span className="flex items-center gap-1.2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_4px_#10b981]" />
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-[1px] ml-1">متصل الآن</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary-600 transition-all rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <MoreVertical size={20} />
                        </button>
                        <AnimatePresence>
                            {showMoreMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                    className="absolute top-full left-0 mt-2 w-60 bg-white/90 dark:bg-[#1a2329]/90 backdrop-blur-2xl border border-gray-100 dark:border-gray-800 shadow-2xl z-[100] rounded-2xl overflow-hidden p-2"
                                >
                                    <div className="space-y-1">
                                        {selectedConv.isGroup && (currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
                                            <button
                                                onClick={() => { openGroupSettings(); setShowMoreMenu(false); }}
                                                className="w-full text-right px-4 py-3 text-sm font-black text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl flex items-center gap-3 transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                                    <Edit2 size={16} className="text-primary-600" />
                                                </div>
                                                تعديل المجموعة
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { confirmDeleteConversation(selectedConv); setShowMoreMenu(false); }}
                                            className="w-full text-right px-4 py-3 text-sm font-black text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                                <Trash2 size={16} />
                                            </div>
                                            حذف المحادثة
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Learning Time Action Bar */}
            <div className="shrink-0 flex justify-start px-6 py-4 bg-transparent relative z-40 border-b border-gray-100 dark:border-gray-800/10">
                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowMeeting(true)}
                        className={cn(
                            "group relative px-8 py-3 bg-white/60 dark:bg-[#202c33]/60 backdrop-blur-md border-r-4 shadow-xl flex items-center gap-4 overflow-hidden rounded-xl transition-all",
                            activeMeeting ? "border-emerald-600" : "border-primary-600"
                        )}
                    >
                        <div className={cn(
                            "w-3 h-3 rounded-full animate-ping",
                            activeMeeting ? "bg-emerald-600" : "bg-primary-600"
                        )}></div>
                        <span className="text-[13px] font-black text-gray-800 dark:text-gray-100 uppercase tracking-[1.5px] border-b-2 border-transparent group-hover:border-current">
                            {activeMeeting ? 'انضم للحصة المباشرة' : 'بدء حصة جديدة'}
                        </span>
                        <Video size={18} className={activeMeeting ? "text-emerald-600" : "text-primary-600"} />
                    </motion.button>

                    {activeMeeting && (
                        <div className="flex items-center gap-3 bg-emerald-100/30 dark:bg-emerald-900/20 px-4 py-2 border border-emerald-200/50 dark:border-emerald-800/30 rounded-2xl">
                            <Video size={16} className="text-emerald-600 animate-pulse" />
                            <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-400">حصة جارية بدأت بواسطة {activeMeeting.teacherName}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 bg-transparent custom-scrollbar relative z-10"
            >
                {/* Patterns Overlay */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                
                <div className="relative space-y-8 pb-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 opacity-20 select-none">
                            <MessageSquare size={80} strokeWidth={1} />
                            <p className="font-black uppercase tracking-widest mt-4">بداية المحادثة</p>
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === currentUser?.id;
                                const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

                                return (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        key={msg.id || idx} 
                                        className={cn(
                                            "flex flex-col",
                                            isMe ? "items-start" : "items-end"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex items-end gap-3 max-w-[85%] lg:max-w-[75%]",
                                            isMe ? "flex-row-reverse" : "flex-row"
                                        )}>
                                            <div className={cn(
                                                "px-4 py-3 rounded-[24px] relative shadow-lg group transition-all duration-300",
                                                isMe
                                                    ? "bg-primary-600 text-white rounded-tr-none hover:shadow-primary-500/20"
                                                    : "bg-white/80 dark:bg-[#1a2329]/90 text-[#111b21] dark:text-[#e9edef] rounded-tl-none border border-white/50 dark:border-gray-800 backdrop-blur-md"
                                            )}>
                                                {!isMe && showAvatar && (
                                                    <span className="block text-[10px] font-black text-primary-600 dark:text-primary-400 mb-2 leading-none uppercase tracking-wider">
                                                        {msg.senderName}
                                                    </span>
                                                )}
                                                <p className="text-[14px] lg:text-[16px] leading-[1.6] whitespace-pre-wrap font-bold">
                                                    {msg.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) => (
                                                        part.match(/^https?:\/\/[^\s]+$/) ? (
                                                            <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-inherit underline decoration-2 underline-offset-4 hover:opacity-60 break-all transition-opacity font-black">
                                                                {part}
                                                            </a>
                                                        ) : part
                                                    ))}
                                                </p>
                                                <div className={cn(
                                                    "flex items-center gap-2 mt-2 justify-end opacity-50",
                                                    isMe ? "text-white" : "text-gray-500 dark:text-gray-400"
                                                )}>
                                                    <span className="text-[9px] font-black">
                                                        {format(new Date(msg.timestamp), 'HH:mm', { locale: ar })}
                                                    </span>
                                                    {isMe && <CheckCheck size={12} className="font-black" />}
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
                            className="fixed bottom-32 left-1/2 -translate-x-1/2 lg:left-12 lg:translate-x-0 w-12 h-12 bg-white dark:bg-gray-800 text-primary-600 shadow-2xl rounded-2xl flex items-center justify-center border border-gray-100 dark:border-gray-700 z-[200] hover:scale-110 active:scale-90 transition-transform"
                        >
                            <ArrowDown size={24} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 lg:p-6 bg-transparent shrink-0 relative z-30">
                
                {/* Quick Replies Pill Bar */}
                <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
                    {QUICK_REPLIES.map(reply => (
                        <button
                            key={reply}
                            onClick={() => {
                                setNewMessage(reply);
                                // Trigger focus if needed
                            }}
                            className="shrink-0 px-4 py-1.5 bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-full text-[11px] font-black text-gray-600 dark:text-gray-400 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all active:scale-95"
                        >
                            {reply}
                        </button>
                    ))}
                </div>

                {showEmojiPicker && (
                    <div
                        className="absolute bottom-full left-4 mb-4 z-[200]"
                        ref={emojiPickerRef}
                    >
                        <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="shadow-2xl rounded-3xl overflow-hidden border border-white/20"
                        >
                            <EmojiPicker
                                onEmojiClick={onEmojiClick}
                                theme={document.documentElement.classList.contains('dark') ? Theme.DARK : Theme.LIGHT}
                                autoFocusSearch={false}
                                searchPlaceholder="ابحث عن ايموجي..."
                                previewConfig={{ showPreview: false }}
                                width={320}
                                height={380}
                            />
                        </motion.div>
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-4 max-w-[1200px] mx-auto">
                    <div className="flex-1 flex items-center gap-2 bg-white/60 dark:bg-[#1a2329]/80 backdrop-blur-xl pl-5 pr-3 py-3 rounded-[28px] shadow-2xl border border-white/20 dark:border-gray-800 group focus-within:ring-2 ring-primary-500/10 transition-all">
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={cn(
                                "p-2.5 rounded-2xl transition-all emoji-toggle-btn active:scale-90",
                                showEmojiPicker ? "text-primary-600 bg-primary-100 dark:bg-primary-900/30" : "text-gray-400 hover:text-primary-600 hover:bg-primary-50"
                            )}
                        >
                            <Smile size={24} />
                        </button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                if (currentUser) setTyping(selectedConv.id, e.target.value.length > 0, currentUser.name);
                            }}
                            placeholder="اكتب رسالتك لزملائك..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-[16px] font-bold py-1 px-0 text-[#111b21] dark:text-[#e9edef] placeholder-gray-400/70"
                        />
                        <button type="button" className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                            <Mic size={22} />
                        </button>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className={cn(
                            "w-14 h-14 flex items-center justify-center rounded-full shadow-2xl transition-all",
                            newMessage.trim()
                                ? "bg-primary-600 text-white shadow-primary-500/30"
                                : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                        )}
                    >
                        {isSending ? (
                            <RefreshCw className="animate-spin" size={24} />
                        ) : (
                            <Send size={24} className={cn("transition-transform", newMessage.trim() && "translate-x-0.5 -translate-y-0.5")} />
                        )}
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );
};

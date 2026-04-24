import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
    Send, MoreVertical, ChevronRight, 
    CheckCheck, ArrowDown, Search
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useChatContext } from '../../../context/ChatContext';
import type { Conversation, ChatMessage } from '../../../types/chat.types';
import type { User } from '../../../types/auth';

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
    markAsRead: (convId: string) => void;
}

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
    setTyping,
    markAsRead
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const { typingUsers } = useChatContext();

    const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            scrollToBottom("smooth");
        }, 100);
        return () => clearTimeout(timer);
    }, [messages]);

    // Mark as read when conversation is active or new messages arrive (only for incoming messages)
    useEffect(() => {
        if (selectedConv?.id && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.senderId !== currentUser?.id) {
                markAsRead(selectedConv.id);
            }
        }
    }, [selectedConv.id, messages.length, markAsRead, currentUser?.id]);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const isFarUp = scrollHeight - scrollTop - clientHeight > 300;
        setShowScrollBottom(isFarUp);
    };

    const typingInThisConv = typingUsers.filter(u => u.conversationId === selectedConv.id);

    // Safer and more efficient message sorting
    const sortedMessages = useMemo(() => {
        return [...messages].sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            if (isNaN(timeA)) return 1;
            if (isNaN(timeB)) return -1;
            return timeA - timeB;
        });
    }, [messages]);

    return (
        <div className="flex-1 bg-[#efeae2] dark:bg-[#0b141a] relative h-full w-full overflow-hidden">
            {/* WhatsApp Doodle Background Pattern */}
            <div 
                className="absolute inset-0 z-0 opacity-[0.06] dark:opacity-[0.1]" 
                style={{ 
                    backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '400px'
                }} 
            />

            {/* Header - Fixed at top */}
            <header className="absolute top-0 left-0 right-0 h-[60px] bg-[#f0f2f5] dark:bg-[#202c33] flex items-center justify-between px-4 z-50 shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                    <button
                        onClick={() => setSelectedConv(null)}
                        className="lg:hidden p-1 text-[#54656f] dark:text-[#aebac1] shrink-0"
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div 
                        className={cn("w-10 h-10 rounded-full overflow-hidden shrink-0", selectedConv.isGroup && currentUser?.role === 'admin' ? "cursor-pointer" : "")}
                        onClick={() => selectedConv.isGroup && currentUser?.role === 'admin' && openGroupSettings()}
                    >
                        <img 
                            src="/chat-avatar.jpg" 
                            alt="avatar" 
                            className="w-full h-full object-cover" 
                        />
                    </div>

                    <div className="flex flex-col text-right truncate">
                        <h2 className={cn(
                            "font-medium text-[#111b21] dark:text-[#e9edef] leading-tight truncate",
                            selectedConv.isGroup ? "text-sm" : "text-base"
                        )}>
                            {selectedConv.displayName}
                        </h2>
                        {typingInThisConv.length > 0 ? (
                            <span className="text-[12px] text-[#00a884] font-normal animate-pulse">جاري الكتابة...</span>
                        ) : (
                            <span className="text-[12px] text-slate-400 dark:text-slate-500 font-normal">
                                {selectedConv.isGroup ? "مجموعة" : "محادثة مباشرة"}
                            </span>
                        )}
                    </div>
                </div>

                {currentUser?.role === 'admin' && (
                    <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1] shrink-0">
                        <button className="hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-full transition-colors hidden md:block">
                            <Search size={20} />
                        </button>
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowMoreMenu(!showMoreMenu)}
                                className="hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-full transition-colors"
                            >
                                <MoreVertical size={20} />
                            </button>
                            <AnimatePresence>
                                {showMoreMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#233138] shadow-xl z-[100] py-2 rounded-md"
                                    >
                                        <button
                                            onClick={() => { openGroupSettings(); setShowMoreMenu(false); }}
                                            className="w-full text-right px-4 py-3 text-sm text-[#3b4a54] dark:text-[#d1d7db] hover:bg-[#f5f6f6] dark:hover:bg-[#182229] transition-colors"
                                        >
                                            معلومات المحادثة
                                        </button>
                                        {selectedConv.isGroup && (
                                            <button
                                                onClick={() => { openGroupSettings(); setShowMoreMenu(false); }}
                                                className="w-full text-right px-4 py-3 text-sm text-[#3b4a54] dark:text-[#d1d7db] hover:bg-[#f5f6f6] dark:hover:bg-[#182229] transition-colors font-bold"
                                            >
                                                تعديل المجموعة
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { confirmDeleteConversation(selectedConv); setShowMoreMenu(false); }}
                                            className="w-full text-right px-4 py-3 text-sm text-rose-500 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] transition-colors"
                                        >
                                            حذف الدردشة
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </header>

            {/* Messages - Scrollable area with fixed height offset */}
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="absolute top-[60px] bottom-[140px] lg:bottom-[72px] left-0 right-0 overflow-y-auto px-3 md:px-10 lg:px-20 pt-6 pb-6 flex flex-col space-y-2 custom-scrollbar z-10"
            >
                {sortedMessages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUser?.id;
                    const isGroup = selectedConv.isGroup;
                    
                    return (
                        <div 
                            key={msg.id || idx} 
                            className={cn(
                                "flex w-full mb-1",
                                isMe ? "justify-start" : "justify-end"
                            )}
                        >
                            <div className={cn(
                                "max-w-[90%] md:max-w-[75%] px-3 py-1.5 shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] relative",
                                isMe 
                                    ? "bg-[#d9fdd3] dark:bg-[#005c4b] rounded-[7.5px] rounded-tl-none ml-2" 
                                    : "bg-white dark:bg-[#202c33] rounded-[7.5px] rounded-tr-none mr-2"
                            )}>
                                {isGroup && !isMe && (
                                    <span className="block text-[12.5px] font-bold text-[#e542a3] mb-0.5 text-right">
                                        {msg.senderName}
                                    </span>
                                )}

                                <div className="text-[14.2px] text-[#111b21] dark:text-[#e9edef] leading-[1.4] whitespace-pre-wrap text-right tracking-tight">
                                    {msg.content}
                                </div>
                                
                                <div className="flex items-center justify-end gap-1 mt-1">
                                    <span className="text-[10px] text-[#667781] dark:text-[#8696a0]">
                                        {msg.timestamp && !isNaN(new Date(msg.timestamp).getTime()) 
                                            ? format(new Date(msg.timestamp), 'h:mm a', { locale: ar })
                                            : '--:--'}
                                    </span>
                                    {isMe && (
                                        <div className="flex">
                                            {new Date().getTime() - new Date(msg.timestamp).getTime() > 10000 ? (
                                                <CheckCheck size={14} className="text-[#53bdeb]" />
                                            ) : new Date().getTime() - new Date(msg.timestamp).getTime() > 3000 ? (
                                                <CheckCheck size={14} className="text-[#8696a0]" />
                                            ) : (
                                                <CheckCheck size={14} className="text-[#8696a0] opacity-50" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Scroll to Bottom Button */}
            <AnimatePresence>
                {showScrollBottom && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => scrollToBottom("smooth")}
                        className="absolute bottom-40 lg:bottom-24 left-6 w-10 h-10 bg-white dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] rounded-full shadow-md flex items-center justify-center z-20 hover:bg-[#f0f2f5] dark:hover:bg-[#2a3942]"
                    >
                        <ArrowDown size={20} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Input Bar - Fixed at bottom */}
            <footer className="absolute bottom-[68px] lg:bottom-0 left-0 right-0 h-[72px] bg-white/95 dark:bg-[#202c33] backdrop-blur-xl px-3 py-3 z-20 flex items-center gap-3 border-t border-gray-100 dark:border-white/5">
                <div className="flex-1 relative flex items-center">
                    <textarea
                        rows={1}
                        value={newMessage}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
                        }}
                        onChange={(e) => {
                            const val = e.target.value;
                            setNewMessage(val);
                            
                            // Throttled typing indicator
                            if (currentUser && selectedConv.id) {
                                // Only emit if it's been more than 2s or if it's the first character
                                const now = Date.now();
                                const lastSent = (window as any)._lastTypingEmit || 0;
                                if (now - lastSent > 2000 || (val.length > 0 && lastSent === 0)) {
                                    setTyping(selectedConv.id, val.length > 0, currentUser.name);
                                    (window as any)._lastTypingEmit = val.length > 0 ? now : 0;
                                } else if (val.length === 0) {
                                    setTyping(selectedConv.id, false, currentUser.name);
                                    (window as any)._lastTypingEmit = 0;
                                }
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e as any);
                                // Reset height
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                            }
                        }}
                        placeholder="اكتب رسالة"
                        className="w-full bg-white dark:bg-[#2a3942] text-[#111b21] dark:text-[#d1d7db] text-sm md:text-base border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-emerald-500 shadow-sm max-h-32 resize-none text-right scroll-smooth custom-scrollbar relative z-10 overflow-y-auto"
                    />
                </div>

                <div className="flex items-center justify-center shrink-0">
                    <button
                        onClick={handleSendMessage}
                        className="bg-[#00a884] text-white p-3.5 rounded-xl hover:bg-[#008f6f] transition-all shadow-[0_2px_4px_rgba(0,0,0,0.1)] active:scale-95 flex items-center justify-center h-[48px] w-[48px]"
                        title="إرسال"
                    >
                        <Send size={20} className={cn("transition-transform", isSending && "animate-pulse")} />
                    </button>
                </div>
            </footer>
        </div>
    );
};

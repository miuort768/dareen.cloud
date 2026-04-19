import React, { useRef, useEffect, useState } from 'react';
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

    // Mark as read when conversation is active or new messages arrive
    useEffect(() => {
        if (selectedConv?.id) {
            markAsRead(selectedConv.id);
        }
    }, [selectedConv.id, messages.length, markAsRead]);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const isFarUp = scrollHeight - scrollTop - clientHeight > 300;
        setShowScrollBottom(isFarUp);
    };

    const typingInThisConv = typingUsers.filter(u => u.conversationId === selectedConv.id);

    return (
        <div className="flex-1 flex flex-col bg-[#efeae2] dark:bg-[#0b141a] overflow-hidden relative h-full pb-[65px] lg:pb-0">
            {/* WhatsApp Doodle Background Pattern */}
            <div 
                className="absolute inset-0 z-0 opacity-[0.06] dark:opacity-[0.1]" 
                style={{ 
                    backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '400px'
                }} 
            />

            {/* Header - WhatsApp Style */}
            <header className="sticky top-0 h-[60px] shrink-0 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center justify-between px-4 z-[50] shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSelectedConv(null)}
                        className="lg:hidden p-1 text-[#54656f] dark:text-[#aebac1]"
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div 
                        className="w-10 h-10 rounded-full overflow-hidden cursor-pointer"
                        onClick={() => selectedConv.isGroup && openGroupSettings()}
                    >
                        <img 
                            src="/chat-avatar.jpg" 
                            alt="avatar" 
                            className="w-full h-full object-cover" 
                        />
                    </div>

                    <div className="flex flex-col text-right">
                        <h2 className={cn(
                            "font-medium text-[#111b21] dark:text-[#e9edef] leading-tight truncate max-w-[150px] md:max-w-[300px]",
                            selectedConv.isGroup ? "text-sm" : "text-base"
                        )}>
                            {selectedConv.displayName}
                        </h2>
                        {typingInThisConv.length > 0 ? (
                            <span className="text-[12px] text-[#00a884] font-normal">جاري الكتابة...</span>
                        ) : (
                            <span className="text-[12px] text-[#00a884] font-normal">
                                {selectedConv.isGroup ? "نشط الآن" : "متصل الآن"}
                            </span>
                        )}
                    </div>
                </div>

                {currentUser?.role === 'admin' && (
                    <div className="flex items-center gap-5 text-[#54656f] dark:text-[#aebac1]">
                        <button className="hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-full transition-colors">
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

            {/* Messages - WhatsApp Bubbles */}
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 lg:px-20 pt-6 pb-10 flex flex-col space-y-2 custom-scrollbar relative z-10"
            >
                {[...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((msg, idx) => {
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
                                        {format(new Date(msg.timestamp), 'h:mm a', { locale: ar })}
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
                        className="absolute bottom-24 left-6 w-10 h-10 bg-white dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] rounded-full shadow-md flex items-center justify-center z-20 hover:bg-[#f0f2f5] dark:hover:bg-[#2a3942]"
                    >
                        <ArrowDown size={20} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Input Bar - Standardized Style */}
            <footer className="bg-[#f0f2f5] dark:bg-[#202c33] px-3 py-3 z-10 flex items-center gap-3">
                <div className="flex-1 relative flex items-center">
                    <textarea
                        rows={1}
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            if (currentUser) setTyping(selectedConv.id, e.target.value.length > 0, currentUser.name);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e as any);
                            }
                        }}
                        placeholder="اكتب رسالة"
                        className="w-full bg-white dark:bg-[#2a3942] text-[#111b21] dark:text-[#d1d7db] text-sm md:text-base border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-emerald-500 shadow-sm max-h-32 resize-none text-right scroll-smooth custom-scrollbar relative z-10"
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

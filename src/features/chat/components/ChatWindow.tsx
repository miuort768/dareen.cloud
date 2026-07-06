import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { 
    Send, MoreVertical, ChevronRight, 
    CheckCheck, ArrowDown, Search
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Virtuoso } from 'react-virtuoso';
import { Image } from '../../../shared/components/ui';
import { cn } from '../../../lib/utils';
import { useChatStore } from '../../../store/chatStore';
import type { Conversation, ChatMessage } from '../../../types/chat.types';
import type { User } from '../../../types/auth';

interface ChatWindowProps {
    selectedConv: Conversation;
    messages: ChatMessage[];
    isLoadingMessages?: boolean;
    isMessagesError?: boolean;
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
    isLoadingMessages,
    isMessagesError,
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
    const virtuosoRef = useRef<{ scrollToIndex: (params: { index: number; behavior?: ScrollBehavior }) => void }>(null);
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const typingUsers = useChatStore(s => s.typingUsers);
    const lastTypingEmitRef = useRef(0);

    // Safer and more efficient message sorting + Searching
    const filteredMessages = useMemo(() => {
        let list = [...messages].sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            if (isNaN(timeA)) return 1;
            if (isNaN(timeB)) return -1;
            return timeA - timeB;
        });

        if (searchQuery.trim()) {
            list = list.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        return list;
    }, [messages, searchQuery]);

    const scrollToBottom = useCallback(() => {
        if (filteredMessages.length > 0) {
            virtuosoRef.current?.scrollToIndex({
                index: filteredMessages.length - 1,
                behavior: 'smooth'
            });
        }
    }, [filteredMessages]);

    useEffect(() => {
        if (selectedConv?.id && 'unreadCount' in selectedConv && selectedConv.unreadCount > 0) {
            markAsRead(selectedConv.id);
        } else if (selectedConv?.id && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.senderId !== currentUser?.id) {
                markAsRead(selectedConv.id);
            }
        }
    }, [selectedConv, messages, markAsRead, currentUser?.id]);

    const typingInThisConv = typingUsers.filter(u => u.conversationId === selectedConv.id);

    return (
        <div className="flex-1 flex flex-col bg-background dark:bg-card overflow-hidden relative h-full">
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
            <header className="sticky top-0 h-[60px] shrink-0 bg-surface dark:bg-card flex items-center justify-between px-4 z-[50] shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSelectedConv(null)}
                        className="lg:hidden p-1 text-muted"
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div 
                        className={cn("w-10 h-10 rounded-full overflow-hidden", selectedConv.isGroup && currentUser?.role === 'admin' ? "cursor-pointer" : "")}
                        onClick={() => selectedConv.isGroup && currentUser?.role === 'admin' && openGroupSettings()}
                    >
                        <Image src="/chat-avatar.jpg" alt="avatar" className="w-full h-full" />
                    </div>

                    <div className="flex flex-col text-right">
                        <h2 className={cn(
                            "font-medium text-main leading-tight truncate max-w-[150px] md:max-w-[300px]",
                            selectedConv.isGroup ? "text-sm" : "text-base"
                        )}>
                            {selectedConv.displayName}
                        </h2>
                        {typingInThisConv.length > 0 ? (
                            <span className="text-xs text-success font-normal animate-pulse">جاري الكتابة...</span>
                        ) : (
                            <span className="text-xs text-muted dark:text-muted font-normal">
                                {selectedConv.isGroup ? "مجموعة" : "محادثة مباشرة"}
                            </span>
                        )}
                    </div>
                </div>

                {currentUser?.role === 'admin' && (
                    <div className="flex items-center gap-5 text-muted">
                        <div className={cn(
                            "flex items-center bg-white/10 dark:bg-black/20 rounded-full px-3 py-1 transition-all",
                            showSearchBar ? "w-40 md:w-64 opacity-100" : "w-0 opacity-0 overflow-hidden p-0"
                        )}>
                            {showSearchBar && (
                                <input 
                                    type="text"
                                    placeholder="بحث..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none text-xs text-right w-full focus:ring-0 placeholder:text-muted"
                                    autoFocus
                                />
                            )}
                        </div>
                        <button 
                            onClick={() => {
                                setShowSearchBar(!showSearchBar);
                                if (showSearchBar) setSearchQuery('');
                            }}
                            className={cn(
                                "p-2 rounded-full transition-colors",
                                showSearchBar ? "bg-primary text-on-primary" : "hover:bg-black/5 dark:hover:bg-white/5"
                            )}
                        >
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
                                        className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-card shadow-sm z-[100] py-2 rounded-md"
                                    >
                                        <button
                                            onClick={() => { openGroupSettings(); setShowMoreMenu(false); }}
                                            className="w-full text-right px-4 py-3 text-sm text-muted hover:bg-hover dark:hover:bg-hover transition-colors"
                                        >
                                            معلومات المحادثة
                                        </button>
                                        {selectedConv.isGroup && (
                                            <button
                                                onClick={() => { openGroupSettings(); setShowMoreMenu(false); }}
                                                className="w-full text-right px-4 py-3 text-sm text-muted dark:text-main hover:bg-hover dark:hover:bg-hover transition-colors font-normal"
                                            >
                                                تعديل المجموعة
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { confirmDeleteConversation(selectedConv); setShowMoreMenu(false); }}
                                            className="w-full text-right px-4 py-3 text-sm text-error hover:bg-hover dark:hover:bg-hover transition-colors"
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

            {/* Messages - Virtualized Scroll for Performance */}
            <div className="flex-1 relative z-10">
                {isMessagesError ? (
                    <div className="flex items-center justify-center h-full text-muted dark:text-muted text-sm px-4">
                        تعذر تحميل الرسائل. حاول مرة أخرى.
                    </div>
                ) : isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-2 border-success/30 border-t-success rounded-full animate-spin" />
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted dark:text-muted text-sm px-4">
                        لا توجد رسائل بعد. ابدأ المحادثة الآن.
                    </div>
                ) : (
                    <Virtuoso
                        ref={virtuosoRef}
                        data={filteredMessages}
                        initialTopMostItemIndex={filteredMessages.length - 1}
                        followOutput="smooth"
                        className="custom-scrollbar"
                        style={{ height: '100%', width: '100%' }}
                        components={{
                            Footer: () => <div className="h-4" />
                        }}
                        atBottomStateChange={(atBottom) => {
                            setShowScrollBottom(!atBottom);
                        }}
                        itemContent={(index, msg) => {
                            const isMe = String(msg.senderId) === String(currentUser?.id);
                            const isGroup = selectedConv.isGroup;
                            
                            return (
                                <div 
                    className={cn(
                        "flex w-full mb-1 px-3 md:px-10 lg:px-20",
                        index === 0 && "pt-4",
                        isMe ? "justify-start" : "justify-end"
                    )}
                                >
                                    <div className={cn(
                                        "max-w-[90%] md:max-w-[75%] px-3 py-1.5 shadow-sm relative",
                                        isMe 
                                            ? "bg-success-light dark:bg-success rounded-[7.5px] rounded-tr-none mr-2" 
                                            : "bg-white dark:bg-card rounded-[7.5px] rounded-tl-none ml-2"
                                    )}>
                                        {isGroup && !isMe && (
                                            <span className="block text-xs font-normal text-primary mb-0.5 text-right">
                                                {msg.senderName}
                                            </span>
                                        )}

                                        <div className="text-sm text-main leading-[1.4] whitespace-pre-wrap text-right tracking-tight">
                                            {msg.content}
                                        </div>
                                        
                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            <span className="text-micro text-muted">
                                                {msg.timestamp && !isNaN(new Date(msg.timestamp).getTime()) 
                                                    ? format(new Date(msg.timestamp), 'h:mm a', { locale: ar })
                                                    : '--:--'}
                                            </span>
                                            {isMe && (
                                                <div className="flex">
                                                    {msg.readAt ? (
                                                        <CheckCheck size={14} className="text-info" />
                                                    ) : (
                                                        <CheckCheck size={14} className="text-muted" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }}
                    />
                )}
            </div>

            {/* Scroll to Bottom Button */}
            <AnimatePresence>
                {showScrollBottom && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={scrollToBottom}
                        className="absolute bottom-20 left-6 w-10 h-10 bg-white dark:bg-card text-muted rounded-full shadow-sm flex items-center justify-center z-20 hover:bg-hover dark:hover:bg-hover"
                    >
                        <ArrowDown size={20} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Input Bar - Standardized Style */}
            <footer className="bg-surface dark:bg-card px-3 py-3 z-10 flex items-center gap-3">
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
                                const now = Date.now();
                                const lastSent = lastTypingEmitRef.current;
                                if (now - lastSent > 2000 || (val.length > 0 && lastSent === 0)) {
                                    setTyping(selectedConv.id, val.length > 0, currentUser.name);
                                    lastTypingEmitRef.current = val.length > 0 ? now : 0;
                                } else if (val.length === 0) {
                                    setTyping(selectedConv.id, false, currentUser.name);
                                    lastTypingEmitRef.current = 0;
                                }
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e as unknown as React.FormEvent);
                                // Reset height
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                            }
                        }}
                        placeholder="اكتب رسالة"
                        className="w-full bg-white dark:bg-card text-main text-sm md:text-base border-none rounded-none px-4 py-3 focus:ring-1 focus:ring-success shadow-sm max-h-32 resize-none text-right scroll-smooth custom-scrollbar relative z-10 overflow-y-auto"
                    />
                </div>

                <div className="flex items-center justify-center shrink-0">
                    <button
                        onClick={handleSendMessage}
                        className="bg-success text-on-primary p-3.5 rounded-none hover:brightness-90 transition-all shadow-sm active:scale-95 flex items-center justify-center h-[48px] w-[48px]"
                        title="إرسال"
                    >
                        <Send size={20} className={cn("transition-transform", isSending && "animate-pulse")} />
                    </button>
                </div>
            </footer>

        </div>
    );
};

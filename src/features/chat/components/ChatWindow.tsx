import React, { useRef, useEffect, useState } from 'react';
import { Send, Smile, MoreVertical, Edit2, Trash2, ChevronRight, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../../../lib/utils';
import { useChatContext } from '../../../context/ChatContext';
import EmojiPicker, { Theme } from 'emoji-picker-react';
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
    setTyping
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { typingUsers } = useChatContext();
    const isChatOnly = currentUser?.role === 'chat_user';
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Don't close if clicking the emoji button itself
            if (target.closest('.emoji-toggle-btn')) return;

            if (emojiPickerRef.current && !emojiPickerRef.current.contains(target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const onEmojiClick = (emojiData: any) => {
        setNewMessage(newMessage + emojiData.emoji);
    };

    const typingInThisConv = typingUsers.filter(u => u.conversationId === selectedConv.id);

    return (
        <div className={cn(
            "flex-1 flex flex-col bg-white dark:bg-[#0b141a] overflow-hidden lg:rounded-2xl shadow-2xl border border-white/20 dark:border-gray-800/50",
            !isChatOnly && "pb-[80px] lg:pb-0"
        )}>
            {/* Chat Header */}
            <div className="h-16 lg:h-20 shrink-0 border-b border-gray-100 dark:border-gray-800/50 flex items-center justify-between bg-white/80 dark:bg-[#202c33]/90 backdrop-blur-md sticky top-0 z-50 px-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSelectedConv(null)}
                        className="lg:hidden p-2 -mr-1 text-gray-500 hover:text-primary-600 transition-colors active:scale-95"
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div className="relative group cursor-pointer" onClick={() => selectedConv.isGroup && openGroupSettings()}>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-gray-700 transition-transform group-hover:scale-105 overflow-hidden">
                            <img src="/chat-avatar.jpg?v=1" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    </div>

                    <div className="min-w-0 flex-1">
                        <h2 className="font-medium text-[#111b21] dark:text-[#e9edef] leading-tight truncate text-sm lg:text-base">
                            {selectedConv.displayName}
                        </h2>
                        <div className="flex items-center gap-1.5 h-4">
                            {typingInThisConv.length > 0 ? (
                                <p className="text-[11px] text-emerald-500 font-bold animate-pulse italic">
                                    {typingInThisConv.length === 1
                                        ? `${typingInThisConv[0].userName} يكتب الآن...`
                                        : `${typingInThisConv.length} أشخاص يكتبون...`}
                                </p>
                            ) : (
                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">متصل الآن</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary-600 transition-all rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <MoreVertical size={20} />
                        </button>
                        {showMoreMenu && (
                            <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-[#233138] border border-gray-100 dark:border-gray-700/50 shadow-2xl z-[100] rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                {selectedConv.isGroup && currentUser?.role === 'admin' && (
                                    <div className="p-1.5 space-y-1">
                                        <button
                                            onClick={() => { openGroupSettings(); setShowMoreMenu(false); }}
                                            className="w-full text-right px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                                <Edit2 size={16} className="text-primary-600" />
                                            </div>
                                            تعديل المجموعة
                                        </button>
                                        <button
                                            onClick={() => { confirmDeleteConversation(selectedConv); setShowMoreMenu(false); }}
                                            className="w-full text-right px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                                <Trash2 size={16} />
                                            </div>
                                            حذف المجموعة
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Learning Time Action Bar - Elegant & Side-aligned */}
            <div className="shrink-0 flex justify-start px-4 lg:px-6 py-2 bg-transparent z-40">
                <button
                    className="group relative px-6 py-2 bg-white dark:bg-[#202c33] rounded-none border-r-4 border-primary-600 shadow-[2px_10px_15px_-3px_rgba(0,0,0,0.1)] hover:shadow-[5px_15px_25px_-5px_rgba(0,0,0,0.15)] hover:translate-x-[-2px] active:translate-x-[1px] transition-all duration-300 flex items-center gap-3 overflow-hidden"
                >
                    {/* Glowing effect inside */}
                    <div className="absolute inset-0 bg-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
                    <span className="text-[12px] font-black text-gray-800 dark:text-gray-100 uppercase tracking-[2px] relative z-10">وقت التعلم</span>

                    {/* Floating Shimmer */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-[#efe7de] dark:bg-[#0b141a] custom-scrollbar relative">
                <div
                    className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08] pointer-events-none"
                    style={{ backgroundImage: 'url("https://wweb.static.whatsapp.net/img/v2/bg-chat-tile-light_62fc4a2963ad5a1d257b90a6e2e29307.png")', backgroundRepeat: 'repeat', backgroundSize: '400px' }}
                />
                <div className="relative z-10 space-y-6">
                    {messages.map((msg, idx) => {
                        const isMe = msg.senderId === currentUser?.id;
                        const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

                        return (
                            <div key={msg.id || idx} className={cn(
                                "flex flex-col",
                                isMe ? "items-start" : "items-end"
                            )}>
                                <div className={cn(
                                    "flex items-end gap-2 max-w-[85%] lg:max-w-[70%] group",
                                    isMe ? "flex-row-reverse" : "flex-row"
                                )}>
                                    <div className={cn(
                                        "px-3.5 py-2 rounded-2xl relative shadow-md transition-all hover:shadow-lg",
                                        isMe
                                            ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-none"
                                            : "bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-none border border-gray-100/50 dark:border-transparent"
                                    )}>
                                        {!isMe && showAvatar && (
                                            <span className="block text-[11px] font-black text-primary-600 dark:text-primary-400 mb-1 leading-none">
                                                {msg.senderName}
                                            </span>
                                        )}
                                        <p className="text-[14px] lg:text-[15.5px] leading-relaxed whitespace-pre-wrap font-medium">
                                            {msg.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) => (
                                                part.match(/^https?:\/\/[^\s]+$/) ? (
                                                    <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 underline decoration-2 underline-offset-4 hover:opacity-80 break-all transition-opacity">
                                                        {part}
                                                    </a>
                                                ) : part
                                            ))}
                                        </p>
                                        <div className={cn(
                                            "flex items-center gap-1.5 mt-1 justify-end opacity-60",
                                            isMe ? "text-[#111b21]" : "text-gray-500 dark:text-gray-400"
                                        )}>
                                            <span className="text-[9px] font-bold">
                                                {format(new Date(msg.timestamp), 'HH:mm', { locale: ar })}
                                            </span>
                                            {isMe && <div className="w-3 h-3 flex items-center justify-center"><CheckCheck size={12} className="text-primary-600 font-black" /></div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 lg:p-4 bg-[#f0f2f5] dark:bg-[#111b21] shrink-0 border-t border-gray-100 dark:border-gray-800/50 relative">
                {showEmojiPicker && (
                    <div
                        className="absolute bottom-full left-0 right-0 lg:left-4 lg:right-auto mb-2 z-[200] flex justify-center lg:justify-start px-2 lg:px-0"
                        ref={emojiPickerRef}
                    >
                        <div className="w-full max-w-[350px] lg:w-auto shadow-2xl rounded-2xl overflow-hidden">
                            <EmojiPicker
                                onEmojiClick={onEmojiClick}
                                theme={document.documentElement.classList.contains('dark') ? Theme.DARK : Theme.LIGHT}
                                autoFocusSearch={false}
                                searchPlaceholder="ابحث عن ايموجي..."
                                previewConfig={{ showPreview: false }}
                                width="100%"
                                height={350}
                            />
                        </div>
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-3 lg:gap-4 max-w-[1000px] mx-auto relative">
                    <div className="flex-1 flex items-center gap-2 bg-white dark:bg-[#2a3942] pl-4 pr-2 py-2 rounded-2xl shadow-lg border border-transparent focus-within:border-primary-500/30 transition-all">
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={cn(
                                "p-2 rounded-full transition-colors emoji-toggle-btn",
                                showEmojiPicker ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20" : "text-gray-400 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                            placeholder="اكتب رسالتك..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] lg:text-[16px] font-medium py-1.5 px-0 text-[#111b21] dark:text-[#e9edef] placeholder-gray-400"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className={cn(
                            "w-12 h-12 flex items-center justify-center rounded-full shadow-xl transition-all active:scale-90 shrink-0",
                            newMessage.trim()
                                ? "bg-[#00a884] text-white hover:bg-[#008f72] shadow-[#00a884]/20"
                                : "bg-gray-300 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                        )}
                    >
                        <Send size={22} className={cn("transition-transform", newMessage.trim() && "translate-x-0.5 -translate-y-0.5")} />
                    </button>
                </form>
            </div>
        </div>
    );
};

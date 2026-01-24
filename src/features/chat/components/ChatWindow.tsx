import React, { useRef, useEffect, useState } from 'react';
import { Send, Smile, Share2, MoreVertical, Edit2, Trash2, ChevronRight, MonitorPlay } from 'lucide-react';
import { socketService } from '../../../lib/socket';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../../../lib/utils';
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
    typingUsers: any[];
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
    typingUsers,
    setTyping
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [activeClasses, setActiveClasses] = useState<string[]>([]);
    const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

    useEffect(() => {
        const socket = socketService.getSocket();

        const handleStatusChange = (classes: string[]) => {
            setActiveClasses(classes);
        };

        socket.on('class_status_change', handleStatusChange);
        socket.emit('check_class_status');

        return () => {
            socket.off('class_status_change', handleStatusChange);
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const isChatOnly = currentUser?.role === 'chat_user';

    return (
        <div className={cn(
            "flex-1 flex flex-col bg-white dark:bg-gray-950 overflow-hidden relative",
            !isChatOnly && "pb-[80px] lg:pb-0" // Space for mobile bottom nav (exactly 80px)
        )}>
            {/* Chat Header */}
            <div className="h-16 lg:h-20 shrink-0 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-[#f0f2f5] dark:bg-[#202c33] sticky top-0 z-50 shadow-sm px-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSelectedConv(null)}
                        className="lg:hidden p-3 -mr-2 text-gray-500 hover:text-primary-600 transition-colors active:scale-95"
                        title="رجوع"
                    >
                        <ChevronRight size={24} />
                    </button>
                    <div className="relative shrink-0">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center font-black text-base lg:text-lg shadow-sm border border-white dark:border-gray-700">
                            {selectedConv.displayName?.charAt(0)}
                        </div>
                        <div className="absolute bottom-0 left-0 w-3 h-3 bg-emerald-500 border-2 border-[#f0f2f5] dark:border-[#202c33] rounded-full"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="font-bold text-[#111b21] dark:text-[#e9edef] leading-tight truncate text-xs lg:text-[16px]">{selectedConv.displayName}</h2>

                        {/* Virtual Class Button */}
                        <div className="flex items-center gap-4 mt-0.5">
                            {(isTeacher || activeClasses.includes(selectedConv.id)) && (
                                <button
                                    onClick={() => (window as any).toggleMeeting?.(selectedConv.id)}
                                    className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-600/20 rounded-full transition-all group active:scale-95"
                                >
                                    <MonitorPlay size={12} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-tight">دخول الفصل المباشر</span>
                                </button>
                            )}

                            {typingUsers.filter(u => u.conversationId === selectedConv.id).length > 0 ? (
                                <p className="text-[11px] lg:text-[12px] text-emerald-600 dark:text-[#8696a0] font-medium italic animate-pulse">يكتب الآن...</p>
                            ) : (
                                <p className="text-[11px] lg:text-[12px] text-gray-500 dark:text-[#8696a0] font-medium">متصل الآن</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 relative" ref={menuRef}>

                    <button
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-all rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <MoreVertical size={20} />
                    </button>

                    {showMoreMenu && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl z-50 rounded-2xl overflow-hidden backdrop-blur-xl">
                            {selectedConv.isGroup && currentUser?.role === 'admin' && (
                                <>
                                    <button
                                        onClick={() => { openGroupSettings(); setShowMoreMenu(false); }}
                                        className="w-full text-right p-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-primary-50 flex items-center gap-2"
                                    >
                                        <Edit2 size={16} className="text-primary-600" />
                                        تعديل المجموعة
                                    </button>
                                    <button
                                        onClick={() => { confirmDeleteConversation(selectedConv); setShowMoreMenu(false); }}
                                        className="w-full text-right p-3 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        حذف المجموعة
                                    </button>
                                </>
                            )}
                            <button
                                className="w-full text-right p-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Share2 size={16} className="text-emerald-600" />
                                مشاركة
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#efe7de] dark:bg-[#0b141a] custom-scrollbar overscroll-contain relative">
                {/* Subtle WhatsApp Pattern Overlay (using a pseudo-element) */}
                <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] pointer-events-none"
                    style={{ backgroundImage: 'url("https://wweb.static.whatsapp.net/img/v2/bg-chat-tile-light_62fc4a2963ad5a1d257b90a6e2e29307.png")', backgroundRepeat: 'repeat' }}></div>

                <div className="relative z-10 space-y-4">
                    {messages.map((msg, idx) => {
                        const isMe = msg.senderId === currentUser?.id;
                        const showDate = idx === 0 ||
                            new Date(msg.timestamp).toLocaleDateString() !== new Date(messages[idx - 1].timestamp).toLocaleDateString();

                        return (
                            <div key={msg.id || idx} className="space-y-2">
                                {showDate && (
                                    <div className="flex justify-center my-4">
                                        <span className="px-3 py-1 bg-white/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 text-[10px] font-bold text-gray-500 rounded-full">
                                            {format(new Date(msg.timestamp), 'eeee, d MMMM yyyy', { locale: ar })}
                                        </span>
                                    </div>
                                )}
                                <div className={cn(
                                    "flex items-end gap-2 max-w-[90%] lg:max-w-[75%]",
                                    isMe ? "mr-auto flex-row-reverse" : "ml-auto flex-row"
                                )}>
                                    {!isMe && (
                                        <div className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-primary-600">
                                            {msg.senderName?.charAt(0)}
                                        </div>
                                    )}
                                    <div className={cn(
                                        "px-4 py-2 rounded-2xl relative shadow-sm max-w-full",
                                        isMe
                                            ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-none"
                                            : "bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-none"
                                    )}>
                                        {/* Bubble Tail */}
                                        <div className={cn(
                                            "absolute top-0 w-4 h-4",
                                            isMe
                                                ? "-left-2 bg-[#d9fdd3] dark:bg-[#005c4b] [clip-path:polygon(100%_0,0_0,100%_100%)] hidden" // Me tail (simple version)
                                                : "-right-2 bg-white dark:bg-[#202c33] [clip-path:polygon(0_0,100%_0,0_100%)] hidden"
                                        )} />
                                        <div className={cn(
                                            "flex items-center justify-between gap-4 mb-1 border-b border-current border-opacity-5 pb-1",
                                            isMe ? "text-[#005c4b]/50 dark:text-emerald-300/30" : "text-gray-400"
                                        )}>
                                            <span className="text-[10px] font-black truncate max-w-[120px]">
                                                {isMe ? 'أنت' : msg.senderName}
                                            </span>
                                            <span className="text-[9px] font-bold opacity-70">
                                                {format(new Date(msg.timestamp), 'HH:mm', { locale: ar })}
                                            </span>
                                        </div>
                                        <p className="text-[13px] lg:text-[15px] leading-relaxed whitespace-pre-wrap font-medium" dir="auto">
                                            {msg.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                                                part.match(/https?:\/\/[^\s]+/) ? (
                                                    <a
                                                        key={i}
                                                        href={part}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={cn(
                                                            "underline break-all",
                                                            isMe ? "text-white/90 hover:text-white" : "text-primary-600 hover:text-primary-700"
                                                        )}
                                                    >
                                                        {part}
                                                    </a>
                                                ) : part
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div ref={messagesEndRef} />
            </div>


            {/* Input Area */}
            <div className="p-3 bg-[#f0f2f5] dark:bg-[#111b21] shrink-0 border-t border-gray-100 dark:border-gray-800">
                <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2 max-w-[950px] mx-auto"
                >
                    <div className="flex-1 flex items-center gap-2 bg-white dark:bg-[#2a3942] p-2 rounded-2xl shadow-sm">
                        <button
                            type="button"
                            className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
                        >
                            <Smile size={24} />
                        </button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                if (currentUser) {
                                    setTyping(selectedConv.id, e.target.value.length > 0, currentUser.name);
                                }
                            }}
                            onBlur={() => {
                                if (currentUser) {
                                    setTyping(selectedConv.id, false, currentUser.name);
                                }
                            }}
                            placeholder="اكتب رسالتك..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] font-medium py-1 px-1 text-[#111b21] dark:text-[#e9edef] placeholder-gray-400"
                            disabled={isSending}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className={cn(
                            "w-12 h-12 flex items-center justify-center bg-[#00a884] text-white rounded-full shadow-lg active:scale-90 transition-all shrink-0",
                            (!newMessage.trim() || isSending) && "opacity-50 grayscale"
                        )}
                    >
                        <Send size={22} className="relative left-[1px]" />
                    </button>
                </form>
            </div>
        </div>
    );
};

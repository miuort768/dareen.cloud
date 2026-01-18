import React, { useRef, useEffect } from 'react';
import { Send, Smile, Share2, MoreVertical, Edit2, Trash2, Phone, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../../../lib/utils';
import type { Conversation, ChatMessage } from '../../../types/chat.types';
import type { User } from '../../../types/auth';
import { MeetingActions } from './MeetingActions';
import { socketService } from '../../../lib/socket';
import { useState } from 'react';
import { useMeeting } from '../../../context/MeetingContext';

interface ChatWindowProps {
    selectedConv: Conversation;
    messages: ChatMessage[];
    newMessage: string;
    setNewMessage: (val: string) => void;
    handleSendMessage: (e: React.FormEvent) => void;
    sendMessage: (p: { conversationId: string, content: string, senderId: string, senderName: string }) => void;
    isSending: boolean;
    currentUser: User | null;
    setSelectedConv: (val: Conversation | null) => void;
    openGroupSettings: () => void;
    confirmDeleteConversation: (conv: Conversation) => void;
    showMoreMenu: boolean;
    setShowMoreMenu: (val: boolean) => void;
    menuRef: React.RefObject<HTMLDivElement>;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    selectedConv,
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    sendMessage,
    isSending,
    currentUser,
    setSelectedConv,
    openGroupSettings,
    confirmDeleteConversation,
    showMoreMenu,
    setShowMoreMenu,
    menuRef
}) => {
    const { startMeeting } = useMeeting();
    const [isMeetingActive, setIsMeetingActive] = useState(false);
    const socket = useRef(socketService.getSocket()).current;

    useEffect(() => {
        const handleStatusChange = ({ conversationId, isActive }: { conversationId: string, isActive: boolean }) => {
            if (conversationId === selectedConv.id) {
                setIsMeetingActive(isActive);
            }
        };

        socket.on('meeting_status_changed', handleStatusChange);

        // Initial reset for new conversation
        setIsMeetingActive(false);

        return () => {
            socket.off('meeting_status_changed', handleStatusChange);
        };
    }, [selectedConv.id, socket]);

    const handleStartMeetingLocal = () => {
        // If teacher/admin, send a notification message and notify server
        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'teacher')) {
            sendMessage({
                conversationId: selectedConv.id,
                content: "🎥 بدأت الحصة الآن، اضغط على زر الكاميرا بالأعلى للانضمام إلى البث المباشر.",
                senderId: currentUser.id,
                senderName: currentUser.name
            });
            socket.emit('meeting_started', selectedConv.id);
        }
        startMeeting(selectedConv.id);
    };
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-950 pb-20 lg:pb-0 overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 lg:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl sticky top-0 z-40 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedConv(null)}
                        className="lg:hidden p-2 -mr-1 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                        <ChevronRight size={28} />
                    </button>
                    <div className="relative group">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl flex items-center justify-center font-black text-base lg:text-lg shadow-lg shadow-primary-600/20 group-hover:scale-105 transition-transform">
                            {selectedConv.displayName?.charAt(0)}
                        </div>
                        <div className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                    </div>
                    <div>
                        <h2 className="font-black text-gray-900 dark:text-white leading-tight tracking-tight lg:text-lg">{selectedConv.displayName}</h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">متصل الآن</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 lg:gap-2 relative" ref={menuRef}>
                    <MeetingActions
                        selectedConv={selectedConv}
                        currentUser={currentUser}
                        onStartMeeting={handleStartMeetingLocal}
                        isMeetingActive={isMeetingActive}
                    />

                    {selectedConv.isGroup && currentUser?.role === 'admin' && (
                        <div className="hidden lg:flex items-center gap-1">
                            <button
                                onClick={openGroupSettings}
                                className="p-3 text-gray-400 hover:text-primary-600 transition-all rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/10"
                                title="إعدادات المجموعة"
                            >
                                <Edit2 size={20} />
                            </button>
                            <button
                                onClick={() => confirmDeleteConversation(selectedConv)}
                                className="p-3 text-gray-400 hover:text-rose-600 transition-all rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/10"
                                title="حذف المجموعة"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )}
                    <button className="hidden lg:block p-3 text-gray-400 hover:text-primary-600 transition-all rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Phone size={20} />
                    </button>
                    <button
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        className="p-3 text-gray-400 hover:text-primary-600 transition-all rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <MoreVertical size={20} />
                    </button>

                    {showMoreMenu && (
                        <div className="absolute top-full left-0 mt-3 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl z-[110] rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 backdrop-blur-xl">
                            {selectedConv.isGroup ? (
                                <>
                                    {currentUser?.role === 'admin' && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    openGroupSettings();
                                                    setShowMoreMenu(false);
                                                }}
                                                className="w-full text-right p-4 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/10 flex items-center gap-3 transition-colors"
                                            >
                                                <Edit2 size={16} className="text-primary-600" />
                                                تعديل المجموعة
                                            </button>
                                            <button
                                                onClick={() => {
                                                    confirmDeleteConversation(selectedConv);
                                                    setShowMoreMenu(false);
                                                }}
                                                className="w-full text-right p-4 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 flex items-center gap-3 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                                حذف المجموعة
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                currentUser?.role === 'admin' && (
                                    <button
                                        onClick={() => {
                                            confirmDeleteConversation(selectedConv);
                                            setShowMoreMenu(false);
                                        }}
                                        className="w-full text-right p-4 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 flex items-center gap-3 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                        حذف المحادثة
                                    </button>
                                )
                            )}
                            <div className="border-t border-gray-100 dark:border-gray-800"></div>
                            <button
                                className="w-full text-right p-4 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
                            >
                                <Share2 size={16} className="text-emerald-600" />
                                مشاركة المحادثة
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-gray-50/30 dark:bg-gray-950/30 custom-scrollbar overscroll-contain">
                {messages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUser?.id;
                    const showTime = idx === 0 ||
                        new Date(msg.timestamp).toLocaleDateString() !== new Date(messages[idx - 1].timestamp).toLocaleDateString();

                    return (
                        <div key={msg.id || idx} className="space-y-2 animate-in fade-in slide-in-from-bottom-1 duration-500">
                            {showTime && (
                                <div className="flex justify-center my-6 relative">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-gray-200/50 dark:border-gray-800/50"></div>
                                    </div>
                                    <span className="relative px-4 py-1.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-100 dark:border-gray-800 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest shadow-sm rounded-full">
                                        {format(new Date(msg.timestamp), 'eeee, d MMMM yyyy', { locale: ar })}
                                    </span>
                                </div>
                            )}
                            <div className={cn(
                                "flex items-end gap-2 max-w-[85%] lg:max-w-[70%]",
                                isMe ? "mr-auto flex-row-reverse" : "ml-auto flex-row"
                            )}>
                                {!isMe && (
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 flex-shrink-0 flex items-center justify-center text-[9px] font-black text-primary-600 dark:text-primary-400 border border-white dark:border-gray-800 shadow-sm mb-0.5">
                                        {msg.senderName?.charAt(0)}
                                    </div>
                                )}
                                <div className={cn(
                                    "px-4 py-2.5 relative group transition-all duration-300 min-w-[140px]",
                                    isMe
                                        ? "bg-gradient-to-br from-primary-600 to-indigo-700 text-white shadow-md shadow-primary-600/10 rounded-2xl rounded-tr-none hover:shadow-lg hover:shadow-primary-600/20"
                                        : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-800 rounded-2xl rounded-tl-none hover:border-primary-500/30"
                                )}>
                                    {/* Bubble Header */}
                                    <div className={cn(
                                        "flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-current border-opacity-10",
                                        isMe ? "text-primary-100" : "text-gray-400"
                                    )}>
                                        <span className="text-[9px] font-black uppercase tracking-tight truncate max-w-[100px]">
                                            {msg.senderName}
                                        </span>
                                        <span className="text-[9px] font-bold tracking-tighter whitespace-nowrap">
                                            {format(new Date(msg.timestamp), 'HH:mm', { locale: ar })}
                                        </span>
                                    </div>

                                    <p className="text-[13px] font-bold leading-relaxed whitespace-pre-wrap selection:bg-white/30">{msg.content}</p>

                                    {/* Glass reflection effect for "me" messages */}
                                    {isMe && (
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 lg:p-10 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-950 dark:via-gray-950 dark:to-transparent border-t border-gray-100 dark:border-gray-800">
                <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2 lg:p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-none focus-within:border-primary-500/50 group transition-all"
                >
                    <button
                        type="button"
                        className="p-3 text-gray-400 hover:text-primary-600 transition-colors rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        <Smile size={24} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="اكتب رسالتك الجميلة هنا..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold py-4 px-2 dark:text-white placeholder:text-gray-400"
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className={cn(
                            "w-14 h-14 flex items-center justify-center transition-all bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-xl shadow-primary-600/30 active:scale-95 rounded-xl",
                            (!newMessage.trim() || isSending) && "opacity-50 grayscale cursor-not-allowed shadow-none"
                        )}
                    >
                        <Send size={24} className={cn("transition-transform", isSending && "translate-x-12 opacity-0")} />
                    </button>
                </form>
            </div>
        </div>
    );
};

import React, { useRef, useEffect, useState } from 'react';
import { Send, Smile, Share2, MoreVertical, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../../../lib/utils';
import type { Conversation, ChatMessage } from '../../../types/chat.types';
import type { User } from '../../../types/auth';
import { MeetingActions } from './MeetingActions';
import { socketService } from '../../../lib/socket';
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
        setIsMeetingActive(false);

        return () => {
            socket.off('meeting_status_changed', handleStatusChange);
        };
    }, [selectedConv.id, socket]);

    const handleStartMeetingLocal = () => {
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

    const isChatOnly = currentUser?.role === 'chat_user';

    return (
        <div className={cn(
            "flex-1 flex flex-col bg-white dark:bg-gray-950 overflow-hidden relative",
            !isChatOnly && "pb-[80px] lg:pb-0" // Space for mobile bottom nav (exactly 80px)
        )}>
            {/* Chat Header */}
            <div className="h-16 lg:h-20 shrink-0 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl sticky top-0 z-40 transition-all shadow-sm px-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSelectedConv(null)}
                        className="lg:hidden p-1 -mr-1 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                        <ChevronRight size={24} />
                    </button>
                    <div className="relative shrink-0 hidden lg:block">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl flex items-center justify-center font-black text-base lg:text-lg shadow-lg">
                            {selectedConv.displayName?.charAt(0)}
                        </div>
                        <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="font-black text-gray-900 dark:text-white leading-tight truncate text-xs lg:text-base max-w-[150px] lg:max-w-none">{selectedConv.displayName}</h2>
                        <div className="flex items-center gap-1.5">
                            <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">متصل</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 relative" ref={menuRef}>
                    <MeetingActions
                        selectedConv={selectedConv}
                        currentUser={currentUser}
                        onStartMeeting={handleStartMeetingLocal}
                        isMeetingActive={isMeetingActive}
                    />

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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/10 dark:bg-gray-950/10 custom-scrollbar overscroll-contain">
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
                                    "px-3 py-2 rounded-2xl relative",
                                    isMe
                                        ? "bg-gradient-to-br from-primary-600 to-indigo-700 text-white rounded-tr-none shadow-sm"
                                        : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-800"
                                )}>
                                    <div className={cn(
                                        "flex items-center justify-between gap-4 mb-1 border-b border-current border-opacity-10 pb-1",
                                        isMe ? "text-primary-100" : "text-gray-400"
                                    )}>
                                        <span className="text-[10px] font-black truncate max-w-[120px]">{msg.senderName}</span>
                                        <span className="text-[10px] font-bold opacity-70">{format(new Date(msg.timestamp), 'HH:mm', { locale: ar })}</span>
                                    </div>
                                    <p className="text-[13px] font-bold leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 shrink-0">
                <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800"
                >
                    <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                        <Smile size={20} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="اكتب رسالتك..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold py-2 px-1 dark:text-white"
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className={cn(
                            "w-10 h-10 flex items-center justify-center bg-primary-600 text-white rounded-xl shadow-lg active:scale-95 transition-all",
                            (!newMessage.trim() || isSending) && "opacity-50 grayscale"
                        )}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

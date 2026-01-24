import React, { useRef, useEffect, useState } from 'react';
import { Send, Smile, MoreVertical, Edit2, Trash2, ChevronRight, Video, ExternalLink } from 'lucide-react';
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
    setTyping: (convId: string, isTyping: boolean, name: string) => void;
    toggleLiveStatus: (data: { id: string, isLive: boolean, meetingUrl?: string }) => Promise<any>;
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
    toggleLiveStatus
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
    const [isEditingMeeting, setIsEditingMeeting] = useState(false);
    const [meetingUrl, setMeetingUrl] = useState(selectedConv.meetingUrl || '');

    useEffect(() => {
        setMeetingUrl(selectedConv.meetingUrl || '');
    }, [selectedConv]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleToggleLive = async () => {
        const nextStatus = !selectedConv.isLive;
        if (nextStatus && !meetingUrl.trim()) {
            alert('يرجى إدخال رابط الاجتماع أولاً');
            return;
        }

        try {
            await toggleLiveStatus({
                id: selectedConv.id,
                isLive: nextStatus,
                meetingUrl: meetingUrl.trim()
            });
            setIsEditingMeeting(false);
        } catch (error) {
            console.error('Error toggling live status:', error);
        }
    };

    const isChatOnly = currentUser?.role === 'chat_user';

    return (
        <div className={cn(
            "flex-1 flex flex-col bg-white dark:bg-gray-950 overflow-hidden relative",
            !isChatOnly && "pb-[80px] lg:pb-0"
        )}>
            {/* Chat Header */}
            <div className="h-16 lg:h-24 shrink-0 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-[#f0f2f5] dark:bg-[#202c33] sticky top-0 z-50 shadow-sm px-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSelectedConv(null)}
                        className="lg:hidden p-3 -mr-2 text-gray-500 hover:text-primary-600 transition-colors active:scale-95"
                        title="رجوع"
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div className="relative shrink-0">
                        <div className="w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full flex items-center justify-center font-black text-lg lg:text-xl shadow-lg border-2 border-white dark:border-gray-700">
                            {selectedConv.displayName?.charAt(0)}
                        </div>
                        <div className={cn(
                            "absolute -bottom-1 -left-1 w-4 h-4 border-2 border-[#f0f2f5] dark:border-[#202c33] rounded-full",
                            selectedConv.isLive ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
                        )}></div>
                    </div>

                    <div className="min-w-0 flex-1">
                        <h2 className="font-black text-[#111b21] dark:text-[#e9edef] leading-tight truncate text-sm lg:text-[18px]">{selectedConv.displayName}</h2>

                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            {selectedConv.isLive ? (
                                <a
                                    href={selectedConv.meetingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-all shadow-md active:scale-95 animate-bounce-subtle"
                                >
                                    <Video size={14} />
                                    <span className="text-[10px] font-black">انضم للاجتماع الآن</span>
                                    <ExternalLink size={10} />
                                </a>
                            ) : (
                                <div className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                    <span>لا يوجد اجتماع حالي</span>
                                </div>
                            )}

                            {isTeacher && (
                                <button
                                    onClick={() => setIsEditingMeeting(!isEditingMeeting)}
                                    className="p-1 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                    title="إعدادات الاجتماع"
                                >
                                    <Edit2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isTeacher && isEditingMeeting && (
                        <div className="hidden lg:flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm animate-in fade-in slide-in-from-right duration-300">
                            <input
                                type="text"
                                value={meetingUrl}
                                onChange={(e) => setMeetingUrl(e.target.value)}
                                placeholder="رابط اجتماع Zoom..."
                                className="bg-transparent border-none text-[12px] font-bold outline-none min-w-[200px] text-gray-700 dark:text-gray-200"
                            />
                            <button
                                onClick={handleToggleLive}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-[11px] font-black transition-all",
                                    selectedConv.isLive ? "bg-rose-600 text-white" : "bg-primary-600 text-white"
                                )}
                            >
                                {selectedConv.isLive ? "إنهاء البث" : "بدء البث"}
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-1 relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className="p-2 text-gray-400 hover:text-primary-600 transition-all rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <MoreVertical size={20} />
                        </button>
                        {showMoreMenu && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl z-50 rounded-2xl overflow-hidden backdrop-blur-xl">
                                {isTeacher && (
                                    <button
                                        onClick={() => { setIsEditingMeeting(true); setShowMoreMenu(false); }}
                                        className="w-full text-right p-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-primary-50 flex items-center gap-2"
                                    >
                                        <Video size={16} className="text-primary-600" />
                                        إعدادات البث المباشر
                                    </button>
                                )}
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
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* If Mobile and editing meeting, show full area Overlay */}
            {isTeacher && isEditingMeeting && (
                <div className="lg:hidden p-4 bg-primary-50 dark:bg-primary-900/10 border-b border-primary-100 dark:border-primary-900/20 animate-in slide-in-from-top">
                    <p className="text-[11px] font-black text-primary-700 dark:text-primary-400 mb-2">إعدادات البث المباشر (Zoom)</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={meetingUrl}
                            onChange={(e) => setMeetingUrl(e.target.value)}
                            placeholder="ضع رابط الاجتماع هنا..."
                            className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl text-xs font-bold"
                        />
                        <button onClick={handleToggleLive} className={cn("px-4 py-2 rounded-xl text-xs font-black", selectedConv.isLive ? "bg-rose-600 text-white" : "bg-emerald-600 text-white")}>
                            {selectedConv.isLive ? "إغلاق" : "بدء"}
                        </button>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#efe7de] dark:bg-[#0b141a] custom-scrollbar relative">
                <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] pointer-events-none"
                    style={{ backgroundImage: 'url("https://wweb.static.whatsapp.net/img/v2/bg-chat-tile-light_62fc4a2963ad5a1d257b90a6e2e29307.png")', backgroundRepeat: 'repeat' }}></div>
                <div className="relative z-10 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={msg.id || idx} className="space-y-2">
                            <div className={cn(
                                "flex items-end gap-2 max-w-[90%] lg:max-w-[75%]",
                                msg.senderId === currentUser?.id ? "mr-auto flex-row-reverse" : "ml-auto flex-row"
                            )}>
                                <div className={cn(
                                    "px-4 py-2 rounded-2xl relative shadow-sm max-w-full",
                                    msg.senderId === currentUser?.id
                                        ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-none"
                                        : "bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-none"
                                )}>
                                    <div className="flex items-center justify-between gap-4 mb-1 border-b border-current border-opacity-5 pb-1 text-[10px]">
                                        <span className="font-black">{msg.senderId === currentUser?.id ? 'أنت' : msg.senderName}</span>
                                        <span className="font-bold opacity-70">{format(new Date(msg.timestamp), 'HH:mm', { locale: ar })}</span>
                                    </div>
                                    <p className="text-[13px] lg:text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[#f0f2f5] dark:bg-[#111b21] shrink-0 border-t border-gray-100 dark:border-gray-800">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-[950px] mx-auto">
                    <div className="flex-1 flex items-center gap-2 bg-white dark:bg-[#2a3942] p-2 rounded-2xl shadow-sm">
                        <button type="button" className="p-1.5 text-gray-400 hover:text-primary-600"><Smile size={24} /></button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                if (currentUser) setTyping(selectedConv.id, e.target.value.length > 0, currentUser.name);
                            }}
                            placeholder="اكتب رسالتك..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] font-medium py-1 px-1 text-[#111b21] dark:text-[#e9edef] placeholder-gray-400"
                        />
                    </div>
                    <button type="submit" disabled={!newMessage.trim() || isSending} className="w-12 h-12 flex items-center justify-center bg-[#00a884] text-white rounded-full shadow-lg active:scale-90 transition-all shrink-0">
                        <Send size={22} className="relative left-[1px]" />
                    </button>
                </form>
            </div>
        </div>
    );
};

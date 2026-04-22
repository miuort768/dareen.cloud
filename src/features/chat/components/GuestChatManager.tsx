import { useState } from 'react';
import { useChat } from '../../../hooks/useChat';
import { MessageSquare, User, Clock, Send, ChevronLeft } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface GuestChatManagerProps {
    adminId: string;
}

export const GuestChatManager = ({ adminId }: GuestChatManagerProps) => {
    const { conversations, useMessages, sendMessage, isSending } = useChat(adminId);
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    // Filter conversations to only show guest chats
    // Guest chats were initialized with name "زائر (guest_id)"
    const guestConvs = conversations.filter(c => 
        c.displayName?.includes('زائر') || 
        c.members.some(m => m.startsWith('guest_'))
    ).sort((a, b) => 
        new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime()
    );

    const selectedConv = guestConvs.find(c => c.id === selectedConvId);
    const { data: messages = [] } = useMessages(selectedConvId || undefined);

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedConvId) return;

        sendMessage({
            conversationId: selectedConvId,
            content: replyText.trim(),
            senderId: adminId,
            senderName: 'الإدارة'
        });
        setReplyText('');
    };

    return (
        <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none shadow-sm overflow-hidden flex flex-col md:flex-row h-[600px]">
            {/* Conversations List */}
            <div className={cn(
                "w-full md:w-80 border-l border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/30 dark:bg-slate-900/50",
                selectedConvId && "hidden md:flex"
            )}>
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <h3 className="font-black text-[13px] text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                            <MessageSquare size={16} className="text-[#5c59f2]" />
                        </div>
                        محادثات الزوار النشطة
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {guestConvs.length > 0 ? guestConvs.map(conv => (
                        <button
                            key={conv.id}
                            onClick={() => setSelectedConvId(conv.id)}
                            className={cn(
                                "w-full p-4 text-right border-b border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 relative group",
                                selectedConvId === conv.id ? "bg-white dark:bg-slate-800 border-r-4 border-r-[#5c59f2]" : ""
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-[12px] text-slate-900 dark:text-white truncate max-w-[150px]">
                                    {conv.displayName}
                                </span>
                                {conv.unreadCount ? (
                                    <span className="w-2 h-2 bg-[#5c59f2] rounded-full animate-pulse shadow-[0_0_8px_rgba(92,89,242,0.6)]"></span>
                                ) : (
                                    <Clock size={10} className="text-slate-400" />
                                )}
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                                {conv.lastMessage || 'لا توجد رسائل بعد'}
                            </p>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronLeft size={14} className="text-[#5c59f2]" />
                            </div>
                        </button>
                    )) : (
                        <div className="p-12 text-center flex flex-col items-center gap-4 opacity-30 grayscale">
                            <User size={32} className="text-slate-400" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">لا توجد محادثات نشطة</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={cn(
                "flex-1 flex flex-col bg-white dark:bg-slate-950",
                !selectedConvId && "hidden md:flex"
            )}>
                {selectedConv ? (
                    <>
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedConvId(null)} className="md:hidden p-1 text-[#5c59f2]">
                                    <ChevronLeft size={20} className="rotate-180" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                        <User size={18} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{selectedConv.displayName}</h4>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                            <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">متصل الآن</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-900/30">
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === adminId;
                                return (
                                    <div key={msg.id || idx} className={cn(
                                        "flex flex-col max-w-[85%]",
                                        isMe ? "mr-auto items-start" : "ml-auto items-end"
                                    )}>
                                        <div className={cn(
                                            "px-4 py-2.5 text-[12px] font-medium shadow-sm transition-all",
                                            isMe 
                                                ? "bg-[#5c59f2] text-white rounded-2xl rounded-tl-none" 
                                                : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tr-none"
                                        )}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[8px] mt-2 opacity-40 font-bold uppercase tracking-wider px-1">
                                            {format(new Date(msg.timestamp), 'HH:mm', { locale: ar })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <form onSubmit={handleSendReply} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                            <input 
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 text-[13px] font-medium outline-none focus:border-[#5c59f2] dark:focus:border-[#5c59f2] rounded-none transition-all placeholder:text-slate-400"
                                placeholder="اكتب ردك للزائر هنا..."
                            />
                            <button 
                                type="submit"
                                disabled={!replyText.trim() || isSending}
                                className="px-8 bg-[#5c59f2] hover:bg-indigo-700 text-white font-black uppercase text-[11px] tracking-widest transition-all flex items-center gap-2 disabled:opacity-50 rounded-none shadow-lg shadow-indigo-500/20 active:scale-95"
                            >
                                {isSending ? <Clock className="animate-spin" size={14} /> : <Send size={14} />}
                                إرسال الرد
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30 grayscale">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
                            <MessageSquare size={40} className="text-slate-400" />
                        </div>
                        <h4 className="font-black text-xl text-slate-800 dark:text-white uppercase tracking-tighter">مركز إدارة المحادثات</h4>
                        <p className="max-w-[280px] mx-auto text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                            اختر محادثة من القائمة الجانبية للبدء في مراسلة زوار الموقع وتقديم الدعم الفوري لهم.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

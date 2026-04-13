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
        <div className="mt-12 bg-white dark:bg-gray-950 border-4 border-gray-900 dark:border-gray-800 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row h-[600px]">
            {/* Conversations List */}
            <div className={cn(
                "w-full md:w-80 border-l-4 border-gray-900 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-gray-900/50",
                selectedConvId && "hidden md:flex"
            )}>
                <div className="p-5 border-b-2 border-gray-900 dark:border-gray-800 bg-primary-600 text-white shadow-inner">
                    <h3 className="font-black text-sm uppercase tracking-tighter flex items-center gap-3">
                        <MessageSquare size={20} strokeWidth={3} /> محادثات الزوار النشطة
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {guestConvs.length > 0 ? guestConvs.map(conv => (
                        <button
                            key={conv.id}
                            onClick={() => setSelectedConvId(conv.id)}
                            className={cn(
                                "w-full p-4 text-right border-b border-gray-200 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-800 relative group",
                                selectedConvId === conv.id ? "bg-white dark:bg-gray-800 ring-2 ring-inset ring-primary-600" : ""
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-black text-xs text-gray-900 dark:text-white truncate max-w-[150px]">
                                    {conv.displayName}
                                </span>
                                {conv.unreadCount ? (
                                    <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></span>
                                ) : (
                                    <Clock size={10} className="text-gray-400" />
                                )}
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold truncate">
                                {conv.lastMessage || 'لا توجد رسائل بعد'}
                            </p>
                            <div className="absolute left-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronLeft size={14} className="text-primary-600" />
                            </div>
                        </button>
                    )) : (
                        <div className="p-10 text-center flex flex-col items-center gap-4 opacity-30">
                            <User size={40} />
                            <p className="text-[10px] font-black uppercase tracking-widest">لا توجد محادثات زوار حالياً</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={cn(
                "flex-1 flex flex-col",
                !selectedConvId && "hidden md:flex"
            )}>
                {selectedConv ? (
                    <>
                        <div className="p-4 border-b-2 border-gray-900 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-950">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedConvId(null)} className="md:hidden p-1 text-primary-600">
                                    <ChevronLeft size={20} className="rotate-180" />
                                </button>
                                <div>
                                    <h4 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight">{selectedConv.displayName}</h4>
                                    <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> متصل الآن
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 dark:bg-gray-900/30">
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === adminId;
                                return (
                                    <div key={msg.id || idx} className={cn(
                                        "flex flex-col max-w-[85%]",
                                        isMe ? "mr-auto items-start" : "ml-auto items-end"
                                    )}>
                                        <div className={cn(
                                            "px-4 py-2 rounded-2xl text-xs font-bold shadow-sm",
                                            isMe 
                                                ? "bg-black text-white rounded-tl-none" 
                                                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-900/10 dark:border-gray-700/50 rounded-tr-none"
                                        )}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[8px] mt-1 opacity-40 font-mono tracking-tighter">
                                            {format(new Date(msg.timestamp), 'HH:mm (yyyy/MM/dd)', { locale: ar })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <form onSubmit={handleSendReply} className="p-4 bg-white dark:bg-gray-950 border-t-2 border-gray-900 dark:border-gray-800 flex gap-3">
                            <input 
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="flex-1 bg-gray-50 dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-800 p-3 text-xs font-bold outline-none focus:ring-4 ring-primary-600/10 transition-all"
                                placeholder="اكتب ردك للزائر هنا..."
                            />
                            <button 
                                type="submit"
                                disabled={!replyText.trim() || isSending}
                                className="px-6 bg-primary-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSending ? <Clock className="animate-spin" size={14} /> : <Send size={14} />}
                                إرسال
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-20">
                        <MessageSquare size={60} strokeWidth={1} />
                        <h4 className="font-black text-lg mt-4 uppercase tracking-tighter">مركز إدارة محادثات الزوار</h4>
                        <p className="max-w-[250px] mx-auto text-xs font-bold mt-2">اختر محادثة من القائمة الجانبية للبدء في مراسلة زوار الموقع</p>
                    </div>
                )}
            </div>
        </div>
    );
};

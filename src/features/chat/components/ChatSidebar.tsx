import React, { useState } from 'react';
import { 
    Search, Plus, Trash2, Edit2, LogOut, 
    Bell, BellOff, UserCircle, ShieldCheck,
    Zap, Terminal, LayoutDashboard
} from 'lucide-react';
import { useChatContext } from '../../../context/ChatContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import type { Conversation, ChatView } from '../../../types/chat.types';
import type { User } from '../../../types/auth';

interface ChatSidebarProps {
    conversations: Conversation[];
    selectedConv: Conversation | null;
    setSelectedConv: (conv: Conversation | null) => void;
    currentUser: User | null;
    openGroupSettings: (conv: Conversation) => void;
    confirmDeleteConversation: (conv: Conversation) => void;
    setShowNewChatModal: (val: boolean) => void;
    confirmDeleteAllConversations: () => void;
    setIsEditingGroup: (val: boolean) => void;
    logout: () => void;
    requestDesktopNotifications: () => Promise<boolean>;
    typingUsers: any[];
    view: ChatView;
    setView: (view: ChatView) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
    conversations,
    selectedConv,
    setSelectedConv,
    currentUser,
    openGroupSettings,
    confirmDeleteConversation,
    setShowNewChatModal,
    confirmDeleteAllConversations,
    setIsEditingGroup,
    logout,
    requestDesktopNotifications,
    typingUsers,
    view,
    setView
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { isConnected } = useChatContext();
    const [isNotificationGranted, setIsNotificationGranted] = React.useState(
        'Notification' in window && Notification.permission === 'granted'
    );

    const confirmDeleteAllConversationsLocal = () => {
        if (window.confirm('هل أنت متأكد من حذف كافة المحادثات؟ لا يمكن التراجع عن هذه الخطوة.')) {
            confirmDeleteAllConversations();
        }
    };

    const filteredConversations = conversations.filter(c =>
        (c.displayName || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );

    return (
        <div className={cn(
            "w-full lg:w-[420px] flex flex-col bg-white dark:bg-[#0b141a] lg:border-8 border-gray-950 transition-all duration-500 ease-in-out shrink-0 overflow-hidden relative z-20",
            selectedConv ? "hidden lg:flex" : "flex"
        )}>
            {/* Sidebar Header - Brutalist Command Box */}
            <div className="p-8 bg-white border-b-8 border-gray-950 relative overflow-hidden text-right">
                <div className="absolute top-0 right-0 w-32 h-full bg-primary-600/5 -skew-x-12 translate-x-10 pointer-events-none"></div>
                
                <div className="flex items-start justify-between mb-10 relative z-10 flex-row-reverse">
                    <div className="flex items-center gap-5 flex-row-reverse">
                        <motion.div 
                            whileHover={{ rotate: -5, scale: 1.05 }}
                            className="w-16 h-16 bg-gray-950 text-white border-2 border-gray-950 shadow-[6px_6px_0px_0px_#ef4444] flex items-center justify-center transform -rotate-3"
                        >
                            <Terminal size={32} />
                        </motion.div>
                        <div className="text-right">
                            <h1 className="text-3xl font-black text-gray-950 tracking-tighter uppercase leading-none italic">مركز الرسائل</h1>
                            <div className="flex items-center gap-2 mt-3 p-1 bg-emerald-50 border border-emerald-500 w-fit ml-auto">
                                <div className={cn(
                                    "w-2 h-2",
                                    isConnected ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" : "bg-rose-500"
                                )} />
                                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest leading-none">
                                    {isConnected ? 'متصل: نشط' : 'غير متصل'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                         <button
                            onClick={logout}
                            className="w-12 h-12 bg-rose-500 text-white border-4 border-gray-950 flex items-center justify-center hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none shadow-[4px_4px_0px_0px_black] transition-all"
                            title="خروج آمن"
                        >
                            <LogOut size={22} />
                        </button>
                    </div>
                </div>

                <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-4 flex-row-reverse">
                        <div className="flex items-center gap-2 flex-row-reverse">
                            <button
                                onClick={async () => {
                                    const success = await requestDesktopNotifications();
                                    if (success) setIsNotificationGranted(true);
                                }}
                                className={cn(
                                    "w-12 h-12 border-4 border-gray-950 flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1",
                                    isNotificationGranted ? "bg-emerald-400 text-gray-950" : "bg-white text-gray-300"
                                )}
                            >
                                {isNotificationGranted ? <Bell size={20} /> : <BellOff size={20} />}
                            </button>

                            {currentUser?.role === 'admin' && (
                                <button
                                    onClick={() => setView(view === 'chat' ? 'management' : 'chat')}
                                    className={cn(
                                        "w-12 h-12 border-4 border-gray-950 flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1",
                                        view === 'management' ? "bg-primary-600 text-white" : "bg-white text-gray-400"
                                    )}
                                >
                                    {view === 'management' ? <LayoutDashboard size={20}/> : <ShieldCheck size={20} />}
                                </button>
                            )}
                        </div>

                        {currentUser?.role === 'admin' && (
                            <div className="flex gap-2 flex-1 flex-row-reverse">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setIsEditingGroup(false);
                                        setShowNewChatModal(true);
                                    }}
                                    className="flex-1 bg-gray-950 text-white py-4 border-4 border-gray-950 shadow-[4px_4px_0px_0px_#ef4444] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                                >
                                    <Plus size={18} />
                                    محادثة استراتيجية
                                </motion.button>
                                <button
                                    onClick={confirmDeleteAllConversationsLocal}
                                    className="w-14 h-14 bg-white border-4 border-gray-950 text-rose-600 hover:bg-rose-500 hover:text-white transition-all shadow-[4px_4px_0px_0px_black] flex items-center justify-center"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-950" size={20} />
                        <input
                            type="text"
                            placeholder="ابحث عن زميل أو مجموعة..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border-4 border-gray-950 px-12 py-4 text-sm font-black focus:bg-yellow-50 outline-none transition-all placeholder:text-gray-300 text-right"
                        />
                    </div>
                </div>
            </div>

            {/* Conversations List - Brutalist Cards */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-gray-50/50">
                <AnimatePresence>
                    {filteredConversations.length > 0 ? (
                        filteredConversations.map((conv, idx) => (
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={conv.id}
                                onClick={() => setSelectedConv(conv)}
                                className={cn(
                                    "w-full p-5 flex items-center gap-5 border-4 border-gray-950 transition-all text-right relative group flex-row-reverse",
                                    selectedConv?.id === conv.id
                                        ? "bg-white shadow-[8px_8px_0px_0px_#ef4444] translate-x-1 -translate-y-1"
                                        : "bg-white hover:bg-yellow-50 shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                                )}
                            >
                                <div className="relative shrink-0">
                                    <div className="w-16 h-16 bg-gray-950 border-2 border-gray-950 shadow-[4px_4px_0px_0px_black] group-hover:rotate-6 transition-transform overflow-hidden">
                                        <img src={conv.isGroup ? "/group-avatar.png" : "/chat-avatar.jpg"} alt="الصورة الشخصية" className="w-full h-full object-cover grayscale group-hover:grayscale-0" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-gray-950" />
                                </div>

                                <div className="flex-1 min-w-0 text-right">
                                    <div className="flex items-center justify-between mb-2 flex-row-reverse">
                                        <h3 className={cn(
                                            "font-black truncate text-base lg:text-lg transition-colors tracking-tighter uppercase italic",
                                            selectedConv?.id === conv.id ? "text-primary-600" : "text-gray-950"
                                        )}>
                                            {conv.displayName}
                                        </h3>
                                        {conv.lastMessageTime && (
                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                                {format(new Date(conv.lastMessageTime), 'HH:mm', { locale: ar })}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between gap-4 flex-row-reverse">
                                        <div className="text-[12px] text-gray-500 truncate font-bold flex-1 leading-snug flex items-center gap-2 min-h-[20px] justify-end">
                                            {typingUsers.filter(u => u.conversationId === conv.id).length > 0 ? (
                                                <span className="text-emerald-500 animate-pulse font-black flex items-center gap-2 flex-row-reverse">
                                                    <Zap size={12} className="fill-current" /> جاري التشفير...
                                                </span>
                                            ) : (
                                                <span className="truncate opacity-60 text-right truncate w-full">{conv.lastMessage || 'تم فتح القناة. لا توجد رسائل بعد.'}</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0 flex-row-reverse">
                                            {(conv.unreadCount ?? 0) > 0 && (
                                                <motion.div 
                                                    animate={{ rotate: [0, 5, -5, 0] }}
                                                    transition={{ repeat: Infinity, duration: 1 }}
                                                    className="bg-primary-600 text-white text-[10px] font-black w-8 h-8 border-2 border-gray-950 flex items-center justify-center shadow-[3px_3px_0px_0px_black]"
                                                >
                                                    {(conv.unreadCount ?? 0) > 99 ? 'الأقصى' : conv.unreadCount}
                                                </motion.div>
                                            )}

                                            {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all flex-row-reverse">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openGroupSettings(conv);
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-950 hover:bg-primary-50 active:scale-90"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            confirmDeleteConversation(conv);
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-950 text-rose-600 hover:bg-rose-50 active:scale-90"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        ))
                    ) : (
                        <div className="py-20 border-8 border-dashed border-gray-200 flex flex-col items-center justify-center text-center opacity-40">
                            <UserCircle size={80} strokeWidth={4} className="text-gray-200 mb-6" />
                            <h3 className="text-2xl font-black text-gray-200 uppercase italic tracking-tighter">قنوات مغلقة</h3>
                            <p className="text-[10px] font-bold mt-2 uppercase tracking-widest">لا توجد محادثات نشطة في القطاع</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

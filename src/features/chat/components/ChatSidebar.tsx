import React, { useState } from 'react';
import { 
    Search, Plus, Trash2, Edit2, LogOut, MessageCircle, 
    Bell, BellOff, UserCircle, ShieldCheck, Activity
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
            "w-full lg:w-[420px] flex flex-col bg-white dark:bg-[#111b21] lg:rounded-[32px] lg:shadow-2xl border border-white/20 dark:border-gray-800/50 transition-all duration-500 ease-in-out shrink-0 overflow-hidden relative z-20",
            selectedConv ? "hidden lg:flex" : "flex"
        )}>
            {/* Sidebar Header */}
            <div className="p-6 bg-white/60 dark:bg-[#111b21]/60 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800/20">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <motion.div 
                            whileHover={{ rotate: 5, scale: 1.05 }}
                            className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-[20px] flex items-center justify-center text-white shadow-2xl shadow-primary-500/30"
                        >
                            <MessageCircle size={28} />
                        </motion.div>
                        <div>
                            <h1 className="text-2xl font-black text-[#111b21] dark:text-[#e9edef] tracking-tight uppercase leading-none">محادثاتي</h1>
                            <div className="flex items-center gap-2 mt-2 leading-none">
                                <div className={cn(
                                    "w-2.5 h-2.5 rounded-full",
                                    isConnected ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-rose-500"
                                )} />
                                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[1.5px] leading-none">
                                    {isConnected ? 'متصل بالشبكة' : 'جارٍ الاتصال...'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={async () => {
                                const success = await requestDesktopNotifications();
                                if (success) setIsNotificationGranted(true);
                            }}
                            className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all bg-gray-50 dark:bg-[#202c33] hover:scale-105 active:scale-95",
                                isNotificationGranted ? "text-emerald-500" : "text-gray-400"
                            )}
                            title={isNotificationGranted ? "التنبيهات مفعلة" : "تفعيل التنبيهات"}
                        >
                            {isNotificationGranted ? <Bell size={18} /> : <BellOff size={18} />}
                        </button>

                        {currentUser?.role === 'admin' && (
                            <button
                                onClick={() => setView(view === 'chat' ? 'management' : 'chat')}
                                className={cn(
                                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                                    view === 'management' ? "bg-primary-600 text-white" : "bg-gray-50 dark:bg-[#202c33] text-gray-400 hover:text-primary-600"
                                )}
                                title={view === 'management' ? "العودة للدردشة" : "إعدادات الأمان"}
                            >
                                <ShieldCheck size={18} />
                            </button>
                        )}
                        
                        <button
                            onClick={logout}
                            className="w-10 h-10 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-2xl flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all shadow-sm"
                            title="خروج آمن"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="relative group">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="ابحث عن زميل أو مجموعة..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50/50 dark:bg-[#2a3942] border-none px-12 py-3.5 text-sm font-black focus:ring-2 ring-primary-500/20 outline-none rounded-2xl dark:text-white dark:placeholder-gray-500 transition-all"
                        />
                    </div>
                    
                    {currentUser?.role === 'admin' && (
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setIsEditingGroup(false);
                                    setShowNewChatModal(true);
                                }}
                                className="flex-1 bg-primary-600 text-white py-3 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20 font-black text-xs uppercase tracking-widest transition-all"
                            >
                                <Plus size={18} />
                                محادثة جديدة
                            </motion.button>
                            <button
                                onClick={confirmDeleteAllConversationsLocal}
                                className="w-12 h-12 bg-rose-600/10 text-rose-600 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-xl"
                                title="تصفير القائمة"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                <AnimatePresence>
                    {filteredConversations.length > 0 ? (
                        filteredConversations.map((conv, idx) => (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={conv.id}
                                onClick={() => setSelectedConv(conv)}
                                className={cn(
                                    "w-full p-4 flex items-center gap-4 rounded-3xl transition-all text-right group relative border-2 border-transparent",
                                    selectedConv?.id === conv.id
                                        ? "bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/30"
                                        : "hover:bg-gray-50 dark:hover:bg-[#202c33]/50"
                                )}
                            >
                                <div className="relative shrink-0">
                                    <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-[20px] flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-xl group-hover:scale-105 group-hover:rotate-3 transition-transform overflow-hidden">
                                        <img src={conv.isGroup ? "/group-avatar.png" : "/chat-avatar.jpg"} alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-1 -left-1 w-4.5 h-4.5 bg-emerald-500 border-[3px] border-white dark:border-[#111b21] rounded-full shadow-sm" />
                                </div>

                                <div className="flex-1 min-w-0 text-right">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <h3 className={cn(
                                            "font-black truncate text-sm lg:text-[15px] transition-colors tracking-tight",
                                            selectedConv?.id === conv.id ? "text-primary-700 dark:text-primary-400" : "text-gray-900 dark:text-[#e9edef]"
                                        )}>
                                            {conv.displayName}
                                        </h3>
                                        {conv.lastMessageTime && (
                                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                                {format(new Date(conv.lastMessageTime), 'HH:mm', { locale: ar })}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                        <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-bold flex-1 leading-tight flex items-center gap-1.5 min-h-[16px]">
                                            {typingUsers.filter(u => u.conversationId === conv.id).length > 0 ? (
                                                <span className="text-emerald-500 animate-pulse italic flex items-center gap-1 font-black">
                                                    <Activity size={10} /> جاري الكتابة...
                                                </span>
                                            ) : (
                                                <span className="truncate">{conv.lastMessage || 'ابدأ الحديث الآن...'}</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {(conv.unreadCount ?? 0) > 0 && (
                                                <motion.div 
                                                    animate={{ scale: [1, 1.1, 1] }}
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                    className="bg-emerald-500 text-white text-[10px] font-black min-w-[22px] h-[22px] rounded-lg flex items-center justify-center px-1.5 shadow-xl shadow-emerald-500/30"
                                                >
                                                    {(conv.unreadCount ?? 0) > 99 ? '+99' : conv.unreadCount}
                                                </motion.div>
                                            )}

                                            {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
                                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openGroupSettings(conv);
                                                        }}
                                                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-primary-600 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-all active:scale-90"
                                                        title="تعديل"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            confirmDeleteConversation(conv);
                                                        }}
                                                        className="w-7 h-7 flex items-center justify-center text-rose-400 hover:text-rose-600 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-all active:scale-90"
                                                        title="حذف"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50/50 dark:bg-transparent rounded-[32px] m-4 border-2 border-dashed border-gray-200 dark:border-gray-800">
                            <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-[28px] flex items-center justify-center mb-6 text-gray-200 dark:text-gray-700 shadow-inner">
                                <UserCircle size={56} strokeWidth={1} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">القائمة خالية</h3>
                            <p className="text-[11px] text-gray-500 font-bold max-w-[180px] leading-relaxed">لم يبدأ أحد بمحادثتك بعد، كن أنت المبادر بالتواصل!</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

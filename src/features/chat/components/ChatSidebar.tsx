import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit2, LogOut, MessageCircle, Bell, BellOff, Smile, Settings } from 'lucide-react';
import { useChatContext } from '../../../context/ChatContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
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
            "w-full lg:w-[380px] flex flex-col bg-white dark:bg-[#111b21] lg:rounded-2xl lg:shadow-2xl border border-white/20 dark:border-gray-800/50 transition-all duration-500 ease-in-out shrink-0 overflow-hidden",
            selectedConv ? "hidden lg:flex" : "flex"
        )}>
            {/* Sidebar Header */}
            <div className="p-4 lg:p-6 bg-white dark:bg-[#111b21] border-b border-gray-100 dark:border-gray-800/50">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 transition-transform hover:scale-105 active:scale-95">
                            <MessageCircle size={26} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-[#111b21] dark:text-[#e9edef] tracking-tight">الدردشات</h1>
                            <div className="flex items-center gap-1.5 leading-none mt-1">
                                <div className={cn(
                                    "w-2 h-2 rounded-full animate-pulse",
                                    isConnected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-rose-500"
                                )} />
                                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none">
                                    {isConnected ? 'متصل' : 'جارٍ الاتصال...'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={async () => {
                                const success = await requestDesktopNotifications();
                                if (success) setIsNotificationGranted(true);
                            }}
                            className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-800",
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
                                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                                    view === 'management' ? "bg-primary-600 text-white" : "text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                                )}
                                title={view === 'management' ? "العودة للدردشة" : "إدارة المستخدمين"}
                            >
                                <Settings size={18} />
                            </button>
                        )}

                        <div className="flex items-center gap-1">
                            {currentUser?.role === 'admin' && (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsEditingGroup(false);
                                            setShowNewChatModal(true);
                                        }}
                                        className="w-9 h-9 bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-primary-700 hover:scale-105 active:scale-95 transition-all"
                                        title="محادثة جديدة"
                                    >
                                        <Plus size={20} />
                                    </button>
                                    <button
                                        onClick={confirmDeleteAllConversationsLocal}
                                        className="w-9 h-9 bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-rose-700 hover:scale-105 active:scale-95 transition-all"
                                        title="حذف كافة المحادثات"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </>
                            )}

                            <button
                                onClick={logout}
                                className="w-9 h-9 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all"
                                title="تسجيل الخروج"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative group">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="ابحث عن محادثة..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#202c33] border-none px-12 py-3 text-sm font-bold focus:ring-2 ring-primary-500/20 outline-none rounded-xl dark:text-white dark:placeholder-gray-500 transition-all"
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 lg:p-3 space-y-1">
                {filteredConversations.length > 0 ? (
                    filteredConversations.map(conv => (
                        <button
                            key={conv.id}
                            onClick={() => setSelectedConv(conv)}
                            className={cn(
                                "w-full p-4 flex items-center gap-4 rounded-xl transition-all text-right group relative",
                                selectedConv?.id === conv.id
                                    ? "bg-primary-50 dark:bg-primary-900/20 shadow-sm"
                                    : "hover:bg-gray-50 dark:hover:bg-[#202c33]/50"
                            )}
                        >
                            {selectedConv?.id === conv.id && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary-600 rounded-l-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                            )}

                            <div className="relative shrink-0">
                                <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                                    <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#111b21] rounded-full shadow-sm" />
                            </div>

                            <div className="flex-1 min-w-0 text-right">
                                <div className="flex items-center justify-between mb-1.5">
                                    <h3 className={cn(
                                        "font-black truncate text-sm lg:text-base transition-colors",
                                        selectedConv?.id === conv.id ? "text-primary-700 dark:text-primary-400" : "text-gray-900 dark:text-[#e9edef]"
                                    )}>
                                        {conv.displayName}
                                    </h3>
                                    {conv.lastMessageTime && (
                                        <span className="text-[10px] text-gray-400 font-bold uppercase whitespace-nowrap">
                                            {format(new Date(conv.lastMessageTime), 'HH:mm', { locale: ar })}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-bold flex-1 leading-tight">
                                        {typingUsers.filter(u => u.conversationId === conv.id).length > 0 ? (
                                            <span className="text-emerald-500 animate-pulse italic flex items-center gap-1">
                                                <Smile size={12} /> يكتب الآن...
                                            </span>
                                        ) : (
                                            conv.lastMessage || 'لا توجد رسائل بعد'
                                        )}
                                    </p>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {(conv.unreadCount ?? 0) > 0 && (
                                            <div className="bg-emerald-500 text-white text-[10px] font-black min-w-[22px] h-[22px] rounded-lg flex items-center justify-center px-1.5 shadow-lg shadow-emerald-500/20 animate-in zoom-in duration-300">
                                                {(conv.unreadCount ?? 0) > 99 ? '+99' : conv.unreadCount}
                                            </div>
                                        )}

                                        {currentUser?.role === 'admin' && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openGroupSettings(conv);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-white dark:hover:bg-gray-700 rounded-lg shadow-sm transition-colors"
                                                    title="تعديل"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        confirmDeleteConversation(conv);
                                                    }}
                                                    className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg shadow-sm transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50/50 dark:bg-transparent rounded-3xl m-4">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-4 text-gray-300 dark:text-gray-700">
                            <MessageCircle size={40} />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">لا توجد محادثات</h3>
                        <p className="text-xs text-gray-500 font-bold max-w-[150px]">ابدأ محادثة جديدة للتواصل مع فريقك</p>
                    </div>
                )}
            </div>
        </div>
    );
};

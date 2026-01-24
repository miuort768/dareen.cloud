import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit2, LogOut, MessageCircle, Bell, BellOff } from 'lucide-react';
import { useChatContext } from '../../../context/ChatContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../../../lib/utils';
import type { Conversation } from '../../../types/chat.types';
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
    typingUsers
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

    return (
        <div className={cn(
            "w-full lg:w-[350px] flex flex-col bg-[#f0f2f5] dark:bg-[#111b21] border-l border-gray-100 dark:border-gray-800 transition-all duration-500 ease-in-out shrink-0",
            selectedConv ? "hidden lg:flex" : "flex"
        )}>
            {/* Sidebar Header */}
            <div className="p-4 bg-[#f0f2f5] dark:bg-[#111b21] border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary-600 rounded-none flex items-center justify-center text-white shadow-lg">
                            <MessageCircle size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-[#111b21] dark:text-[#e9edef] tracking-tight">محادثات دارين</h1>
                            <div className="flex items-center gap-1.5 leading-none">
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full animate-pulse",
                                    isConnected ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "bg-rose-500"
                                )} />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">
                                    {isConnected ? 'متصل' : 'جارٍ الاتصال...'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={async () => {
                                const success = await requestDesktopNotifications();
                                if (success) setIsNotificationGranted(true);
                            }}
                            className={cn(
                                "w-10 h-10 rounded-none flex items-center justify-center transition-all",
                                isNotificationGranted ? "text-emerald-500" : "text-gray-400 hover:text-primary-600"
                            )}
                            title={isNotificationGranted ? "تم تفعيل التنبيهات" : "تفعيل تنبيهات سطح المكتب"}
                        >
                            {isNotificationGranted ? <Bell size={20} /> : <BellOff size={20} />}
                        </button>
                        <button
                            onClick={() => {
                                logout();
                                window.location.href = '/#/login';
                            }}
                            className="w-10 h-10 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-none flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all"
                            title="تسجيل الخروج"
                        >
                            <LogOut size={20} />
                        </button>
                        {currentUser?.role === 'admin' && (
                            <button
                                onClick={() => {
                                    setIsEditingGroup(false);
                                    setShowNewChatModal(true);
                                }}
                                className="w-10 h-10 bg-primary-600 text-white rounded-none flex items-center justify-center shadow-lg hover:bg-primary-700 active:scale-95 transition-all"
                                title="محادثة جديدة"
                            >
                                <Plus size={24} />
                            </button>
                        )}
                        {currentUser?.role === 'admin' && conversations.length > 0 && (
                            <button
                                onClick={confirmDeleteAllConversationsLocal}
                                className="w-10 h-10 bg-rose-600 text-white rounded-none flex items-center justify-center shadow-lg hover:bg-rose-700 active:scale-95 transition-all"
                                title="حذف كافة المحادثات"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="البحث في المحادثات..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-800 border-none px-12 py-3 text-sm font-bold focus:ring-2 ring-primary-500 outline-none rounded-none dark:text-white"
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {conversations.filter(c => (c.displayName || '').toLowerCase().includes((searchQuery || '').toLowerCase())).length > 0 ? (
                    conversations.filter(c => (c.displayName || '').toLowerCase().includes((searchQuery || '').toLowerCase())).map(conv => (
                        <button
                            key={conv.id}
                            onClick={() => setSelectedConv(conv)}
                            className={cn(
                                "w-full p-5 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 transition-all text-right group",
                                selectedConv?.id === conv.id
                                    ? "bg-white dark:bg-gray-800 border-r-4 border-r-primary-600 shadow-sm"
                                    : "hover:bg-white/50 dark:hover:bg-gray-800/30"
                            )}
                        >
                            <div className="relative">
                                <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-none flex items-center justify-center text-gray-500 dark:text-gray-400 font-black text-xl border border-white dark:border-gray-700">
                                    {conv.displayName?.charAt(0)}
                                </div>
                                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0 text-right">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-black text-gray-900 dark:text-white truncate text-sm lg:text-base">{conv.displayName}</h3>
                                    <div className="flex items-center gap-2">
                                        {conv.lastMessageTime && (
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">
                                                {format(new Date(conv.lastMessageTime), 'HH:mm', { locale: ar })}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-bold flex-1">
                                        {typingUsers.filter(u => u.conversationId === conv.id).length > 0 ? (
                                            <span className="text-emerald-500 animate-pulse italic">يكتب الآن...</span>
                                        ) : (
                                            conv.lastMessage || 'لا توجد رسائل بعد'
                                        )}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {(conv.unreadCount ?? 0) > 0 && (
                                            <div className="bg-emerald-500 text-white text-[10px] font-black min-w-[20px] h-5 rounded-full flex items-center justify-center px-1 shadow-sm animate-in zoom-in duration-300">
                                                {(conv.unreadCount ?? 0) > 99 ? '+99' : conv.unreadCount}
                                            </div>
                                        )}
                                        {currentUser?.role === 'admin' && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openGroupSettings(conv);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    title="تعديل"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        confirmDeleteConversation(conv);
                                                    }}
                                                    className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
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
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-50">
                        <MessageCircle size={48} className="mb-4 text-gray-300" />
                        <p className="text-gray-500 font-bold">لا توجد محادثات</p>
                    </div>
                )}
            </div>
        </div>
    );
};

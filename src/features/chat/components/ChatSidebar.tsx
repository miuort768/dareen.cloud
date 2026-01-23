import React from 'react';
import { Search, MessageCircle, Edit2, Trash2, Plus, LogOut, Bell, BellOff } from 'lucide-react';
import { useChatContext } from '../../../context/ChatContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../../../lib/utils';
import type { Conversation } from '../../../types/chat.types';
import type { User } from '../../../types/auth';

interface ChatSidebarProps {
    conversations: Conversation[];
    selectedConv: Conversation | null;
    setSelectedConv: (conv: Conversation) => void;
    currentUser: User | null;
    openGroupSettings: (conv: Conversation) => void;
    confirmDeleteConversation: (conv: Conversation) => void;
    setShowNewChatModal: (val: boolean) => void;
    confirmDeleteAllConversations: () => void;
    setIsEditingGroup: (val: boolean) => void;
    setView: (view: 'chat' | 'management') => void;
    view: 'chat' | 'management';
    logout: () => void;
    requestDesktopNotifications: () => Promise<boolean>;
    typingUsers: { conversationId: string, userName: string }[];
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
    setView,
    view,
    logout,
    requestDesktopNotifications,
    typingUsers
}) => {
    const { isConnected } = useChatContext();
    const [isNotificationGranted, setIsNotificationGranted] = React.useState(
        'Notification' in window && Notification.permission === 'granted'
    );

    const handleToggleNotifications = async () => {
        const granted = await requestDesktopNotifications();
        setIsNotificationGranted(granted);
    };
    return (
        <div className={cn(
            "w-full lg:w-[400px] border-l border-gray-100 dark:border-gray-800 flex flex-col bg-white/50 dark:bg-gray-950/50 backdrop-blur-xl z-20",
            selectedConv ? "hidden lg:flex" : "flex"
        )}>
            {/* Sidebar Header */}
            <div className="p-4 lg:p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">الدردشة</h2>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                            )}></div>
                            <span className="text-[9px] lg:text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                {isConnected ? 'متصل لحظياً' : 'جاري الاتصال...'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleToggleNotifications}
                            className={cn(
                                "w-10 h-10 rounded-none flex items-center justify-center transition-all",
                                isNotificationGranted
                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                                    : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 animate-pulse"
                            )}
                            title={isNotificationGranted ? "الإشعارات المكتبية مفعلة" : "تفعيل الإشعارات المكتبية"}
                        >
                            {isNotificationGranted ? <Bell size={20} /> : <BellOff size={20} />}
                        </button>
                        {currentUser?.role === 'admin' && (
                            <button
                                onClick={() => setView(view === 'management' ? 'chat' : 'management')}
                                className={cn(
                                    "w-10 h-10 rounded-none flex items-center justify-center transition-all",
                                    view === 'management'
                                        ? "bg-primary-600 text-white shadow-lg"
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                )}
                                title="إدارة المستخدمين"
                            >
                                <Plus size={20} className={cn("transition-transform duration-500", view === 'management' && "rotate-45")} />
                            </button>
                        )}
                        <button
                            onClick={() => {
                                logout();
                                window.location.href = '/#/login';
                            }}
                            className="w-10 h-10 bg-rose-50 text-rose-600 rounded-none flex items-center justify-center hover:bg-rose-100 transition-all"
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
                                onClick={confirmDeleteAllConversations}
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
                        className="w-full bg-gray-100 dark:bg-gray-800 border-none px-12 py-3 text-sm font-bold focus:ring-2 ring-primary-500 outline-none rounded-none dark:text-white"
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {conversations.length > 0 ? (
                    conversations.map(conv => (
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
                            <div className="flex-1 min-w-0">
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
                                        {conv.unreadCount !== undefined && conv.unreadCount > 0 && (
                                            <div className="bg-emerald-500 text-white text-[10px] font-black min-w-[20px] h-5 rounded-full flex items-center justify-center px-1 shadow-sm animate-in zoom-in duration-300">
                                                {conv.unreadCount > 99 ? '+99' : conv.unreadCount}
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
                                                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
                    <div className="p-12 text-center opacity-40 grayscale scale-90 transition-all">
                        <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest leading-loose">ابدأ محادثة جديدة الآن مع أعضاء المعهد</p>
                    </div>
                )}
            </div>
        </div>
    );
};

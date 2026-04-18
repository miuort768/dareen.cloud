import React, { useState } from 'react';
import { 
    Search, LogOut, 
    ShieldCheck, MessageSquarePlus
} from 'lucide-react';
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
    setShowNewChatModal: (val: boolean) => void;
    logout: () => void;
    typingUsers: any[];
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
    conversations,
    selectedConv,
    setSelectedConv,
    currentUser,
    setShowNewChatModal,
    logout,
    typingUsers
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { isConnected } = useChatContext();

    const filteredConversations = conversations.filter(c =>
        (c.displayName || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );

    return (
        <div className={cn(
            "w-full lg:w-[400px] flex flex-col bg-white dark:bg-[#111b21] shrink-0 overflow-hidden relative border-r border-gray-200 dark:border-gray-800 pb-[65px] lg:pb-0",
            selectedConv ? "hidden lg:flex" : "flex"
        )}>
            <div className="h-[60px] bg-[#f0f2f5] dark:bg-[#202c33] px-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img 
                            src="/chat-avatar.jpg" 
                            alt="avatar" 
                            className="w-full h-full object-cover" 
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + (currentUser?.name || "User"); }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 text-[#54656f] dark:text-[#aebac1]">
                    {currentUser?.role === 'admin' && (
                        <>
                            <button 
                                onClick={() => { setIsEditingGroup(false); setShowNewChatModal(true); }}
                                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                            >
                                <MessageSquarePlus size={22} />
                            </button>
                        </>
                    )}
                    <button 
                        onClick={logout}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                        title="خروج"
                    >
                        <LogOut size={22} />
                    </button>
                </div>
            </div>

            <div className="p-2 bg-white dark:bg-[#111b21] border-b border-gray-100 dark:border-gray-800">
                <div className="relative flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-1.5 focus-within:shadow-sm">
                    <Search className="text-[#667781] dark:text-[#8696a0]" size={18} />
                    <input
                        type="text"
                        placeholder="البحث أو بدء دردشة جديدة"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 px-4 text-right text-[#111b21] dark:text-[#e9edef]"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {filteredConversations.length > 0 ? (
                    filteredConversations.map((conv) => {
                        const isSelected = selectedConv?.id === conv.id;
                        const isTyping = typingUsers.filter(u => u.conversationId === conv.id).length > 0;

                        return (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedConv(conv)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-3 transition-colors relative hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]",
                                    isSelected && "bg-[#f0f2f5] dark:bg-[#2a3942]"
                                )}
                            >
                                <div className="shrink-0 relative">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                        <img 
                                            src={conv.isGroup ? "/group-avatar.png" : "/chat-avatar.jpg"} 
                                            alt="chat" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + conv.displayName; }}
                                        />
                                    </div>
                                    {isConnected && !isSelected && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-white dark:border-[#111b21] rounded-full"></div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 border-b border-gray-100 dark:border-gray-800 pb-3 mt-1 text-right">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            {conv.isGroup && <ShieldCheck size={14} className="text-[#8696a0] shrink-0" />}
                                            <h3 className="text-base font-normal text-[#111b21] dark:text-[#e9edef] truncate">
                                                {conv.displayName}
                                            </h3>
                                        </div>
                                        {conv.lastMessageTime && (
                                            <span className={cn(
                                                "text-[12px] font-normal tracking-tight",
                                                (conv.unreadCount ?? 0) > 0 ? "text-[#00a884]" : "text-[#667781] dark:text-[#8696a0]"
                                            )}>
                                                {format(new Date(conv.lastMessageTime), 'h:mm a', { locale: ar })}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 truncate">
                                            {isTyping ? (
                                                <span className="text-sm text-[#00a884] font-normal">جاري الكتابة...</span>
                                            ) : (
                                                <p className="text-sm text-[#667781] dark:text-[#8696a0] truncate leading-tight opacity-90">
                                                    {conv.lastMessage || 'لا توجد رسائل'}
                                                </p>
                                            )}
                                        </div>

                                        {(conv.unreadCount ?? 0) > 0 && (
                                            <div className="bg-[#00a884] text-white text-[11px] font-medium min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center mr-2">
                                                {conv.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-[#667781] dark:text-[#8696a0]">
                        <p className="text-sm">لا توجد محادثات نشطة</p>
                    </div>
                )}
            </div>
            
            <div className="bg-[#f0f2f5] dark:bg-[#202c33] p-3 border-t border-gray-200 dark:border-gray-800 text-center">
                <span className="text-[10px] text-[#667781] font-bold uppercase tracking-widest opacity-30">تواصل آمن ومحمي</span>
            </div>
        </div>
    );
};

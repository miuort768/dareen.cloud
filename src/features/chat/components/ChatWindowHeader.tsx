import { useState } from 'react';
import { ChevronRight, Search, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image } from '../../../shared/components/ui';
import { cn } from '../../../lib/utils';
import type { Conversation } from '../../../types/chat.types';
import type { User } from '../../../types/auth';

interface ChatWindowHeaderProps {
    selectedConv: Conversation;
    currentUser: User | null;
    openGroupSettings: () => void;
    menuRef: React.RefObject<HTMLDivElement | null>;
    onBack: () => void;
    showMoreMenu: boolean;
    onToggleMoreMenu: () => void;
    onDeleteConversation: () => void;
    typingInThisConv: { conversationId: string; name: string }[];
}

export const ChatWindowHeader = ({
    selectedConv, currentUser, openGroupSettings, menuRef,
    onBack, showMoreMenu, onToggleMoreMenu, onDeleteConversation, typingInThisConv
}: ChatWindowHeaderProps) => {
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <header className="sticky top-0 h-[60px] shrink-0 bg-surface dark:bg-card flex items-center justify-between px-4 z-[50] shadow-sm">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="lg:hidden p-1 text-muted">
                    <ChevronRight size={24} />
                </button>

                <div className={cn("w-10 h-10 rounded-full overflow-hidden", selectedConv.isGroup && currentUser?.role === 'admin' ? "cursor-pointer" : "")}
                    onClick={() => selectedConv.isGroup && currentUser?.role === 'admin' && openGroupSettings()}
                    role={selectedConv.isGroup && currentUser?.role === 'admin' ? "button" : undefined}
                    tabIndex={selectedConv.isGroup && currentUser?.role === 'admin' ? 0 : undefined}
                    onKeyDown={selectedConv.isGroup && currentUser?.role === 'admin' ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGroupSettings(); } } : undefined}
                >
                    <Image src="/chat-avatar.webp" alt="avatar" className="w-full h-full" onError={(e) => { (e.target as HTMLImageElement).src = '/chat-avatar.jpg'; }} />
                </div>

                <div className="flex flex-col text-start">
                    <h2 className={cn("font-medium text-main leading-tight truncate max-w-[150px] md:max-w-[300px]", selectedConv.isGroup ? "text-sm" : "text-base")}>
                        {selectedConv.displayName}
                    </h2>
                    {typingInThisConv.length > 0 ? (
                        <span className="text-xs text-success font-normal animate-pulse">جاري الكتابة...</span>
                    ) : (
                        <span className="text-xs text-muted font-normal">
                            {selectedConv.isGroup ? "مجموعة" : "محادثة مباشرة"}
                        </span>
                    )}
                </div>
            </div>

            {currentUser?.role === 'admin' && (
                <div className="flex items-center gap-5 text-muted">
                    <div className={cn("flex items-center bg-white/10 dark:bg-black/20 rounded-full px-3 py-1 transition-all", showSearchBar ? "w-40 md:w-64 opacity-100" : "w-0 opacity-0 overflow-hidden p-0")}>
                        {showSearchBar && (
                            <input type="text" placeholder="بحث..." aria-label="بحث في الرسائل" value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none text-xs text-start w-full focus:ring-0 placeholder:text-muted" autoFocus />
                        )}
                    </div>
                    <button onClick={() => { setShowSearchBar(!showSearchBar); if (showSearchBar) setSearchQuery(''); }}
                        className={cn("p-2 rounded-full transition-colors", showSearchBar ? "bg-primary text-on-primary" : "hover:bg-black/5 dark:hover:bg-white/5")}>
                        <Search size={20} />
                    </button>
                    <div className="relative" ref={menuRef}>
                        <button onClick={onToggleMoreMenu} className="hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-full transition-colors">
                            <MoreVertical size={20} />
                        </button>
                        <AnimatePresence>
                            {showMoreMenu && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    className="absolute top-full end-0 mt-2 w-48 bg-card shadow-sm z-[100] py-2 rounded-md">
                                    <button onClick={() => { openGroupSettings(); onToggleMoreMenu(); }}
                                        className="w-full text-start px-4 py-3 text-sm text-muted hover:bg-hover transition-colors">
                                        معلومات المحادثة
                                    </button>
                                    {selectedConv.isGroup && (
                                        <button onClick={() => { openGroupSettings(); onToggleMoreMenu(); }}
                                            className="w-full text-start px-4 py-3 text-sm text-muted dark:text-main hover:bg-hover transition-colors font-normal">
                                            تعديل المجموعة
                                        </button>
                                    )}
                                    <button onClick={() => { onDeleteConversation(); onToggleMoreMenu(); }}
                                        className="w-full text-start px-4 py-3 text-sm text-error hover:bg-hover transition-colors">
                                        حذف الدردشة
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </header>
    );
};

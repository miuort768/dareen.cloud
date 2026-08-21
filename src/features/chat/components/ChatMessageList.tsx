import { useState, useRef, useMemo } from 'react';
import { ArrowDown, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Virtuoso } from 'react-virtuoso';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../../../lib/utils';
import type { ChatMessage } from '../../../types/chat.types';

interface ChatMessageListProps {
    messages: ChatMessage[];
    isLoadingMessages?: boolean;
    isMessagesError?: boolean;
    isGroup: boolean;
    currentUserId?: string;
}

export const ChatMessageList = ({ messages, isLoadingMessages, isMessagesError, isGroup, currentUserId }: ChatMessageListProps) => {
    const virtuosoRef = useRef<{ scrollToIndex: (params: { index: number; behavior?: ScrollBehavior }) => void }>(null);
    const [showScrollBottom, setShowScrollBottom] = useState(false);

    const filteredMessages = useMemo(() => {
        return [...messages].sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            if (isNaN(timeA)) return 1;
            if (isNaN(timeB)) return -1;
            return timeA - timeB;
        });
    }, [messages]);

    const scrollToBottom = () => {
        if (filteredMessages.length > 0) {
            virtuosoRef.current?.scrollToIndex({ index: filteredMessages.length - 1, behavior: 'smooth' });
        }
    };

    if (isMessagesError) {
        return (
            <div className="flex-1 relative z-10">
                <div className="flex items-center justify-center h-full text-muted text-sm px-4">
                    تعذر تحميل الرسائل. حاول مرة أخرى.
                </div>
            </div>
        );
    }

    if (isLoadingMessages) {
        return (
            <div className="flex-1 relative z-10">
                <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-2 border-success/30 border-t-success rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (filteredMessages.length === 0) {
        return (
            <div className="flex-1 relative z-10">
                <div className="flex items-center justify-center h-full text-muted text-sm px-4">
                    لا توجد رسائل بعد. ابدأ المحادثة الآن.
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 relative z-10">
            <Virtuoso
                ref={virtuosoRef}
                data={filteredMessages}
                initialTopMostItemIndex={filteredMessages.length - 1}
                followOutput="smooth"
                className="custom-scrollbar"
                style={{ height: '100%', width: '100%' }}
                components={{ Footer: () => <div className="h-4" /> }}
                atBottomStateChange={(atBottom) => setShowScrollBottom(!atBottom)}
                itemContent={(index, msg) => {
                    const isMe = String(msg.senderId) === String(currentUserId);
                    return (
                        <div className={cn("flex w-full mb-1 px-3 md:px-10 lg:px-20", index === 0 && "pt-4", isMe ? "justify-start" : "justify-end")}>
                            <div className={cn(
                                "max-w-[90%] md:max-w-[75%] px-3 py-2 shadow-sm relative",
                                isMe ? "bg-primary text-on-primary rounded-[12px] rounded-tr-none ms-2"
                                     : "bg-surface border border-border text-main rounded-[12px] rounded-tl-none me-2"
                            )}>
                                {isGroup && !isMe && (
                                    <span className="block text-xs font-semibold text-primary mb-1 text-start">{msg.senderName}</span>
                                )}
                                <div className={cn("text-sm leading-relaxed whitespace-pre-wrap text-start tracking-tight", isMe ? "text-on-primary" : "text-main")}>
                                    {msg.content}
                                </div>
                                <div className="flex items-center justify-end gap-1 mt-1">
                                    <span className={cn("text-[10px]", isMe ? "text-on-primary/80" : "text-muted")}>
                                        {msg.timestamp && !isNaN(new Date(msg.timestamp).getTime()) ? format(new Date(msg.timestamp), 'h:mm a', { locale: ar }) : '--:--'}
                                    </span>
                                    {isMe && (
                                        <div>{msg.readAt ? <CheckCheck size={14} className="text-on-primary" /> : <CheckCheck size={14} className="text-on-primary/60" />}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                }}
            />
            <AnimatePresence mode="wait">
                {showScrollBottom && (
                    <motion.button key="scroll-bottom-btn" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                        onClick={scrollToBottom}
                        className="absolute bottom-20 end-6 w-10 h-10 bg-card text-muted rounded-full shadow-sm flex items-center justify-center z-20 hover:bg-hover">
                        <ArrowDown size={20} />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

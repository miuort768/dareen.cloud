import { useRef } from 'react';
import { Send } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { User } from '../../../types/auth';

interface ChatInputFooterProps {
    newMessage: string;
    onMessageChange: (val: string) => void;
    onSend: (e: React.FormEvent) => void;
    isSending: boolean;
    currentUser: User | null;
    conversationId: string;
    onTyping: (convId: string, isTyping: boolean, name: string) => void;
}

export const ChatInputFooter = ({ newMessage, onMessageChange, onSend, isSending, currentUser, conversationId, onTyping }: ChatInputFooterProps) => {
    const lastTypingEmitRef = useRef(0);

    const handleChange = (val: string) => {
        onMessageChange(val);
        if (currentUser && conversationId) {
            const now = Date.now();
            const lastSent = lastTypingEmitRef.current;
            if (now - lastSent > 2000 || (val.length > 0 && lastSent === 0)) {
                onTyping(conversationId, val.length > 0, currentUser.name);
                lastTypingEmitRef.current = val.length > 0 ? now : 0;
            } else if (val.length === 0) {
                onTyping(conversationId, false, currentUser.name);
                lastTypingEmitRef.current = 0;
            }
        }
    };

    return (
        <footer className="bg-surface dark:bg-card px-3 py-3 z-10 flex items-center gap-3">
            <div className="flex-1 relative flex items-center">
                <textarea
                    rows={1}
                    value={newMessage}
                    onInput={(e) => { const target = e.target as HTMLTextAreaElement; target.style.height = 'auto'; target.style.height = `${Math.min(target.scrollHeight, 150)}px`; }}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(e as unknown as React.FormEvent); const target = e.target as HTMLTextAreaElement; target.style.height = 'auto'; } }}
                    placeholder="اكتب رسالة"
                    className="w-full bg-white dark:bg-card text-main text-sm md:text-base border-none rounded-none px-4 py-3 focus:ring-1 focus:ring-success shadow-sm max-h-32 resize-none text-start scroll-smooth custom-scrollbar relative z-10 overflow-y-auto"
                />
            </div>
            <div className="flex items-center justify-center shrink-0">
                <button onClick={onSend} className="bg-success text-on-success p-3.5 rounded-none hover:brightness-90 transition-all shadow-sm active:scale-95 flex items-center justify-center h-[48px] w-[48px]" title="إرسال">
                    <Send size={20} className={cn("transition-transform", isSending && "animate-pulse")} />
                </button>
            </div>
        </footer>
    );
};

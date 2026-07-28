import { Send, ShieldCheck } from 'lucide-react';

interface ForumCreatePostProps {
    newPostContent: string;
    setNewPostContent: (v: string) => void;
    handleCreatePost: () => void;
}

export const ForumCreatePost = ({ newPostContent, setNewPostContent, handleCreatePost }: ForumCreatePostProps) => (
    <div className="bg-card rounded-card p-5">
        <div className="space-y-3">
            <textarea value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full bg-background rounded-card p-4 min-h-[100px] text-sm font-medium text-main focus:outline-none focus:ring-2 focus:ring-focus transition-all placeholder:text-muted resize-none border border-border leading-relaxed"
                placeholder="شارك فكرة أو سؤال…" />
            <div className="flex justify-between items-center">
                <p className="text-micro text-muted font-medium flex items-center gap-1.5">
                    <ShieldCheck size={11} className="text-primary" /> نشر متوافق مع سياسات المنصة
                </p>
                <button onClick={handleCreatePost} disabled={!newPostContent.trim()}
                    className="bg-primary hover:bg-primary-hover text-on-primary px-5 py-2.5 text-xs font-bold rounded-card disabled:opacity-30 transition-all flex items-center gap-2 active:scale-95">
                    <Send size={13} /> نشر
                </button>
            </div>
        </div>
    </div>
);

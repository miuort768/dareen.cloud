import { Send, ShieldCheck } from 'lucide-react'

interface ForumCreatePostProps {
  newPostContent: string
  setNewPostContent: (v: string) => void
  handleCreatePost: () => void
}

export const ForumCreatePost = ({
  newPostContent,
  setNewPostContent,
  handleCreatePost,
}: ForumCreatePostProps) => (
  <div className="rounded-card bg-card p-5">
    <div className="space-y-3">
      <textarea
        aria-label="اكتب منشورك"
        value={newPostContent}
        onChange={(e) => setNewPostContent(e.target.value)}
        className="min-h-[100px] w-full resize-none rounded-card border border-border bg-background p-4 text-sm font-medium leading-relaxed text-main transition-all placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-focus"
        placeholder="شارك فكرة أو سؤال…"
      />
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-micro font-medium text-muted">
          <ShieldCheck size={11} className="text-primary" /> نشر متوافق مع سياسات المنصة
        </p>
        <button
          onClick={handleCreatePost}
          disabled={!newPostContent.trim()}
          className="flex items-center gap-2 rounded-card bg-primary px-5 py-2.5 text-xs font-bold text-on-primary outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95 disabled:opacity-30"
        >
          <Send size={13} /> نشر
        </button>
      </div>
    </div>
  </div>
)

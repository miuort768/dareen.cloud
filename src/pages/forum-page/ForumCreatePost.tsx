import { useState } from 'react'
import { Send, ShieldCheck } from 'lucide-react'
import { HelpCircle, MessageSquare, Lightbulb, Megaphone } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { ForumPostType } from '../../features/forum/types'

interface ForumCreatePostProps {
  newPostContent: string
  setNewPostContent: (v: string) => void
  handleCreatePost: (type: ForumPostType) => void
}

const TYPE_OPTIONS: {
  value: ForumPostType
  label: string
  icon: typeof HelpCircle
  tone: string
}[] = [
  {
    value: 'question',
    label: 'سؤال',
    icon: HelpCircle,
    tone: 'text-info border-info-soft bg-info-soft',
  },
  {
    value: 'discussion',
    label: 'مناقشة',
    icon: MessageSquare,
    tone: 'text-primary border-primary/30 bg-primary-soft',
  },
  {
    value: 'tip',
    label: 'نصيحة',
    icon: Lightbulb,
    tone: 'text-success border-success-soft bg-success-soft',
  },
  {
    value: 'announcement',
    label: 'إعلان',
    icon: Megaphone,
    tone: 'text-warning border-warning-soft bg-warning-soft',
  },
]

export const ForumCreatePost = ({
  newPostContent,
  setNewPostContent,
  handleCreatePost,
}: ForumCreatePostProps) => {
  const [postType, setPostType] = useState<ForumPostType>('discussion')

  return (
    <div className="rounded-card bg-card p-5">
      <div className="space-y-3">
        {/* اختيار نوع المنشور — أيقونات فيكتور */}
        <div className="grid grid-cols-4 gap-2">
          {TYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const active = postType === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPostType(opt.value)}
                aria-pressed={active}
                className={cn(
                  'flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-[10px] font-bold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]',
                  active ? opt.tone : 'border-border bg-surface text-muted hover:bg-hover',
                )}
              >
                <Icon size={15} strokeWidth={2} />
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>

        <textarea
          aria-label="اكتب منشورك"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          className="min-h-[100px] w-full resize-none rounded-card border border-border bg-background p-4 text-sm font-medium leading-relaxed text-main outline-none transition-all placeholder:text-muted focus-visible:ring-2 focus-visible:ring-focus"
          placeholder="شارك فكرة أو سؤال…"
        />
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-micro font-medium text-muted">
            <ShieldCheck size={11} className="text-primary" /> نشر متوافق مع سياسات المنصة
          </p>
          <button
            onClick={() => handleCreatePost(postType)}
            disabled={!newPostContent.trim()}
            className="flex items-center gap-2 rounded-card bg-primary px-5 py-2.5 text-xs font-bold text-on-primary outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95 disabled:opacity-30"
          >
            <Send size={13} /> نشر
          </button>
        </div>
      </div>
    </div>
  )
}

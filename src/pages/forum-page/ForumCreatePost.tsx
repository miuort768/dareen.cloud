import { useState } from 'react'
import {
  Send,
  ShieldCheck,
  PenLine,
  HelpCircle,
  MessageSquare,
  Lightbulb,
  Megaphone,
} from 'lucide-react'
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
    tone: 'bg-info text-on-info border-info',
  },
  {
    value: 'discussion',
    label: 'مناقشة',
    icon: MessageSquare,
    tone: 'bg-primary text-on-primary border-primary',
  },
  {
    value: 'tip',
    label: 'نصيحة',
    icon: Lightbulb,
    tone: 'bg-success text-on-success border-success',
  },
  {
    value: 'announcement',
    label: 'إعلان',
    icon: Megaphone,
    tone: 'bg-warning text-on-warning border-warning',
  },
]

export const ForumCreatePost = ({
  newPostContent,
  setNewPostContent,
  handleCreatePost,
}: ForumCreatePostProps) => {
  const [postType, setPostType] = useState<ForumPostType>('discussion')

  return (
    <div className="overflow-hidden rounded-3xl border border-primary/20 bg-surface shadow-elevation-1">
      <div className="relative overflow-hidden bg-primary p-4 text-on-primary md:p-5">
        <div
          className="pointer-events-none absolute -end-8 -top-10 h-28 w-28 rounded-full border border-white/10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-12 -start-8 h-32 w-32 rounded-full bg-white/5"
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
            <PenLine size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black">شارك فكرتك</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-bold opacity-80">
              <ShieldCheck size={11} />
              نشر متوافق مع سياسات المنصة
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4 md:p-5">
        <textarea
          aria-label="اكتب منشورك"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          className="min-h-[100px] w-full resize-none rounded-2xl border border-border bg-background p-4 text-sm font-medium leading-relaxed text-main outline-none transition-all placeholder:text-muted focus-visible:ring-2 focus-visible:ring-focus"
          placeholder="شارك فكرة أو سؤال…"
        />

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
                  'flex min-h-11 flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-2 text-[10px] font-bold outline-none transition-all duration-normal focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]',
                  active
                    ? cn(opt.tone, 'shadow-soft hover:brightness-110')
                    : 'border-border bg-background text-muted hover:bg-hover hover:text-main',
                )}
              >
                <Icon size={15} strokeWidth={2} />
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={() => handleCreatePost(postType)}
            disabled={!newPostContent.trim()}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-black text-on-primary shadow-elevation-1 outline-none transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-95 disabled:opacity-30"
          >
            <Send size={13} /> نشر
          </button>
        </div>
      </div>
    </div>
  )
}

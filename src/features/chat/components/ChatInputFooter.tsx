import { useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { cn } from '../../../lib/utils'
import type { User } from '../../../types/auth'

interface ChatInputFooterProps {
  newMessage: string
  onMessageChange: (val: string) => void
  onSend: (e: React.FormEvent) => void
  isSending: boolean
  currentUser: User | null
  conversationId: string
  onTyping: (convId: string, isTyping: boolean, name: string) => void
}

export const ChatInputFooter = ({
  newMessage,
  onMessageChange,
  onSend,
  isSending,
  currentUser,
  conversationId,
  onTyping,
}: ChatInputFooterProps) => {
  const lastTypingEmitRef = useRef(0)

  useEffect(() => {
    return () => {
      if (lastTypingEmitRef.current > 0 && currentUser && conversationId) {
        onTyping(conversationId, false, currentUser.name)
      }
      lastTypingEmitRef.current = 0
    }
  }, [conversationId, currentUser, onTyping])

  const handleChange = (val: string) => {
    onMessageChange(val)
    if (currentUser && conversationId) {
      const now = Date.now()
      const lastSent = lastTypingEmitRef.current
      if (now - lastSent > 2000 || (val.length > 0 && lastSent === 0)) {
        onTyping(conversationId, val.length > 0, currentUser.name)
        lastTypingEmitRef.current = val.length > 0 ? now : 0
      } else if (val.length === 0) {
        onTyping(conversationId, false, currentUser.name)
        lastTypingEmitRef.current = 0
      }
    }
  }

  return (
    <footer className="z-10 flex shrink-0 items-center gap-3 bg-surface px-3 py-3 dark:bg-card">
      <div className="relative flex flex-1 items-center">
        <textarea
          aria-label="اكتب رسالة"
          rows={1}
          value={newMessage}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = 'auto'
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`
          }}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSend(e as unknown as React.FormEvent)
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
            }
          }}
          placeholder="اكتب رسالة"
          className="custom-scrollbar relative z-10 max-h-[120px] w-full resize-none overflow-y-auto scroll-smooth rounded-xl border-none bg-card px-4 py-3 text-start text-sm text-main shadow-sm focus:ring-1 focus:ring-success md:text-base"
        />
      </div>
      <div className="flex shrink-0 items-center justify-center">
        <button
          onClick={onSend}
          className="flex h-[48px] w-[48px] items-center justify-center rounded-xl bg-success p-3.5 text-on-success shadow-sm transition-all hover:brightness-90 active:scale-95"
          title="إرسال"
        >
          <Send size={20} className={cn('transition-transform', isSending && 'animate-pulse')} />
        </button>
      </div>
    </footer>
  )
}

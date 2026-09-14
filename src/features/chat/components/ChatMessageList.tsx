import { useState, useRef, useMemo } from 'react'
import { ArrowDown, CheckCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'
import { ar } from 'date-fns/locale'
import { cn } from '../../../lib/utils'
import type { ChatMessage } from '../../../types/chat.types'

interface ChatMessageListProps {
  messages: ChatMessage[]
  isLoadingMessages?: boolean
  isMessagesError?: boolean
  isGroup: boolean
  currentUserId?: string
  searchQuery?: string
}

export const ChatMessageList = ({
  messages,
  isLoadingMessages,
  isMessagesError,
  isGroup,
  currentUserId,
  searchQuery,
}: ChatMessageListProps) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null)
  const [showScrollBottom, setShowScrollBottom] = useState(false)

  const filteredMessages = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase()
    const sorted = [...messages].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      if (isNaN(timeA)) return 1
      if (isNaN(timeB)) return -1
      return timeA - timeB
    })
    if (!q) return sorted
    return sorted.filter((m) => (m.content || '').toLowerCase().includes(q))
  }, [messages, searchQuery])

  const dayLabel = (msg: ChatMessage): string => {
    const date = new Date(msg.timestamp)
    if (isNaN(date.getTime())) return ''
    if (isToday(date)) return 'اليوم'
    if (isYesterday(date)) return 'أمس'
    return format(date, 'EEEE d MMMM yyyy', { locale: ar })
  }

  const scrollToBottom = () => {
    if (filteredMessages.length > 0) {
      virtuosoRef.current?.scrollToIndex({ index: filteredMessages.length - 1, behavior: 'smooth' })
    }
  }

  if (isMessagesError) {
    return (
      <div className="relative z-10 min-h-0 flex-1">
        <div className="flex h-full items-center justify-center px-4 text-sm text-muted">
          تعذر تحميل الرسائل. حاول مرة أخرى.
        </div>
      </div>
    )
  }

  if (isLoadingMessages) {
    return (
      <div className="relative z-10 min-h-0 flex-1">
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-success-soft border-t-success" />
        </div>
      </div>
    )
  }

  if (filteredMessages.length === 0) {
    return (
      <div className="relative z-10 min-h-0 flex-1">
        <div className="flex h-full items-center justify-center px-4 text-sm text-muted">
          {searchQuery ? 'لا توجد رسائل مطابقة للبحث.' : 'لا توجد رسائل بعد. ابدأ المحادثة الآن.'}
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-10 min-h-0 flex-1">
      <Virtuoso
        ref={virtuosoRef}
        data={filteredMessages}
        initialTopMostItemIndex={filteredMessages.length - 1}
        followOutput="smooth"
        className="custom-scrollbar"
        style={{ height: '100%', width: '100%' }}
        components={{ Footer: () => <div className="h-6" /> }}
        atBottomStateChange={(atBottom) => setShowScrollBottom(!atBottom)}
        itemContent={(index, msg) => {
          const isMe = String(msg.senderId) === String(currentUserId)
          const prev = filteredMessages[index - 1]
          const isNewDay = !prev || !isSameDay(new Date(prev.timestamp), new Date(msg.timestamp))
          const label = isNewDay ? dayLabel(msg) : ''
          return (
            <div key={msg.id}>
              {isNewDay && label && (
                <div className="flex justify-center px-3 pt-3">
                  <span className="rounded-full bg-hover px-3 py-1 text-[11px] font-bold text-muted dark:bg-card dark:text-dim">
                    {label}
                  </span>
                </div>
              )}
              <div
                className={cn(
                  'flex w-full px-3 md:px-10 lg:px-20',
                  index === 0 ? 'pt-4' : '',
                  isNewDay ? 'mt-2' : 'mt-1',
                  isMe ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'relative max-w-[90%] px-3 py-2 shadow-elevation-1 md:max-w-[75%]',
                    isMe
                      ? 'ms-2 rounded-lg rounded-tl-none bg-primary text-on-primary'
                      : 'me-2 rounded-lg rounded-tr-none border border-border bg-surface text-main',
                  )}
                >
                  {isGroup && !isMe && (
                    <span className="mb-1 block text-start text-xs font-semibold text-primary">
                      {msg.senderName}
                    </span>
                  )}
                  <div
                    className={cn(
                      'whitespace-pre-wrap text-start text-sm leading-relaxed tracking-tight',
                      isMe ? 'text-on-primary' : 'text-main',
                    )}
                  >
                    {msg.content}
                  </div>
                  <div className="mt-1 flex items-center justify-end gap-1">
                    <span className={cn('text-[10px]', isMe ? 'text-white/80' : 'text-muted')}>
                      {msg.timestamp && !isNaN(new Date(msg.timestamp).getTime())
                        ? format(new Date(msg.timestamp), 'h:mm a', { locale: ar })
                        : '--:--'}
                    </span>
                    {isMe && (
                      <div>
                        {/* readAt is never populated server-side (per-recipient
                          read state needs a Message migration) — show a single
                          delivered check instead of a dead read/unread branch. */}
                        <CheckCheck size={14} className="text-white/80" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        }}
      />
      <AnimatePresence mode="wait">
        {showScrollBottom && (
          <motion.button
            key="scroll-bottom-btn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-20 end-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-card text-muted shadow-elevation-1 hover:bg-hover"
          >
            <ArrowDown size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

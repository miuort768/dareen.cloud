import React, { useState } from 'react'
import { Search, ShieldCheck, MessageSquarePlus, Sun, Trash2 } from 'lucide-react'
import { NotificationDropdown } from '../../../components/ui/NotificationDropdown'
import { useDarkMode } from '../../../shared/hooks/useDarkMode'
import { useShortAcademyName } from '../../../context/AppContext'
import { useChatUIStore } from '../../../store/chatUIStore'

import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Image } from '../../../shared/components/ui'
import { cn } from '../../../lib/utils'
import type { Conversation } from '../../../types/chat.types'
import type { User } from '../../../types/auth'

interface ChatSidebarProps {
  conversations: Conversation[]
  selectedConv: Conversation | null
  currentUser: User | null
  onDeleteAll: () => void
  typingUsers: { conversationId: string; userName: string }[]
  isLoading?: boolean
  hasError?: boolean
  onRetry?: () => void
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  selectedConv,
  currentUser,
  onDeleteAll,
  typingUsers,
  isLoading = false,
  hasError = false,
  onRetry,
}) => {
  const setSelectedConv = useChatUIStore((s) => s.setSelectedConv)
  const setShowNewChatModal = useChatUIStore((s) => s.setShowNewChatModal)
  const setIsEditingGroup = useChatUIStore((s) => s.setIsEditingGroup)
  const [searchQuery, setSearchQuery] = useState('')

  const [theme, setTheme] = useDarkMode()

  const academyName = useShortAcademyName()

  const filteredConversations = conversations.filter((c) =>
    (c.displayName || '').toLowerCase().includes((searchQuery || '').toLowerCase()),
  )

  return (
    <div
      className={cn(
        'relative flex w-full max-w-full shrink-0 flex-col overflow-hidden overflow-x-hidden border-e border-border bg-card lg:w-[400px]',
        selectedConv ? 'hidden lg:flex' : 'flex',
      )}
    >
      <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-border bg-surface px-4 dark:border-white/5 dark:bg-card">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-success-soft shadow-elevation-1">
            <Image
              src="/chat-avatar.webp"
              alt="avatar"
              className="h-full w-full"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = '/chat-avatar.jpg'
              }}
            />
          </div>
          <div className="flex flex-col text-start">
            <span className="text-xs font-semibold leading-tight text-main">
              واتساب {academyName}
            </span>
            <span className="text-[10px] font-thin text-muted">تواصل أسهل وأسرع</span>
          </div>

          <div className="ms-3 flex items-center gap-1.5 border-s border-border ps-2 dark:border-white/10">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full p-1.5 text-muted outline-none transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-focus dark:hover:bg-white/5"
            >
              <Sun size={18} />
            </button>
            <NotificationDropdown tray />
          </div>
        </div>

        <div className="flex items-center gap-2 text-muted">
          <button
            onClick={() => {
              setIsEditingGroup(false)
              setShowNewChatModal(true)
            }}
            className="relative rounded-full p-2 outline-none transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-focus dark:hover:bg-white/5"
            title="دردشة جديدة"
            aria-label="دردشة جديدة"
          >
            <MessageSquarePlus size={22} />
          </button>
          {currentUser?.role === 'admin' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteAll()
              }}
              className="relative flex cursor-pointer items-center justify-center rounded-full p-2 text-error outline-none transition-colors hover:bg-error-light focus-visible:ring-2 focus-visible:ring-focus dark:hover:bg-error-soft"
              title="حذف جميع المحادثات"
            >
              <Trash2 size={22} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-border bg-card p-2 dark:border-white/5 dark:bg-card">
        <div className="relative flex items-center rounded-lg border-0 bg-hover px-3 py-1.5 outline-none ring-0 transition-colors dark:bg-card">
          <Search className="me-3 shrink-0 text-muted" size={18} />
          <input
            type="text"
            aria-label="البحث أو بدء دردشة"
            placeholder="البحث أو بدء دردشة جديدة"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-0 bg-transparent px-4 py-1 text-start text-sm font-medium text-main outline-none ring-0 placeholder:text-muted focus:ring-0"
          />
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3" aria-label="جاري تحميل المحادثات">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-1 py-2">
                <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-hover"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/2 animate-pulse rounded bg-hover"></div>
                  <div className="h-3 w-2/3 animate-pulse rounded bg-hover"></div>
                </div>
              </div>
            ))}
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center gap-4 p-6 text-center lg:p-12">
            <p className="text-sm font-bold text-error">تعذر تحميل المحادثات</p>
            <button
              onClick={onRetry}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-error px-5 py-2.5 text-sm font-bold text-on-error outline-none transition-all hover:bg-error-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
            >
              إعادة محاولة
            </button>
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => {
            const isSelected = selectedConv?.id === conv.id
            const isTyping = typingUsers.filter((u) => u.conversationId === conv.id).length > 0

            return (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={cn(
                  'relative flex w-full items-center gap-3 px-3 py-3 outline-none transition-colors hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-focus',
                  isSelected && 'bg-primary/10 dark:bg-primary/5',
                )}
              >
                <div className="relative shrink-0">
                  <div className="h-12 w-12 overflow-hidden rounded-full border border-border bg-surface shadow-elevation-1 dark:border-white/10 dark:bg-card">
                    <Image
                      src="/chat-avatar.webp"
                      alt="chat"
                      className="h-full w-full"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = '/chat-avatar.jpg'
                      }}
                    />
                  </div>
                </div>

                <div className="mt-1 min-w-0 flex-1 border-b border-border pb-3 text-start">
                  <div className="mb-0.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      {conv.isGroup && <ShieldCheck size={14} className="shrink-0 text-muted" />}
                      <h3
                        className={cn(
                          'truncate font-normal text-main',
                          conv.isGroup ? 'text-button' : 'text-base',
                        )}
                      >
                        {conv.displayName}
                      </h3>
                    </div>
                    {conv.lastMessageTime && (
                      <span
                        className={cn(
                          'text-xs font-normal tracking-tight',
                          (conv.unreadCount ?? 0) > 0 ? 'text-success' : 'text-muted',
                        )}
                      >
                        {conv.lastMessageTime && !isNaN(new Date(conv.lastMessageTime).getTime())
                          ? format(new Date(conv.lastMessageTime), 'h:mm a', { locale: ar })
                          : ''}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1 truncate">
                      {isTyping ? (
                        <span className="text-sm font-normal text-success">جاري الكتابة...</span>
                      ) : (
                        <p className="truncate text-sm leading-tight text-muted opacity-90">
                          {conv.lastMessage || 'لا توجد رسائل'}
                        </p>
                      )}
                    </div>

                    {(conv.unreadCount ?? 0) > 0 && (
                      <div className="ms-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-success px-1.5 text-xs font-medium text-on-success shadow-elevation-1">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-muted lg:p-12">
            <p className="text-xs font-bold text-muted">لا توجد محادثات نشطة</p>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-[100] w-full border-t border-success-soft bg-white/80 p-3 text-center dark:bg-card">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="animate-pulse text-success" />
          <span className="text-micro font-semibold uppercase tracking-label text-success">
            تواصل آمن ومشفر
          </span>
        </div>
      </div>
    </div>
  )
}

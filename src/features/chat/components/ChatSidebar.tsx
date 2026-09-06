import React, { useState } from 'react'
import { Search, ShieldCheck, MessageSquarePlus, Sun, Trash2 } from 'lucide-react'
import { NotificationDropdown } from '../../../components/ui/NotificationDropdown'
import { useDarkMode } from '../../../shared/hooks/useDarkMode'
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
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  selectedConv,
  currentUser,
  onDeleteAll,
  typingUsers,
}) => {
  const setSelectedConv = useChatUIStore((s) => s.setSelectedConv)
  const setShowNewChatModal = useChatUIStore((s) => s.setShowNewChatModal)
  const setIsEditingGroup = useChatUIStore((s) => s.setIsEditingGroup)
  const [searchQuery, setSearchQuery] = useState('')

  const [theme, setTheme] = useDarkMode()

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
              واتساب دارين السابعة
            </span>
            <span className="text-[10px] font-thin text-muted">تواصل أسهل وأسرع</span>
          </div>

          <div className="ms-3 flex items-center gap-1.5 border-s border-border ps-2 dark:border-white/10">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full p-1.5 text-muted transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Sun size={18} />
            </button>
            <NotificationDropdown tray />
          </div>
        </div>

        <div className="flex items-center gap-2 text-muted">
          {currentUser?.role === 'admin' && (
            <>
              <button
                onClick={() => {
                  setIsEditingGroup(false)
                  setShowNewChatModal(true)
                }}
                className="relative rounded-full p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                title="دردشة جديدة"
              >
                <MessageSquarePlus size={22} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteAll()
                }}
                className="relative flex cursor-pointer items-center justify-center rounded-full p-2 text-error transition-all hover:bg-error-light dark:hover:bg-error-soft"
                title="حذف جميع المحادثات"
              >
                <Trash2 size={22} strokeWidth={2.5} />
              </button>
            </>
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
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => {
            const isSelected = selectedConv?.id === conv.id
            const isTyping = typingUsers.filter((u) => u.conversationId === conv.id).length > 0

            return (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={cn(
                  'relative flex w-full items-center gap-3 px-3 py-3 transition-colors hover:bg-primary/5',
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

import { useState } from 'react'
import { ChevronRight, Search, MoreVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image } from '../../../shared/components/ui'
import { cn } from '../../../lib/utils'
import type { Conversation } from '../../../types/chat.types'
import type { User } from '../../../types/auth'

interface ChatWindowHeaderProps {
  selectedConv: Conversation
  currentUser: User | null
  openGroupSettings: () => void
  menuRef: React.RefObject<HTMLDivElement>
  onBack: () => void
  showMoreMenu: boolean
  onToggleMoreMenu: () => void
  onDeleteConversation: () => void
  typingInThisConv: { conversationId: string; name: string }[]
  messageSearch: string
  onMessageSearchChange: (value: string) => void
}

export const ChatWindowHeader = ({
  selectedConv,
  currentUser,
  openGroupSettings,
  menuRef,
  onBack,
  showMoreMenu,
  onToggleMoreMenu,
  onDeleteConversation,
  typingInThisConv,
  messageSearch,
  onMessageSearchChange,
}: ChatWindowHeaderProps) => {
  const [showSearchBar, setShowSearchBar] = useState(false)

  return (
    <header className="sticky top-0 z-[50] flex h-[60px] shrink-0 items-center justify-between bg-surface px-4 shadow-elevation-1 dark:bg-card">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="رجوع لقائمة المحادثات"
          className="p-1 text-muted lg:hidden"
        >
          <ChevronRight size={24} />
        </button>

        <div
          className={cn(
            'h-10 w-10 overflow-hidden rounded-full',
            selectedConv.isGroup && currentUser?.role === 'admin' ? 'cursor-pointer' : '',
          )}
          onClick={() =>
            selectedConv.isGroup && currentUser?.role === 'admin' && openGroupSettings()
          }
          role={selectedConv.isGroup && currentUser?.role === 'admin' ? 'button' : undefined}
          tabIndex={selectedConv.isGroup && currentUser?.role === 'admin' ? 0 : undefined}
          onKeyDown={
            selectedConv.isGroup && currentUser?.role === 'admin'
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openGroupSettings()
                  }
                }
              : undefined
          }
        >
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
          <h2
            className={cn(
              'max-w-[150px] truncate font-medium leading-tight text-main md:max-w-[300px]',
              selectedConv.isGroup ? 'text-sm' : 'text-base',
            )}
          >
            {selectedConv.displayName}
          </h2>
          {typingInThisConv.length > 0 ? (
            <span className="animate-pulse text-xs font-normal text-success">جاري الكتابة...</span>
          ) : (
            <span className="text-xs font-normal text-muted">
              {selectedConv.isGroup ? 'مجموعة' : 'محادثة مباشرة'}
            </span>
          )}
        </div>
      </div>

      {currentUser?.role === 'admin' && (
        <div className="flex items-center gap-5 text-muted">
          <div
            className={cn(
              'flex items-center rounded-full bg-white/10 px-3 py-1 transition-all dark:bg-background',
              showSearchBar ? 'w-40 opacity-100 md:w-64' : 'w-0 overflow-hidden p-0 opacity-0',
            )}
          >
            {showSearchBar && (
              <input
                type="text"
                placeholder="بحث..."
                aria-label="بحث في الرسائل"
                value={messageSearch}
                onChange={(e) => onMessageSearchChange(e.target.value)}
                className="w-full border-none bg-transparent text-start text-xs placeholder:text-muted focus:ring-0"
                autoFocus
              />
            )}
          </div>
          <button
            onClick={() => {
              setShowSearchBar(!showSearchBar)
              if (showSearchBar) onMessageSearchChange('')
            }}
            aria-label={showSearchBar ? 'إغلاق البحث' : 'بحث في الرسائل'}
            className={cn(
              'rounded-full p-2 transition-colors',
              showSearchBar
                ? 'bg-primary text-on-primary'
                : 'hover:bg-black/5 dark:hover:bg-white/5',
            )}
          >
            <Search size={20} />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={onToggleMoreMenu}
              aria-label="خيارات المحادثة"
              className="rounded-full p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            >
              <MoreVertical size={20} />
            </button>
            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute end-0 top-full z-[100] mt-2 w-48 rounded-md bg-card py-2 shadow-elevation-1"
                >
                  {selectedConv.isGroup && (
                    <button
                      onClick={() => {
                        openGroupSettings()
                        onToggleMoreMenu()
                      }}
                      className="w-full px-4 py-3 text-start text-sm font-medium text-main transition-colors hover:bg-hover"
                    >
                      تعديل المجموعة
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onDeleteConversation()
                      onToggleMoreMenu()
                    }}
                    className="w-full px-4 py-3 text-start text-sm text-error transition-colors hover:bg-hover"
                  >
                    حذف الدردشة
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </header>
  )
}

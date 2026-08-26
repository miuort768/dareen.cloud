import type { ReactNode } from 'react'
import { ChevronRight, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../../../context/AppContext'
import { useUnreadStore } from '../../../store/unreadStore'
import { cn } from '../../../lib/utils'

interface MobileTopBarProps {
  title?: string
  subtitle?: string
  showBack?: boolean
  backTo?: string
  avatar?: ReactNode
  actions?: ReactNode
  className?: string
}

/**
 * Sticky frosted-glass mobile app bar. Renders a back button (optional),
 * title/subtitle, and trailing actions. Safe-area top is provided globally.
 */
export const MobileTopBar = ({
  title,
  subtitle,
  showBack = false,
  backTo,
  avatar,
  actions,
  className,
}: MobileTopBarProps) => {
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount)

  const firstName = (currentUser?.name || currentUser?.username || '').split(' ')[0]

  return (
    <header
      className={cn(
        'sticky top-0 z-[90] border-b border-border bg-surface backdrop-blur-xl dark:bg-surface',
        className,
      )}
    >
      <div className="flex h-14 items-center justify-between gap-2 px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {showBack && (
            <button
              onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
              aria-label="رجوع"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-main transition-colors hover:bg-hover active:scale-95"
            >
              <ChevronRight size={18} />
            </button>
          )}
          {avatar ?? (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-deep shadow-elevation-1">
              <span className="text-xs font-bold text-on-primary">
                {(firstName || 'د').charAt(0)}
              </span>
            </div>
          )}
          <div className="min-w-0">
            {title && (
              <h1 className="truncate text-sm font-bold leading-tight text-main">{title}</h1>
            )}
            {subtitle && (
              <p className="truncate text-[11px] font-medium leading-snug text-muted">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {actions}
          <button
            onClick={() => navigate('/parent-announcements')}
            aria-label="الإعلانات"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted transition-colors hover:bg-hover active:scale-95"
          >
            <Bell size={16} strokeWidth={1.5} />
            {totalUnreadCount > 0 && (
              <span className="absolute -end-0.5 -top-0.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full border-2 border-surface bg-error px-1 text-[8px] font-bold text-on-error">
                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

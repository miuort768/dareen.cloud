import type { ReactNode } from 'react'
import { ChevronLeft, MoreHorizontal } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { triggerHaptic } from '../../../lib/haptics'

interface MobileListItemProps {
  leading?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
  onClick?: () => void
  showChevron?: boolean
  onMenu?: () => void
  className?: string
  selected?: boolean
}

/**
 * Tappable native-style list row: leading icon/avatar, title + subtitle,
 * optional trailing element, chevron, and a three-dot action menu.
 */
export const MobileListItem = ({
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  showChevron = false,
  onMenu,
  className,
  selected = false,
}: MobileListItemProps) => {
  const handleClick = () => {
    if (!onClick) return
    triggerHaptic('light')
    onClick()
  }

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleClick()
        }
      }}
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm',
        'transition-all duration-fast active:scale-[0.985]',
        'outline-none focus-visible:ring-2 focus-visible:ring-focus',
        onClick && 'cursor-pointer',
        selected && 'border-primary',
        className,
      )}
    >
      {leading && <div className="shrink-0">{leading}</div>}

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-main">{title}</div>
        {subtitle && (
          <div className="mt-0.5 truncate text-[11px] font-medium text-muted">{subtitle}</div>
        )}
      </div>

      {trailing && <div className="shrink-0">{trailing}</div>}

      {onMenu && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            triggerHaptic('light')
            onMenu()
          }}
          aria-label="خيارات أخرى"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
        >
          <MoreHorizontal size={18} strokeWidth={2} />
        </button>
      )}

      {showChevron && <ChevronLeft size={16} className="shrink-0 text-dim" />}
    </div>
  )
}

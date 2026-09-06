import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface MobilePageHeaderProps {
  title: string
  subtitle?: string
  /** Show a back chevron — navigates to backTo or history back */
  showBack?: boolean
  backTo?: string
  /** Leading icon chip next to the title */
  icon?: ReactNode
  /** Trailing primary action (button/icon) */
  action?: ReactNode
  className?: string
}

/**
 * Unified mobile page header: [Back] Title/subtitle [Action]
 * One-hand friendly, sticky-safe, RTL native. Desktop untouched.
 */
export const MobilePageHeader = ({
  title,
  subtitle,
  showBack = false,
  backTo,
  icon,
  action,
  className,
}: MobilePageHeaderProps) => {
  const navigate = useNavigate()

  return (
    <header className={cn('flex items-center gap-3 px-1 pb-1', className)}>
      {showBack && (
        <button
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          aria-label="رجوع"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-main outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
        >
          <ChevronRight size={20} />
        </button>
      )}
      {icon && (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-deep text-on-primary shadow-elevation-2 shadow-primary/20">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="font-outfit truncate text-lg font-black leading-tight text-main">{title}</h1>
        {subtitle && <p className="truncate text-[11px] font-medium text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

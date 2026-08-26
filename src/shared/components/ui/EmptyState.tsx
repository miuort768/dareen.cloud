import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  iconClassName?: string
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
  compact?: boolean
}

export const EmptyState = ({
  icon: Icon = Inbox,
  iconClassName,
  title,
  subtitle,
  action,
  className,
  compact = false,
}: EmptyStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center text-center',
      compact ? 'py-10' : 'py-16 md:py-20',
      className,
    )}
  >
    <div
      className={cn(
        'mb-4 flex items-center justify-center rounded-card border border-border bg-hover',
        compact ? 'h-12 w-12' : 'h-14 w-14 md:h-16 md:w-16',
      )}
    >
      <Icon size={compact ? 20 : 24} className={cn('text-muted', iconClassName)} />
    </div>
    <p className={cn('font-semibold text-main', compact ? 'text-sm' : 'text-base')}>{title}</p>
    {subtitle && <p className="mt-1 max-w-xs text-sm text-muted">{subtitle}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DashboardTone = 'primary' | 'success' | 'warning' | 'info' | 'error'

/* One colour pair per tone - soft tile fill + the readable strong text/icon colour */
const TONE: Record<DashboardTone, string> = {
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success-strong',
  warning: 'bg-warning-soft text-warning-strong',
  info: 'bg-info-soft text-info-strong',
  error: 'bg-error-soft text-error-strong',
}

interface DashboardSectionHeadProps {
  icon: LucideIcon
  title: string
  tone?: DashboardTone
  /** Secondary line under the title */
  description?: ReactNode
  /** Node rendered beside the title (count chip, rank badge) */
  afterTitle?: ReactNode
  /** Node pinned to the opposite edge (action button) */
  action?: ReactNode
  className?: string
}

/**
 * Single section headline for the dashboard cards.
 * 40px square icon tile (rounded-xl) + text-sm font-black title.
 * Replaces the four competing scales each card used to carry on its own
 * (h-8 / h-9 / h-11 tiles, text-xs / text-sm / text-base titles).
 */
export const DashboardSectionHead = ({
  icon: Icon,
  title,
  tone = 'primary',
  description,
  afterTitle,
  action,
  className,
}: DashboardSectionHeadProps) => (
  <div className={cn('mb-4 flex items-start justify-between gap-3', className)}>
    <div className="flex min-w-0 items-center gap-3">
      <div
        className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', TONE[tone])}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-black text-main">{title}</h3>
          {afterTitle}
        </div>
        {description && <p className="mt-0.5 text-[11px] font-medium text-muted">{description}</p>}
      </div>
    </div>
    {action}
  </div>
)

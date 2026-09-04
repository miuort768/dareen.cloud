import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../../lib/utils'

export interface SectionProps {
  /** Section heading — e.g. "جلسات اليوم" */
  title?: string
  /** Supporting line under the heading */
  subtitle?: string
  icon?: LucideIcon
  /** Secondary slot for section-level actions (e.g. "عرض الكل" link) */
  actions?: React.ReactNode
  /** Optional chips/counts rendered inline next to the title */
  meta?: React.ReactNode
  children?: React.ReactNode
  /** Vertical rhythm between heading and content */
  spacing?: 'sm' | 'md' | 'lg'
  className?: string
  contentClassName?: string
}

const spacingMap = {
  sm: 'mb-2',
  md: 'mb-3',
  lg: 'mb-4',
}

/**
 * Page section with identity: heading → supporting text → content.
 * Use instead of stacking random cards — gives every block on the page
 * a clear name and consistent heading typography.
 */
export const Section = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  meta,
  children,
  spacing = 'md',
  className,
  contentClassName,
}: SectionProps) => {
  const hasHeader = Boolean(title || subtitle || actions)
  return (
    <section className={cn('w-full', className)}>
      {hasHeader && (
        <div
          className={cn(
            'flex flex-wrap items-center justify-between gap-x-4 gap-y-2',
            spacingMap[spacing],
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Icon size={15} />
              </span>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-card-title font-bold leading-snug text-main">{title}</h2>
                {meta}
              </div>
              {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </section>
  )
}

Section.displayName = 'Section'

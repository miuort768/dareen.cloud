import React from 'react'
import { cn } from '../../../lib/utils'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  /** Primary action (single Button — the most important action on the page) */
  action?: React.ReactNode
  /** Secondary actions (secondary buttons, filters, etc.) — rendered before the primary action */
  actions?: React.ReactNode
  breadcrumbs?: React.ReactNode
  /** Optional toolbar row (search, filters) rendered under the title row, separated by a divider */
  toolbar?: React.ReactNode
  /** Optional meta chips rendered next to the title (counts, status) */
  meta?: React.ReactNode
  className?: string
}

/**
 * Unified page header for all dashboard pages (Desktop + Mobile).
 * Pattern: title + subtitle | meta chips | secondary actions + primary action.
 * Optionally a toolbar row (search/filters) under a divider.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  action,
  actions,
  breadcrumbs,
  toolbar,
  meta,
  className,
}) => {
  const hasActions = Boolean(action || actions)
  return (
    <div className={cn('mb-6 md:mb-8', className)}>
      {breadcrumbs && <div className="mb-3 md:mb-4">{breadcrumbs}</div>}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3 md:gap-4">
          {icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-soft md:h-14 md:w-14">
              {icon}
            </div>
          )}
          <div className="min-w-0 pt-1">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-main md:text-3xl">
                {title}
              </h1>
              {meta}
            </div>
            {subtitle && <p className="mt-1.5 text-sm text-dim md:text-base">{subtitle}</p>}
          </div>
        </div>
        {hasActions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 pt-1 md:gap-3">
            {actions}
            {action}
          </div>
        )}
      </div>

      {toolbar && <div className="mt-6 md:mt-8">{toolbar}</div>}
    </div>
  )
}

PageHeader.displayName = 'PageHeader'

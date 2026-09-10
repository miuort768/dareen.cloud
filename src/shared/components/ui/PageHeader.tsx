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
    <div className={cn('mb-4 md:mb-6', className)}>
      {breadcrumbs && <div className="mb-2 md:mb-3">{breadcrumbs}</div>}

      <div className="rounded-card border border-border bg-card p-3.5 shadow-card md:p-5">
        <div className="flex flex-wrap items-center gap-2.5 md:flex-nowrap md:justify-between md:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 md:gap-3">
            {icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary md:h-11 md:w-11">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                <h1 className="text-xl font-bold leading-tight text-main md:text-section">
                  {title}
                </h1>
                {meta}
              </div>
              {subtitle && <p className="mt-0.5 text-xs text-muted md:text-sm">{subtitle}</p>}
            </div>
          </div>
          {hasActions && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
              {action}
            </div>
          )}
        </div>

        {toolbar && (
          <div className="mt-3 border-t border-divider pt-3 md:mt-4 md:pt-4">{toolbar}</div>
        )}
      </div>
    </div>
  )
}

PageHeader.displayName = 'PageHeader'

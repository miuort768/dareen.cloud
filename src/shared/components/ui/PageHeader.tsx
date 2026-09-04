import React from 'react'
import { cn } from '../../../lib/utils'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  breadcrumbs?: React.ReactNode
  stats?: React.ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  actions,
  breadcrumbs,
  stats,
  className,
}) => {
  return (
    <div className={cn('mb-6', className)}>
      {breadcrumbs && <div className="mb-3">{breadcrumbs}</div>}

      <div className="rounded-card border border-border bg-card p-5 shadow-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-section font-bold text-main">{title}</h1>
              {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
            </div>
          </div>
          {actions && (
            <div className="flex shrink-0 flex-wrap items-center gap-2 max-md:w-full">
              {actions}
            </div>
          )}
        </div>

        {stats && (
          <div className="mt-5 border-t border-border pt-5">
            <div className="flex flex-wrap gap-4">{stats}</div>
          </div>
        )}
      </div>
    </div>
  )
}

PageHeader.displayName = 'PageHeader'

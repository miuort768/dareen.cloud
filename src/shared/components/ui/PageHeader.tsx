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
 * ترويسة موحدة وعصرية لصفحات النظام ولوحات الإدارة
 * تصميم فخم مع أيقونة Double-Bezel وعناوين عريضة واضحة.
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
    <div className={cn('mb-6 sm:mb-8', className)} dir="rtl">
      {breadcrumbs && <div className="mb-3 sm:mb-4">{breadcrumbs}</div>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3.5 sm:gap-4">
          {icon && (
            <div className="via-border/60 shrink-0 rounded-2xl bg-gradient-to-br from-primary/25 to-transparent p-1 shadow-soft">
              <div className="border-border/80 flex h-12 w-12 items-center justify-center rounded-xl border bg-card text-primary shadow-soft sm:h-14 sm:w-14">
                {icon}
              </div>
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <h1 className="font-heading text-2xl font-bold leading-tight tracking-tight text-main sm:text-3xl">
                {title}
              </h1>
              {meta}
            </div>
            {subtitle && (
              <p className="mt-1 text-xs font-normal text-muted sm:text-sm">{subtitle}</p>
            )}
          </div>
        </div>
        {hasActions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2.5 sm:gap-3">
            {actions}
            {action}
          </div>
        )}
      </div>

      {toolbar && (
        <div className="border-border/70 mt-5 border-t pt-4 sm:mt-6 sm:pt-5">{toolbar}</div>
      )}
    </div>
  )
}

PageHeader.displayName = 'PageHeader'

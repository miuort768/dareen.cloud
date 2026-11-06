import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MobileQuickActionItem {
  id?: string
  label: string
  icon: LucideIcon
  onClick: () => void
  tone?: string
}

export interface MobileQuickActionsRowProps {
  actions: MobileQuickActionItem[]
  title?: string
  viewAllText?: string
  onViewAll?: () => void
  className?: string
}

/**
 * شريط الإجراءات السريعة (4 أزرار مصفوفة أفقياً كبطاقات مستديرة وأيقونات معزولة)
 * كما في صور التصميم (Add Payment, Add Expense, Generate Report, Manage Students)
 */
export const MobileQuickActionsRow: React.FC<MobileQuickActionsRowProps> = ({
  actions,
  title = 'إجراءات سريعة',
  viewAllText,
  onViewAll,
  className,
}) => {
  return (
    <section className={cn('space-y-2.5', className)} dir="rtl">
      {(title || onViewAll) && (
        <div className="flex items-center justify-between px-0.5">
          {title && <h3 className="text-sm font-medium text-main">{title}</h3>}
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="text-xs font-normal text-primary hover:underline"
            >
              {viewAllText || 'عرض الكل >'}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {actions.map((act, idx) => {
          const Icon = act.icon
          return (
            <button
              key={act.id || idx}
              type="button"
              onClick={act.onClick}
              aria-label={act.label}
              className="border-border/80 group flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-2xl border bg-card p-2 shadow-elevation-1 outline-none transition-all duration-normal hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.95]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform duration-normal group-hover:scale-110 dark:bg-primary/20">
                <Icon size={20} strokeWidth={1.9} />
              </div>
              <span className="line-clamp-2 flex min-h-[24px] items-center justify-center text-center text-[10px] font-normal leading-tight text-main">
                {act.label}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

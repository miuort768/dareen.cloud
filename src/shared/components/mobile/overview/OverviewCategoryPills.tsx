import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface OverviewCategoryItem {
  id: string
  label: string
  icon?: LucideIcon
  count?: number
}

export interface OverviewCategoryPillsProps {
  categories: OverviewCategoryItem[]
  activeId: string
  onSelect: (id: string) => void
  className?: string
}

export const OverviewCategoryPills: React.FC<OverviewCategoryPillsProps> = ({
  categories,
  activeId,
  onSelect,
  className,
}) => {
  return (
    <div
      className={cn(
        'scrollbar-none -mx-1 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-1 py-1',
        className,
      )}
      dir="rtl"
    >
      {categories.map((cat) => {
        const isActive = cat.id === activeId
        const Icon = cat.icon

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              'group relative flex min-h-[40px] shrink-0 flex-row items-center justify-center gap-2 rounded-full px-4 py-2 outline-none transition-all duration-normal focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.96]',
              isActive
                ? 'bg-primary font-medium text-on-primary shadow-elevation-2 ring-1 ring-primary'
                : 'border-border/80 border bg-card text-muted shadow-elevation-1 hover:border-primary/30 hover:text-main',
            )}
          >
            {/* Icon container */}
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                isActive
                  ? 'bg-black/10 text-on-accent dark:bg-white/10'
                  : 'text-muted group-hover:text-main',
              )}
            >
              {Icon && <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />}
            </div>

            {/* Label */}
            <span className="whitespace-nowrap text-[11px] leading-none">{cat.label}</span>

            {/* Optional count badge */}
            {typeof cat.count === 'number' && (
              <span
                className={cn(
                  'font-dash text-[9px] font-medium leading-none',
                  isActive ? 'opacity-90' : 'text-dim',
                )}
              >
                {cat.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

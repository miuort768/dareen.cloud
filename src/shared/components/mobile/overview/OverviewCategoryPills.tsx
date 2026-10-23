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
              'group relative flex min-w-[76px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-[20px] p-2.5 outline-none transition-all duration-normal focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.96]',
              isActive
                ? 'bg-accent font-black text-on-accent shadow-elevation-2'
                : 'border border-border bg-card text-muted shadow-elevation-1 hover:border-border-strong hover:text-main',
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
                  'font-dash text-[9px] font-black leading-none',
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

import React from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface OverviewSearchFilterProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  onFilterClick?: () => void
  isFilterActive?: boolean
  className?: string
}

export const OverviewSearchFilter: React.FC<OverviewSearchFilterProps> = ({
  value,
  onChange,
  placeholder = 'بحث سريع...',
  onFilterClick,
  isFilterActive = false,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)} dir="rtl">
      {/* Search Input Box */}
      <div className="relative flex flex-1 items-center">
        <Search size={18} className="pointer-events-none absolute start-3.5 text-muted" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="placeholder:text-muted/70 h-11 w-full rounded-2xl border border-border bg-card pe-10 ps-10 text-xs font-medium text-main shadow-elevation-1 outline-none transition-all duration-normal focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="مسح نص البحث"
            className="absolute end-3 flex h-6 w-6 items-center justify-center rounded-full text-muted transition-colors hover:text-main focus-visible:ring-2 focus-visible:ring-focus"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter Button */}
      {onFilterClick && (
        <button
          type="button"
          onClick={onFilterClick}
          aria-label="تصفية النتائج"
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border outline-none transition-all duration-normal focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.96]',
            isFilterActive
              ? 'border-primary bg-primary text-on-primary shadow-elevation-1'
              : 'border-border bg-card text-main shadow-elevation-1 hover:bg-hover',
          )}
        >
          <SlidersHorizontal size={18} strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

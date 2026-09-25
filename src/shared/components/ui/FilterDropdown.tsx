import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, type LucideIcon } from 'lucide-react'
import { cn } from '../../../lib/utils'

export interface FilterItem {
  key: string
  label: string
  dot?: string
}

interface FilterDropdownProps {
  value: string
  items: FilterItem[]
  onChange: (key: string) => void
  icon?: LucideIcon
  className?: string
}

/** قائمة منسدلة مخصصة للفلاتر — بنفس أسلوب DayDropdown في صفحة الجدول */
export const FilterDropdown = ({
  value,
  items,
  onChange,
  icon: Icon,
  className,
}: FilterDropdownProps) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const activeItem = items.find((i) => i.key === value)
  const displayLabel = activeItem?.label ?? items[0]?.label ?? ''

  return (
    <div ref={ref} className={cn('relative flex', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`فلتر: ${displayLabel}`}
        className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-2xl border border-border bg-card px-3.5 text-start shadow-button outline-none transition-all duration-normal ease-out hover:border-primary hover:shadow-button-hover focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.985] active:shadow-button-pressed active:duration-fast"
      >
        {Icon && <Icon size={14} className="shrink-0 text-primary" />}
        {activeItem?.dot && (
          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', activeItem.dot)} />
        )}
        <span className="flex-1 truncate text-xs font-bold text-main">{displayLabel}</span>
        <ChevronDown
          size={14}
          className={cn(
            'shrink-0 text-muted transition-transform duration-fast',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute inset-x-0 z-50 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-border bg-card py-1 shadow-elevation-2"
        >
          {items.map((item) => {
            const isActive = item.key === value
            return (
              <button
                key={item.key || 'all'}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onChange(item.key)
                  setOpen(false)
                }}
                className={cn(
                  'flex h-11 w-full items-center gap-2.5 px-3.5 text-start outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus',
                  isActive ? 'bg-primary-soft text-primary' : 'text-main',
                )}
              >
                {item.dot ? (
                  <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', item.dot)} />
                ) : null}
                <span className="flex-1 truncate text-xs font-bold">{item.label}</span>
                {isActive && <Check size={14} className="shrink-0 text-primary" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

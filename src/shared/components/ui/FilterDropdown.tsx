import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
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
  icon?: React.ComponentType<{ size?: number; className?: string }>
  className?: string
}

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
  const hasSelection = Boolean(activeItem && activeItem.key !== '')

  return (
    <div ref={ref} className={cn('relative shrink-0', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`فلتر: ${displayLabel}`}
        className={cn(
          'flex h-10 items-center justify-center gap-1.5 rounded-xl border px-3 text-[11px] font-bold transition-all duration-200',
          hasSelection
            ? 'border-primary/30 bg-primary-soft text-primary'
            : 'border-border bg-surface text-main hover:border-primary/20',
        )}
      >
        {Icon && <Icon size={13} className="text-muted" />}
        {activeItem?.dot && (
          <span className={cn('h-1.5 w-1.5 rounded-full', activeItem.dot)} />
        )}
        {displayLabel}
        <ChevronDown
          size={13}
          className={cn('text-muted transition-transform duration-fast', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute start-0 z-50 mt-1.5 min-w-[170px] overflow-hidden rounded-xl border border-border bg-card py-1 shadow-elevation-2"
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
                  'flex w-full items-center gap-2 px-3.5 py-2.5 text-start text-[11px] font-bold transition-colors duration-fast hover:bg-hover',
                  isActive ? 'text-primary' : 'text-main',
                )}
              >
                {item.dot ? (
                  <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', item.dot)} />
                ) : (
                  <span className="h-1.5 w-1.5 shrink-0" />
                )}
                <span className="flex-1">{item.label}</span>
                {isActive && <Check size={13} className="shrink-0 text-primary" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

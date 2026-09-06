import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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
    <div ref={ref} className={cn('relative flex', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`فلتر: ${displayLabel}`}
        className={cn(
          'flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-all duration-normal md:text-[11px]',
          hasSelection
            ? 'border-primary/30 bg-primary-soft text-primary'
            : 'border-border bg-surface text-main hover:border-primary/20',
          open && 'border-primary ring-2 ring-primary/10',
        )}
      >
        {Icon && <Icon size={13} className="text-muted" />}
        {activeItem?.dot && <span className={cn('h-1.5 w-1.5 rounded-full', activeItem.dot)} />}
        {displayLabel}
        <ChevronDown
          size={13}
          className={cn('text-muted transition-transform duration-fast', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={{ transformOrigin: 'top center' }}
            className="absolute start-0 z-50 mt-1.5 max-h-[280px] min-w-[170px] overflow-y-auto rounded-xl border border-border bg-card py-1.5 shadow-elevation-3"
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
                    'flex min-h-[44px] w-full items-center gap-2 px-3.5 py-2.5 text-start text-xs font-bold transition-colors duration-fast hover:bg-hover md:min-h-0 md:text-[11px]',
                    isActive ? 'bg-primary-soft text-primary' : 'text-main',
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { CalendarDays, Check, ChevronDown } from 'lucide-react'
import { cn } from '../../../lib/utils'

const DAYS_OF_WEEK = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

interface DayDropdownProps {
  selectedDay: string
  onSelectDay: (day: string) => void
  todayName: string
  dayCounts: Record<string, number>
}

/** قائمة منسدلة مخصصة لأيام الأسبوع — مطابقة للثيم وتتجنب مشكلة صندوق المتصفح بالأبيض/الأسود */
export const DayDropdown = ({
  selectedDay,
  onSelectDay,
  todayName,
  dayCounts,
}: DayDropdownProps) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const options = [
    { label: 'كل الأيام', value: 'all' },
    ...DAYS_OF_WEEK.map((day) => ({ label: day, value: day })),
  ]
  const selectedLabel = selectedDay === 'all' ? 'كل الأيام' : selectedDay

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-2xl border border-border bg-card px-3.5 text-start outline-none transition-all hover:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-focus"
      >
        <CalendarDays size={14} className="shrink-0 text-primary" />
        <span className="flex-1 truncate text-xs font-bold text-main">{selectedLabel}</span>
        {selectedDay !== 'all' && (
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-micro font-black tabular-nums text-primary">
            {dayCounts[selectedDay] || 0}
          </span>
        )}
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
          className="absolute inset-x-0 z-40 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-border bg-card py-1 shadow-elevation-2"
        >
          {options.map((opt) => {
            const isToday = opt.value === todayName
            const count = opt.value === 'all' ? 0 : dayCounts[opt.value] || 0
            const selected = opt.value === selectedDay
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onSelectDay(opt.value)
                  setOpen(false)
                }}
                aria-selected={selected}
                className={cn(
                  'flex h-11 w-full items-center gap-2.5 px-3.5 text-start outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus',
                  selected ? 'bg-primary-soft text-primary' : 'text-main',
                )}
              >
                {isToday && opt.value !== 'all' && (
                  <span className="relative flex h-1.5 w-1.5 shrink-0 items-center justify-center">
                    <span className="absolute h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                )}
                <span className="flex-1 truncate text-xs font-bold">{opt.label}</span>
                {opt.value !== 'all' && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-micro font-black tabular-nums leading-none',
                      count > 0 ? 'bg-info text-on-info' : 'bg-surface text-muted',
                    )}
                  >
                    {count}
                  </span>
                )}
                {selected && <Check size={14} className="shrink-0 text-primary" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

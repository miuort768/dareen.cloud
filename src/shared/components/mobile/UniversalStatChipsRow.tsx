import { Link } from 'react-router-dom'
import { ChevronLeft, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface OverviewStatChip {
  label: string
  value: string | number
  icon: LucideIcon
  to?: string
  onClick?: () => void
  tone?: string
}

interface UniversalStatChipsRowProps {
  chips: OverviewStatChip[]
  className?: string
}

export const UniversalStatChipsRow = ({ chips, className }: UniversalStatChipsRowProps) => {
  if (!chips || chips.length === 0) return null

  return (
    <div
      className={cn(
        'scrollbar-none -mx-2 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-2 pb-1',
        className,
      )}
      dir="rtl"
    >
      {chips.map((chip) => {
        const Icon = chip.icon
        const tone = chip.tone || 'text-primary bg-primary-soft'

        const content = (
          <>
            <div className="mb-2 flex items-center justify-between">
              <span className={cn('flex h-8 w-8 items-center justify-center rounded-xl', tone)}>
                <Icon size={15} strokeWidth={1.9} />
              </span>
              <ChevronLeft
                size={12}
                className="text-dim opacity-0 transition-opacity group-hover:opacity-100"
              />
            </div>
            <p className="font-dash text-lg font-medium tabular-nums leading-none tracking-tight text-main">
              {chip.value}
            </p>
            <p className="mt-1 truncate text-[10px] font-normal text-muted">{chip.label}</p>
          </>
        )

        const baseClass = cn(
          'group w-[108px] shrink-0 snap-start rounded-2xl border border-border bg-card p-3 outline-none transition-all duration-normal hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.96] shadow-elevation-1',
        )

        if (chip.to) {
          return (
            <Link key={chip.label} to={chip.to} className={baseClass}>
              {content}
            </Link>
          )
        }

        return (
          <button
            key={chip.label}
            type="button"
            onClick={chip.onClick}
            className={cn(baseClass, 'text-start')}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}

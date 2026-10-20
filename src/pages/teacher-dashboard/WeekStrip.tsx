import { CalendarClock, UsersRound } from 'lucide-react'
import { cn } from '../../lib/utils'

interface WeekStripProps {
  counts: number[]
  /** false when the strip sits inside a merged framed container (e.g. Desktop) */
  framed?: boolean
}

const DAY_LABELS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']

/**
 * Week-at-a-glance — إعادة تصميم كاملة.
 * No compression, equal cells, today is primary-gradient accent.
 */
export const WeekStrip = ({ counts, framed = true }: WeekStripProps) => {
  const todayIdx = new Date().getDay()
  const weekTotal = counts.reduce((a, b) => a + b, 0)

  if (weekTotal === 0) return null

  const maxCount = Math.max(...counts, 1)

  const ordered = Array.from({ length: 7 }, (_, i) => {
    const idx = (todayIdx + i) % 7
    const count = counts[i] ?? 0
    const barPct = count > 0 ? Math.max(18, Math.round((count / maxCount) * 100)) : 0
    return {
      label: DAY_LABELS[idx],
      count,
      isToday: i === 0,
      barPct,
    }
  })

  return (
    <section
      aria-label="حمل الأسبوع القادم"
      className={cn(
        'flex h-full flex-col bg-card p-5 transition-colors duration-slow',
        framed && 'rounded-2xl border border-border shadow-elevation-1 shadow-primary/10',
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary shadow-elevation-1">
            <CalendarClock size={18} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-black text-main">أسبوعك القادم</h3>
            <p className="mt-0.5 text-[10px] font-bold text-muted">توزيع الحصص على الأيام السبع</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-black tabular-nums text-on-primary shadow-elevation-1">
          <UsersRound size={11} />
          <span>{weekTotal} حصص</span>
        </span>
      </div>

      <div className="grid flex-1 grid-cols-7 gap-px overflow-hidden rounded-none border border-border bg-border">
        {ordered.map((day) => (
          <div
            key={day.label}
            title={
              day.count > 0
                ? `${day.label}: ${day.count} ${day.count === 1 ? 'حصة' : 'حصص'}${day.isToday ? ' (اليوم)' : ''}`
                : `${day.label}: لا حصص`
            }
            className={cn(
              'group flex flex-col items-center justify-between bg-card p-2 transition-colors hover:bg-surface',
              day.isToday && 'border-t border-t-primary/60 bg-primary-soft',
            )}
          >
            <span
              className={cn('text-[10px] font-black', day.isToday ? 'text-primary' : 'text-muted')}
            >
              {day.label}
            </span>

            <div className="mt-1.5 flex h-10 w-full items-end overflow-hidden bg-surface">
              <div
                style={{ height: `${day.barPct}%` }}
                className={cn(
                  'w-full transition-all duration-500',
                  day.count > 0 ? 'bg-gradient-to-t from-primary to-primary-light' : 'bg-border',
                  day.isToday && 'min-h-[8px]',
                )}
              />
            </div>

            <span
              className={cn(
                'mt-1 text-sm font-black tabular-nums leading-none',
                day.isToday ? 'text-primary' : day.count > 0 ? 'text-main' : 'text-muted',
              )}
            >
              {day.count}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

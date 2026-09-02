import { cn } from '../../lib/utils'

interface WeekStripProps {
  counts: number[]
}

const DAY_LABELS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']

/**
 * Week-at-a-glance: scheduled session load for the next 7 days.
 * counts[i] is today (i=0) through six days ahead.
 */
export const WeekStrip = ({ counts }: WeekStripProps) => {
  const todayIdx = new Date().getDay()
  const weekTotal = counts.reduce((a, b) => a + b, 0)
  if (weekTotal === 0) return null

  const ordered = Array.from({ length: 7 }, (_, i) => {
    const idx = (todayIdx + i) % 7
    return { label: DAY_LABELS[idx], count: counts[i] ?? 0, isToday: i === 0 }
  })

  return (
    <section
      aria-label="حمل الأسبوع القادم"
      className="flex h-full flex-col rounded-3xl border border-border bg-card p-5 shadow-elevation-1 transition-colors duration-300"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-black text-main">أسبوعك القادم</h3>
        <span className="rounded-xl bg-primary-soft px-2.5 py-1 text-[11px] font-black tabular-nums text-primary dark:bg-primary/10">
          {weekTotal} {weekTotal === 1 ? 'حصة' : 'حصص'}
        </span>
      </div>

      <div className="grid flex-1 grid-cols-7 gap-1.5">
        {ordered.map((day) => (
          <div
            key={day.label}
            title={
              day.count > 0
                ? `${day.label}: ${day.count} ${day.count === 1 ? 'حصة' : 'حصص'}${day.isToday ? ' (اليوم)' : ''}`
                : `${day.label}: لا حصص`
            }
            className={cn(
              'flex cursor-default flex-col items-center justify-center gap-1.5 rounded-2xl px-0.5 py-3 transition-all duration-300 hover:-translate-y-0.5 sm:py-4',
              day.isToday
                ? 'bg-primary text-on-primary shadow-md shadow-primary/25'
                : day.count > 0
                  ? 'bg-primary-soft dark:bg-primary/10'
                  : 'bg-surface dark:bg-hover',
            )}
          >
            <span
              className={cn(
                'text-[9px] font-black sm:text-[10px]',
                day.isToday ? 'text-on-primary opacity-80' : 'text-muted',
              )}
            >
              {day.label}
            </span>
            <span
              className={cn(
                'text-lg font-black tabular-nums leading-none sm:text-xl',
                day.isToday
                  ? 'text-on-primary'
                  : day.count > 0
                    ? 'text-primary'
                    : 'text-dim opacity-60',
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

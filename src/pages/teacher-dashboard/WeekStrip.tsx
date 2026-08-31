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
  const max = Math.max(...counts, 1)
  const weekTotal = counts.reduce((a, b) => a + b, 0)
  if (weekTotal === 0) return null

  const ordered = Array.from({ length: 7 }, (_, i) => {
    const idx = (todayIdx + i) % 7
    return { label: DAY_LABELS[idx], count: counts[i] ?? 0, isToday: i === 0 }
  })

  return (
    <section
      aria-label="حمل الأسبوع القادم"
      className="rounded-3xl border border-border bg-surface p-4 shadow-sm transition-colors duration-300"
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-black text-main">أسبوعك القادم</h3>
        <span className="rounded-lg bg-primary-soft px-2.5 py-1 text-[11px] font-black tabular-nums text-primary">
          {weekTotal} {weekTotal === 1 ? 'حصة' : 'حصص'}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {ordered.map((day) => {
          const intensity = day.count / max
          return (
            <div
              key={day.label + day.count}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 transition-colors duration-300',
                day.isToday ? 'border-primary/40 bg-primary-soft' : 'border-border bg-surface',
              )}
            >
              <span
                className={cn('text-[9px] font-black', day.isToday ? 'text-primary' : 'text-muted')}
              >
                {day.label}
              </span>
              <div className="flex h-8 w-full items-end justify-center px-1">
                <div
                  className={cn(
                    'w-full rounded-sm transition-all duration-700',
                    day.count > 0 ? 'bg-primary' : 'bg-divider',
                  )}
                  style={{ height: `${day.count > 0 ? 20 + intensity * 80 : 12}%` }}
                  aria-hidden="true"
                />
              </div>
              <span
                className={cn(
                  'text-[11px] font-black tabular-nums',
                  day.count > 0 ? 'text-main' : 'text-muted/60',
                )}
              >
                {day.count}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

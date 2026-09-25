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

  const maxCount = Math.max(...counts, 1)

  const ordered = Array.from({ length: 7 }, (_, i) => {
    const idx = (todayIdx + i) % 7
    const count = counts[i] ?? 0
    return {
      label: DAY_LABELS[idx],
      count,
      isToday: i === 0,
      barPct: count > 0 ? Math.max(18, Math.round((count / maxCount) * 100)) : 6,
    }
  })

  return (
    <section
      aria-label="حمل الأسبوع القادم"
      className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-soft transition-colors duration-slow hover:shadow-elevation-1"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-black text-main">أسبوعك القادم</h3>
        <span className="rounded-xl bg-primary-soft px-3 py-1 text-[11px] font-bold tabular-nums text-primary">
          {weekTotal} {weekTotal === 1 ? 'حصة' : 'حصص'}
        </span>
      </div>

      <div className="grid flex-1 grid-cols-7 gap-2">
        {ordered.map((day) => (
          <div
            key={day.label}
            title={
              day.count > 0
                ? `${day.label}: ${day.count} ${day.count === 1 ? 'حصة' : 'حصص'}${day.isToday ? ' (اليوم)' : ''}`
                : `${day.label}: لا حصص`
            }
            className="flex cursor-default flex-col items-center gap-2 transition-all duration-slow hover:-translate-y-0.5"
          >
            <span
              className={cn(
                'text-[10px] font-bold',
                day.isToday ? 'text-primary' : day.count > 0 ? 'text-main' : 'text-muted',
              )}
            >
              {day.label}
            </span>

            <div className="flex h-20 w-full items-end justify-center">
              <div className="flex w-full items-end justify-center">
                <div
                  style={{ height: `${day.barPct}%` }}
                  className={cn(
                    'w-full max-w-[14px] rounded-full transition-all duration-slow',
                    day.isToday
                      ? 'bg-primary shadow-soft'
                      : day.count > 0
                        ? 'bg-info-soft'
                        : 'bg-hover',
                    day.isToday && 'min-h-[10px]',
                  )}
                />
              </div>
            </div>

            <span
              className={cn(
                'text-sm font-black tabular-nums leading-none',
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

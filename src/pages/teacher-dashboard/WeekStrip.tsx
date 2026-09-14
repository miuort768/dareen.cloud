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
      className="flex h-full flex-col rounded-card border border-border bg-card p-5 shadow-elevation-1 transition-colors duration-slow"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-black text-main">أسبوعك القادم</h3>
        <span className="rounded-lg bg-primary px-2.5 py-1 text-[11px] font-black tabular-nums text-on-primary shadow-elevation-1">
          {weekTotal} {weekTotal === 1 ? 'حصة' : 'حصص'}
        </span>
      </div>

      <div className="grid flex-1 grid-cols-7 gap-1.5 sm:gap-2">
        {ordered.map((day) => (
          <div
            key={day.label}
            title={
              day.count > 0
                ? `${day.label}: ${day.count} ${day.count === 1 ? 'حصة' : 'حصص'}${day.isToday ? ' (اليوم)' : ''}`
                : `${day.label}: لا حصص`
            }
            className="flex cursor-default flex-col items-center gap-1.5 transition-all duration-slow hover:-translate-y-0.5"
          >
            <span
              className={cn(
                'text-[9px] font-black sm:text-[10px]',
                day.isToday ? 'text-primary' : day.count > 0 ? 'text-info' : 'text-dim',
              )}
            >
              {day.label}
            </span>

            <div className="flex h-16 w-full items-end justify-center sm:h-20">
              <div className="flex w-full items-end justify-center rounded-lg">
                <div
                  style={{ height: `${day.barPct}%` }}
                  className={cn(
                    'w-full rounded-md transition-all duration-slow',
                    day.isToday
                      ? 'bg-gradient-to-t from-primary-deep to-primary shadow-elevation-2 shadow-primary/25 ring-1 ring-white/30'
                      : day.count > 0
                        ? 'bg-info'
                        : 'bg-hover dark:bg-hover',
                    day.isToday && 'min-h-2.5',
                  )}
                />
              </div>
            </div>

            <span
              className={cn(
                'text-sm font-black tabular-nums leading-none sm:text-base',
                day.isToday ? 'text-primary' : day.count > 0 ? 'text-info' : 'text-dim opacity-60',
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

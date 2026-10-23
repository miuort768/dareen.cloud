import { CalendarClock, UsersRound } from 'lucide-react'
import { cn } from '../../lib/utils'

interface WeekStripProps {
  counts: number[]
  /** false when the strip sits inside a merged framed container (e.g. Desktop) */
  framed?: boolean
}

const DAY_LABELS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']

/**
 * Week-at-a-glance — حمل الأسبوع القادم وتوزيع الحصص.
 * تصميم ناعم ومتناسق مع الوضعين الفاتح والداكن.
 */
export const WeekStrip = ({ counts, framed = true }: WeekStripProps) => {
  const todayIdx = new Date().getDay()
  const weekTotal = counts.reduce((a, b) => a + b, 0)

  if (weekTotal === 0) return null

  const maxCount = Math.max(...counts, 1)

  const ordered = Array.from({ length: 7 }, (_, i) => {
    const idx = (todayIdx + i) % 7
    const count = counts[i] ?? 0
    const barPct = count > 0 ? Math.max(20, Math.round((count / maxCount) * 100)) : 8
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
        'flex h-full flex-col justify-between bg-card p-4 transition-colors duration-slow sm:p-5',
        framed && 'rounded-2xl border border-border shadow-elevation-1',
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary shadow-elevation-1">
            <CalendarClock size={18} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-black text-main">أسبوعك القادم</h3>
            <p className="mt-0.5 text-[10px] font-bold text-muted">
              توزيع الحصص على الأيام القادمة
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-black tabular-nums text-on-primary shadow-elevation-1">
          <UsersRound size={12} />
          <span>{weekTotal} حصة</span>
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {ordered.map((day) => (
          <div
            key={day.label}
            title={
              day.count > 0
                ? `${day.label}: ${day.count} ${day.count === 1 ? 'حصة' : 'حصص'}${day.isToday ? ' (اليوم)' : ''}`
                : `${day.label}: لا حصص`
            }
            className={cn(
              'group flex flex-col items-center justify-between rounded-xl border p-2 transition-all duration-normal hover:-translate-y-0.5',
              day.isToday
                ? 'bg-primary-soft/60 border-primary/50 shadow-elevation-1'
                : 'border-border/70 bg-surface/50 hover:border-border hover:bg-surface',
            )}
          >
            <div className="flex items-center gap-1">
              {day.isToday && (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              )}
              <span
                className={cn(
                  'text-[10px] font-black',
                  day.isToday ? 'text-primary' : 'text-muted',
                )}
              >
                {day.label}
              </span>
            </div>

            <div className="bg-card/60 my-2 flex h-12 w-full items-end justify-center rounded-lg p-1">
              <div
                style={{ height: `${day.barPct}%` }}
                className={cn(
                  'w-full max-w-[14px] rounded-t-md transition-all duration-500',
                  day.count > 0
                    ? day.isToday
                      ? 'bg-gradient-to-t from-primary to-primary-hover shadow-elevation-1'
                      : 'bg-primary/40 group-hover:bg-primary/70'
                    : 'bg-border/60',
                )}
              />
            </div>

            <span
              className={cn(
                'font-dash text-xs font-black tabular-nums leading-none',
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

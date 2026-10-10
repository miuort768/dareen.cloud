import { CalendarClock, UsersRound } from 'lucide-react'
import { cn } from '../../lib/utils'

interface WeekStripProps {
  counts: number[]
}

const DAY_LABELS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']

/**
 * Week-at-a-glance — إعادة تصميم كاملة.
 * No compression, equal cells, today is primary-gradient accent.
 */
export const WeekStrip = ({ counts }: WeekStripProps) => {
  const todayIdx = new Date().getDay()
  const weekTotal = counts.reduce((a, b) => a + b, 0)

  if (weekTotal === 0) return null

  const maxCount = Math.max(...counts, 1)

  const ordered = Array.from({ length: 7 }, (_, i) => {
    const idx = (todayIdx + i) % 7
    const count = counts[i] ?? 0
    const barPct = count > 0 ? Math.max(18, Math.round((count / maxCount) * 100)) : 6
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
      className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-elevation-1 transition-colors duration-slow hover:shadow-elevation-2"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary shadow-elevation-1">
            <CalendarClock size={18} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-black text-main">أسبوعك القادم</h3>
            <p className="mt-0.5 text-[10px] font-bold text-muted">
              توزيع الحصص على الأيام السبع
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-black tabular-nums text-on-primary shadow-elevation-1">
          <UsersRound size={11} />
          <span>{weekTotal} حصص</span>
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
            className={cn(
              'group flex flex-col items-center gap-2 rounded-xl border px-1 py-2 transition-all duration-slow hover:-translate-y-0.5 hover:shadow-elevation-1',
              day.isToday
                ? 'border-primary bg-gradient-to-b from-primary-light via-primary-soft to-transparent'
                : day.count > 0
                  ? 'border-border bg-surface'
                  : 'border-border bg-card',
            )}
          >
            <span
              className={cn(
                'text-[10px] font-black',
                day.isToday ? 'text-primary' : 'text-muted',
              )}
            >
              {day.label}
            </span>

            <div className="flex h-24 w-full items-end justify-center">
              <div
                style={{ height: `${day.barPct}%` }}
                className={cn(
                  'w-full max-w-[12px] rounded-full transition-all duration-500',
                  day.isToday ? 'bg-primary shadow-soft' : day.count > 0 ? 'bg-info' : 'bg-border',
                  day.isToday && 'min-h-[10px]',
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

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
 * تصميم عصري بنمط Double-Bezel وشاشات Desktop فخمة.
 */
export const WeekStrip = ({ counts, framed = true }: WeekStripProps) => {
  const todayIdx = new Date().getDay()
  const weekTotal = counts.reduce((a, b) => a + b, 0)

  if (weekTotal === 0) return null

  const maxCount = Math.max(...counts, 1)

  const ordered = Array.from({ length: 7 }, (_, i) => {
    const idx = (todayIdx + i) % 7
    const count = counts[i] ?? 0
    const barPct = count > 0 ? Math.max(22, Math.round((count / maxCount) * 100)) : 10
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
        'flex h-full flex-col justify-between bg-card p-5 transition-all duration-slow sm:p-6',
        framed &&
          'border-border/80 rounded-[26px] border shadow-elevation-1 hover:shadow-elevation-2',
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary shadow-soft">
            <CalendarClock size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-main">أسبوعك القادم</h3>
            <p className="text-xs text-muted">توزيع الحصص والأنصبة على مدار الأيام</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold tabular-nums text-on-primary shadow-elevation-1">
          <UsersRound size={13} />
          <span>{weekTotal} حصة</span>
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
        {ordered.map((day) => (
          <div
            key={day.label}
            title={
              day.count > 0
                ? `${day.label}: ${day.count} ${day.count === 1 ? 'حصة' : 'حصص'}${day.isToday ? ' (اليوم)' : ''}`
                : `${day.label}: لا حصص`
            }
            className={cn(
              'group flex flex-col items-center justify-between rounded-2xl border p-2.5 transition-all duration-normal hover:-translate-y-1',
              day.isToday
                ? 'bg-primary-soft/70 border-primary/50 shadow-elevation-1'
                : 'border-border/70 bg-surface/60 hover:border-border hover:bg-surface',
            )}
          >
            <div className="flex items-center gap-1">
              {day.isToday && (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              )}
              <span
                className={cn('text-xs font-bold', day.isToday ? 'text-primary' : 'text-muted')}
              >
                {day.label}
              </span>
            </div>

            <div className="bg-card/70 my-2.5 flex h-16 w-full items-end justify-center rounded-xl p-1">
              <div
                style={{ height: `${day.barPct}%` }}
                className={cn(
                  'w-full max-w-[16px] rounded-t-lg transition-all duration-500',
                  day.count > 0
                    ? day.isToday
                      ? 'bg-gradient-to-t from-primary to-primary-hover shadow-elevation-1'
                      : 'bg-primary/40 group-hover:bg-primary/80'
                    : 'bg-divider/50',
                )}
              />
            </div>

            <span
              className={cn(
                'font-dash text-xs font-bold tabular-nums',
                day.count > 0 ? (day.isToday ? 'text-primary' : 'text-main') : 'text-muted/60',
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

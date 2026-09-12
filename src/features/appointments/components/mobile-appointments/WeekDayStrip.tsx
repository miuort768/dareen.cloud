import { cn } from '../../../../lib/utils'
import { DAYS_OF_WEEK } from '../../types'

interface WeekDayStripProps {
  selectedDay: string
  onSelectDay: (day: string) => void
  todayName: string
  /** عدد حصص كل يوم في التبويب الحالي (قبل فلترة اليوم) */
  dayCounts: Record<string, number>
}

/** شريط أيام الأسبوع — لمسة إبداعية: عدّادات حية + تمييز اليوم الحالي بنقطة نابضة */
export const WeekDayStrip = ({
  selectedDay,
  onSelectDay,
  todayName,
  dayCounts,
}: WeekDayStripProps) => (
  <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
    {(['الكل', ...DAYS_OF_WEEK] as string[]).map((day) => {
      const selected = selectedDay === day
      const isToday = day === todayName
      const count = day === 'الكل' ? 0 : dayCounts[day] || 0
      const hasAppointments = count > 0
      return (
        <button
          key={day}
          type="button"
          onClick={() => onSelectDay(day)}
          aria-pressed={selected}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95',
            selected
              ? 'border-transparent bg-gradient-to-l from-primary to-primary-deep text-on-primary shadow-elevation-1'
              : 'border-border bg-card text-main hover:border-info-soft hover:bg-info-soft hover:text-info',
          )}
        >
          {isToday && !selected && (
            <span className="relative flex h-1.5 w-1.5 items-center justify-center">
              <span className="absolute h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
          )}
          {day}
          {day !== 'الكل' && (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 tabular-nums leading-none',
                selected
                  ? 'bg-white/25 text-on-primary'
                  : hasAppointments
                    ? 'bg-info-soft text-info'
                    : 'bg-surface text-muted',
              )}
            >
              {count}
            </span>
          )}
        </button>
      )
    })}
  </div>
)

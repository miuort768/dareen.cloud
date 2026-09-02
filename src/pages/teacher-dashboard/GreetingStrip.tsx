import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { CalendarDays, Sparkles } from 'lucide-react'

interface GreetingStripProps {
  name: string
  studentsCount: number
  todayCount: number
  monthCompleted: number
  points?: number
}

const getGreeting = (): string => {
  const h = new Date().getHours()
  if (h < 5) return 'ليلة طيبة'
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'يوم سعيد'
  return 'مساء الخير'
}

export const GreetingStrip = ({
  name,
  studentsCount,
  todayCount,
  monthCompleted,
  points,
}: GreetingStripProps) => {
  const firstName = (name || 'المعلمة').split(' ')[0]

  const stats = [
    { value: studentsCount, label: studentsCount === 1 ? 'طالب' : 'طلاب' },
    { value: todayCount, label: 'حصص اليوم' },
    { value: monthCompleted, label: 'منجزة هذا الشهر' },
  ]

  return (
    <section
      aria-label="ترحيب"
      className="rounded-3xl border border-border bg-card p-5 shadow-elevation-1 transition-colors duration-300 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-black text-on-primary">
            {firstName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="mb-0.5 flex items-center gap-1.5 text-[11px] font-bold text-muted">
              <CalendarDays size={12} />
              {format(new Date(), 'eeee، d MMMM yyyy', { locale: ar })}
            </p>
            <h1 className="truncate text-xl font-black leading-tight text-main md:text-2xl">
              {getGreeting()}، أ. {firstName}
            </h1>
          </div>
        </div>

        {typeof points === 'number' && points > 0 && (
          <div
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary-soft px-3 py-2 dark:bg-primary/10"
            aria-label={`نقاطك ${points} نقطة`}
          >
            <Sparkles size={14} className="text-primary" />
            <span className="text-sm font-black tabular-nums leading-none text-primary">
              {points.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-3 divide-x divide-x-reverse divide-border border-t border-border pt-4">
        {stats.map(({ value, label }) => (
          <div key={label} className="px-2 text-center first:ps-0 last:pe-0">
            <p className="text-xl font-black tabular-nums leading-none text-main">{value}</p>
            <p className="mt-1.5 text-[11px] font-bold text-muted">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

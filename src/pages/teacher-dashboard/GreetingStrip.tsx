import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { CalendarDays, CheckCircle2, Sparkles, Users, CalendarCheck } from 'lucide-react'

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

  const tiles = [
    {
      icon: Users,
      value: studentsCount,
      label: studentsCount === 1 ? 'طالب' : 'طلاب',
      tone: 'bg-primary-soft text-primary dark:bg-primary/10',
    },
    {
      icon: CalendarCheck,
      value: todayCount,
      label: 'حصص اليوم',
      tone: 'bg-info-soft text-info-strong',
    },
    {
      icon: CheckCircle2,
      value: monthCompleted,
      label: 'منجزة هذا الشهر',
      tone: 'bg-success-soft text-success-strong',
    },
  ]

  return (
    <section
      aria-label="ترحيب"
      className="rounded-3xl border border-border bg-card p-5 shadow-elevation-1 transition-colors duration-300"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-black text-on-primary">
            {firstName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="mb-0.5 flex items-center gap-1.5 text-[11px] font-bold text-muted">
              <CalendarDays size={12} />
              {format(new Date(), 'eeee، d MMMM', { locale: ar })}
            </p>
            <h1 className="truncate text-lg font-black leading-tight text-main">
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

      <div className="mt-4 grid grid-cols-3 gap-2">
        {tiles.map(({ icon: Icon, value, label, tone }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-surface p-2.5 text-center"
          >
            <span
              className={`mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg ${tone}`}
            >
              <Icon size={13} />
            </span>
            <p className="text-sm font-black tabular-nums leading-none text-main">{value}</p>
            <p className="mt-1 text-[10px] font-bold text-muted">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

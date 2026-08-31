import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { CalendarDays, GraduationCap, BookOpen, ClipboardList } from 'lucide-react'

interface GreetingStripProps {
  name: string
  childCount: number
  subjectCount: number
  todayCount: number
  attendanceRate: number
}

const getGreeting = (): string => {
  const h = new Date().getHours()
  if (h < 5) return 'ليلة هادئة'
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'يوم سعيد'
  return 'مساء الخير'
}

export const GreetingStrip = ({
  name,
  childCount,
  subjectCount,
  todayCount,
  attendanceRate,
}: GreetingStripProps) => {
  const firstName = name.split(' ')[0] || name
  const tone =
    attendanceRate >= 90 ? 'text-success' : attendanceRate >= 75 ? 'text-warning' : 'text-error'

  const chips = [
    {
      icon: GraduationCap,
      label: childCount === 1 ? 'ابن واحد' : `${childCount} أبناء`,
    },
    { icon: BookOpen, label: `${subjectCount} ${subjectCount === 1 ? 'مادة' : 'مواد'}` },
    {
      icon: ClipboardList,
      label: todayCount > 0 ? `${todayCount} حصص اليوم` : 'لا حصص اليوم',
    },
  ]

  return (
    <section
      aria-label="ترحيب"
      className="relative overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-sm transition-colors duration-300 sm:p-6"
    >
      <div
        className="pointer-events-none absolute inset-y-0 start-0 w-1.5 bg-primary"
        aria-hidden="true"
      />

      <div className="flex flex-wrap items-center justify-between gap-4 ps-3">
        <div className="min-w-0">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-muted">
            <CalendarDays size={12} />
            {format(new Date(), 'eeee، d MMMM yyyy', { locale: ar })}
          </p>
          <h1 className="text-xl font-black leading-tight text-main md:text-2xl">
            {getGreeting()}، {firstName}
          </h1>
        </div>

        <div
          className="flex shrink-0 items-center gap-2 rounded-2xl border border-border px-3.5 py-2"
          aria-label={`نسبة الحضور الإجمالية ${attendanceRate} بالمئة`}
        >
          <span className={`text-lg font-black tabular-nums leading-none ${tone}`}>
            {attendanceRate}%
          </span>
          <span className="text-[11px] font-bold text-muted">
            الحضور
            <br />
            الإجمالي
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 ps-3">
        {chips.map((chip) => {
          const Icon = chip.icon
          return (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-[11px] font-bold text-primary"
            >
              <Icon size={12} />
              {chip.label}
            </span>
          )
        })}
      </div>
    </section>
  )
}

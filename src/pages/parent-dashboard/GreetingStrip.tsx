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

/** هيرو ترحيب ولي الأمر — تدرج primary مع شرائح زجاجية وعدّاد الحضور */
export const GreetingStrip = ({
  name,
  childCount,
  subjectCount,
  todayCount,
  attendanceRate,
}: GreetingStripProps) => {
  const firstName = name.split(' ')[0] || name

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
      className="relative overflow-hidden rounded-none bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-5 shadow-elevation-2 transition-colors duration-300 sm:p-6"
    >
      <div
        className="pointer-events-none absolute -end-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-14 -start-10 h-36 w-36 rounded-full bg-black/10 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-white/70">
            <CalendarDays size={12} />
            {format(new Date(), 'eeee، d MMMM yyyy', { locale: ar })}
          </p>
          <h1 className="text-xl font-black leading-tight text-on-primary md:text-2xl">
            {getGreeting()}، {firstName}
          </h1>
        </div>

        <div
          className="flex shrink-0 items-center gap-2 rounded-none border border-white/20 bg-white/10 px-3.5 py-2 backdrop-blur-sm"
          aria-label={`نسبة الحضور الإجمالية ${attendanceRate} بالمئة`}
        >
          <span className="text-lg font-black tabular-nums leading-none text-on-primary">
            {attendanceRate}%
          </span>
          <span className="text-[11px] font-bold text-white/70">
            الحضور
            <br />
            الإجمالي
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-4 flex flex-wrap gap-2">
        {chips.map((chip) => {
          const Icon = chip.icon
          return (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1.5 rounded-none border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-on-primary backdrop-blur-sm"
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

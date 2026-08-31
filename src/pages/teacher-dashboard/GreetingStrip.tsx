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

  const chips = [
    { label: studentsCount === 1 ? 'طالب واحد' : `${studentsCount} طلاب` },
    { label: todayCount > 0 ? `${todayCount} حصص اليوم` : 'لا حصص اليوم' },
    { label: `${monthCompleted} منجزة هذا الشهر` },
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
            {getGreeting()}، أ. {firstName}
          </h1>
        </div>

        {typeof points === 'number' && points > 0 && (
          <div
            className="flex shrink-0 items-center gap-2 rounded-2xl border border-border px-3.5 py-2"
            aria-label={`نقاطك ${points} نقطة`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning-soft">
              <Sparkles size={17} className="text-warning" />
            </div>
            <div>
              <p className="text-sm font-black tabular-nums leading-none text-warning">{points}</p>
              <p className="mt-1 text-[10px] font-bold text-muted">نقطة</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 ps-3">
        {chips.map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-[11px] font-bold text-primary"
          >
            {chip.label}
          </span>
        ))}
      </div>
    </section>
  )
}

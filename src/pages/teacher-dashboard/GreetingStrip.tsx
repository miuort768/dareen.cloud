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

/**
 * هيرو الترحيب — بطاقة عصرية ملونة بلمسات ناعمة:
 * أفاتار متدرج + شارات إحصائية ملونة + شارة نقاط صلبة.
 */
export const GreetingStrip = ({
  name,
  studentsCount,
  todayCount,
  monthCompleted,
  points,
}: GreetingStripProps) => {
  const firstName = (name || 'المعلمة').split(' ')[0]

  const chips = [
    {
      icon: Users,
      label: studentsCount === 1 ? 'طالب واحد' : `${studentsCount} طلاب`,
      tone: 'bg-primary-soft text-primary dark:bg-primary/10',
    },
    {
      icon: CalendarCheck,
      label: todayCount > 0 ? `${todayCount} حصص اليوم` : 'لا حصص اليوم',
      tone: 'bg-info-soft text-info-strong',
    },
    {
      icon: CheckCircle2,
      label: `${monthCompleted} منجزة هذا الشهر`,
      tone: 'bg-success-soft text-success-strong',
    },
  ]

  return (
    <section
      aria-label="ترحيب"
      className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-elevation-1 transition-colors duration-300 sm:p-6"
    >
      {/* زخارف ملونة ناعمة */}
      <div
        className="pointer-events-none absolute -start-10 -top-16 h-44 w-44 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -end-8 h-40 w-40 rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            {/* أفاتار متدرج بالحرف الأول */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-xl font-black text-on-primary shadow-lg shadow-primary/25">
              {firstName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="mb-0.5 flex items-center gap-1.5 text-xs font-bold text-muted">
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
              className="flex shrink-0 items-center gap-2.5 rounded-2xl bg-primary px-4 py-2.5 shadow-lg shadow-primary/25"
              aria-label={`نقاطك ${points} نقطة`}
            >
              <Sparkles size={17} className="text-on-primary" />
              <div>
                <p className="text-base font-black tabular-nums leading-none text-on-primary">
                  {points.toLocaleString()}
                </p>
                <p className="mt-0.5 text-[10px] font-bold text-on-primary opacity-80">نقطة</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${chip.tone}`}
            >
              <chip.icon size={12} />
              {chip.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

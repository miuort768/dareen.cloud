import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CalendarCheck,
  GraduationCap,
} from 'lucide-react'
import { cn } from '../../lib/utils'

export interface GreetingStripProps {
  name: string
  grade: string
  attendanceRate?: number
  sessionsUsed?: number
  sessionsTotal?: number
  nextSessionLabel?: string | null
}

const getGreeting = (): string => {
  const h = new Date().getHours()
  if (h < 5) return 'ليلة هادئة'
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'يوم سعيد'
  return 'مساء الخير'
}

/** هيرو ترحيبي عصري لهوية الطالب — تصميم Double-Bezel فائق الجاذبية */
export const GreetingStrip = ({
  name,
  grade,
  attendanceRate,
  sessionsUsed,
  sessionsTotal,
  nextSessionLabel,
}: GreetingStripProps) => {
  const firstName = (name || 'الطالب').split(' ')[0] || 'الطالب'
  const today = format(new Date(), 'eeee، d MMMM yyyy', { locale: ar })
  const hasSnapshot =
    attendanceRate !== undefined && sessionsUsed !== undefined && sessionsTotal !== undefined

  return (
    <section
      aria-label="ترحيب"
      className="via-border/50 to-primary-soft/30 relative rounded-[30px] bg-gradient-to-br from-primary/20 p-1 shadow-elevation-1 transition-all duration-normal hover:shadow-elevation-2 sm:p-1.5"
    >
      <div className="border-border/80 relative overflow-hidden rounded-[26px] border bg-card">
        {/* خلفية بلون الدور الناعم + حلقات زخرفية */}
        <div
          className="via-primary-soft/50 pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-light to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -end-14 -top-20 h-56 w-56 rounded-full border border-primary/10 lg:-end-20 lg:h-80 lg:w-80"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -end-4 -top-8 h-28 w-28 rounded-full border border-primary/10 bg-primary/5 lg:-end-10 lg:h-40 lg:w-40"
          aria-hidden="true"
        />

        <div className="relative z-10 p-5 sm:p-6 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="border-border/70 bg-surface/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-normal text-muted shadow-soft">
                <CalendarDays size={12} className="text-primary" />
                <span className="font-dash">{today}</span>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary shadow-soft">
                <GraduationCap size={13} />
                {grade || 'طالب'}
              </span>
            </div>

            <h1 className="mt-3 font-student-heading text-xl font-bold leading-tight text-main md:text-2xl xl:text-3xl">
              {getGreeting()}، {firstName}
            </h1>
            <p className="mt-1 text-xs font-normal leading-relaxed text-muted sm:text-sm">
              مستقبلك يبدأ بخطوة .. وأنتِ على الطريق الصحيح
            </p>
          </div>

          {/* لقطة أرقام سطح المكتب — تملأ الفراغ في نهاية الهيرو */}
          {hasSnapshot && (
            <div className="hidden shrink-0 gap-3 lg:flex" aria-label="ملخص مسيرتك الدراسية">
              <div className="border-border/80 bg-surface/60 group flex min-w-28 flex-col items-center gap-2 rounded-2xl border p-4 shadow-soft transition-all duration-normal hover:-translate-y-0.5 hover:bg-card hover:shadow-elevation-1">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-soft text-success shadow-soft transition-transform duration-normal group-hover:scale-110">
                  <CheckCircle2 size={16} />
                </span>
                <span className="font-dash text-xl font-bold tabular-nums leading-none text-main">
                  {attendanceRate}%
                </span>
                <span className="text-xs font-medium text-muted">نسبة الحضور</span>
              </div>

              <div className="border-border/80 bg-surface/60 group flex min-w-28 flex-col items-center gap-2 rounded-2xl border p-4 shadow-soft transition-all duration-normal hover:-translate-y-0.5 hover:bg-card hover:shadow-elevation-1">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary shadow-soft transition-transform duration-normal group-hover:scale-110">
                  <CalendarCheck size={16} />
                </span>
                <span className="font-dash text-xl font-bold tabular-nums leading-none text-main">
                  {sessionsUsed}
                  <span className="text-xs font-normal text-muted"> / {sessionsTotal}</span>
                </span>
                <span className="text-xs font-medium text-muted">حصص منفذة</span>
              </div>

              <div className="border-border/80 bg-surface/60 group flex min-w-28 flex-col items-center gap-2 rounded-2xl border p-4 shadow-soft transition-all duration-normal hover:-translate-y-0.5 hover:bg-card hover:shadow-elevation-1">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-info-soft text-info shadow-soft transition-transform duration-normal group-hover:scale-110">
                  <CalendarClock size={16} />
                </span>
                <span
                  className={cn(
                    'max-w-28 truncate text-xs font-bold leading-none text-main',
                    !nextSessionLabel && 'text-dim',
                  )}
                >
                  {nextSessionLabel || 'لا حصص اليوم'}
                </span>
                <span className="text-xs font-medium text-muted">الحصة القادمة</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

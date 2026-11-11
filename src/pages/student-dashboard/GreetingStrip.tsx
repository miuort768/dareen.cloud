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
        {/* خلفية بلون الدور الناعم + حلقات وإضاءة زخرفية */}
        <div
          className="via-primary-soft/50 pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-light to-transparent opacity-80"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -start-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl transition-opacity duration-slow lg:h-80 lg:w-80"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-16 -end-16 h-64 w-64 rounded-full bg-accent opacity-15 blur-3xl transition-opacity duration-slow lg:h-80 lg:w-80"
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

        <div className="relative z-10 p-5 sm:p-6 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:p-8 xl:p-9">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="bg-surface/80 inline-flex items-center gap-2 rounded-full border border-primary/20 px-3.5 py-1 text-xs font-normal text-muted shadow-soft backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                <CalendarDays size={13} className="text-primary" />
                <span className="font-dash">{today}</span>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3.5 py-1 text-xs font-semibold text-primary shadow-soft">
                <GraduationCap size={13} />
                {grade || 'طالب'}
              </span>
            </div>

            <h1 className="mt-3 font-student-heading text-xl font-black leading-tight tracking-tight text-main md:text-2xl lg:text-3xl xl:text-4xl">
              {getGreeting()}، {firstName}
            </h1>
            <p className="mt-1.5 text-xs font-normal leading-relaxed text-muted sm:text-sm lg:text-base">
              مستقبلك يبدأ بخطوة .. وأنتِ على الطريق الصحيح نحو القمة
            </p>
          </div>

          {/* لقطة أرقام سطح المكتب — تملأ الفراغ في نهاية الهيرو */}
          {hasSnapshot && (
            <div className="hidden shrink-0 gap-3.5 lg:flex" aria-label="ملخص مسيرتك الدراسية">
              <div className="border-border/80 bg-surface/80 p-4.5 group flex min-w-[130px] flex-col items-center gap-2.5 rounded-2xl border shadow-elevation-1 backdrop-blur-sm transition-all duration-normal hover:-translate-y-1 hover:bg-card hover:shadow-elevation-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-soft text-success shadow-soft transition-transform duration-normal group-hover:scale-110">
                  <CheckCircle2 size={18} />
                </span>
                <span className="font-dash text-2xl font-black tabular-nums leading-none text-main lg:text-3xl">
                  {attendanceRate}%
                </span>
                <span className="text-xs font-medium text-muted">نسبة الحضور</span>
              </div>

              <div className="border-border/80 bg-surface/80 p-4.5 group flex min-w-[130px] flex-col items-center gap-2.5 rounded-2xl border shadow-elevation-1 backdrop-blur-sm transition-all duration-normal hover:-translate-y-1 hover:bg-card hover:shadow-elevation-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary shadow-soft transition-transform duration-normal group-hover:scale-110">
                  <CalendarCheck size={18} />
                </span>
                <span className="font-dash text-2xl font-black tabular-nums leading-none text-main lg:text-3xl">
                  {sessionsUsed}
                  <span className="text-xs font-normal text-muted"> / {sessionsTotal}</span>
                </span>
                <span className="text-xs font-medium text-muted">حصص منفذة</span>
              </div>

              <div className="border-border/80 bg-surface/80 p-4.5 group flex min-w-[130px] flex-col items-center gap-2.5 rounded-2xl border shadow-elevation-1 backdrop-blur-sm transition-all duration-normal hover:-translate-y-1 hover:bg-card hover:shadow-elevation-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-soft text-info shadow-soft transition-transform duration-normal group-hover:scale-110">
                  <CalendarClock size={18} />
                </span>
                <span
                  className={cn(
                    'max-w-32 truncate text-sm font-bold leading-none text-main',
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

import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  BookOpen,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CalendarCheck,
  GraduationCap,
  PenLine,
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

/** هيرو ترحيبي متميّز لهوية الطالب الخضراء — تاريخ + ترحيب + شعار + شارة الصف + توضيح تعليمي */
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
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-elevation-1"
    >
      {/* خلفية خضراء ناعمة + هالات زخرفية */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-light via-primary-soft to-transparent"
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
            <p className="flex items-center gap-1.5 text-xs font-bold text-muted">
              <CalendarDays size={13} className="text-primary" />
              <span className="font-dash">{today}</span>
            </p>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-black text-on-primary shadow-elevation-1">
              <GraduationCap size={11} />
              {grade || 'طالب'}
            </span>
          </div>

          <h1 className="mt-3 text-xl font-black leading-tight text-main md:text-2xl xl:text-3xl">
            {getGreeting()}، {firstName}
          </h1>
          <p className="mt-1 text-xs font-bold leading-relaxed text-muted sm:text-sm xl:text-base">
            مستقبلك يبدأ بخطوة .. وأنتِ على الطريق الصحيح
          </p>

          {/* توضيح تعليمي بأيقونات كتب/قلم/تقويم */}
          <div className="mt-4 flex items-end justify-between gap-3" aria-hidden="true">
            <div className="flex items-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-elevation-2">
                <BookOpen size={20} />
              </span>
              <div className="-ms-2 space-y-1.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-info shadow-elevation-1">
                  <PenLine size={13} />
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-success-strong shadow-elevation-1">
                  <CalendarDays size={13} />
                </span>
              </div>
            </div>

            <span className="mb-1 hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-bold text-muted shadow-elevation-1 sm:inline-flex lg:mb-0">
              <PenLine size={10} className="text-primary" />
              رحلتك التعليمية تبدأ اليوم
            </span>
          </div>
        </div>

        {/* لقطة أرقام سطح المكتب — تملأ الفراغ في نهاية الهيرو */}
        {hasSnapshot && (
          <div className="hidden shrink-0 gap-3 lg:flex" aria-label="ملخص مسيرتك الدراسية">
            <div className="flex min-w-28 flex-col items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-elevation-1">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-soft text-success-strong">
                <CheckCircle2 size={16} />
              </span>
              <span className="font-dash text-lg font-black tabular-nums leading-none text-main">
                {attendanceRate}%
              </span>
              <span className="text-[10px] font-bold text-muted">نسبة الحضور</span>
            </div>

            <div className="flex min-w-28 flex-col items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-elevation-1">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <CalendarCheck size={16} />
              </span>
              <span className="font-dash text-lg font-black tabular-nums leading-none text-main">
                {sessionsUsed}
                <span className="text-[10px] font-bold text-muted"> / {sessionsTotal}</span>
              </span>
              <span className="text-[10px] font-bold text-muted">حصص منفذة</span>
            </div>

            <div className="flex min-w-28 flex-col items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-elevation-1">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-info-soft text-info-strong">
                <CalendarClock size={16} />
              </span>
              <span
                className={cn(
                  'max-w-24 truncate text-sm font-black leading-none text-main',
                  !nextSessionLabel && 'text-dim',
                )}
              >
                {nextSessionLabel || 'لا حصص'}
              </span>
              <span className="text-[10px] font-bold text-muted">الحصة القادمة</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

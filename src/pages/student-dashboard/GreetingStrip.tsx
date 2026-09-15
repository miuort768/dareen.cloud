import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { BookOpen, CalendarDays, GraduationCap, PenLine } from 'lucide-react'

export interface GreetingStripProps {
  name: string
  grade: string
}

const getGreeting = (): string => {
  const h = new Date().getHours()
  if (h < 5) return 'ليلة هادئة'
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'يوم سعيد'
  return 'مساء الخير'
}

/** هيرو ترحيبي متميّز لهوية الطالب الخضراء — تاريخ + ترحيب + شعار + شارة الصف + توضيح تعليمي */
export const GreetingStrip = ({ name, grade }: GreetingStripProps) => {
  const firstName = (name || 'الطالب').split(' ')[0] || 'الطالب'
  const today = format(new Date(), 'eeee، d MMMM yyyy', { locale: ar })

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
        className="pointer-events-none absolute -end-14 -top-20 h-56 w-56 rounded-full border border-primary/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -end-4 -top-8 h-28 w-28 rounded-full border border-primary/10 bg-primary/5"
        aria-hidden="true"
      />

      <div className="relative z-10 p-5 sm:p-6">
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

        <h1 className="mt-3 text-xl font-black leading-tight text-main md:text-2xl">
          {getGreeting()}، {firstName}
        </h1>
        <p className="mt-1 text-xs font-bold leading-relaxed text-muted sm:text-sm">
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

          <span className="mb-1 hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-bold text-muted shadow-elevation-1 sm:inline-flex">
            <PenLine size={10} className="text-primary" />
            رحلتك التعليمية تبدأ اليوم
          </span>
        </div>
      </div>
    </section>
  )
}

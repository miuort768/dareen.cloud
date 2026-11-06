import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { BookOpen, ClipboardList, UserRound, Users } from 'lucide-react'
import { CountUp } from '../../shared/components/CountUp'

export interface GreetingStripProps {
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

/** هيرو ترحيبي عصري لهوية شريك النجاح — تصميم Double-Bezel فائق الجاذبية */
export const GreetingStrip = ({
  childCount,
  subjectCount,
  todayCount,
  attendanceRate,
}: GreetingStripProps) => {
  const today = format(new Date(), 'eeee، d MMMM yyyy', { locale: ar })
  const RING_SIZE = 56
  const RING_RADIUS = 24
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
  const clampedRate = Math.min(Math.max(attendanceRate, 0), 100)

  return (
    <section
      aria-label="ترحيب"
      className="via-border/50 to-primary-soft/30 relative rounded-[30px] bg-gradient-to-br from-primary/20 p-1 shadow-elevation-1 transition-all duration-normal hover:shadow-elevation-2 sm:p-1.5"
    >
      <div className="border-border/80 relative overflow-hidden rounded-[26px] border bg-card">
        {/* خلفية ناعمة + هالات زخرفية */}
        <div
          className="via-primary-soft/50 pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-light to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -end-14 -top-20 h-56 w-56 rounded-full border border-accent opacity-30 lg:-end-20 lg:h-80 lg:w-80"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -end-4 -top-8 h-28 w-28 rounded-full border border-primary/10 bg-primary/5 lg:-end-10 lg:h-40 lg:w-40"
          aria-hidden="true"
        />

        <div className="relative z-10 p-5 sm:p-6 lg:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="border-border/70 bg-surface/80 mb-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-normal text-muted shadow-soft">
                <UserRound size={12} className="text-primary" />
                <span className="font-dash">{today}</span>
              </div>

              <h1 className="font-parent-heading text-xl font-bold leading-tight text-main md:text-2xl xl:text-3xl">
                {getGreeting()}، شريك النجاح
              </h1>

              <p className="mt-1 text-xs font-normal text-muted">
                نبض يومي ومتابعة دقيقة وشاملة لمسيرة أبنائك
              </p>
            </div>

            {/* حلقة الحضور الإجمالية */}
            <div
              className="border-border/60 bg-surface/50 flex shrink-0 flex-col items-center gap-1 rounded-2xl border p-2.5 shadow-soft"
              aria-label={`نسبة الحضور الإجمالية ${attendanceRate} بالمئة`}
            >
              <div className="relative flex items-center justify-center">
                <svg
                  width={RING_SIZE}
                  height={RING_SIZE}
                  viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
                  className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16"
                >
                  <circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_RADIUS}
                    fill="none"
                    stroke="currentColor"
                    className="text-primary/15"
                    strokeWidth={5}
                  />
                  <motion.circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_RADIUS}
                    fill="none"
                    stroke="currentColor"
                    className="text-primary"
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
                    animate={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - clampedRate / 100) }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                  />
                </svg>
                <span className="absolute flex items-baseline gap-0.5">
                  <CountUp
                    value={attendanceRate}
                    format={(n) => `${Math.round(n)}`}
                    className="font-dash text-sm font-bold tabular-nums leading-none text-primary sm:text-base lg:text-lg"
                  />
                  <span className="text-[10px] font-bold leading-none text-primary">%</span>
                </span>
              </div>
              <span className="whitespace-nowrap text-[10px] font-medium text-muted">
                الحضور الإجمالي
              </span>
            </div>
          </div>

          <p className="mt-2.5 max-w-xl text-xs font-normal leading-relaxed text-muted sm:text-sm">
            متابعتك اليومية تصنع الفرق .. وأبناؤك في أيدٍ أمينة مع نخبة المعلمات
          </p>

          {/* رقائق البيانات */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary shadow-soft">
              <Users size={12} />
              {childCount === 1 ? 'ابن واحد' : `${childCount} أبناء`}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent shadow-soft">
              <BookOpen size={12} />
              {subjectCount} {subjectCount === 1 ? 'مادة' : 'مواد'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary shadow-soft">
              <ClipboardList size={12} />
              {todayCount > 0 ? `${todayCount} حصص اليوم` : 'لا حصص اليوم'}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

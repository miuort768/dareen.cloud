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
        {/* خلفية ناعمة + هالات وإضاءة زخرفية */}
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

        <div className="relative z-10 p-5 sm:p-6 lg:p-8 xl:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="min-w-0 flex-1">
              <div className="bg-surface/80 mb-2.5 inline-flex items-center gap-2 rounded-full border border-primary/20 px-3.5 py-1 text-xs font-normal text-muted shadow-soft backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                <UserRound size={13} className="text-primary" />
                <span className="font-dash">{today}</span>
              </div>

              <h1 className="font-parent-heading text-xl font-black leading-tight tracking-tight text-main md:text-2xl lg:text-3xl xl:text-4xl">
                {getGreeting()}، شريك النجاح
              </h1>

              <p className="mt-1.5 max-w-xl text-xs font-normal leading-relaxed text-muted sm:text-sm lg:text-base">
                نبض يومي ومتابعة دقيقة وشاملة لمسيرة أبنائك .. مع نخبة المعلمات المتميزات
              </p>

              {/* رقائق البيانات */}
              <div className="mt-4 flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-on-primary shadow-soft transition-transform hover:scale-105">
                  <Users size={13} />
                  {childCount === 1 ? 'ابن واحد' : `${childCount} أبناء`}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-on-accent shadow-soft transition-transform hover:scale-105">
                  <BookOpen size={13} />
                  {subjectCount} {subjectCount === 1 ? 'مادة' : 'مواد'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3.5 py-1.5 text-xs font-semibold text-primary shadow-soft transition-transform hover:scale-105">
                  <ClipboardList size={13} />
                  {todayCount > 0 ? `${todayCount} حصص اليوم` : 'لا حصص اليوم'}
                </span>
              </div>
            </div>

            {/* حلقة الحضور الإجمالية */}
            <div
              className="border-border/80 bg-surface/80 flex shrink-0 flex-col items-center gap-2 rounded-2xl border p-4 shadow-elevation-1 backdrop-blur-sm transition-all duration-normal hover:shadow-elevation-2 sm:p-5 lg:min-w-[150px]"
              aria-label={`نسبة الحضور الإجمالية ${attendanceRate} بالمئة`}
            >
              <div className="relative flex items-center justify-center">
                <svg
                  width={RING_SIZE}
                  height={RING_SIZE}
                  viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
                  className="lg:h-18 lg:w-18 h-14 w-14 sm:h-16 sm:w-16"
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
                    className="font-dash text-base font-black tabular-nums leading-none text-primary sm:text-lg lg:text-xl"
                  />
                  <span className="text-[11px] font-bold leading-none text-primary">%</span>
                </span>
              </div>
              <span className="whitespace-nowrap text-xs font-semibold text-muted">
                الحضور الإجمالي
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

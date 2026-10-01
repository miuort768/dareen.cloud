import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { CalendarDays, CheckCircle2, Sparkles, Users, UserRound } from 'lucide-react'
import { CountUp } from '../../shared/components/CountUp'
import { hasMonthSessions, monthCompletionPercent } from './heroMetrics'

export interface GreetingStripProps {
  name: string
  studentsCount: number
  todayCount: number
  monthCompleted: number
  monthTotal: number
  points?: number
}

const getGreeting = (): string => {
  const h = new Date().getHours()
  if (h < 5) return 'ليلة طيبة'
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'يوم سعيد'
  return 'مساء الخير'
}

const RING_SIZE = 56
const RING_RADIUS = 24
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

/** Teacher hero — violet identity. Soft tinted card + decorative rings + month-completion ring. */
export const GreetingStrip = ({
  name,
  studentsCount,
  todayCount,
  monthCompleted,
  monthTotal,
  points,
}: GreetingStripProps) => {
  const firstName = (name || 'المعلمة').split(' ')[0] || 'المعلمة'
  const today = format(new Date(), 'eeee، d MMMM yyyy', { locale: ar })
  const percent = monthCompletionPercent(monthCompleted, monthTotal)
  const showRing = hasMonthSessions(monthTotal)

  return (
    <section
      aria-label="ترحيب"
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-elevation-1"
    >
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

      <div className="relative z-10 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-bold text-muted">
              <UserRound size={13} className="text-primary" />
              <span className="font-dash">{today}</span>
            </p>

            <h1 className="mt-3 text-xl font-black leading-tight text-main md:text-2xl xl:text-3xl">
              {getGreeting()}، {firstName}
            </h1>

            <p className="mt-1 text-[11px] font-bold text-muted xl:text-xs">
              ملخص يومك التعليمي في مكان واحد
            </p>
          </div>

          <div
            className="flex shrink-0 flex-col items-center gap-1.5"
            aria-label={`إنجاز حصص الشهر ${percent} بالمئة`}
          >
            <div className="relative flex items-center justify-center">
              <svg
                width={RING_SIZE}
                height={RING_SIZE}
                viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
                className="lg:h-20 lg:w-20"
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
                  animate={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - percent / 100) }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                />
              </svg>
              <span className="absolute flex items-baseline gap-0.5">
                <CountUp
                  value={percent}
                  format={(n) => `${Math.round(n)}`}
                  className="font-dash text-base font-black tabular-nums leading-none text-primary lg:text-xl lg:leading-none"
                />
                <span className="text-[11px] font-black leading-none text-primary lg:text-xs">
                  %
                </span>
              </span>
            </div>
            <span className="whitespace-nowrap text-[10px] font-bold text-muted">
              {showRing ? 'إنجاز حصص الشهر' : 'لا حصص هذا الشهر'}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[10px] font-black text-on-primary shadow-elevation-1 lg:px-3 lg:py-1.5 lg:text-xs">
            <Users size={11} />
            {studentsCount === 1 ? 'طالب واحد' : `${studentsCount} طلاب`}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-black text-primary lg:px-3 lg:py-1.5 lg:text-xs">
            <CalendarDays size={11} />
            {todayCount > 0 ? `${todayCount} حصص اليوم` : 'لا حصص اليوم'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-black text-primary lg:px-3 lg:py-1.5 lg:text-xs">
            <CheckCircle2 size={11} />
            {showRing ? `${monthCompleted} من ${monthTotal}` : 'لا إنجاز بعد'}
          </span>
          {typeof points === 'number' && points > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-black text-primary lg:px-3 lg:py-1.5 lg:text-xs">
              <Sparkles size={11} />
              {points} نقطة
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

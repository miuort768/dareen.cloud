import { motion } from 'framer-motion'
import { CalendarDays, CheckCircle2, XCircle, Clock3, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { fadeUpStatic } from '../../../../shared/animations/fadeUp'
import { CountUp } from '../../../../shared/components/CountUp'
import { cn } from '../../../../lib/utils'

interface AttendanceHeroCardProps {
  completedToday: number
  cancelledToday: number
  scheduledToday: number
  date?: string
  onDateChange?: (date: string) => void
}

const RING_RADIUS = 32
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export const AttendanceHeroCard = ({
  completedToday,
  cancelledToday,
  scheduledToday,
  date,
  onDateChange,
}: AttendanceHeroCardProps) => {
  const resolved = completedToday + cancelledToday
  const rate = resolved > 0 ? Math.round((completedToday / resolved) * 100) : 100

  const getStatusBadge = () => {
    if (resolved === 0 && scheduledToday > 0) {
      return { text: 'في انتظار البدء', tone: 'bg-white/15 text-white' }
    }
    if (rate >= 90) return { text: 'حضور ممتاز', tone: 'bg-success/30 text-white' }
    if (rate >= 75) return { text: 'حضور جيد', tone: 'bg-accent opacity-90 text-on-accent' }
    return { text: 'متابعة مطلوبة', tone: 'bg-error/30 text-white' }
  }

  const status = getStatusBadge()

  // Format today date in Arabic
  const formattedDate = date
    ? format(new Date(date), 'eeee، d MMMM yyyy', { locale: ar })
    : format(new Date(), 'eeee، d MMMM yyyy', { locale: ar })

  const stats = [
    {
      label: 'حضور',
      value: completedToday,
      icon: CheckCircle2,
      boxClass: 'bg-success/20 border-success/30',
      iconClass: 'text-success',
    },
    {
      label: 'غياب',
      value: cancelledToday,
      icon: XCircle,
      boxClass: 'bg-error/20 border-error/30',
      iconClass: 'text-error',
    },
    {
      label: 'متبقي',
      value: scheduledToday,
      icon: Clock3,
      boxClass: 'bg-white/15 border-white/20',
      iconClass: 'text-white/90',
    },
  ]

  return (
    <motion.div {...fadeUpStatic} className="pb-2 pt-2">
      {/* Outer Double-Bezel Frame */}
      <div className="to-primary-deep/40 relative rounded-[28px] bg-gradient-to-br from-white/25 via-primary/30 p-1 shadow-elevation-2 transition-all">
        {/* Inner Card */}
        <div className="relative overflow-hidden rounded-[24px] border border-white/25 bg-gradient-to-br from-primary via-primary-active to-primary-deep p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] sm:p-5">
          {/* Ambient Lighting */}
          <div
            className="pointer-events-none absolute -start-14 -top-14 h-48 w-48 rounded-full bg-white/20 blur-2xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-14 -end-14 h-48 w-48 rounded-full bg-accent opacity-25 blur-2xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.18),rgba(255,255,255,0))] opacity-80"
            aria-hidden="true"
          />

          {/* Top Info Bar */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-normal text-white/95 shadow-soft backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span>جلسات اليوم المباشرة</span>
            </div>

            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border border-white/20 px-2.5 py-0.5 text-[11px] font-bold shadow-soft backdrop-blur-md',
                status.tone,
              )}
            >
              <Sparkles size={11} />
              {status.text}
            </span>
          </div>

          {/* Central Showcase: Ring + Stats */}
          <div className="relative z-10 mt-3.5 flex items-center gap-3 sm:gap-4">
            {/* Circular Gauge */}
            <div
              className="relative flex h-[82px] w-[82px] shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-1 shadow-elevation-1 backdrop-blur-md sm:h-[88px] sm:w-[88px]"
              role="img"
              aria-label={`نسبة الحضور ${rate} بالمئة`}
            >
              <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
                {/* Background Ring Track */}
                <circle
                  cx="40"
                  cy="40"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="6.5"
                />
                {/* Animated Glowing Progress Ring */}
                <motion.circle
                  cx="40"
                  cy="40"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="white"
                  strokeWidth="6.5"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
                  animate={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - rate / 100) }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                />
              </svg>

              {/* Inside Ring Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="flex items-baseline font-dash text-xl font-black tabular-nums leading-none text-on-primary sm:text-2xl">
                  <CountUp value={rate} />
                  <span className="ms-0.5 text-xs font-bold">%</span>
                </span>
                <span className="mt-0.5 text-[10px] font-medium text-white/80">نسبة الحضور</span>
              </div>
            </div>

            {/* Quick Metric Tiles */}
            <div className="grid min-w-0 flex-1 grid-cols-3 gap-1.5 sm:gap-2">
              {stats.map((s) => {
                const Icon = s.icon
                return (
                  <div
                    key={s.label}
                    className={cn(
                      'flex flex-col items-center justify-center rounded-xl border p-2 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-md transition-transform duration-normal active:scale-95',
                      s.boxClass,
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <Icon size={12} className={s.iconClass} />
                      <span className="font-dash text-base font-black tabular-nums leading-none text-on-primary sm:text-lg">
                        <CountUp value={s.value} />
                      </span>
                    </div>
                    <span className="mt-1 text-[11px] font-medium text-white/90">{s.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom Date Strip with Touch-Friendly Picker */}
          <div className="relative z-10 mt-3 flex min-h-[44px] items-center justify-between rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 shadow-soft backdrop-blur-md">
            <div className="flex items-center gap-2 text-white/95">
              <CalendarDays size={14} className="text-white/90" />
              <span className="font-dash text-xs font-medium">{formattedDate}</span>
            </div>

            {onDateChange && date && (
              <label className="relative flex cursor-pointer items-center justify-center rounded-lg border border-white/20 bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-on-primary transition-colors hover:bg-white/25 active:scale-95">
                <span>تغيير</span>
                <input
                  type="date"
                  aria-label="اختيار التاريخ"
                  value={date}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

import { motion } from 'framer-motion'
import { CalendarDays, CheckCircle2, XCircle, Clock3 } from 'lucide-react'
import { fadeUpStatic } from '../../../../shared/animations/fadeUp'
import { cn } from '../../../../lib/utils'

interface AttendanceHeroCardProps {
  completedToday: number
  cancelledToday: number
  scheduledToday: number
  date?: string
  onDateChange?: (date: string) => void
}

const RING_RADIUS = 30
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const todayArabic = () => {
  const now = new Date()
  const weekday = now.toLocaleDateString('ar-EG', { weekday: 'long' })
  const full = now.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })
  return `${weekday} · ${full}`
}

/** بطاقة البطل — حلقة نسبة حضور اليوم مع العدادات والتاريخ */
export const AttendanceHeroCard = ({
  completedToday,
  cancelledToday,
  scheduledToday,
  date,
  onDateChange,
}: AttendanceHeroCardProps) => {
  const resolved = completedToday + cancelledToday
  const rate = resolved > 0 ? Math.round((completedToday / resolved) * 100) : 100

  const stats = [
    { label: 'حضور', value: completedToday, icon: CheckCircle2, className: 'text-on-primary' },
    { label: 'غياب', value: cancelledToday, icon: XCircle, className: 'text-white/80' },
    { label: 'متبقي', value: scheduledToday, icon: Clock3, className: 'text-white/80' },
  ]

  return (
    <motion.div {...fadeUpStatic} className="px-4 pb-1 pt-3">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary p-4">
        {/* نقشة زخرفية */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true">
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="att-mobile-hero-grid"
                x="0"
                y="0"
                width="22"
                height="22"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1.2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#att-mobile-hero-grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          {/* حلقة النسبة */}
          <div
            className="relative h-[76px] w-[76px] shrink-0"
            role="img"
            aria-label={`نسبة الحضور ${rate} بالمئة`}
          >
            <svg viewBox="0 0 76 76" className="h-full w-full -rotate-90">
              <circle
                cx="38"
                cy="38"
                r={RING_RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="7"
              />
              <motion.circle
                cx="38"
                cy="38"
                r={RING_RADIUS}
                fill="none"
                stroke="white"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
                animate={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - rate / 100) }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black tabular-nums text-on-primary">{rate}%</span>
            </div>
          </div>

          {/* العدادات */}
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-xs font-bold text-white/85">حصص اليوم</p>
            <div className="grid grid-cols-3 gap-1.5">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl bg-white/10 px-2 py-1.5 text-center backdrop-blur-sm"
                >
                  <p
                    className={cn(
                      'flex items-center justify-center gap-1 text-base font-bold tabular-nums leading-none',
                      s.className,
                    )}
                  >
                    <s.icon size={11} strokeWidth={2} />
                    {s.value}
                  </p>
                  <p className="mt-1 text-micro font-bold text-white/90">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* التاريخ */}
        <div className="relative z-10 mt-3 flex items-center justify-between rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-white/85">
            <CalendarDays size={12} />
            <span className="text-micro font-bold">{todayArabic()}</span>
          </div>
          {onDateChange && date && (
            <input
              type="date"
              aria-label="اختيار التاريخ"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-[105px] cursor-pointer rounded-2xl border-none bg-transparent p-0 text-end text-micro font-bold text-white outline-none"
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}

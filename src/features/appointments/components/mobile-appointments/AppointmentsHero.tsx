import { motion } from 'framer-motion'
import { CalendarClock, CheckCircle2, CalendarDays, ListChecks } from 'lucide-react'
import { fadeUpStatic } from '../../../../shared/animations/fadeUp'
import { cn } from '../../../../lib/utils'

const RING_RADIUS = 30
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

interface AppointmentsHeroProps {
  todayTotal: number
  remainingToday: number
  totalAppointments: number
  completedCount: number
  todayName: string
}

/** بطاقة البطل — حلقة تقدم مواعيد اليوم مع عدادات سريعة */
export const AppointmentsHero = ({
  todayTotal,
  remainingToday,
  totalAppointments,
  completedCount,
  todayName,
}: AppointmentsHeroProps) => {
  const doneToday = Math.max(0, todayTotal - remainingToday)
  const rate = todayTotal > 0 ? Math.round((doneToday / todayTotal) * 100) : 100

  const chips = [
    {
      icon: CalendarDays,
      label: 'اليوم',
      value: todayTotal,
    },
    {
      icon: ListChecks,
      label: 'الأسبوع',
      value: totalAppointments,
    },
    {
      icon: CheckCircle2,
      label: 'مكتملة',
      value: completedCount,
    },
  ]

  return (
    <motion.div {...fadeUpStatic} className="px-4 pt-3">
      <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-primary via-primary-deep to-primary p-4">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true">
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="appointments-hero-grid"
                x="0"
                y="0"
                width="22"
                height="22"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1.2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#appointments-hero-grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          {/* حلقة التقدم */}
          <div
            className="relative h-[76px] w-[76px] shrink-0"
            role="img"
            aria-label={`أُنجز ${doneToday} من ${todayTotal} مواعيد اليوم`}
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
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-black tabular-nums leading-none text-on-primary">
                {rate}%
              </span>
              <span className="mt-0.5 text-micro font-bold text-white/70">اليوم</span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-white/85">
              <CalendarClock size={12} strokeWidth={1.7} />
              <p className="text-xs font-bold">{todayName}</p>
            </div>
            <p className="mt-0.5 text-micro font-bold text-white/65">
              بقي {remainingToday} من {todayTotal} حصة
            </p>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {chips.map((chip) => (
                <div
                  key={chip.label}
                  className="rounded-none bg-white/10 px-1 py-1.5 text-center backdrop-blur-sm"
                >
                  <p className="flex items-center justify-center gap-0.5 text-sm font-bold tabular-nums leading-none text-on-primary">
                    <chip.icon
                      size={10}
                      strokeWidth={2}
                      className={cn(chip.label === 'مكتملة' && 'opacity-80')}
                    />
                    {chip.value}
                  </p>
                  <p className="mt-1 text-micro font-bold text-white/70">{chip.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

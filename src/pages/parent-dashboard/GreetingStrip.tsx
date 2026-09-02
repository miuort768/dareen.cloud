import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { CalendarDays, GraduationCap, BookOpen, ClipboardList, UserRound } from 'lucide-react'
import { TimeOfDayBadge } from '../../shared/components/TimeOfDayBadge'
import { CountUp } from '../../shared/components/CountUp'

interface GreetingStripProps {
  name: string
  childCount: number
  subjectCount: number
  todayCount: number
  attendanceRate: number
  eldestChildName?: string | null
  eldestChildGrade?: string | null
}

const getGreeting = (): string => {
  const h = new Date().getHours()
  if (h < 5) return 'ليلة هادئة'
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'يوم سعيد'
  return 'مساء الخير'
}

/** هيرو ترحيب ولي الأمر — تدرج primary مع شرائح زجاجية وعدّاد الحضور */
export const GreetingStrip = ({
  name,
  childCount,
  subjectCount,
  todayCount,
  attendanceRate,
  eldestChildName,
  eldestChildGrade,
}: GreetingStripProps) => {
  const firstName = name.split(' ')[0] || name

  const RING_SIZE = 56
  const RING_RADIUS = 24
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
  const clampedRate = Math.min(Math.max(attendanceRate, 0), 100)

  const chips = [
    {
      icon: GraduationCap,
      label: childCount === 1 ? 'ابن واحد' : `${childCount} أبناء`,
    },
    { icon: BookOpen, label: `${subjectCount} ${subjectCount === 1 ? 'مادة' : 'مواد'}` },
    {
      icon: ClipboardList,
      label: todayCount > 0 ? `${todayCount} حصص اليوم` : 'لا حصص اليوم',
    },
  ]

  return (
    <section
      aria-label="ترحيب"
      className="relative overflow-hidden rounded-none bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-5 shadow-elevation-2 transition-colors duration-300 sm:p-6"
    >
      <div
        className="pointer-events-none absolute -end-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-14 -start-10 h-36 w-36 rounded-full bg-black/10 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-white/70">
            <CalendarDays size={12} />
            {format(new Date(), 'eeee، d MMMM yyyy', { locale: ar })}
          </p>
          <h1 className="text-xl font-black leading-tight text-on-primary md:text-2xl">
            {getGreeting()}، {firstName}
          </h1>
          {eldestChildName && (
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-white/75">
              <UserRound size={11} />
              متابعة رحلة {eldestChildName.split(' ')[0]}
              {eldestChildGrade ? ` — ${eldestChildGrade}` : ''}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <TimeOfDayBadge variant="glass" />
          <div
            className="relative flex shrink-0 items-center justify-center"
            aria-label={`نسبة الحضور الإجمالية ${attendanceRate} بالمئة`}
          >
            <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={5}
              />
              <motion.circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke="currentColor"
                className="text-on-primary"
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
                animate={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - clampedRate / 100) }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              />
            </svg>
            <CountUp
              value={attendanceRate}
              format={(n) => `${n}%`}
              className="absolute text-[13px] font-black tabular-nums text-on-primary"
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-4 flex flex-wrap gap-2">
        {chips.map((chip) => {
          const Icon = chip.icon
          return (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1.5 rounded-none border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-on-primary backdrop-blur-sm"
            >
              <Icon size={12} />
              {chip.label}
            </span>
          )
        })}
      </div>
    </section>
  )
}

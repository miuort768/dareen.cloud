import { motion } from 'framer-motion'
import { GraduationCap, BookOpen, ClipboardList, UserRound } from 'lucide-react'
import { DashboardGreeting } from '../../shared/components/DashboardGreeting'
import { CountUp } from '../../shared/components/CountUp'

export interface GreetingStripProps {
  name: string
  childCount: number
  subjectCount: number
  todayCount: number
  attendanceRate: number
  eldestChildName?: string | null
  eldestChildGrade?: string | null
}

/** هيرو ترحيب ولي الأمر — تدرج primary مع عداد الحضور الدائري */
export const GreetingStrip = ({
  name,
  childCount,
  subjectCount,
  todayCount,
  attendanceRate,
  eldestChildName,
  eldestChildGrade,
}: GreetingStripProps) => {
  const RING_SIZE = 56
  const RING_RADIUS = 24
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
  const clampedRate = Math.min(Math.max(attendanceRate, 0), 100)

  return (
    <DashboardGreeting
      name={name}
      nightMessage="ليلة هادئة"
      subtitle={
        eldestChildName ? (
          <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-white/75">
            <UserRound size={11} />
            متابعة رحلة {eldestChildName.split(' ')[0]}
            {eldestChildGrade ? ` — ${eldestChildGrade}` : ''}
          </p>
        ) : null
      }
      end={
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
            className="absolute text-sm font-black tabular-nums text-on-primary"
          />
        </div>
      }
      chips={[
        {
          icon: GraduationCap,
          label: childCount === 1 ? 'ابن واحد' : `${childCount} أبناء`,
        },
        { icon: BookOpen, label: `${subjectCount} ${subjectCount === 1 ? 'مادة' : 'مواد'}` },
        {
          icon: ClipboardList,
          label: todayCount > 0 ? `${todayCount} حصص اليوم` : 'لا حصص اليوم',
        },
      ]}
    />
  )
}

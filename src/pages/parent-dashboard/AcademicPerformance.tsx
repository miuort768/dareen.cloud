import { motion } from 'framer-motion'
import { CheckCircle2, BookMarked, Star } from 'lucide-react'
import type { Student } from '../../types'

interface AcademicPerformanceProps {
  sessions: Student[]
  children: Student[]
  points: number
  rank: { name: string }
}

const colorMap: Record<string, { bg: string; bar: string; text: string }> = {
  success: { bg: 'bg-success-soft', bar: 'bg-success', text: 'text-success' },
  primary: { bg: 'bg-primary-soft', bar: 'bg-primary', text: 'text-primary' },
}

const ProgressBar = ({
  value,
  color,
  label,
  icon: Icon,
}: {
  value: number
  color: string
  label: string
  icon: React.ElementType
}) => {
  const percent = Math.min(Math.max(Math.round(value), 0), 100)
  const c = colorMap[color] || colorMap.primary!

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-7 w-7 rounded-lg ${c.bg} flex items-center justify-center`}>
            <Icon size={13} className={c.text} />
          </div>
          <span className="text-xs font-bold text-main">{label}</span>
        </div>
        <span className={`text-xs font-bold ${c.text}`}>{percent}%</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-divider">
        <motion.div
          className={`absolute inset-y-0 start-0 rounded-full ${c.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export const AcademicPerformance = ({
  sessions,
  children: kids,
  points,
  rank,
}: AcademicPerformanceProps) => {
  const completed = sessions.filter((s) => s.status === 'completed').length
  const totalRecorded = sessions.filter(
    (s) => s.status === 'completed' || s.status === 'cancelled',
  ).length
  const attendanceRate = totalRecorded > 0 ? Math.round((completed / totalRecorded) * 100) : 0

  let sessionsUsed = 0
  let sessionsTotal = 0
  kids.forEach((c) => {
    ;(c.enrollments || []).forEach((en: { sessionsUsed?: number; sessionsTotal?: number }) => {
      sessionsUsed += Number(en.sessionsUsed || 0)
      sessionsTotal += Number(en.sessionsTotal || 0)
    })
  })
  const academicProgress = sessionsTotal > 0 ? Math.round((sessionsUsed / sessionsTotal) * 100) : 0

  return (
    <div className="rounded-3xl border border-border bg-surface p-4 shadow-sm transition-colors duration-300 dark:border-primary/20 dark:bg-card sm:p-5 md:p-6">
      <h3 className="mb-5 text-sm font-bold text-main sm:text-base">التقدم الأكاديمي</h3>

      <div className="space-y-4">
        <ProgressBar value={attendanceRate} color="success" label="الحضور" icon={CheckCircle2} />
        <ProgressBar value={academicProgress} color="primary" label="المنهج" icon={BookMarked} />
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-xl border border-primary/10 bg-primary-soft p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface">
          <Star size={20} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-main">{rank.name}</p>
          <p className="text-xs font-medium text-muted">{points} نقطة خبرة</p>
        </div>
      </div>
    </div>
  )
}

import { motion } from 'framer-motion'
import { fadeUpStatic } from '../../../../shared/animations/fadeUp'
import { TrendingUp } from 'lucide-react'

interface AttendanceStatsBarProps {
  completedToday: number
  cancelledToday: number
  scheduledToday: number
}

export const AttendanceStatsBar = ({
  completedToday,
  cancelledToday,
  scheduledToday,
}: AttendanceStatsBarProps) => {
  const total = completedToday + cancelledToday
  const attendanceRate = total > 0 ? Math.round((completedToday / total) * 100) : 100

  return (
    <motion.div {...fadeUpStatic} className="px-4 pb-2 pt-3">
      {/* Attendance rate banner */}
      <div className="mb-2 flex items-center justify-between rounded-2xl bg-primary-soft px-4 py-2.5">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-primary" />
          <span className="text-xs font-bold text-primary">نسبة الحضور</span>
        </div>
        <span className="text-lg font-black tabular-nums text-primary">{attendanceRate}%</span>
      </div>
      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-success bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums leading-none text-success">
            {completedToday}
          </p>
          <p className="text-success/70 mt-1 text-micro font-bold">حضور</p>
        </div>
        <div className="rounded-2xl border border-error bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums leading-none text-error">{cancelledToday}</p>
          <p className="text-error/70 mt-1 text-micro font-bold">غياب</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums leading-none text-main">{scheduledToday}</p>
          <p className="mt-1 text-micro font-bold text-muted">متبقي</p>
        </div>
      </div>
    </motion.div>
  )
}

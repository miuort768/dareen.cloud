import { motion } from 'framer-motion'
import { fadeUpStatic } from '../../../../shared/animations/fadeUp'

interface AttendanceStatsBarProps {
  completedToday: number
  cancelledToday: number
  scheduledToday: number
}

export const AttendanceStatsBar = ({
  completedToday,
  cancelledToday,
  scheduledToday,
}: AttendanceStatsBarProps) => (
  <motion.div {...fadeUpStatic} className="px-4 pb-2 pt-3">
    <div className="grid grid-cols-3 gap-2">
      <div className="border-success/30 rounded-2xl border bg-card p-3 text-center">
        <p className="text-lg font-bold tabular-nums leading-none text-success">{completedToday}</p>
        <p className="text-success/70 mt-1 text-micro font-bold">حضور</p>
      </div>
      <div className="border-error/30 rounded-2xl border bg-card p-3 text-center">
        <p className="text-lg font-bold tabular-nums leading-none text-error">{cancelledToday}</p>
        <p className="text-error/70 mt-1 text-micro font-bold">غياب</p>
      </div>
      <div className="border-border/30 rounded-2xl border bg-card p-3 text-center">
        <p className="text-lg font-bold tabular-nums leading-none text-main">{scheduledToday}</p>
        <p className="mt-1 text-micro font-bold text-muted">متبقي</p>
      </div>
    </div>
  </motion.div>
)

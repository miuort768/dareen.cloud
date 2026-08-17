import { motion } from 'framer-motion'
import { fadeUpStatic } from '../../../../shared/animations/fadeUp'

interface AppointmentStatsProps {
  todayCount: number
  totalCount: number
  completedCount: number
}

export const AppointmentStats = ({
  todayCount,
  totalCount,
  completedCount,
}: AppointmentStatsProps) => (
  <motion.div {...fadeUpStatic} className="px-4 pb-2 pt-3">
    <div className="grid grid-cols-3 gap-2">
      <div className="rounded-2xl border border-primary/20 bg-card p-3 text-center">
        <p className="text-lg font-bold tabular-nums leading-none text-primary">{todayCount}</p>
        <p className="mt-1 text-micro font-bold text-primary/70">اليوم</p>
      </div>
      <div className="border-success/50 rounded-2xl border bg-card p-3 text-center">
        <p className="text-lg font-bold tabular-nums leading-none text-success">
          {totalCount - completedCount}
        </p>
        <p className="text-success/70 mt-1 text-micro font-bold">المتبقي</p>
      </div>
      <div className="border-info/50 rounded-2xl border bg-card p-3 text-center">
        <p className="text-lg font-bold tabular-nums leading-none text-primary">{totalCount}</p>
        <p className="text-info/70 mt-1 text-micro font-bold">الإجمالي</p>
      </div>
    </div>
  </motion.div>
)

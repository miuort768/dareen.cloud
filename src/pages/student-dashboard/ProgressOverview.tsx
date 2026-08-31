import { motion } from 'framer-motion'
import { CheckCircle2, BookMarked, Star } from 'lucide-react'
import { RANK_ICON_MAP } from '../../shared/utils/ranks'
import type { DashboardStats } from './types'

interface ProgressOverviewProps {
  stats: DashboardStats
  points: number
  rank: { name: string; icon: string }
  nextRank: { next: { name: string; minPoints: number } | null; pointsNeeded: number }
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

export const ProgressOverview = ({ stats, points, rank, nextRank }: ProgressOverviewProps) => {
  const RankIconComponent = RANK_ICON_MAP[rank.icon] || Star

  return (
    <div className="rounded-3xl border border-border bg-surface p-4 shadow-sm transition-colors duration-300 dark:border-primary/20 dark:bg-card sm:p-5 md:p-6">
      <h3 className="mb-5 text-sm font-bold text-main sm:text-base">التقدم الأكاديمي</h3>

      <div className="space-y-4">
        <ProgressBar
          value={stats.attendanceRate}
          color="success"
          label="الحضور"
          icon={CheckCircle2}
        />
        <ProgressBar
          value={stats.curriculumProgress}
          color="primary"
          label="المنهج"
          icon={BookMarked}
        />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-primary/10 bg-primary-soft p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface">
            <RankIconComponent size={20} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-main">{rank.name}</p>
            {nextRank.next ? (
              <p className="text-xs font-medium text-muted">
                {nextRank.pointsNeeded} نقطة للرتبة التالية
              </p>
            ) : (
              <p className="text-xs font-medium text-muted">أعلى رتبة — أحسنت!</p>
            )}
          </div>
        </div>
        <span className="shrink-0 rounded-xl bg-surface px-3 py-1.5 text-base font-black tabular-nums text-primary">
          {points}
        </span>
      </div>
    </div>
  )
}

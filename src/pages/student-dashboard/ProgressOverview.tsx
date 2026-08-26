import { motion } from 'framer-motion'
import { CheckCircle2, BookOpen, BookMarked, Star } from 'lucide-react'
import { RANK_ICON_MAP } from '../../shared/utils/ranks'
import type { DashboardStats } from './types'

interface ProgressOverviewProps {
  stats: DashboardStats
  points: number
  rank: { name: string; icon: string }
  nextRank: { next: { name: string; minPoints: number } | null; pointsNeeded: number }
}

const colorMap: Record<string, { bg: string; bar: string; text: string }> = {
  success: { bg: 'bg-success-soft dark:bg-success-soft', bar: 'bg-success', text: 'text-success' },
  info: { bg: 'bg-info-soft dark:bg-info-soft', bar: 'bg-info', text: 'text-info' },
  primary: { bg: 'bg-primary-soft dark:bg-primary/10', bar: 'bg-primary', text: 'text-primary' },
  warning: { bg: 'bg-warning-soft dark:bg-warning-soft', bar: 'bg-warning', text: 'text-warning' },
}

const ProgressBar = ({
  value,
  max,
  color,
  label,
  icon: Icon,
}: {
  value: number
  max: number
  color: string
  label: string
  icon: React.ElementType
}) => {
  const percent = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0
  const c = colorMap[color] || colorMap.primary!

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-7 w-7 rounded-lg ${c.bg} flex items-center justify-center`}>
            <Icon size={13} className={c.text} />
          </div>
          <span className="text-xs font-bold text-main dark:text-main">{label}</span>
        </div>
        <span className={`text-xs font-bold ${c.text}`}>{percent}%</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-border dark:bg-border">
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
  const xpPercent = nextRank.next
    ? Math.min(Math.round((points / nextRank.next.minPoints) * 100), 100)
    : 100
  const homeworkPercent =
    stats.sessionsTotal > 0 ? Math.round((stats.sessionsUsed / stats.sessionsTotal) * 100) : 0
  const RankIconComponent = RANK_ICON_MAP[rank.icon] || Star

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm transition-colors duration-300 dark:border-primary/20 dark:bg-card md:p-6">
      <h3 className="mb-5 text-base font-bold text-main dark:text-main">التقدم الأكاديمي</h3>

      <div className="space-y-4">
        <ProgressBar
          value={stats.attendanceRate}
          max={100}
          color="text-success"
          label="الحضور"
          icon={CheckCircle2}
        />
        <ProgressBar
          value={homeworkPercent}
          max={100}
          color="text-info"
          label="الواجبات"
          icon={BookOpen}
        />
        <ProgressBar
          value={stats.curriculumProgress}
          max={100}
          color="text-primary"
          label="المنهج"
          icon={BookMarked}
        />
        <ProgressBar value={xpPercent} max={100} color="text-warning" label="XP" icon={Star} />
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl border border-primary/10 bg-primary-soft p-4 dark:border-primary/10 dark:bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/10">
            <RankIconComponent size={20} className="text-primary dark:text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-main dark:text-main">{rank.name}</p>
            {nextRank.next && (
              <p className="text-xs font-medium text-muted dark:text-muted">
                {nextRank.pointsNeeded} نقطة للرتبة التالية
              </p>
            )}
          </div>
        </div>
        <span className="rounded-xl bg-primary/10 px-3 py-1.5 text-lg font-bold text-primary dark:bg-primary/10 dark:text-primary">
          {points}
        </span>
      </div>
    </div>
  )
}

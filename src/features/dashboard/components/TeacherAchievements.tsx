import { AlertCircle, Clock, Star, TrendingUp, Zap } from 'lucide-react'
import { CURRENCY_SYMBOL } from '../../../config/constants'
import type { DashboardStats as Stats, LowBalanceStudent } from '../types'
import { getRankByPoints, getNextRank, TEACHER_RANKS } from '../../../shared/utils/ranks'
import { RankBadge } from '../../../shared/components/RankBadge'

interface TeacherAchievementsProps {
  stats: Stats
  lowBalanceStudents: LowBalanceStudent[]
  isTeacher: boolean
}

export const TeacherAchievements = ({
  stats,
  lowBalanceStudents,
  isTeacher,
}: TeacherAchievementsProps) => {
  const points = stats.teacherPoints || 0
  const rank = getRankByPoints(points, TEACHER_RANKS)
  const { next, pointsNeeded } = getNextRank(points, TEACHER_RANKS)
  const expiredCount = lowBalanceStudents.filter((s) => s.remainingSessions === 0).length
  const lowCount = lowBalanceStudents.filter((s) => s.remainingSessions > 0).length

  const currentRankIdx = [...TEACHER_RANKS].reverse().findIndex((r) => points >= r.minPoints)
  const actualIdx = TEACHER_RANKS.length - 1 - currentRankIdx
  const currentRank = TEACHER_RANKS[actualIdx]!
  const xpProgress = next
    ? Math.min(
        Math.round(
          ((points - currentRank.minPoints) / (next.minPoints - currentRank.minPoints)) * 100,
        ),
        100,
      )
    : 100

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning-soft dark:bg-primary/10">
          <Star size={14} className="text-warning dark:text-primary" />
        </div>
        <h3 className="text-sm font-black text-main dark:text-main">
          {isTeacher ? 'إنجازاتك التعليمية' : 'التحصيل المالي'}
        </h3>
        {isTeacher && <RankBadge rank={rank} size="sm" />}
      </div>

      {isTeacher && next && (
        <div className="mb-4 rounded-2xl border border-border bg-surface p-3.5 dark:border-border dark:bg-hover">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-main dark:text-main">
              <Zap size={11} className="text-warning dark:text-primary" />
              {pointsNeeded} XP للترقية إلى «{next.name}»
            </span>
            <span className="text-[11px] font-black tabular-nums text-primary dark:text-primary">
              {xpProgress}%
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-hover dark:bg-surface"
            role="progressbar"
            aria-valuenow={xpProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="تقدم الرتبة"
          >
            <div
              className="h-full rounded-full bg-warning transition-all duration-700 dark:bg-primary"
              style={{ width: `${Math.max(xpProgress, 4)}%` }}
            />
          </div>
        </div>
      )}

      <div className="mb-4 overflow-hidden rounded-2xl bg-primary p-5 dark:bg-primary">
        <div className="mb-2 flex items-center gap-1.5">
          <TrendingUp size={12} className="text-on-primary opacity-70" />
          <span className="text-[11px] font-bold text-on-primary opacity-70">
            {isTeacher ? 'صافي أرباح الشهر (تقديري)' : 'إجمالي التحصيل المستهدف'}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black tabular-nums text-on-primary">
            {isTeacher
              ? (stats.monthNetProfit || 0).toLocaleString('ar-EG')
              : stats.expectedCollection.toLocaleString('ar-EG')}
          </span>
          <span className="text-[11px] font-bold text-on-primary opacity-70">
            {CURRENCY_SYMBOL}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 dark:border-border dark:bg-hover">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-error-soft dark:bg-error-soft">
            <AlertCircle size={14} className="text-error dark:text-error" />
          </div>
          <div>
            <span className="text-lg font-black tabular-nums text-main dark:text-main">
              {expiredCount}
            </span>
            <p className="text-[11px] font-bold text-muted dark:text-muted">منتهي</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 dark:border-border dark:bg-hover">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning-soft dark:bg-warning-soft">
            <Clock size={14} className="text-warning dark:text-warning" />
          </div>
          <div>
            <span className="text-lg font-black tabular-nums text-main dark:text-main">
              {lowCount}
            </span>
            <p className="text-[11px] font-bold text-muted dark:text-muted">مستحق</p>
          </div>
        </div>
      </div>
    </div>
  )
}

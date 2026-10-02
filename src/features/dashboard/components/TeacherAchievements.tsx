import { AlertCircle, Clock, Star, TrendingUp, Zap } from 'lucide-react'
import { CURRENCY_SYMBOL } from '../../../config/constants'
import type { DashboardStats as Stats, LowBalanceStudent } from '../types'
import { getRankByPoints, getNextRank, TEACHER_RANKS } from '../../../shared/utils/ranks'
import { RankBadge } from '../../../shared/components/RankBadge'
import { DashboardSectionHead } from './DashboardSectionHead'

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
      <DashboardSectionHead
        icon={Star}
        tone="warning"
        title={isTeacher ? 'إنجازاتك التعليمية' : 'التحصيل المالي'}
        afterTitle={isTeacher ? <RankBadge rank={rank} size="sm" /> : null}
      />

      {isTeacher && next && (
        <div className="mb-4 rounded-xl border border-border bg-surface p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-main">
              <Zap size={11} className="text-warning-strong" />
              {pointsNeeded} XP للترقية إلى «{next.name}»
            </span>
            <span className="text-[11px] font-black tabular-nums text-primary">{xpProgress}%</span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-hover"
            role="progressbar"
            aria-valuenow={xpProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="تقدم الرتبة"
          >
            <div
              className="h-full rounded-full bg-warning transition-all duration-700"
              style={{ width: `${Math.max(xpProgress, 4)}%` }}
            />
          </div>
        </div>
      )}

      <div className="mb-4 overflow-hidden rounded-xl bg-primary p-4">
        <div className="mb-1.5 flex items-center gap-1.5">
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
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-error-soft">
            <AlertCircle size={15} className="text-error-strong" />
          </div>
          <div>
            <span className="text-lg font-black tabular-nums text-main">{expiredCount}</span>
            <p className="text-[11px] font-bold text-muted">منتهي</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning-soft">
            <Clock size={15} className="text-warning-strong" />
          </div>
          <div>
            <span className="text-lg font-black tabular-nums text-main">{lowCount}</span>
            <p className="text-[11px] font-bold text-muted">مستحق</p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Award, AlertCircle, Clock, Star, TrendingUp } from 'lucide-react'
import { CURRENCY_SYMBOL } from '../../../config/constants'
import type { DashboardStats as Stats, LowBalanceStudent } from '../types'
import { getRankByPoints, TEACHER_RANKS } from '../../../shared/utils/ranks'
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
  const rank = getRankByPoints(stats.teacherPoints || 0, TEACHER_RANKS)
  const expiredCount = lowBalanceStudents.filter((s) => s.remainingSessions === 0).length
  const lowCount = lowBalanceStudents.filter((s) => s.remainingSessions > 0).length

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[13px] font-bold text-main dark:text-main">
          <Star size={13} className="text-warning dark:text-primary" />
          {isTeacher ? 'إنجازاتك التعليمية' : 'التحصيل المالي'}
        </h3>
        {isTeacher && <RankBadge rank={rank} size="sm" />}
      </div>

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
        {isTeacher && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-[11px] font-bold text-on-primary">
            <Award size={10} />
            {stats.teacherPoints || 0} XP
          </div>
        )}
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

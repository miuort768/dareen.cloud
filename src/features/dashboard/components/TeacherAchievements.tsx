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

      <div className="relative mb-4 overflow-hidden rounded-2xl bg-primary p-5 dark:bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-1.5">
            <TrendingUp size={12} className="text-white/70 dark:text-main" />
            <span className="text-[11px] font-bold text-white/70 dark:text-main">
              {isTeacher ? 'صافي أرباح الشهر (تقديري)' : 'إجمالي التحصيل المستهدف'}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tabular-nums text-on-primary">
              {isTeacher
                ? (stats.monthNetProfit || 0).toLocaleString('ar-EG')
                : stats.expectedCollection.toLocaleString('ar-EG')}
            </span>
            <span className="text-[11px] font-bold text-white/70">{CURRENCY_SYMBOL}</span>
          </div>
          {isTeacher && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm">
              <Award size={10} />
              {stats.teacherPoints || 0} XP
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-error-soft bg-error-soft p-3 dark:border-error-soft dark:bg-error-soft">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-error-soft">
            <AlertCircle size={14} className="text-error" />
          </div>
          <div>
            <span className="text-lg font-bold tabular-nums text-error">{expiredCount}</span>
            <p className="text-[11px] font-bold text-error">منتهي</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-warning-soft bg-warning-soft p-3 dark:border-primary/30 dark:bg-primary/5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-soft">
            <Clock size={14} className="text-warning dark:text-primary" />
          </div>
          <div>
            <span className="text-lg font-bold tabular-nums text-warning">{lowCount}</span>
            <p className="text-[11px] font-bold text-warning">مستحق</p>
          </div>
        </div>
      </div>
    </div>
  )
}

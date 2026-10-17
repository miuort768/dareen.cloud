import { AlertCircle, Clock, Star, TrendingUp, Zap } from 'lucide-react'
import { CURRENCY_SYMBOL } from '../../../config/constants'
import type { DashboardStats as Stats, LowBalanceStudent } from '../types'
import { getRankByPoints, getNextRank, TEACHER_RANKS } from '../../../shared/utils/ranks'
import { RankBadge } from '../../../shared/components/RankBadge'
import { CountUp } from '../../../shared/components/CountUp'

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
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-elevation-1">
      <div
        className="from-warning-soft/40 to-primary-soft/20 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent"
        aria-hidden="true"
      />
      <div
        className="border-warning/10 pointer-events-none absolute -end-12 -top-16 h-44 w-44 rounded-full border"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-1 flex-col justify-between gap-4 p-4 lg:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning text-on-warning shadow-elevation-1"
              aria-hidden="true"
            >
              <Star size={18} fill="currentColor" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-main">
                {isTeacher ? 'إنجازاتك التعليمية' : 'التحصيل المالي'}
              </p>
              <p className="text-[11px] font-bold text-muted">
                {isTeacher ? 'رتبتك وتقدمك هذا الشهر' : 'ملخص التحصيل'}
              </p>
            </div>
          </div>
          {isTeacher && <RankBadge rank={rank} size="sm" />}
        </div>

        {isTeacher && next && (
          <div className="bg-surface/60 rounded-xl border border-border p-3.5 dark:bg-surface">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-main">
                <Zap size={12} className="text-warning-strong" />
                <CountUp value={points} className="font-dash tabular-nums text-primary" />
                <span className="text-micro font-bold text-muted">نقطة</span>
              </span>
              <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-black tabular-nums text-warning-strong">
                {xpProgress}%
              </span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-hover"
              role="progressbar"
              aria-valuenow={xpProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="تقدم الرتبة"
            >
              <div
                className="h-full rounded-full bg-gradient-to-l from-warning to-warning-hover transition-all duration-700"
                style={{ width: `${Math.max(xpProgress, 6)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] font-bold text-muted">
              باقي <span className="font-dash tabular-nums text-main">{pointsNeeded}</span> نقطة
              للترقية إلى «{next.name}»
            </p>
          </div>
        )}

        <div className="rounded-xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-4 shadow-elevation-1 shadow-primary/15">
          <div className="mb-1.5 flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/20">
              <TrendingUp size={12} className="text-white" />
            </div>
            <span className="text-[11px] font-bold text-white/80">
              {isTeacher ? 'صافي أرباح الشهر (تقديري)' : 'إجمالي التحصيل المستهدف'}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-dash text-2xl font-black tabular-nums leading-none text-white lg:text-3xl">
              <CountUp
                value={isTeacher ? stats.monthNetProfit || 0 : stats.expectedCollection}
                format={(n) => Math.round(n).toLocaleString('ar-EG')}
              />
            </span>
            <span className="text-xs font-bold text-white/70">{CURRENCY_SYMBOL}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-surface/60 flex items-center gap-3 rounded-xl border border-border p-3 dark:bg-surface">
            <div className="ring-error/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-error-soft ring-1">
              <AlertCircle size={18} className="text-error-strong" />
            </div>
            <div>
              <span className="font-dash text-xl font-black tabular-nums leading-none text-main">
                {expiredCount}
              </span>
              <p className="mt-0.5 text-[11px] font-bold text-muted">منتهي</p>
            </div>
          </div>
          <div className="bg-surface/60 flex items-center gap-3 rounded-xl border border-border p-3 dark:bg-surface">
            <div className="ring-warning/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning-soft ring-1">
              <Clock size={18} className="text-warning-strong" />
            </div>
            <div>
              <span className="font-dash text-xl font-black tabular-nums leading-none text-main">
                {lowCount}
              </span>
              <p className="mt-0.5 text-[11px] font-bold text-muted">مستحق</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

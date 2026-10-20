import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Star,
  TrendingUp,
  UserRound,
  Users,
  Zap,
} from 'lucide-react'
import { CURRENCY_SYMBOL } from '../../config/constants'
import { CountUp } from '../../shared/components/CountUp'
import { RankBadge } from '../../shared/components/RankBadge'
import { getRankByPoints, getNextRank, TEACHER_RANKS } from '../../shared/utils/ranks'
import type { DashboardStats as Stats, LowBalanceStudent } from '../../features/dashboard/types'
import { hasMonthSessions, monthCompletionPercent } from './heroMetrics'

interface TeacherHeroProps {
  name: string
  stats: Stats
  lowBalanceStudents: LowBalanceStudent[]
}

const getGreeting = (): string => {
  const h = new Date().getHours()
  if (h < 5) return 'ليلة طيبة'
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'يوم سعيد'
  return 'مساء الخير'
}

const RING_SIZE = 56
const RING_RADIUS = 24
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

/** Teacher hero — one full-width rectangle merging greeting + achievements. */
export const TeacherHero = ({ name, stats, lowBalanceStudents }: TeacherHeroProps) => {
  const firstName = (name || 'المعلمة').split(' ')[0] || 'المعلمة'
  const today = format(new Date(), 'eeee، d MMMM yyyy', { locale: ar })
  const percent = monthCompletionPercent(stats.monthCompletedSessions, stats.monthTotalSessions)
  const showRing = hasMonthSessions(stats.monthTotalSessions)

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
    <section
      aria-label="ترحيب وإنجازات"
      className="relative overflow-hidden rounded-2xl border border-primary/15 bg-card shadow-[0_20px_60px_-30px_rgba(59,130,246,0.4)] transition-shadow duration-300 hover:shadow-[0_25px_70px_-25px_rgba(59,130,246,0.45)]"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-light via-primary-soft to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -end-14 -top-20 h-56 w-56 rounded-full border border-primary/10 lg:-end-20 lg:h-80 lg:w-80"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -end-4 -top-8 h-28 w-28 rounded-full border border-primary/10 bg-primary/5 lg:-end-10 lg:h-40 lg:w-40"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col gap-3.5 p-4 sm:gap-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          <div className="flex flex-col justify-between gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-bold text-muted">
                  <UserRound size={13} className="text-primary" />
                  <span className="font-dash">{today}</span>
                </p>

                <h1 className="mt-2 text-lg font-black leading-tight text-main md:text-2xl xl:text-3xl">
                  {getGreeting()}، {firstName}
                </h1>

                <p className="mt-0.5 text-[11px] font-bold text-muted xl:text-xs">
                  ملخص يومك التعليمي في مكان واحد
                </p>
              </div>

              <div
                className="flex shrink-0 flex-col items-center gap-1"
                aria-label={`إنجاز حصص الشهر ${percent} بالمئة`}
              >
                <div className="relative flex items-center justify-center">
                  <svg
                    width={RING_SIZE}
                    height={RING_SIZE}
                    viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
                    className="h-12 w-12 sm:h-14 sm:w-14 lg:h-20 lg:w-20"
                  >
                    <circle
                      cx={RING_SIZE / 2}
                      cy={RING_SIZE / 2}
                      r={RING_RADIUS}
                      fill="none"
                      stroke="currentColor"
                      className="text-primary/15"
                      strokeWidth={5}
                    />
                    <motion.circle
                      cx={RING_SIZE / 2}
                      cy={RING_SIZE / 2}
                      r={RING_RADIUS}
                      fill="none"
                      stroke="currentColor"
                      className="text-primary"
                      strokeWidth={5}
                      strokeLinecap="round"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
                      animate={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - percent / 100) }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                      transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                    />
                  </svg>
                  <span className="absolute flex items-baseline gap-0.5">
                    <CountUp
                      value={percent}
                      format={(n) => `${Math.round(n)}`}
                      className="font-dash text-sm font-black tabular-nums leading-none text-primary sm:text-base lg:text-xl lg:leading-none"
                    />
                    <span className="text-[10px] font-black leading-none text-primary sm:text-xs">
                      %
                    </span>
                  </span>
                </div>
                <span className="whitespace-nowrap text-[10px] font-bold text-muted">
                  {showRing ? 'إنجاز حصص الشهر' : 'لا حصص هذا الشهر'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2 py-1 text-[10px] font-black text-on-primary shadow-elevation-1 lg:px-3 lg:py-1.5 lg:text-xs">
                <Users size={11} />
                {stats.studentsCount === 1 ? 'طالب واحد' : `${stats.studentsCount} طلاب`}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2 py-1 text-[10px] font-black text-primary lg:px-3 lg:py-1.5 lg:text-xs">
                <CalendarDays size={11} />
                {stats.todaySessions > 0 ? `${stats.todaySessions} حصص اليوم` : 'لا حصص اليوم'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2 py-1 text-[10px] font-black text-primary lg:px-3 lg:py-1.5 lg:text-xs">
                <CheckCircle2 size={11} />
                {showRing
                  ? `${stats.monthCompletedSessions} من ${stats.monthTotalSessions}`
                  : 'لا إنجاز بعد'}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3 lg:gap-4 lg:border-s lg:border-divider lg:ps-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-on-accent shadow-[0_12px_40px_-20px_rgba(251,191,36,0.8)] sm:h-10 sm:w-10"
                  aria-hidden="true"
                >
                  <Star size={16} fill="currentColor" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-main">إنجازاتك التعليمية</p>
                  <p className="text-[11px] font-bold text-muted">رتبتك وتقدمك هذا الشهر</p>
                </div>
              </div>
              <RankBadge rank={rank} size="sm" />
            </div>

            {next && (
              <div className="rounded-xl border border-border bg-surface p-3 dark:bg-surface sm:p-3.5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-main">
                    <Zap size={12} className="text-accent" />
                    <CountUp value={points} className="font-dash tabular-nums text-primary" />
                    <span className="text-micro font-bold text-muted">نقطة</span>
                  </span>
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-black tabular-nums text-accent">
                    {xpProgress}%
                  </span>
                </div>
                <div
                  className="h-2.5 w-full overflow-hidden rounded-full bg-accent-soft"
                  role="progressbar"
                  aria-valuenow={xpProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="تقدم الرتبة"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-accent to-accent-hover transition-all duration-700"
                    style={{ width: `${Math.max(xpProgress, 6)}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] font-bold text-muted">
                  باقي <span className="font-dash tabular-nums text-main">{pointsNeeded}</span> نقطة
                  للترقية إلى «{next.name}»
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2.5">
          <div className="rounded-xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-3 shadow-[0_20px_60px_-30px_rgba(59,130,246,0.7)] sm:p-4">
            <div className="mb-1.5 flex items-center gap-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/20">
                <TrendingUp size={12} className="text-white" />
              </div>
              <span className="text-[11px] font-bold text-white/80">صافي أرباح الشهر (تقديري)</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-dash text-2xl font-black tabular-nums leading-none text-white lg:text-3xl">
                <CountUp
                  value={stats.monthNetProfit || 0}
                  format={(n) => Math.round(n).toLocaleString('ar-EG')}
                />
              </span>
              <span className="text-xs font-bold text-white/70">{CURRENCY_SYMBOL}</span>
            </div>
          </div>

          <div className="border-border/60 flex items-center gap-2.5 rounded-xl border bg-surface p-3 shadow-[0_12px_40px_-25px_rgba(239,68,68,0.5)] dark:bg-surface">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error-soft ring-1 ring-error-light">
              <AlertCircle size={17} className="text-error-strong" />
            </div>
            <div>
              <span className="font-dash text-xl font-black tabular-nums leading-none text-main">
                {expiredCount}
              </span>
              <p className="mt-0.5 text-[11px] font-bold text-muted">منتهي</p>
            </div>
          </div>

          <div className="border-border/60 flex items-center gap-2.5 rounded-xl border bg-surface p-3 shadow-[0_12px_40px_-25px_rgba(245,158,11,0.5)] dark:bg-surface">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-soft ring-1 ring-warning-light">
              <Clock size={17} className="text-warning-strong" />
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
    </section>
  )
}

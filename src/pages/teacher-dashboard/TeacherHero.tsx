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
      className="relative overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-elevation-1 transition-shadow duration-300 hover:shadow-elevation-2"
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

                <h1 className="mt-2 font-teacher-heading text-lg font-black leading-tight text-main md:text-2xl xl:text-3xl">
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

            <div className="w-full md:w-auto">
              <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-1.5 shadow-elevation-1 md:flex-row md:flex-wrap md:items-center">
                <span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-black text-main lg:px-2.5 lg:py-1 lg:text-xs">
                  <Users size={11} className="text-primary" />
                  {stats.studentsCount === 1 ? 'طالب واحد' : `${stats.studentsCount} طلاب`}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-black text-main lg:px-2.5 lg:py-1 lg:text-xs">
                  <CalendarDays size={11} className="text-primary" />
                  {stats.todaySessions > 0 ? `${stats.todaySessions} حصص اليوم` : 'لا حصص اليوم'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-black text-main lg:px-2.5 lg:py-1 lg:text-xs">
                  <CheckCircle2 size={11} className="text-primary" />
                  {showRing
                    ? `${stats.monthCompletedSessions} من ${stats.monthTotalSessions}`
                    : 'لا إنجاز بعد'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3 lg:gap-4 lg:border-s lg:border-divider lg:ps-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-on-accent shadow-gold sm:h-10 sm:w-10"
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

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-3.5 shadow-elevation-2 shadow-primary/20 transition-all duration-normal hover:shadow-elevation-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-white/90">صافي أرباح الشهر (تقديري)</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
                <TrendingUp size={14} className="text-white" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-dash text-2xl font-black tabular-nums leading-none text-white lg:text-3xl">
                <CountUp
                  value={stats.monthNetProfit || 0}
                  format={(n) => Math.round(n).toLocaleString('ar-EG')}
                />
              </span>
              <span className="text-xs font-bold text-white/80">{CURRENCY_SYMBOL}</span>
            </div>
            <p className="mt-1 text-[10px] font-medium text-white/75">يُحسب بنهاية الشهر</p>
          </div>

          <div className="border-success/20 rounded-2xl border bg-success-soft p-3.5 shadow-elevation-1 transition-all duration-normal hover:shadow-elevation-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-success-strong">الحصص المنفذة</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success text-on-success">
                <CheckCircle2 size={14} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-dash text-2xl font-black tabular-nums leading-none text-main lg:text-3xl">
                <CountUp value={stats.monthCompletedSessions || 0} />
              </span>
              <span className="text-xs font-bold text-muted">
                من {stats.monthTotalSessions || 0}
              </span>
            </div>
            <p className="mt-1 text-[10px] font-medium text-success-strong">
              نسبة الإنجاز {percent}%
            </p>
          </div>

          <div className="border-error/20 rounded-2xl border bg-error-soft p-3.5 shadow-elevation-1 transition-all duration-normal hover:shadow-elevation-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-error-strong">اشتراكات منتهية</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-error text-on-error">
                <AlertCircle size={14} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-dash text-2xl font-black tabular-nums leading-none text-main lg:text-3xl">
                {expiredCount}
              </span>
              <span className="text-xs font-bold text-muted">طلاب</span>
            </div>
            <p className="mt-1 text-[10px] font-medium text-error-strong">تحتاج لتجديد فوري</p>
          </div>

          <div className="border-warning/20 rounded-2xl border bg-warning-soft p-3.5 shadow-elevation-1 transition-all duration-normal hover:shadow-elevation-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-warning-strong">قاربت على الانتهاء</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning text-on-warning">
                <Clock size={14} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-dash text-2xl font-black tabular-nums leading-none text-main lg:text-3xl">
                {lowCount}
              </span>
              <span className="text-xs font-bold text-muted">طلاب</span>
            </div>
            <p className="mt-1 text-[10px] font-medium text-warning-strong">متبقي حصتان أو أقل</p>
          </div>
        </div>
      </div>
    </section>
  )
}

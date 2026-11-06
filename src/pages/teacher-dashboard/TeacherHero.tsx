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

/** Teacher hero — Modern Double-Bezel layout merging greeting + achievements. */
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
      className="via-border/50 to-primary-soft/30 relative rounded-[30px] bg-gradient-to-br from-primary/20 p-1 shadow-elevation-1 transition-all duration-normal hover:shadow-elevation-2 sm:p-1.5"
    >
      <div className="border-border/80 relative overflow-hidden rounded-[26px] border bg-card">
        <div
          className="via-primary-soft/50 pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-light to-transparent"
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

        <div className="relative z-10 flex flex-col gap-4 p-5 sm:gap-6 sm:p-6 lg:p-7">
          <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
            <div className="flex flex-col justify-between gap-3.5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="border-border/70 bg-surface/80 mb-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-normal text-muted shadow-soft">
                    <UserRound size={12} className="text-primary" />
                    <span className="font-dash">{today}</span>
                  </div>

                  <h1 className="font-teacher-heading text-xl font-bold leading-tight text-main md:text-2xl xl:text-3xl">
                    {getGreeting()}، {firstName}
                  </h1>

                  <p className="mt-1 text-xs font-normal text-muted">
                    ملخص يومك التعليمي وتقدم طلابك في مكان واحد
                  </p>
                </div>

                <div
                  className="border-border/60 bg-surface/50 flex shrink-0 flex-col items-center gap-1 rounded-2xl border p-2.5 shadow-soft"
                  aria-label={`إنجاز حصص الشهر ${percent} بالمئة`}
                >
                  <div className="relative flex items-center justify-center">
                    <svg
                      width={RING_SIZE}
                      height={RING_SIZE}
                      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
                      className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16"
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
                        className="font-dash text-sm font-bold tabular-nums leading-none text-primary sm:text-base lg:text-lg"
                      />
                      <span className="text-[10px] font-bold leading-none text-primary">%</span>
                    </span>
                  </div>
                  <span className="whitespace-nowrap text-[10px] font-medium text-muted">
                    {showRing ? 'إنجاز الشهر' : 'لا حصص'}
                  </span>
                </div>
              </div>

              <div className="w-full md:w-auto">
                <div className="border-border/80 bg-surface/70 flex flex-col gap-1.5 rounded-2xl border p-1.5 shadow-soft md:flex-row md:flex-wrap md:items-center">
                  <span className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold text-main">
                    <Users size={13} className="text-primary" />
                    {stats.studentsCount === 1 ? 'طالب واحد' : `${stats.studentsCount} طلاب`}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold text-main">
                    <CalendarDays size={13} className="text-primary" />
                    {stats.todaySessions > 0 ? `${stats.todaySessions} حصص اليوم` : 'لا حصص اليوم'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold text-main">
                    <CheckCircle2 size={13} className="text-primary" />
                    {showRing
                      ? `${stats.monthCompletedSessions} من ${stats.monthTotalSessions}`
                      : 'لا إنجاز بعد'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3.5 lg:gap-4 lg:border-s lg:border-divider lg:ps-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-on-accent shadow-gold"
                    aria-hidden="true"
                  >
                    <Star size={17} fill="currentColor" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-main">إنجازاتك التعليمية</p>
                    <p className="text-[11px] text-muted">رتبتك وتقدمك هذا الشهر</p>
                  </div>
                </div>
                <RankBadge rank={rank} size="sm" />
              </div>

              {next && (
                <div className="border-border/80 bg-surface/70 rounded-2xl border p-3.5 shadow-soft">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-main">
                      <Zap size={13} className="text-accent" />
                      <CountUp
                        value={points}
                        className="font-dash font-bold tabular-nums text-primary"
                      />
                      <span className="text-micro font-medium text-muted">نقطة</span>
                    </span>
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold tabular-nums text-accent">
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
                  <p className="mt-2 text-xs font-normal text-muted">
                    باقي{' '}
                    <span className="font-dash font-bold tabular-nums text-main">
                      {pointsNeeded}
                    </span>{' '}
                    نقطة للترقية إلى «{next.name}»
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="group rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-4 shadow-elevation-2 shadow-primary/20 transition-all duration-normal hover:-translate-y-0.5 hover:shadow-elevation-3">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs font-medium text-white/90">صافي أرباح الشهر</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 shadow-soft">
                  <TrendingUp size={15} className="text-white" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-dash text-2xl font-bold tabular-nums leading-none text-white lg:text-3xl">
                  <CountUp
                    value={stats.monthNetProfit || 0}
                    format={(n) => Math.round(n).toLocaleString('ar-EG')}
                  />
                </span>
                <span className="text-xs font-semibold text-white/80">{CURRENCY_SYMBOL}</span>
              </div>
              <p className="mt-1.5 text-[10px] font-medium text-white/80">
                تقديري يُحسب بنهاية الشهر
              </p>
            </div>

            <div className="border-success/25 bg-success-soft/50 group rounded-2xl border p-4 shadow-elevation-1 transition-all duration-normal hover:-translate-y-0.5 hover:shadow-elevation-2">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-success-strong">الحصص المنفذة</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-success text-on-success shadow-soft">
                  <CheckCircle2 size={15} />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-dash text-2xl font-bold tabular-nums leading-none text-main lg:text-3xl">
                  <CountUp value={stats.monthCompletedSessions || 0} />
                </span>
                <span className="text-xs font-semibold text-muted">
                  من {stats.monthTotalSessions || 0}
                </span>
              </div>
              <p className="mt-1.5 text-[10px] font-semibold text-success-strong">
                نسبة الإنجاز {percent}%
              </p>
            </div>

            <div className="border-error/25 bg-error-soft/50 group rounded-2xl border p-4 shadow-elevation-1 transition-all duration-normal hover:-translate-y-0.5 hover:shadow-elevation-2">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-error-strong">اشتراكات منتهية</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-error text-on-error shadow-soft">
                  <AlertCircle size={15} />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-dash text-2xl font-bold tabular-nums leading-none text-main lg:text-3xl">
                  {expiredCount}
                </span>
                <span className="text-xs font-semibold text-muted">طلاب</span>
              </div>
              <p className="mt-1.5 text-[10px] font-semibold text-error-strong">
                تحتاج لتجديد فوري
              </p>
            </div>

            <div className="border-warning/25 bg-warning-soft/50 group rounded-2xl border p-4 shadow-elevation-1 transition-all duration-normal hover:-translate-y-0.5 hover:shadow-elevation-2">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-warning-strong">
                  قاربت على الانتهاء
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-warning text-on-warning shadow-soft">
                  <Clock size={15} />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-dash text-2xl font-bold tabular-nums leading-none text-main lg:text-3xl">
                  {lowCount}
                </span>
                <span className="text-xs font-semibold text-muted">طلاب</span>
              </div>
              <p className="mt-1.5 text-[10px] font-semibold text-warning-strong">
                متبقي حصتان أو أقل
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

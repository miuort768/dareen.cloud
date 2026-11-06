import { CheckCircle2, ClipboardList, TrendingUp } from 'lucide-react'
import type { WeeklyPulseStats } from './types'
import { CountUp } from '../../shared/components/CountUp'

interface WeeklyPulseProps {
  stats: WeeklyPulseStats
}

/** شريط نبض الأسبوع — تصميم بصري حديث لولي الأمر */
export const WeeklyPulse = ({ stats }: WeeklyPulseProps) => {
  return (
    <section
      aria-label="نبض الأسبوع"
      className="rounded-[24px] border border-border bg-card p-5 font-dash shadow-elevation-1 transition-all duration-normal hover:shadow-elevation-2 sm:p-6"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Featured KPI: Academic Progress */}
        <div className="flex-1">
          <div className="mb-4 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary-soft text-primary shadow-soft">
              <TrendingUp size={22} strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted">التقدم الأكاديمي العام</p>
              <div className="mt-1 flex items-baseline gap-2.5">
                <CountUp
                  value={stats.academicProgress}
                  format={(n) => `${n}%`}
                  className="font-dash text-2xl font-bold tabular-nums text-main sm:text-3xl"
                />
                <span className="border-success/20 rounded-full border bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success shadow-soft">
                  حضور {stats.attendanceRate}%
                </span>
              </div>
            </div>
          </div>
          <div className="border-border/60 h-2 w-full overflow-hidden rounded-full border bg-surface">
            <div
              className="h-full rounded-full bg-gradient-to-l from-primary to-primary-hover transition-all duration-700"
              style={{ width: `${Math.min(Math.max(stats.academicProgress, 0), 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-normal text-muted">
            من إجمالي الخطة الأكاديمية والمناهج المعتمدة لأبنائك
          </p>
        </div>

        {/* Desktop Divider */}
        <div className="mx-4 hidden h-20 w-px bg-divider md:block lg:mx-8" />

        {/* Secondary KPIs */}
        <div className="grid flex-1 grid-cols-2 gap-3 lg:gap-4">
          <article className="border-success/25 bg-success-soft/40 group flex flex-col justify-between rounded-2xl border p-4 shadow-soft transition-all duration-normal hover:-translate-y-0.5 hover:shadow-elevation-1">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-success text-on-success shadow-soft">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <CountUp
                value={stats.completed}
                className="font-dash text-2xl font-bold tabular-nums text-main"
              />
              <p className="mt-1 text-xs font-semibold text-main">حصص منجزة</p>
              <p className="mt-0.5 text-[11px] text-muted">{stats.weeklyCompleted} هذا الأسبوع</p>
            </div>
          </article>

          <article className="border-border/80 bg-surface/50 group flex flex-col justify-between rounded-2xl border p-4 shadow-soft transition-all duration-normal hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-elevation-1">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary-soft text-primary shadow-soft">
              <ClipboardList size={16} />
            </div>
            <div>
              <CountUp
                value={stats.todayCount}
                className="font-dash text-2xl font-bold tabular-nums text-main"
              />
              <p className="mt-1 text-xs font-semibold text-main">في جدول اليوم</p>
              <p className="mt-0.5 text-[11px] text-muted">جاهز للمتابعة</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

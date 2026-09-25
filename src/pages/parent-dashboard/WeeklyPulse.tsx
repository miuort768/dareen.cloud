import { CheckCircle2, ClipboardList, TrendingUp } from 'lucide-react'
import type { WeeklyPulseStats } from './types'
import { CountUp } from '../../shared/components/CountUp'

interface WeeklyPulseProps {
  stats: WeeklyPulseStats
}

/** شريط نبض الأسبوع — تصميم بصري هرمي يبرز التقدم الأكاديمي أولاً مع إحصائيات داعمة */
export const WeeklyPulse = ({ stats }: WeeklyPulseProps) => {
  return (
    <section
      aria-label="نبض الأسبوع"
      className="rounded-3xl border border-border bg-card p-6 shadow-soft"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Featured KPI: Academic Progress */}
        <div className="flex-1">
          <div className="mb-4 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-muted">التقدم الأكاديمي العام</p>
              <div className="mt-1 flex items-baseline gap-2">
                <CountUp
                  value={stats.academicProgress}
                  format={(n) => `${n}%`}
                  className="font-dash text-3xl font-black tabular-nums text-main"
                />
                <span className="rounded-lg bg-success-soft px-2 py-0.5 text-[11px] font-bold text-success">
                  حضور {stats.attendanceRate}%
                </span>
              </div>
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${Math.min(Math.max(stats.academicProgress, 0), 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] font-medium text-muted">
            من إجمالي الخطة الأكاديمية لأبنائك
          </p>
        </div>

        {/* Desktop Divider */}
        <div className="mx-4 hidden h-20 w-px bg-divider md:block lg:mx-8" />

        {/* Secondary KPIs */}
        <div className="grid flex-1 grid-cols-2 gap-3 lg:gap-4">
          <article className="flex flex-col rounded-2xl bg-success-soft p-4 transition-transform hover:-translate-y-0.5">
            <CheckCircle2 className="mb-2 text-success" size={20} />
            <CountUp
              value={stats.completed}
              className="font-dash text-2xl font-black tabular-nums text-success"
            />
            <p className="mt-1 text-xs font-bold text-success">حصص منجزة</p>
            <p className="mt-0.5 text-[10px] font-medium text-success opacity-80">
              {stats.weeklyCompleted} هذا الأسبوع
            </p>
          </article>

          <article className="flex flex-col rounded-2xl bg-surface p-4 transition-transform hover:-translate-y-0.5">
            <ClipboardList className="mb-2 text-primary" size={20} />
            <CountUp
              value={stats.todayCount}
              className="font-dash text-2xl font-black tabular-nums text-main"
            />
            <p className="mt-1 text-xs font-bold text-muted">في جدول اليوم</p>
            <p className="mt-0.5 text-[10px] font-medium text-muted">استعد لحصص اليوم</p>
          </article>
        </div>
      </div>
    </section>
  )
}

import React from 'react'
import {
  Activity,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Calendar,
  TrendingUp,
  Trophy,
  Medal,
  Award,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '../../../lib/utils'

interface AttendanceReportProps {
  monthlySessionsData: { month: string; completed: number; cancelled: number; total: number }[]
  teacherPerformanceData: {
    teacher: string
    completed: number
    cancelled: number
    rate: number
    total: number
  }[]
}

const SectionCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => <div className={cn('rounded-card border border-border bg-card', className)}>{children}</div>

const SectionHeader = ({
  icon: Icon,
  label,
  sub,
}: {
  icon: LucideIcon
  label: string
  sub?: string
}) => (
  <div className="flex items-center gap-3 border-b border-border px-5 py-4">
    <div className="flex h-8 w-8 items-center justify-center rounded-xl">
      <Icon size={15} className="text-chart-3" />
    </div>
    <div>
      <p className="text-xs font-bold text-main">{label}</p>
      {sub && <p className="mt-0.5 text-micro font-bold text-muted">{sub}</p>}
    </div>
  </div>
)

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name?: string; value: number; color?: string; stroke?: string; fill?: string }[]
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="min-w-[140px] rounded-xl border border-border bg-card px-4 py-3 text-start text-main shadow-xl"
        dir="rtl"
      >
        <p className="mb-2 border-b border-border pb-1 text-micro font-medium uppercase text-muted">
          {label}
        </p>
        {payload.map(
          (
            entry: { name?: string; value: number; color?: string; stroke?: string; fill?: string },
            i: number,
          ) => (
            <div
              key={`report-${i}`}
              className="mb-1 flex items-center justify-between gap-4 last:mb-0"
            >
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 rounded-sm"
                  style={{ backgroundColor: entry.stroke || entry.fill }}
                />
                <span className="text-micro font-normal text-muted">{entry.name}</span>
              </div>
              <span className="font-mono text-sm font-medium text-main">{entry.value}</span>
            </div>
          ),
        )}
      </div>
    )
  }
  return null
}

export const AttendanceReport = React.memo(
  ({ monthlySessionsData, teacherPerformanceData }: AttendanceReportProps) => {
    // Compute totals for summary bar
    const totalSessions = monthlySessionsData.reduce((s, m) => s + (m.total || 0), 0)
    const totalCompleted = monthlySessionsData.reduce((s, m) => s + (m.completed || 0), 0)
    const totalCancelled = monthlySessionsData.reduce((s, m) => s + (m.cancelled || 0), 0)
    const overallRate = totalSessions > 0 ? Math.round((totalCompleted / totalSessions) * 100) : 0

    return (
      <div className="space-y-4">
        {/* Summary Stat Bar */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            {
              label: 'إجمالي الحصص',
              value: totalSessions,
              icon: Calendar,
              bgClass: '',
              textClass: 'text-chart-6',
              sub: 'كل الأشهر',
            },
            {
              label: 'حصص مكتملة',
              value: totalCompleted,
              icon: CheckCircle2,
              bgClass: '',
              textClass: 'text-chart-3',
              sub: 'حضور فعلي',
            },
            {
              label: 'حصص ملغية',
              value: totalCancelled,
              icon: XCircle,
              bgClass: '',
              textClass: 'text-chart-5',
              sub: 'غياب/إلغاء',
            },
            {
              label: 'معدل الحضور',
              value: `${overallRate}%`,
              icon: TrendingUp,
              bgClass: '',
              textClass: 'text-chart-4',
              sub: 'نسبة النجاح الكلية',
            },
          ].map((item, i) => (
            <div key={`report-${i}`} className="rounded-card border border-border bg-card p-4">
              <div
                className={`mb-3 flex h-8 w-8 items-center justify-center rounded-xl ${item.bgClass}`}
              >
                <item.icon size={16} className={item.textClass} />
              </div>
              <p className={`font-mono text-xl font-bold ${item.textClass}`}>{item.value}</p>
              <p className="mt-1 text-micro font-bold text-muted">{item.label}</p>
              <p className="mt-0.5 text-micro font-bold text-muted">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Monthly Trend – Area Chart */}
        <SectionCard>
          <SectionHeader
            icon={Activity}
            label="اتجاه الحضور الشهري"
            sub="مقارنة بين الحصص المكتملة والملغية"
          />
          <div className="h-72 p-4" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlySessionsData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="arGradCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="arGradCancelled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-5)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--chart-5)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="arGradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-6)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--chart-6)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'var(--text-muted)', fontSize: 9, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 9, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="إجمالي"
                  stroke="var(--chart-6)"
                  strokeWidth={2}
                  fill="url(#arGradTotal)"
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="حضور"
                  stroke="var(--chart-3)"
                  strokeWidth={2.5}
                  fill="url(#arGradCompleted)"
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="cancelled"
                  name="غياب"
                  stroke="var(--chart-5)"
                  strokeWidth={2}
                  fill="url(#arGradCancelled)"
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pb-4">
            {[
              { bgClass: 'bg-chart-6', label: 'إجمالي' },
              { bgClass: 'bg-chart-3', label: 'حضور' },
              { bgClass: 'bg-chart-5', label: 'غياب' },
            ].map((l, i) => (
              <div key={`report-${i}`} className="flex items-center gap-1.5">
                <div className={`h-0.5 w-5 rounded-full ${l.bgClass}`} />
                <span className="text-micro font-bold text-muted">{l.label}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Teacher Performance */}
        <SectionCard>
          <SectionHeader
            icon={GraduationCap}
            label="أداء المعلمات"
            sub={`${teacherPerformanceData.length} معلمة • مرتبات حسب نسبة الحضور`}
          />

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-start">
              <thead>
                <tr className="bg-chart-4 text-on-primary">
                  <th className="px-5 py-3 text-micro font-bold text-on-primary opacity-70">#</th>
                  <th className="px-5 py-3 text-start text-micro font-bold text-on-primary opacity-70">
                    اسم المعلمة
                  </th>
                  <th className="px-5 py-3 text-center text-micro font-bold text-on-primary opacity-70">
                    المتوقعة
                  </th>
                  <th className="px-5 py-3 text-center text-micro font-bold text-on-primary opacity-70">
                    مكتملة
                  </th>
                  <th className="px-5 py-3 text-center text-micro font-bold text-on-primary opacity-70">
                    ملغية
                  </th>
                  <th className="w-44 px-5 py-3 text-center text-micro font-bold text-on-primary opacity-70">
                    معدل الحضور
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {teacherPerformanceData
                  .sort((a, b) => b.rate - a.rate)
                  .map((teacher, index) => {
                    const rate = teacher.rate
                    const barColor =
                      rate >= 80 ? 'bg-success' : rate >= 60 ? 'bg-warning' : 'bg-error'
                    const textColor =
                      rate >= 80 ? 'text-success' : rate >= 60 ? 'text-warning' : 'text-error'
                    const medalIcon =
                      index === 0 ? (
                        <Trophy size={12} className="text-warning" />
                      ) : index === 1 ? (
                        <Medal size={12} className="text-muted" />
                      ) : index === 2 ? (
                        <Award size={12} className="text-warning" />
                      ) : null
                    return (
                      <tr key={index} className="transition-colors hover:bg-hover">
                        <td className="px-5 py-3">
                          <span className="flex items-center justify-center gap-1 font-mono text-micro font-medium text-muted">
                            {medalIcon || String(index + 1).padStart(2, '0')}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold text-chart-3">
                              {teacher.teacher.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-main">{teacher.teacher}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center font-mono text-xs font-medium text-muted">
                          {teacher.total}
                        </td>
                        <td className="px-5 py-3 text-center font-mono text-xs font-medium text-success">
                          {teacher.completed}
                        </td>
                        <td className="px-5 py-3 text-center font-mono text-xs font-medium text-error">
                          {teacher.cancelled}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-2 flex-1 overflow-hidden rounded-xl bg-surface">
                              <div
                                className={cn(
                                  'h-full rounded-xl transition-all duration-700',
                                  barColor,
                                )}
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                            <span className={cn('w-9 text-end text-micro font-medium', textColor)}>
                              {rate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="divide-y divide-border md:hidden">
            {teacherPerformanceData
              .sort((a, b) => b.rate - a.rate)
              .map((teacher, index) => {
                const rate = teacher.rate
                const barColor = rate >= 80 ? 'bg-success' : rate >= 60 ? 'bg-warning' : 'bg-error'
                const textColor =
                  rate >= 80 ? 'text-success' : rate >= 60 ? 'text-warning' : 'text-error'
                const medalIcon =
                  index === 0 ? (
                    <Trophy size={14} className="text-warning" />
                  ) : index === 1 ? (
                    <Medal size={14} className="text-muted" />
                  ) : index === 2 ? (
                    <Award size={14} className="text-warning" />
                  ) : null
                return (
                  <div key={index} className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-chart-3">
                      {medalIcon || teacher.teacher.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="truncate text-xs font-normal text-main">{teacher.teacher}</p>
                        <span className={cn('me-2 shrink-0 text-micro font-medium', textColor)}>
                          {rate}%
                        </span>
                      </div>
                      <div className="mb-1.5 flex items-center gap-3">
                        <span className="text-micro font-normal text-success">
                          {teacher.completed} <CheckCircle2 size={10} className="inline" />
                        </span>
                        <span className="text-micro font-normal text-error">
                          {teacher.cancelled} <XCircle size={10} className="inline" />
                        </span>
                        <span className="text-micro font-normal text-muted">
                          {teacher.total} إجمالي
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-xl bg-surface">
                        <div
                          className={cn('h-full rounded-xl', barColor)}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </SectionCard>
      </div>
    )
  },
)
AttendanceReport.displayName = 'AttendanceReport'
export default AttendanceReport

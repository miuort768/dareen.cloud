import { useEffect, useMemo, lazy, Suspense } from 'react'
import {
  Award,
  CheckCircle2,
  DollarSign,
  LayoutDashboard,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
  Download,
} from 'lucide-react'
import { Skeleton, PageHeader } from '../shared/components/ui'
import { useReports } from '../features/reports/hooks/useReports'
import { FinancialReport } from '../features/reports/components/FinancialReport'
import type { ReportType } from '../features/reports/types'
import { CURRENCY_SYMBOL } from '@/config/constants'
import { useAcademyName } from '../context/AppContext'

const AcademicReport = lazy(() => import('../features/reports/components/AcademicReport'))
const AttendanceReport = lazy(() => import('../features/reports/components/AttendanceReport'))

export const Reports = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `التقارير | ${academyName}`
  }, [academyName])
  const { state, actions, filtered } = useReports()

  // Consolidated Tabs (enrollment merged into academic)
  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
    { id: 'academic', label: 'الأكاديمي والتسجيلات', icon: Award },
    { id: 'attendance', label: 'الحضور والغياب', icon: CheckCircle2 },
    { id: 'financial', label: 'المالي', icon: DollarSign },
  ]

  const uniqueSubjects = new Set(state.subjectPieData.map((s) => s.name)).size

  const tabVariants = {
    academic: { bg: 'bg-primary-soft', iconBg: 'bg-primary-light', text: 'text-primary' },
    attendance: { bg: 'bg-success-soft', iconBg: 'bg-success-light', text: 'text-success' },
    financial: { bg: 'bg-warning-soft', iconBg: 'bg-warning-light', text: 'text-warning' },
  }

  const dateStr = useMemo(
    () =>
      new Date().toLocaleDateString('ar-EG-u-nu-latn', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [],
  )

  if (state.loading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <Skeleton className="h-[76px] rounded-2xl" />
        <Skeleton className="h-[56px] rounded-2xl" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={`skel-${i}`} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    )
  }

  return (
    <div
      id="printable-reports"
      className="from-primary-soft/40 relative min-h-full overflow-x-hidden bg-gradient-to-b via-background to-background"
      dir="rtl"
    >
      <div className="mx-auto max-w-page space-y-4 px-2">
        {/* Header — unified PageHeader pattern */}
        <PageHeader
          title="التقارير والإحصائيات"
          subtitle={dateStr}
          icon={<BarChart3 size={22} />}
          action={
            <button
              onClick={() => window.print()}
              aria-label="طباعة التقرير"
              className="no-print inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-main shadow-sm transition-all duration-200 hover:bg-hover hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              <Download size={14} />
              طباعة / تصدير PDF
            </button>
          }
        />

        {/* Tabs Row */}
        <div className="no-scrollbar no-print flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive =
              state.activeReport === tab.id ||
              (state.activeReport === 'enrollment' && tab.id === 'academic')
            return (
              <button
                key={tab.id}
                onClick={() => actions.setActiveReport(tab.id as ReportType)}
                className={`flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:min-h-0 ${isActive ? 'shadow-xs bg-primary text-on-primary' : 'text-muted hover:text-main'}`}
              >
                <Icon size={15} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Main Content Area */}
        <div className="px-0 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
          {state.activeReport === 'overview' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-soft">
                        <BarChart3 size={16} className="text-primary" />
                      </div>
                      <h2 className="text-base font-bold text-main">ملخص الأداء العام</h2>
                    </div>
                    <p className="max-w-md text-xs font-bold leading-relaxed text-muted">
                      تقرير شامل يوضح الحالة الأكاديمية والمالية للمؤسسة. تم تحليل{' '}
                      {state.totalEnrollments} اشتراك نشط عبر {uniqueSubjects} مادة دراسية.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
                    <div>
                      <p className="text-xs font-bold text-primary">نسبة الحضور</p>
                      <p className="mt-1 font-mono text-2xl font-bold leading-none text-main">
                        {state.attendanceRate}%
                      </p>
                    </div>
                    <div className="h-10 w-px bg-border" />
                    <div>
                      <p className="text-xs font-bold text-success">النمو الشهري</p>
                      <p className="mt-1 font-mono text-2xl font-bold leading-none text-main">
                        {state.revenueGrowth >= 0
                          ? `+${state.revenueGrowth}%`
                          : `${state.revenueGrowth}%`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {tabs
                  .filter((t) => t.id !== 'overview')
                  .map((tab) => {
                    const Icon = tab.icon
                    const v =
                      tabVariants[tab.id as keyof typeof tabVariants] ?? tabVariants.academic
                    return (
                      <button
                        key={tab.id}
                        onClick={() => actions.setActiveReport(tab.id as ReportType)}
                        className={`group rounded-2xl border-0 p-4 transition-all hover:shadow-md active:scale-95 ${v.bg}`}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div
                            className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${v.iconBg}`}
                          >
                            <Icon size={18} className={v.text} />
                          </div>
                          <p className={`text-xs font-bold ${v.text}`}>{tab.label}</p>
                          <p className={`mt-1 text-micro font-bold ${v.text} opacity-60`}>
                            عرض التقرير التفصيلي
                          </p>
                        </div>
                      </button>
                    )
                  })}
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  {
                    label: 'الطلاب',
                    value: state.totalStudents,
                    icon: Users,
                    textClass: 'text-primary',
                    bgClass: 'bg-primary-soft',
                  },
                  {
                    label: 'الاشتراكات',
                    value: state.totalEnrollments,
                    icon: Award,
                    textClass: 'text-info',
                    bgClass: 'bg-info-soft',
                  },
                  {
                    label: 'المواد',
                    value: uniqueSubjects,
                    icon: BarChart3,
                    textClass: 'text-success',
                    bgClass: 'bg-success-soft',
                  },
                  {
                    label: 'الحصص الكلية',
                    value: state.totalSessions,
                    icon: Calendar,
                    textClass: 'text-warning',
                    bgClass: 'bg-warning-soft',
                  },
                  {
                    label: 'الحصص المكتملة',
                    value: state.completedSessions,
                    icon: CheckCircle2,
                    textClass: 'text-success',
                    bgClass: 'bg-success-soft',
                  },
                  {
                    label: 'الإيرادات',
                    value:
                      (state.totalRevenue > 1000
                        ? Math.round(state.totalRevenue / 1000) + 'k'
                        : state.totalRevenue) +
                      ' ' +
                      CURRENCY_SYMBOL,
                    textClass: 'text-primary',
                    bgClass: 'bg-primary-soft',
                    icon: DollarSign,
                  },
                  {
                    label: 'نسبة الحضور',
                    value: state.attendanceRate + '%',
                    icon: TrendingUp,
                    textClass: 'text-info',
                    bgClass: 'bg-info-soft',
                  },
                  {
                    label: 'النمو الشهري',
                    value:
                      state.revenueGrowth >= 0
                        ? `+${state.revenueGrowth}%`
                        : `${state.revenueGrowth}%`,
                    icon: TrendingUp,
                    textClass: 'text-primary',
                    bgClass: 'bg-primary-soft',
                  },
                ].map((stat, i) => (
                  <div
                    key={`stat-${i}`}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl ${stat.bgClass}`}
                    >
                      <stat.icon size={15} className={stat.textClass} />
                    </div>
                    <div className="mt-3">
                      <p className={`font-mono text-base font-bold leading-none ${stat.textClass}`}>
                        {stat.value}
                      </p>
                      <p className="mt-1.5 truncate text-xs font-bold text-muted">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-soft">
                      <BarChart3 size={16} className="text-primary" />
                    </div>
                    <h3 className="text-xs font-bold text-main">توزيع الاشتراكات حسب المادة</h3>
                  </div>
                  <span className="rounded-xl bg-success-soft px-2.5 py-1 text-micro font-bold text-success">
                    تحليل مباشر
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                  {state.subjectPieData.slice(0, 6).map((s, i) => {
                    const chartColorClasses = [
                      { text: 'text-chart-1', bg: 'bg-chart-1', var: 'var(--chart-1)' },
                      { text: 'text-chart-2', bg: 'bg-chart-2', var: 'var(--chart-2)' },
                      { text: 'text-chart-4', bg: 'bg-chart-4', var: 'var(--chart-4)' },
                      { text: 'text-chart-5', bg: 'bg-chart-5', var: 'var(--chart-5)' },
                      { text: 'text-chart-3', bg: 'bg-chart-3', var: 'var(--chart-3)' },
                      { text: 'text-chart-6', bg: 'bg-chart-6', var: 'var(--chart-6)' },
                    ]
                    const cc = chartColorClasses[i % chartColorClasses.length]!
                    const pct =
                      state.totalEnrollments > 0
                        ? Math.round((s.value / state.totalEnrollments) * 100)
                        : 0
                    return (
                      <div
                        key={`report-${i}`}
                        className="flex flex-col gap-2 rounded-2xl border bg-card p-3.5 transition-all"
                        style={{ borderColor: `color-mix(in srgb, ${cc.var} 25%, transparent)` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`h-2.5 w-2.5 rounded-sm ${cc.bg}`} />
                          <p className={`font-mono text-micro font-bold ${cc.text}`}>{pct}%</p>
                        </div>
                        <p className="truncate text-xs font-bold text-main">{s.name}</p>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                          <div
                            className={`h-full rounded-full transition-all ${cc.bg}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {(state.activeReport === 'academic' || state.activeReport === 'enrollment') && (
            <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
              <AcademicReport
                gradeBarData={state.gradeBarData}
                subjectPieData={state.subjectPieData}
                totalEnrollments={state.totalEnrollments}
                totalStudents={state.totalStudents}
                uniqueSubjects={uniqueSubjects}
                filteredStudentProgress={filtered.studentProgress}
                studentProgressTotal={state.studentProgressData.length}
                searchTerm={state.searchTerm}
                setSearchTerm={actions.setSearchTerm}
              />
            </Suspense>
          )}

          {state.activeReport === 'attendance' && (
            <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
              <AttendanceReport
                monthlySessionsData={state.monthlySessionsData}
                teacherPerformanceData={state.teacherPerformanceData}
              />
            </Suspense>
          )}

          {state.activeReport === 'financial' && (
            <FinancialReport
              totalRevenue={state.totalRevenue}
              monthRevenue={state.monthRevenue}
              totalExpenses={state.totalExpenses}
              monthExpenses={state.monthExpenses}
              netProfit={state.netProfit}
              monthNetProfit={state.monthNetProfit}
              profitMargin={state.profitMargin}
              completedSessions={state.completedSessions}
              reportCurrency={state.reportCurrency}
            />
          )}
        </div>
      </div>
    </div>
  )
}

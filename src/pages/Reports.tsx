import { useEffect, useMemo, useState, lazy, Suspense } from 'react'
import {
  Award,
  CheckCircle2,
  DollarSign,
  LayoutDashboard,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
  Plus,
  FileText,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '../shared/components/ui'
import { useReports } from '../features/reports/hooks/useReports'
import { ReportsHeader } from '../features/reports/components/ReportsHeader'
import { FinancialReport } from '../features/reports/components/FinancialReport'
import type { ReportType } from '../features/reports/types'
import { CURRENCY_SYMBOL } from '@/config/constants'
import { useAcademyName } from '../context/AppContext'
import { cn } from '../lib/utils'

const AcademicReport = lazy(() => import('../features/reports/components/AcademicReport'))
const AttendanceReport = lazy(() => import('../features/reports/components/AttendanceReport'))

const particles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 5 + 2,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 3,
}))

export const Reports = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `التقارير | ${academyName}`
  }, [academyName])
  const { state, actions, filtered } = useReports()

  const [fabOpen, setFabOpen] = useState(false)

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

  const kpiCards = useMemo(
    () => [
      {
        label: 'الطلاب',
        value: state.totalStudents,
        icon: Users,
        gradient: 'from-primary/20 to-primary/5',
        iconBg: 'bg-primary/10 text-primary',
        accent: 'bg-primary',
      },
      {
        label: 'الاشتراكات',
        value: state.totalEnrollments,
        icon: Award,
        gradient: 'from-success/20 to-success/5',
        iconBg: 'bg-success/10 text-success',
        accent: 'bg-success',
      },
      {
        label: 'الإيرادات',
        value:
          (state.totalRevenue > 1000
            ? Math.round(state.totalRevenue / 1000) + 'k'
            : state.totalRevenue) +
          ' ' +
          CURRENCY_SYMBOL,
        icon: DollarSign,
        gradient: 'from-warning/20 to-warning/5',
        iconBg: 'bg-warning/10 text-warning',
        accent: 'bg-warning',
      },
      {
        label: 'الحضور',
        value: state.attendanceRate + '%',
        icon: TrendingUp,
        gradient: 'from-info/20 to-info/5',
        iconBg: 'bg-info/10 text-info',
        accent: 'bg-info',
      },
    ],
    [state],
  )

  const fabActions = useMemo(
    () => [
      {
        icon: FileText,
        label: 'تقرير أكاديمي',
        onClick: () => actions.setActiveReport('academic'),
      },
      {
        icon: CheckCircle2,
        label: 'تقرير الحضور',
        onClick: () => actions.setActiveReport('attendance'),
      },
      {
        icon: DollarSign,
        label: 'تقرير مالي',
        onClick: () => actions.setActiveReport('financial'),
      },
    ],
    [actions],
  )

  if (state.loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-20" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={`skel-${i}`} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-16" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-full overflow-x-hidden pb-24" dir="rtl">
      <div className="mx-auto max-w-page space-y-4 px-2">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-2xl border border-transparent bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-6 dark:border-primary/20 dark:from-slate-950 dark:via-indigo-950/90 dark:to-slate-950 md:p-8"
        >
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="pointer-events-none absolute rounded-full bg-white/10"
              style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-xl bg-white/15 p-2 backdrop-blur-sm">
                  <BarChart3 className="text-white" size={20} />
                </div>
                <span className="text-xs font-medium text-white/70">التقارير</span>
              </div>
              <h1 className="mb-1 text-2xl font-bold text-on-primary md:text-3xl">
                التقارير والإحصائيات
              </h1>
              <p className="text-sm text-white/70">تحليل الأداء الأكاديمي والمالي المتكامل</p>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-center">
                <p className="mb-1 text-xs text-white/60">معدل الإنجاز</p>
                <p className="text-2xl font-bold text-white">{state.attendanceRate}%</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <p className="mb-1 text-xs text-white/60">النمو الشهري</p>
                <p className="text-2xl font-bold text-white">
                  {state.revenueGrowth >= 0
                    ? `+${state.revenueGrowth}%`
                    : `${state.revenueGrowth}%`}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {kpiCards.map((kpi, i) => {
              const Icon = kpi.icon
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.06 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={cn(
                    'border-border/50 relative overflow-hidden rounded-xl border bg-gradient-to-br p-4',
                    kpi.gradient,
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn('rounded-lg p-2', kpi.iconBg)}>
                      <Icon size={16} />
                    </div>
                    <div className={cn('h-1 w-12 rounded-full', kpi.accent)} />
                  </div>
                  <p className="mb-1 text-xs text-muted">{kpi.label}</p>
                  <p className="text-2xl font-bold text-main">{kpi.value}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <ReportsHeader onExport={() => window.print()} />

        {/* Tabs Row */}
        <div className="no-print no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive =
              state.activeReport === tab.id ||
              (state.activeReport === 'enrollment' && tab.id === 'academic')
            return (
              <button
                key={tab.id}
                onClick={() => actions.setActiveReport(tab.id as ReportType)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${isActive ? 'shadow-xs bg-primary text-on-primary' : 'text-muted hover:text-main'}`}
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
                      <p className="text-xs font-bold text-primary">معدل الإنجاز</p>
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
                    textClass: 'text-chart-1',
                    bgClass: 'bg-chart-1/10',
                  },
                  {
                    label: 'الاشتراكات',
                    value: state.totalEnrollments,
                    icon: Award,
                    textClass: 'text-chart-1',
                    bgClass: 'bg-chart-1/10',
                  },
                  {
                    label: 'المواد',
                    value: uniqueSubjects,
                    icon: BarChart3,
                    textClass: 'text-chart-4',
                    bgClass: 'bg-chart-4/10',
                  },
                  {
                    label: 'الحصص الكلية',
                    value: state.totalSessions,
                    icon: Calendar,
                    textClass: 'text-chart-2',
                    bgClass: 'bg-chart-2/10',
                  },
                  {
                    label: 'الحصص المكتملة',
                    value: state.completedSessions,
                    icon: CheckCircle2,
                    textClass: 'text-chart-6',
                    bgClass: 'bg-chart-6/10',
                  },
                  {
                    label: 'الإيرادات',
                    value:
                      (state.totalRevenue > 1000
                        ? Math.round(state.totalRevenue / 1000) + 'k'
                        : state.totalRevenue) +
                      ' ' +
                      CURRENCY_SYMBOL,
                    icon: DollarSign,
                    textClass: 'text-chart-5',
                    bgClass: 'bg-chart-5/10',
                  },
                  {
                    label: 'نسبة الحضور',
                    value: state.attendanceRate + '%',
                    icon: TrendingUp,
                    textClass: 'text-chart-3',
                    bgClass: 'bg-chart-3/10',
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
                filteredStudentProgress={filtered.studentProgress.map((s) => ({
                  ...s,
                  subject: '',
                  attendanceRate: 0,
                  sessionsCount: 0,
                }))}
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
              completedSessions={state.completedSessions}
              reportCurrency={CURRENCY_SYMBOL}
            />
          )}
        </div>
      </div>

      {/* FAB Button - rounded square (rounded-2xl) */}
      <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {fabOpen &&
            fabActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.3, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.3, y: 20 }}
                transition={{ delay: 0.05 * (fabActions.length - 1 - i) }}
                className="flex items-center gap-2"
              >
                <span className="whitespace-nowrap rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold shadow-sm">
                  {action.label}
                </span>
                <button
                  onClick={() => {
                    action.onClick()
                    setFabOpen(false)
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl active:scale-95"
                >
                  <action.icon size={18} />
                </button>
              </motion.div>
            ))}
        </AnimatePresence>
        <motion.button
          onClick={() => setFabOpen(!fabOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'w-13 h-13 flex items-center justify-center rounded-2xl text-on-primary shadow-xl transition-all',
            fabOpen ? 'rotate-45 bg-error' : 'bg-primary',
          )}
        >
          <Plus size={24} />
        </motion.button>
      </div>
    </div>
  )
}

import { memo } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  CalendarDays,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Users,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { CURRENCY_SYMBOL } from '@/config/constants'
import { CountUp } from '@/shared/components/CountUp'
import { TimeOfDayBadge } from '@/shared/components/TimeOfDayBadge'
import type { ExecutiveStats } from '../../services/executiveService'

interface ExecutiveHeroProps {
  userName?: string
  academicYear?: string
  stats?: ExecutiveStats
  criticalCount?: number
  isFetching?: boolean
  onRefresh?: () => void
}

const getGreeting = (): string => {
  const h = new Date().getHours()
  if (h < 5) return 'ليلة موفقة'
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'يوم سعيد'
  return 'مساء الخير'
}

export const ExecutiveHero = memo(function ExecutiveHero({
  userName,
  academicYear,
  stats,
  criticalCount = 0,
  isFetching = false,
  onRefresh,
}: ExecutiveHeroProps) {
  const firstName = (userName || '').split(' ')[0] || 'المدير'
  const today = format(new Date(), 'eeee، d MMMM yyyy', { locale: ar })

  const attendanceRate = stats?.attendanceRate ?? 0
  const activeSessions = stats?.activeSessions ?? 0
  const totalRevenue = stats?.todayRevenue ?? 0
  const totalStudents = stats?.studentsCount ?? 0
  const totalTeachers = stats?.teachersCount ?? 0

  return (
    <section
      aria-label="لوحة الترحيب القيادية"
      className="group relative rounded-[32px] bg-gradient-to-br from-primary/30 via-primary-deep/20 to-accent/20 p-1 shadow-elevation-2 transition-all duration-normal hover:shadow-elevation-3"
      dir="rtl"
    >
      <div className="relative overflow-hidden rounded-[28px] border border-white/20 bg-gradient-to-br from-primary via-primary-active to-primary-deep p-6 text-on-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] sm:p-8 lg:p-9">
        {/* Ambient atmospheric lights */}
        <div
          className="pointer-events-none absolute -start-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl transition-opacity duration-slow group-hover:opacity-80 lg:h-96 lg:w-96"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -end-24 h-72 w-72 rounded-full bg-accent/25 blur-3xl transition-opacity duration-slow group-hover:opacity-80 lg:h-96 lg:w-96"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-1/4 top-0 h-40 w-96 rounded-full bg-white/10 blur-3xl transition-opacity duration-slow"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.2),rgba(255,255,255,0))] opacity-90"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col gap-6 lg:gap-8">
          {/* Top Bar: Badges, Title & Actions */}
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3.5 py-1 text-xs font-medium text-white shadow-soft backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  <CalendarDays size={13} className="text-white/90" />
                  <span>{today}</span>
                </div>

                {academicYear && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 shadow-soft backdrop-blur-md">
                    <ShieldCheck size={13} className="text-white/80" />
                    العام الدراسي {academicYear}
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 shadow-soft backdrop-blur-md">
                  <Sparkles size={12} className="text-accent" />
                  مركز القيادة التنفيذي
                </span>
              </div>

              <div>
                <h1 className="font-heading text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {getGreeting()}، {firstName}
                </h1>
                <p className="mt-1.5 text-xs font-normal text-white/85 sm:text-sm">
                  متابعة شاملة ومباشرة لتدفق الحصص، الإيرادات المالية، وانضباط الأكاديمية
                </p>
              </div>
            </div>

            {/* Quick Actions & Live Indicator */}
            <div className="flex shrink-0 items-center gap-2.5 self-start">
              <TimeOfDayBadge variant="glass" />
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isFetching}
                  aria-label="تحديث البيانات لحظياً"
                  title="تحديث البيانات لحظياً"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-white shadow-soft outline-none backdrop-blur-md transition-all duration-normal hover:scale-105 hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-focus active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw size={17} className={isFetching ? 'animate-spin' : ''} />
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar: 4 Interactive High-End Glass Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
            {/* Revenue */}
            <div className="group/metric relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md transition-all duration-normal hover:-translate-y-1 hover:bg-white/15 hover:shadow-elevation-2 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-white/85">تحصيلات اليوم</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white shadow-soft transition-transform duration-normal group-hover/metric:scale-110">
                  <TrendingUp size={16} />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <CountUp
                  value={totalRevenue}
                  format={(val) => Math.round(val).toLocaleString('en-US')}
                  className="font-dash text-2xl font-black tabular-nums tracking-tight text-white lg:text-3xl"
                />
                <span className="text-xs font-bold text-white/80">{CURRENCY_SYMBOL}</span>
              </div>
              <p className="mt-1 text-[11px] text-white/70">المسجلة بالخزينة اليوم</p>
            </div>

            {/* Attendance */}
            <div className="group/metric relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md transition-all duration-normal hover:-translate-y-1 hover:bg-white/15 hover:shadow-elevation-2 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-white/85">نسبة الحضور</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white shadow-soft transition-transform duration-normal group-hover/metric:scale-110">
                  <CheckCircle2 size={16} />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <CountUp
                  value={attendanceRate}
                  format={(val) => `${Math.round(val)}`}
                  className="font-dash text-2xl font-black tabular-nums tracking-tight text-white lg:text-3xl"
                />
                <span className="text-xs font-bold text-white/80">%</span>
              </div>
              <p className="mt-1 text-[11px] text-white/70">التزام الطلاب بالحصص</p>
            </div>

            {/* Active Sessions */}
            <div className="group/metric relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md transition-all duration-normal hover:-translate-y-1 hover:bg-white/15 hover:shadow-elevation-2 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-white/85">حصص جارية الآن</span>
                <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white shadow-soft transition-transform duration-normal group-hover/metric:scale-110">
                  {activeSessions > 0 && (
                    <span className="absolute -end-1 -top-1 flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                    </span>
                  )}
                  <GraduationCap size={16} />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <CountUp
                  value={activeSessions}
                  className="font-dash text-2xl font-black tabular-nums tracking-tight text-white lg:text-3xl"
                />
                <span className="text-xs font-medium text-white/80">حصة مباشرة</span>
              </div>
              <p className="mt-1 text-[11px] text-white/70">بالفصول التفاعلية</p>
            </div>

            {/* Academic Community */}
            <div className="group/metric relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md transition-all duration-normal hover:-translate-y-1 hover:bg-white/15 hover:shadow-elevation-2 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-white/85">المجتمع التعليمي</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white shadow-soft transition-transform duration-normal group-hover/metric:scale-110">
                  <Users size={16} />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-dash text-2xl font-black tabular-nums tracking-tight text-white lg:text-3xl">
                  {(totalStudents + totalTeachers).toLocaleString('en-US')}
                </span>
                <span className="text-xs font-medium text-white/80">عضو</span>
              </div>
              <p className="mt-1 text-[11px] text-white/70">
                {totalStudents} طالب · {totalTeachers} معلمة
              </p>
            </div>
          </div>

          {/* Bottom Alerts / Status Strip */}
          {criticalCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between gap-3 rounded-2xl border border-error/40 bg-error/20 px-4 py-2.5 text-white backdrop-blur-md"
            >
              <div className="flex items-center gap-2 text-xs font-medium">
                <AlertTriangle size={15} className="shrink-0 text-white" />
                <span>يوجد {criticalCount} تنبيهات حرجة تتطلب تدخلك الفوري الآن</span>
              </div>
              <span className="shrink-0 rounded-lg bg-white/20 px-2 py-0.5 text-[11px] font-bold text-white">
                تنبيه عاجل
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
})

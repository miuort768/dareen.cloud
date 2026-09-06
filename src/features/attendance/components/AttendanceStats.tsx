import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  Calendar,
  TrendingUp,
  TrendingDown,
  Info,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AttendanceStats as IStats, TeacherStats as ITeacherStats } from '../types'

interface AttendanceStatsProps {
  stats: IStats
  teacherStats?: ITeacherStats
  isTeacher: boolean
  periodLabel?: string
  prevCompleted?: number
  prevCancelled?: number
}

const Counter = ({ value, suffix = '' }: { value: number; suffix?: string }) => (
  <motion.span
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    className="tabular-nums"
  >
    {value.toLocaleString('ar-EG')}
    {suffix && <span className="me-1 text-micro font-bold text-muted">{suffix}</span>}
  </motion.span>
)

const TrendBadge = ({ value, label }: { value: number; label: string }) => {
  if (value === 0) return null
  const isUp = value > 0
  return (
    <div
      className={cn(
        'mt-0.5 flex items-center gap-0.5 rounded-2xl px-1.5 py-0.5 text-[9px] font-bold',
        isUp ? 'bg-success-soft text-success' : 'bg-error-soft text-error',
      )}
    >
      {isUp ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
      <span>
        {isUp ? '+' : ''}
        {value}% {label}
      </span>
    </div>
  )
}

const TooltipWrap = ({ text, children }: { text: string; children: React.ReactNode }) => {
  const [show, setShow] = useState(false)
  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-1 start-1/2 z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-2xl bg-main px-2 py-1 text-[9px] font-bold text-inverse shadow-elevation-3"
        >
          {text}
          <div className="absolute start-1/2 top-full h-0 w-0 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-main" />
        </motion.div>
      )}
    </div>
  )
}

export const AttendanceStats = ({
  stats,
  teacherStats,
  isTeacher,
  periodLabel,
  prevCompleted = 0,
  prevCancelled = 0,
}: AttendanceStatsProps) => {
  if (isTeacher && teacherStats) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-4 space-y-3"
        dir="rtl"
      >
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 md:p-5">
          <div className="pointer-events-none absolute -end-14 -top-16 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative z-10">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted">نسبة الإنجاز الإجمالية</span>
              <TooltipWrap text="نسبة الحصص المنعقدة من إجمالي المطلوبة">
                <Info size={11} className="text-dim" />
              </TooltipWrap>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tabular-nums text-primary md:text-4xl">
                <Counter value={teacherStats.rate} suffix="%" />
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(teacherStats.rate, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-primary"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <Calendar size={14} className="text-primary" />
              <TooltipWrap text="إجمالي الحصص المقررة لهذا اليوم">
                <Info size={9} className="text-muted" />
              </TooltipWrap>
            </div>
            <p className="text-lg font-bold text-main">
              <Counter value={teacherStats.expected} />
            </p>
            <p className="mt-0.5 text-micro font-bold text-muted">الحصص المتوقعة</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <CheckCircle2 size={14} className="text-success" />
              <TooltipWrap text="الحصص التي تم عقدها فعلياً">
                <Info size={9} className="text-muted" />
              </TooltipWrap>
            </div>
            <p className="text-lg font-bold text-success">
              <Counter value={teacherStats.used} />
            </p>
            <p className="mt-0.5 text-micro font-bold text-muted">المنعقدة</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <XCircle size={14} className="text-warning dark:text-primary" />
              <TooltipWrap text="الحصص المتبقية من الجدول">
                <Info size={9} className="text-muted" />
              </TooltipWrap>
            </div>
            <p className="text-lg font-bold text-warning dark:text-primary">
              <Counter value={teacherStats.remaining} />
            </p>
            <p className="mt-0.5 text-micro font-bold text-muted">المتبقية</p>
          </div>
        </div>
      </motion.div>
    )
  }

  const total = stats.todayCompleted + stats.todayCancelled + stats.todayScheduled || 1
  const completedPct = Math.round((stats.todayCompleted / total) * 100)
  const cancelledPct = Math.round((stats.todayCancelled / total) * 100)
  const scheduledPct = Math.round((stats.todayScheduled / total) * 100)
  const trendCompleted = prevCompleted
    ? Math.round(((stats.todayCompleted - prevCompleted) / prevCompleted) * 100)
    : 0
  const trendCancelled = prevCancelled
    ? Math.round(((stats.todayCancelled - prevCancelled) / prevCancelled) * 100)
    : 0

  const attendanceRate =
    stats.todayCompleted + stats.todayCancelled > 0
      ? Math.round((stats.todayCompleted / (stats.todayCompleted + stats.todayCancelled)) * 100)
      : 100
  const absenceRate =
    stats.todayCompleted + stats.todayCancelled > 0
      ? Math.round((stats.todayCancelled / (stats.todayCompleted + stats.todayCancelled)) * 100)
      : 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-4 space-y-3"
      dir="rtl"
    >
      {/* Main summary card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 md:p-5">
        <div className="pointer-events-none absolute -end-14 -top-16 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative z-10">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-muted">
              <Users size={12} />
              إحصائيات الفترة ({periodLabel || 'اليوم'})
            </span>
            <TooltipWrap text="مجموع جميع الحصص لجميع المعلمات">
              <Info size={11} className="text-dim" />
            </TooltipWrap>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tabular-nums text-main md:text-4xl">
              <Counter value={total} />
            </span>
            <span className="text-xs font-bold text-muted">حصة</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 rounded-2xl bg-success-soft px-2 py-1 text-[10px] font-bold text-success">
              <CheckCircle2 size={10} />
              {stats.todayCompleted} حضور
            </span>
            <span className="flex items-center gap-1 rounded-2xl bg-error-soft px-2 py-1 text-[10px] font-bold text-error">
              <XCircle size={10} />
              {stats.todayCancelled} غياب
            </span>
            <span className="flex items-center gap-1 rounded-2xl bg-warning-soft px-2 py-1 text-[10px] font-bold text-warning dark:bg-primary-soft dark:text-primary">
              <Calendar size={10} />
              {stats.todayScheduled} مجدولة
            </span>
          </div>
          <div className="mt-3 flex h-2 gap-0.5 overflow-hidden rounded-full bg-border">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completedPct}%` }}
              transition={{ duration: 0.6 }}
              className="h-full rounded-s-full bg-success"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${cancelledPct}%` }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="h-full bg-error"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${scheduledPct}%` }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-full rounded-2xl bg-warning dark:bg-primary"
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[9px] font-bold text-dim">نسبة الإنجاز: {completedPct}%</span>
            <span className="text-[9px] font-bold text-dim">
              إجمالي الكل: <Counter value={stats.totalCompleted} />
            </span>
          </div>
        </div>
      </div>

      {/* Rate cards — attendance % + absence % */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-success-soft bg-success-soft p-4">
          <div className="mb-2 flex items-center justify-between">
            <CheckCircle2 size={14} className="text-success" />
            <TrendBadge value={trendCompleted} label="مقارنة" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-success">
            {attendanceRate}
            <span className="text-sm">%</span>
          </p>
          <p className="mt-0.5 text-[10px] font-bold text-muted">نسبة الحضور</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${attendanceRate}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full bg-success"
            />
          </div>
        </div>
        <div className="rounded-2xl border border-error-soft bg-error-soft p-4">
          <div className="mb-2 flex items-center justify-between">
            <XCircle size={14} className="text-error" />
            <TrendBadge value={trendCancelled} label="مقارنة" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-error">
            {absenceRate}
            <span className="text-sm">%</span>
          </p>
          <p className="mt-0.5 text-[10px] font-bold text-muted">نسبة الغياب</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${absenceRate}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full bg-error"
            />
          </div>
        </div>
      </div>

      {/* Count cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <CheckCircle2 size={14} className="text-success" />
          </div>
          <p className="text-lg font-bold text-success">
            <Counter value={stats.todayCompleted} />
          </p>
          <p className="mt-0.5 text-[10px] font-bold text-muted">حضور</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <XCircle size={14} className="text-error" />
          </div>
          <p className="text-lg font-bold text-error">
            <Counter value={stats.todayCancelled} />
          </p>
          <p className="mt-0.5 text-[10px] font-bold text-muted">غياب</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <Calendar size={14} className="text-warning dark:text-primary" />
            <TooltipWrap text="الحصص التي لم يتم البدء بها بعد">
              <Info size={9} className="text-muted" />
            </TooltipWrap>
          </div>
          <p className="text-lg font-bold text-warning dark:text-primary">
            <Counter value={stats.todayScheduled} />
          </p>
          <p className="mt-0.5 text-[10px] font-bold text-muted">مجدولة</p>
        </div>
      </div>
    </motion.div>
  )
}

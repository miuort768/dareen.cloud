import { useNavigate } from 'react-router-dom'
import { BookMarked, CalendarClock, ArrowLeft, GraduationCap, User } from 'lucide-react'
import type { Student } from '../../types'
import { periodLabel } from '../../features/attendance/utils/slotUtils'
import { cn } from '../../lib/utils'
import type { ChildStats } from './types'

interface ChildPanelProps {
  child: Student
  stats: ChildStats
}

const Ring = ({ value, size = 68 }: { value: number; size?: number }) => {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  const tone =
    value >= 90 ? 'text-success' : value >= 75 ? 'text-warning dark:text-primary' : 'text-error'
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-divider"
          strokeWidth="6"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (value / 100) * c}
          className={`${tone} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn('font-dash text-sm font-bold tabular-nums', tone)}>{value}%</span>
      </div>
    </div>
  )
}

export const ChildPanel = ({ child, stats }: ChildPanelProps) => {
  const navigate = useNavigate()
  const enrollments = child.enrollments || []
  const { nextSession, notes } = stats
  const when = nextSession
    ? nextSession.isToday
      ? `اليوم ${nextSession.hour} ${periodLabel(nextSession.period, true)}`
      : `${nextSession.day} ${nextSession.hour} ${periodLabel(nextSession.period, true)}`
    : null

  return (
    <section
      aria-label={`لوحة متابعة ${child.name}`}
      className="border-border/80 overflow-hidden rounded-[26px] border bg-card shadow-elevation-1 transition-all duration-normal hover:shadow-elevation-2"
    >
      {/* Header — هوية الابن + حلقة الحضور + أرقام */}
      <div className="border-border/60 bg-surface/40 p-5.5 flex flex-wrap items-center justify-between gap-4 border-b sm:p-6">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover text-on-primary shadow-elevation-2">
            <span className="text-xl font-bold" aria-hidden="true">
              {(child.name || 'ط').charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-black text-main">{child.name}</h2>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <GraduationCap size={13} className="text-primary" />
              <span>{child.stage || 'المرحلة الدراسية'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-end">
            <p className="text-xs font-bold text-main">نسبة الحضور</p>
            <p className="text-[11px] text-muted">خلال الشهر الحالي</p>
          </div>
          <Ring value={stats.attendanceRate} />
        </div>
      </div>

      <div className="p-5.5 grid grid-cols-1 gap-5 sm:p-6 lg:grid-cols-2">
        {/* الحصة القادمة */}
        <div className="border-border/80 bg-surface/50 p-4.5 flex flex-col justify-between rounded-2xl border shadow-soft">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-bold text-main">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <CalendarClock size={14} />
                </span>
                الحصة القادمة
              </span>
              {when && (
                <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold tabular-nums text-primary">
                  {when}
                </span>
              )}
            </div>

            {nextSession ? (
              <div className="mt-3">
                <p className="text-base font-black text-main">{nextSession.subject}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                  <User size={12} className="text-primary" />
                  <span>مع {nextSession.teacher}</span>
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted">لا توجد حصص قادمة مجدولة حالياً</p>
            )}
          </div>

          <button
            onClick={() => navigate('/schedule')}
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-primary transition-colors hover:text-primary-hover"
          >
            <span>عرض جدول الابن</span>
            <ArrowLeft size={13} />
          </button>
        </div>

        {/* ملخص الإنجاز الدراسي */}
        <div className="border-border/80 bg-surface/50 p-4.5 flex flex-col justify-between rounded-2xl border shadow-soft">
          <div>
            <span className="flex items-center gap-2 text-xs font-bold text-main">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-soft text-success-strong">
                <BookMarked size={14} />
              </span>
              المواد النشطة
            </span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-dash text-2xl font-black text-main">{enrollments.length}</span>
              <span className="text-xs text-muted">مواد مسجل بها</span>
            </div>
          </div>

          {notes && (
            <p className="mt-3 truncate rounded-xl bg-card p-2.5 text-xs text-muted">{notes}</p>
          )}
        </div>
      </div>
    </section>
  )
}

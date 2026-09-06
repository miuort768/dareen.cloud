import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  BookMarked,
  Clock,
  ChevronLeft,
  FileText,
  Snowflake,
  CalendarDays,
} from 'lucide-react'
import type { Student } from '../../types'
import { periodLabel } from '../../features/attendance/utils/slotUtils'
import { CountUp } from '../../shared/components/CountUp'
import type { ChildStats } from './types'

interface ChildPanelProps {
  child: Student
  stats: ChildStats
}

const Ring = ({ value, size = 64 }: { value: number; size?: number }) => {
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
        <span className={`text-sm font-black tabular-nums ${tone}`}>{value}%</span>
      </div>
    </div>
  )
}

export const ChildPanel = ({ child, stats }: ChildPanelProps) => {
  const navigate = useNavigate()
  const enrollments = child.enrollments || []
  const { nextSession, notes } = stats

  return (
    <section
      aria-label={`لوحة متابعة ${child.name}`}
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-elevation-1 transition-colors duration-slow"
    >
      {/* Header — identity + attendance ring + key numbers */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary">
            <span className="text-base font-black" aria-hidden="true">
              {(child.name || 'ط').charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-black text-main">{child.name}</h2>
            <p className="text-[11px] font-bold text-muted">{child.grade}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-sm font-black tabular-nums text-main">
              <CountUp value={stats.completed} />
              <span className="text-[10px] font-bold text-muted"> منجزة</span>
            </p>
            {stats.cancelled > 0 && (
              <p className="text-[10px] font-bold text-error">{stats.cancelled} ملغاة</p>
            )}
          </div>
          <Ring value={stats.attendanceRate} />
        </div>
      </div>

      {/* Next session strip */}
      <div className="border-b border-border bg-primary-soft px-5 py-3">
        {nextSession ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-xs font-bold text-main">
              <CalendarDays size={13} className="text-primary" />
              الحصة القادمة:
              <span className="text-primary">{nextSession.subject}</span>
              <span className="text-muted">مع {nextSession.teacher}</span>
            </p>
            <span className="rounded-2xl bg-surface px-2.5 py-1 text-[11px] font-black tabular-nums text-main">
              {nextSession.isToday
                ? `اليوم ${nextSession.hour} ${periodLabel(nextSession.period, true)}`
                : `${nextSession.day} ${nextSession.hour} ${periodLabel(nextSession.period, true)}`}
            </span>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-xs font-bold text-muted">
            <CalendarDays size={13} className="text-primary" />
            لا توجد حصص مجدولة — راجع الجدول الأسبوعي
          </p>
        )}
      </div>

      {/* Subject progress grid */}
      <div className="p-5">
        <h3 className="mb-3 text-xs font-black text-muted">تقدم المواد</h3>
        {enrollments.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-6 text-center text-xs font-bold text-muted">
            لا توجد مواد مسجلة
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {enrollments.map((en, idx) => {
              const total = Number(en.sessionsTotal || 0)
              const used = Number(en.sessionsUsed || 0)
              const pct = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0
              const frozen = en.isFrozen
              return (
                <div
                  key={en.id || `en-${idx}`}
                  className={`rounded-2xl border p-3 transition-colors duration-slow ${
                    frozen ? 'bg-divider/30 border-border' : 'border-border bg-surface'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="flex min-w-0 items-center gap-1.5 text-xs font-black text-main">
                      <BookMarked
                        size={12}
                        className={frozen ? 'shrink-0 text-muted' : 'shrink-0 text-primary'}
                      />
                      <span className="truncate">{en.subject}</span>
                    </p>
                    {frozen ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-2xl bg-divider px-1.5 py-0.5 text-[9px] font-bold text-muted">
                        <Snowflake size={9} /> مجمّدة
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] font-black tabular-nums text-primary">
                        {used}/{total}
                      </span>
                    )}
                  </div>
                  <div className="relative h-1.5 overflow-hidden rounded-full bg-divider">
                    <div
                      className={`absolute inset-y-0 start-0 rounded-full transition-all duration-700 ${
                        frozen ? 'bg-muted' : 'bg-primary'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1.5 truncate text-[10px] font-bold text-muted">
                    {typeof en.teacher === 'string'
                      ? en.teacher
                      : en.teacher?.name || en.teacherName}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {/* Teacher notes */}
        {notes.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-black text-muted">
              <FileText size={12} className="text-primary" />
              ملاحظات المعلمات
            </h3>
            <div className="space-y-2">
              {notes.map((note, i) => (
                <div
                  key={`note-${i}`}
                  className="rounded-2xl border border-s-[3px] border-border border-s-primary bg-card p-3 shadow-elevation-1"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[11px] font-black text-main">{note.subject}</span>
                    <span className="text-[10px] font-bold text-primary">{note.teacher}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted">{note.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/parent-students')}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-border py-2.5 text-xs font-bold text-primary transition-all hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.99]"
        >
          عرض السجل الكامل في صفحة الأبناء
          <ChevronLeft size={14} />
        </button>
      </div>
    </section>
  )
}

export const ChildPanelSkeletonHint = () => (
  <div className="flex items-center gap-2 text-[10px] font-bold text-muted">
    <Clock size={10} /> يُحدّث تلقائيًا
  </div>
)

export const ChildPanelCompletedBadge = () => (
  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success">
    <CheckCircle2 size={10} /> مكتمل
  </span>
)

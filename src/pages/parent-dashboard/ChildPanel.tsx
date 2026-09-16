import { useNavigate } from 'react-router-dom'
import {
  BookMarked,
  CalendarClock,
  Clock,
  ArrowLeft,
  FileText,
  Snowflake,
  GraduationCap,
  User,
  CalendarDays,
} from 'lucide-react'
import type { Student } from '../../types'
import { periodLabel } from '../../features/attendance/utils/slotUtils'
import { CountUp } from '../../shared/components/CountUp'
import { ProgressBar } from '../../shared/components/ui'
import { cn } from '../../lib/utils'
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
        <span className={cn('font-dash text-sm font-black tabular-nums', tone)}>{value}%</span>
      </div>
    </div>
  )
}

const ACCENT_TONES: {
  tile: string
  text: string
  bar: 'primary' | 'success' | 'info' | 'warning' | 'error'
}[] = [
  { tile: 'bg-primary-soft', text: 'text-primary', bar: 'primary' },
  { tile: 'bg-success-soft', text: 'text-success-strong', bar: 'success' },
  { tile: 'bg-info-soft', text: 'text-info-strong', bar: 'info' },
  { tile: 'bg-warning-soft', text: 'text-warning-strong', bar: 'warning' },
  { tile: 'bg-error-soft', text: 'text-error-strong', bar: 'error' },
]

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
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-elevation-1 transition-colors duration-slow"
    >
      {/* Header — هوية الابن + حلقة الحضور + أرقام */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover text-on-primary shadow-elevation-2">
            <span className="text-base font-black" aria-hidden="true">
              {(child.name || 'ط').charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-black text-main">{child.name}</h2>
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-muted">
              <GraduationCap size={11} className="text-primary" />
              {child.grade}
            </p>
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

      {/* شريط الحصة القادمة */}
      <div className="border-b border-border bg-primary-soft px-5 py-3.5">
        {nextSession && when ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-black text-main">
                <CalendarClock size={13} className="text-primary" />
                الحصة القادمة:
                <span className="truncate text-primary">{nextSession.subject}</span>
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-bold text-muted">
                <User size={10} className="text-primary" />
                مع {nextSession.teacher}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-black tabular-nums text-on-primary">
              <Clock size={11} />
              {when}
            </span>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-xs font-bold text-muted">
            <CalendarClock size={13} className="text-primary" />
            لا توجد حصص مجدولة
          </p>
        )}
        <button
          onClick={() => navigate('/schedule')}
          className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          aria-label="فتح الجدول الأسبوعي"
        >
          <CalendarDays size={11} />
          عرض الجدول الأسبوعي
          <ArrowLeft size={11} />
        </button>
      </div>

      {/* تقدم المواد */}
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
              const accent = ACCENT_TONES[idx % ACCENT_TONES.length]!
              const teacherName =
                typeof en.teacher === 'string' ? en.teacher : en.teacher?.name || en.teacherName
              return (
                <div
                  key={en.id || `en-${idx}`}
                  className="rounded-2xl border border-border bg-card p-3.5 shadow-elevation-1 transition-colors duration-slow"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex min-w-0 items-center gap-2 text-xs font-black text-main">
                      <span
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                          accent.tile,
                          accent.text,
                        )}
                      >
                        <BookMarked size={14} />
                      </span>
                      <span className="truncate">{en.subject}</span>
                    </p>
                    {frozen ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-divider px-2 py-1 text-[9px] font-bold text-muted">
                        <Snowflake size={9} /> مجمّدة
                      </span>
                    ) : (
                      <span
                        className={cn(
                          'shrink-0 font-dash text-lg font-black tabular-nums leading-none',
                          accent.text,
                        )}
                      >
                        {pct}%
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black text-muted">المنهج</span>
                    <span className="flex items-baseline gap-1 text-[11px] font-black tabular-nums text-main">
                      {used}
                      <span className="text-[10px] font-bold text-muted">/ {total} حصة</span>
                    </span>
                  </div>
                  <div className="mt-1.5">
                    {frozen ? (
                      <div className="h-1.5 rounded-full bg-divider" />
                    ) : (
                      <ProgressBar value={pct} variant={accent.bar} size="sm" animate />
                    )}
                  </div>
                  {teacherName && (
                    <p className="mt-2 truncate text-[10px] font-bold text-muted">{teacherName}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ملاحظات المعلمات */}
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
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-3 text-xs font-black text-on-primary shadow-elevation-1 shadow-black/20 transition-all duration-normal hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
        >
          عرض السجل الكامل في صفحة الأبناء
          <ArrowLeft size={14} />
        </button>
      </div>
    </section>
  )
}

import { memo } from 'react'
import type { UpcomingSession } from '../../services/executiveService'
import { Clock, GraduationCap, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const URGENCY_DOT: Record<string, string> = {
  now: 'bg-error',
  very_soon: 'bg-warning',
  soon: 'bg-info',
  within_hour: 'bg-success',
  later: 'bg-muted',
}

const URGENCY_TIME: Record<string, string> = {
  now: 'bg-error-soft text-error',
  very_soon: 'bg-warning-soft text-warning',
  soon: 'bg-info-soft text-info',
  within_hour: 'bg-success-soft text-success',
  later: 'bg-surface text-muted',
}

export const UpcomingTimeline = memo(function UpcomingTimeline({
  sessions,
}: {
  sessions: UpcomingSession[]
}) {
  if (!sessions) return null
  const sorted = [...sessions].sort((a, b) => a.minutesUntil - b.minutesUntil)

  return (
    <div
      className="border-info-soft/60 flex h-full flex-col rounded-2xl border bg-card p-5 font-dash"
      dir="rtl"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-info-soft">
            <Calendar size={16} className="text-info" />
          </div>
          <div>
            <h3 className="text-sm font-black text-main">الجلسات القادمة</h3>
            <p className="text-[10px] text-muted">الجدول الزمني</p>
          </div>
        </div>
        {sorted.length > 0 && (
          <span className="rounded-lg bg-info-soft px-2 py-0.5 text-[10px] font-black tabular-nums text-info">
            {sorted.length} جلسة
          </span>
        )}
      </div>

      <div className="flex-1 space-y-1">
        {sorted.length === 0 && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-success-soft">
              <Calendar size={16} className="text-success" />
            </div>
            <p className="text-xs font-bold text-muted">لا توجد جلسات قادمة</p>
            <p className="mt-0.5 text-[10px] text-dim">ستظهر الجلسات هنا حسب الجدول</p>
          </div>
        )}
        {sorted.map((session, idx) => {
          const isLast = idx === sorted.length - 1
          return (
            <div key={session.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'mt-4 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-card',
                    URGENCY_DOT[session.urgency] || 'bg-muted',
                  )}
                />
                {!isLast && <div className="w-px flex-1 bg-divider" />}
              </div>

              <div className="hover:border-info/40 mb-2.5 flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-border bg-card p-2.5 shadow-elevation-1 transition-all duration-normal hover:shadow-elevation-1">
                <span
                  className={cn(
                    'flex h-10 w-12 shrink-0 flex-col items-center justify-center rounded-lg text-[11px] font-black tabular-nums leading-none',
                    URGENCY_TIME[session.urgency] || 'bg-surface text-muted',
                  )}
                >
                  <Clock size={10} className="mb-0.5 opacity-70" />
                  {session.time}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-main">{session.subject}</p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-muted">
                    <User size={9} className="shrink-0" />
                    <span className="truncate">{session.studentName}</span>
                    <span className="text-dim">·</span>
                    <GraduationCap size={9} className="shrink-0" />
                    <span className="truncate">{session.teacherName}</span>
                  </p>
                </div>

                <span className="shrink-0 rounded-lg bg-surface px-2 py-1 text-[10px] font-black tabular-nums text-muted">
                  {session.minutesUntil < 60
                    ? `${session.minutesUntil}د`
                    : `${Math.round(session.minutesUntil / 60)}س`}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

import { memo } from 'react'
import type { UpcomingSession } from '../../services/executiveService'
import { Clock, GraduationCap, User, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const URGENCY_DOT: Record<string, string> = {
  now: 'bg-error',
  very_soon: 'bg-warning',
  soon: 'bg-info',
  within_hour: 'bg-success',
  later: 'bg-muted',
}

const URGENCY_ROW: Record<string, string> = {
  now: 'bg-error-soft border-border',
  very_soon: 'bg-warning-soft border-border',
  soon: 'bg-info-soft border-border',
  within_hour: 'bg-success-soft border-border',
  later: 'bg-surface border-border',
}

const URGENCY_BADGE: Record<string, string> = {
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
    <div className="border-info-soft/60 rounded-2xl border bg-card p-5 font-dash" dir="rtl">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-info-soft">
          <Calendar size={16} className="text-info" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-main">الجلسات القادمة</h3>
          <p className="text-[10px] text-muted">الجدول الزمني</p>
        </div>
      </div>

      <div className="space-y-1">
        {sorted.length === 0 && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-success-soft">
              <Calendar size={16} className="text-success" />
            </div>
            <p className="text-xs font-bold text-muted">لا توجد جلسات قادمة</p>
          </div>
        )}
        {sorted.map((session, idx) => {
          const isLast = idx === sorted.length - 1
          return (
            <div key={session.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'mt-2 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-border',
                    URGENCY_DOT[session.urgency] || 'bg-muted',
                  )}
                />
                {!isLast && <div className="min-h-[6px] w-px flex-1 bg-divider" />}
              </div>
              <div
                className={cn(
                  'mb-1.5 min-w-0 flex-1 rounded-xl border p-3 transition-colors',
                  URGENCY_ROW[session.urgency] || 'border-border bg-surface',
                )}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="truncate text-[11px] font-bold text-main">{session.subject}</p>
                  <span
                    className={cn(
                      'shrink-0 rounded-md px-2 py-0.5 text-[9px] font-bold',
                      URGENCY_BADGE[session.urgency] || 'bg-surface text-muted',
                    )}
                  >
                    {session.minutesUntil < 60
                      ? `${session.minutesUntil}د`
                      : `${Math.round(session.minutesUntil / 60)}س`}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted">
                  <span className="flex items-center gap-1">
                    <User size={9} />
                    {session.studentName}
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap size={9} />
                    {session.teacherName}
                  </span>
                  <span className="ms-auto flex items-center gap-1">
                    <Clock size={9} />
                    {session.time}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

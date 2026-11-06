import { memo } from 'react'
import type { UpcomingSession } from '../../services/executiveService'
import { Clock, GraduationCap, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const URGENCY_DOT: Record<string, string> = {
  now: 'bg-error ring-error/20',
  very_soon: 'bg-warning ring-warning/20',
  soon: 'bg-info ring-info/20',
  within_hour: 'bg-success ring-success/20',
  later: 'bg-muted ring-muted/20',
}

const URGENCY_TIME: Record<string, string> = {
  now: 'bg-error-soft text-error border border-error/20',
  very_soon: 'bg-warning-soft text-warning border border-warning/20',
  soon: 'bg-info-soft text-info border border-info/20',
  within_hour: 'bg-success-soft text-success border border-success/20',
  later: 'bg-surface text-muted border border-border/80',
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
      className="flex h-full flex-col rounded-[24px] border border-border bg-card p-5 font-dash shadow-elevation-1 transition-all duration-normal hover:shadow-elevation-2"
      dir="rtl"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-info-soft shadow-soft">
            <Calendar size={16} className="text-info" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-main">الجلسات القادمة اليوم</h3>
            <p className="text-[10px] text-muted">الجدول الزمني للحصص المرتقبة</p>
          </div>
        </div>
        {sorted.length > 0 && (
          <span className="border-info/20 rounded-full border bg-info-soft px-2.5 py-0.5 text-[10px] font-semibold tabular-nums text-info shadow-soft">
            {sorted.length} جلسة
          </span>
        )}
      </div>

      <div className="custom-scrollbar max-h-72 min-h-36 flex-1 space-y-1 overflow-y-auto pe-1">
        {sorted.length === 0 && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-success-soft shadow-soft">
              <Calendar size={16} className="text-success" />
            </div>
            <p className="text-xs font-medium text-main">لا توجد جلسات قادمة اليوم</p>
            <p className="mt-0.5 text-[10px] text-muted">كافة حصص اليوم تم إنجازها بنجاح</p>
          </div>
        )}
        {sorted.map((session, idx) => {
          const isLast = idx === sorted.length - 1
          return (
            <div key={session.id} className="group flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'mt-4 h-2.5 w-2.5 shrink-0 rounded-full ring-4 transition-transform group-hover:scale-125',
                    URGENCY_DOT[session.urgency] || 'ring-muted/20 bg-muted',
                  )}
                />
                {!isLast && <div className="bg-border/80 w-px flex-1" />}
              </div>

              <div className="border-border/70 bg-surface/40 hover:border-info/30 mb-2.5 flex min-w-0 flex-1 items-center gap-3 rounded-2xl border p-3 shadow-soft transition-all duration-normal hover:-translate-x-0.5 hover:bg-card hover:shadow-elevation-1">
                <span
                  className={cn(
                    'flex h-11 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-xs font-semibold tabular-nums leading-none shadow-soft',
                    URGENCY_TIME[session.urgency] || 'bg-surface text-muted',
                  )}
                >
                  <Clock size={11} className="mb-1 opacity-75" />
                  {session.time}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-main">{session.subject}</p>
                  <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] text-muted">
                    <User size={11} className="shrink-0 text-primary" />
                    <span className="truncate">{session.studentName}</span>
                    <span className="text-dim">·</span>
                    <GraduationCap size={11} className="shrink-0 text-info" />
                    <span className="truncate">{session.teacherName}</span>
                  </p>
                </div>

                <span className="border-border/60 shrink-0 rounded-lg border bg-surface px-2 py-1 text-[10px] font-semibold tabular-nums text-dim shadow-soft">
                  {session.minutesUntil < 60
                    ? `خلال ${session.minutesUntil} د`
                    : `بعد ${Math.round(session.minutesUntil / 60)} س`}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

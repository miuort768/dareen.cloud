import { Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'
import { sessionOutcome } from '../../../shared/utils/enrollments'
import { DashboardSectionHead } from './DashboardSectionHead'

interface TimelineSession {
  id: string
  studentId?: string
  studentName: string
  time: string
  subject: string
  status: string
}

interface TeacherSessionTimelineProps {
  sessions: TimelineSession[]
  onStudentClick?: (student: { id: string; name: string }) => void
}

export const TeacherSessionTimeline = ({
  sessions,
  onStudentClick,
}: TeacherSessionTimelineProps) => {
  const sortedSessions = useMemo(
    () => (sessions ? [...sessions].sort((a, b) => a.time.localeCompare(b.time)) : []),
    [sessions],
  )
  const [currentPage, setCurrentPage] = useState(0)

  if (!sessions || sessions.length === 0) return null
  const PAGE_SIZE = 4
  const totalPages = Math.ceil(sortedSessions.length / PAGE_SIZE)
  const visibleSessions = sortedSessions.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  )

  const handleStudentClick = (session: TimelineSession) => {
    onStudentClick?.({ id: session.studentId || session.id, name: session.studentName })
  }

  return (
    <div dir="rtl">
      <DashboardSectionHead
        icon={Clock}
        title="الجدول الزمني"
        description="جدول الحصص اليومية"
        action={
          <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-success-soft px-2.5 py-1 text-[10px] font-bold text-success-strong">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            مباشر
          </div>
        }
      />

      <div className="relative">
        <div className="no-scrollbar flex snap-x snap-mandatory items-center gap-3 overflow-x-auto scroll-smooth pb-3 pt-1">
          {visibleSessions.map((session) => {
            // Canonical resolver. The local lists missed 'تم الإنجاز', so those sessions
            // rendered as "قادمة" instead of "مكتملة".
            const outcome = sessionOutcome(session.status)
            const isCompleted = outcome === 'done'
            const isCancelled = outcome === 'cancelled'
            const isOngoing = outcome === null

            return (
              <div
                key={session.id}
                onClick={() => handleStudentClick(session)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleStudentClick(session)
                  }
                }}
                className={cn(
                  'group/card relative w-60 min-w-60 shrink-0 cursor-pointer snap-center rounded-xl border p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:w-[calc(50%-6px)] md:w-[calc(25%-9px)] md:min-w-0',
                  isCompleted
                    ? 'border-success-soft bg-success-soft'
                    : isCancelled
                      ? 'border-error-soft bg-error-soft'
                      : 'border-border bg-surface hover:-translate-y-0.5 hover:border-primary/30',
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className={cn(
                      'rounded-lg px-2 py-0.5 text-[11px] font-bold tabular-nums',
                      isCompleted
                        ? 'bg-success-soft text-success-strong'
                        : isCancelled
                          ? 'bg-error-soft text-error-strong'
                          : 'bg-primary-soft text-primary',
                    )}
                  >
                    {session.time}
                  </div>
                  {isCompleted && <CheckCircle2 size={14} className="text-success" />}
                  {isCancelled && <AlertCircle size={14} className="text-error" />}
                  {isOngoing && <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />}
                </div>

                <h4 className="mb-1 truncate text-xs font-bold text-main">{session.studentName}</h4>

                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      isCompleted ? 'bg-success' : isCancelled ? 'bg-error' : 'bg-primary',
                    )}
                  />
                  <p className="truncate text-[11px] text-muted">{session.subject}</p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
                  <span
                    className={cn(
                      'text-[11px] font-bold',
                      isCompleted
                        ? 'text-success-strong'
                        : isCancelled
                          ? 'text-error-strong'
                          : 'text-primary',
                    )}
                  >
                    {isCompleted ? 'مكتملة' : isCancelled ? 'ملغاة' : 'قادمة'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {totalPages > 1 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="pointer-events-auto z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface shadow-elevation-3 outline-none transition-all hover:bg-hover hover:shadow-elevation-4 focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="السابق"
            >
              <ChevronRight size={16} className="text-main" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="pointer-events-auto z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface shadow-elevation-3 outline-none transition-all hover:bg-hover hover:shadow-elevation-4 focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="التالي"
            >
              <ChevronLeft size={16} className="text-main" />
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-2 flex justify-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={cn(
                  'h-2 w-2 rounded-full outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus',
                  i === currentPage ? 'w-6 bg-primary' : 'bg-hover',
                )}
                aria-label={`صفحة ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

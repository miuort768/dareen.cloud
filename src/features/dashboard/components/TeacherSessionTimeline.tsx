import { Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'

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
  const PAGE_SIZE = 3
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
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary dark:bg-primary/10 dark:text-primary">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-main dark:text-main">الجدول الزمني</h3>
            <p className="mt-0.5 text-[11px] font-medium text-muted dark:text-muted">
              جدول الحصص اليومية
            </p>
          </div>
        </div>
        <div className="dark:bg-success/10 flex items-center gap-1.5 rounded-lg bg-success-soft px-2.5 py-1 text-[10px] font-bold text-success dark:text-success">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-success dark:bg-success" />
          مباشر
        </div>
      </div>

      <div className="relative">
        <div className="no-scrollbar flex snap-x snap-mandatory items-center gap-3 overflow-x-auto scroll-smooth pb-3 pt-1">
          {visibleSessions.map((session) => {
            const isCompleted = ['completed', 'مكتملة', 'تمت'].includes(
              session.status?.toLowerCase(),
            )
            const isCancelled = ['cancelled', 'ملغاة', 'تم الإلغاء'].includes(
              session.status?.toLowerCase(),
            )
            const isOngoing = !isCompleted && !isCancelled

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
                  'group/card relative w-[280px] min-w-[280px] shrink-0 cursor-pointer snap-center rounded-xl border p-4 transition-all md:w-[calc(33.333%-14px)]',
                  isCompleted
                    ? 'dark:bg-success/5 dark:border-success/20 border-success bg-success-soft'
                    : isCancelled
                      ? 'dark:bg-error/5 dark:border-error/20 border-error bg-error-soft'
                      : 'border-border bg-surface hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm dark:border-border dark:bg-card dark:hover:border-border',
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className={cn(
                      'rounded-lg px-2 py-0.5 text-[11px] font-bold tabular-nums',
                      isCompleted
                        ? 'dark:bg-success/10 bg-success-soft text-success dark:text-success'
                        : isCancelled
                          ? 'dark:bg-error/10 bg-error-soft text-error dark:text-error'
                          : 'bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary',
                    )}
                  >
                    {session.time}
                  </div>
                  {isCompleted && (
                    <CheckCircle2 size={14} className="text-success dark:text-success" />
                  )}
                  {isCancelled && <AlertCircle size={14} className="text-error dark:text-error" />}
                  {isOngoing && (
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary dark:bg-primary" />
                  )}
                </div>

                <h4 className="mb-1 truncate text-xs font-bold text-main dark:text-main">
                  {session.studentName}
                </h4>

                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      isCompleted
                        ? 'bg-success dark:bg-success'
                        : isCancelled
                          ? 'bg-error dark:bg-error'
                          : 'bg-primary dark:bg-primary',
                    )}
                  />
                  <p className="truncate text-[11px] text-muted dark:text-muted">
                    {session.subject}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 dark:border-border">
                  <span
                    className={cn(
                      'text-[11px] font-bold',
                      isCompleted
                        ? 'text-success dark:text-success'
                        : isCancelled
                          ? 'text-error dark:text-error'
                          : 'text-primary dark:text-primary',
                    )}
                  >
                    {isCompleted ? 'مكتملة' : isCancelled ? 'ملغاة' : 'قادمة'}
                  </span>
                  {isOngoing && (
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary dark:bg-primary" />
                  )}
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
              className="pointer-events-auto z-10 flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface shadow-lg transition-all hover:bg-hover hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-30 dark:border-border dark:bg-card md:h-9 md:w-9"
              aria-label="السابق"
            >
              <ChevronRight size={16} className="text-main dark:text-main" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="pointer-events-auto z-10 flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface shadow-lg transition-all hover:bg-hover hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-30 dark:border-border dark:bg-card md:h-9 md:w-9"
              aria-label="التالي"
            >
              <ChevronLeft size={16} className="text-main dark:text-main" />
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
                  'h-2 w-2 rounded-full transition-all',
                  i === currentPage
                    ? 'w-6 bg-primary dark:bg-primary'
                    : 'bg-muted/30 dark:bg-muted/20 hover:bg-muted/50 dark:hover:bg-muted/30',
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

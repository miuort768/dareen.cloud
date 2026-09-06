import { useEffect, useRef, useCallback } from 'react'
import { TrendingUp, X, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { ProgressBar } from '../../../shared/components/ui'

interface ParentStudent {
  id: string
  name: string
  grade?: string
  enrollments?: {
    teacherName?: string
    sessionsTotal?: number
    sessionsUsed?: number
    subject?: string
    teacher?: string
  }[]
  [key: string]: unknown
}

interface ChildSession {
  id: string
  date: string
  subject: string
  status: string
  [key: string]: unknown
}

interface AttendanceModalProps {
  viewingAttendanceStudent: ParentStudent | null
  onClose: () => void
  childSessions: ChildSession[]
  isSessionsLoading: boolean
}

export const AttendanceModal = ({
  viewingAttendanceStudent,
  onClose,
  childSessions,
  isSessionsLoading,
}: AttendanceModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!viewingAttendanceStudent) return
    const first = containerRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    first?.focus()
  }, [viewingAttendanceStudent])

  if (!viewingAttendanceStudent) return null

  const name = viewingAttendanceStudent.name || ''
  const enrollments = (viewingAttendanceStudent.enrollments || []) as {
    teacherName: string
    sessionsTotal?: number
    sessionsUsed?: number
    subject?: string
    teacher?: string
  }[]

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-end justify-center md:items-center md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="تقرير الحضور"
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-2 md:duration-slow md:animate-in md:slide-in-from-bottom-8">
        <div className="relative flex shrink-0 items-center justify-between overflow-hidden bg-success p-5 text-on-success">
          <div className="absolute end-0 top-0 -me-12 -mt-12 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 start-0 h-16 w-16 translate-x-8 translate-y-8 rounded-full bg-white/5 blur-lg"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/20 backdrop-blur-sm">
              <TrendingUp size={20} className="text-on-success" />
            </div>
            <div className="text-start">
              <h2 className="text-lg font-medium leading-none">{name}</h2>
              <p className="mt-1 text-micro font-normal uppercase tracking-widest text-success">
                تقرير نسب الحضور والانصراف لكل المواد
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="relative z-10 flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 outline-none backdrop-blur-sm transition-all hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto p-5">
          {isSessionsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={`skel-${i}`}
                  className="h-28 animate-pulse rounded-xl border border-border bg-surface"
                />
              ))}
            </div>
          ) : (
            <>
              {enrollments.map((en, idx: number) => {
                const subjectSessions = childSessions.filter((s) => s.subject === en.subject)
                const attended = subjectSessions.filter((s) => s.status === 'completed').length
                const totalRecorded = subjectSessions.length
                const absent = subjectSessions.filter(
                  (s) => s.status === 'absent' || s.status === 'cancelled',
                ).length
                const percentage =
                  totalRecorded > 0 ? Math.round((attended / totalRecorded) * 100) : 0
                return (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-xl border border-border bg-surface p-5 transition-all hover:border-success-soft hover:shadow-elevation-1"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h4 className="mb-1 text-sm font-medium text-main">{en.subject}</h4>
                        <p className="text-micro font-normal uppercase tracking-tight text-muted">
                          المعلم: {en.teacher}
                        </p>
                      </div>
                      <div className="text-end">
                        <span
                          className={cn(
                            'text-xl font-medium tracking-tighter',
                            percentage >= 75
                              ? 'text-success'
                              : percentage >= 50
                                ? 'text-warning'
                                : 'text-error',
                          )}
                        >
                          {percentage}%
                        </span>
                        <p className="text-micro font-medium uppercase leading-none tracking-widest text-muted">
                          نسبة الالتزام
                        </p>
                      </div>
                    </div>
                    <div className="mb-4 grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 rounded-xl border border-success-soft bg-success-soft p-3">
                        <CheckCircle2 size={18} className="shrink-0 text-success" />
                        <div>
                          <p className="text-micro font-medium uppercase text-success">حضر</p>
                          <p className="text-sm font-medium text-success">{attended} حصة</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-error-soft bg-error-soft p-3">
                        <XCircle size={18} className="shrink-0 text-error" />
                        <div>
                          <p className="text-micro font-medium uppercase text-error">غاب</p>
                          <p className="text-sm font-medium text-error">{absent} حصة</p>
                        </div>
                      </div>
                    </div>
                    <ProgressBar
                      value={percentage}
                      variant={
                        percentage >= 75 ? 'success' : percentage >= 50 ? 'warning' : 'error'
                      }
                    />
                    <p className="mt-2 text-start text-micro font-normal text-muted">
                      إجمالي الجلسات المسجلة من المعلم: {totalRecorded}
                    </p>
                  </div>
                )
              })}
              {enrollments.length === 0 && (
                <div className="py-20 text-center">
                  <AlertCircle size={32} className="mx-auto mb-4 text-muted" />
                  <p className="text-micro font-medium uppercase tracking-widest text-muted">
                    لا توجد اشتراكات مسجلة لهذا الابن بعد
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex shrink-0 justify-end border-t border-border bg-surface p-5">
          <button
            onClick={onClose}
            className="rounded-xl bg-success px-6 py-2 text-micro font-medium text-on-success outline-none transition-all hover:bg-success-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}

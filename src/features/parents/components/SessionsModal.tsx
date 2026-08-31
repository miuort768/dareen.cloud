import { useEffect, useRef, useCallback } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface ParentEnrollment {
  teacherName?: string
  sessionsTotal?: number
  sessionsUsed?: number
  subject?: string
  teacher?: string
  date?: string
  [key: string]: unknown
}

interface ParentStudent {
  id: string
  name: string
  grade?: string
  enrollments?: ParentEnrollment[]
  totalPoints?: number
  [key: string]: unknown
}

interface ChildSession {
  id: string
  date: string
  subject: string
  status: string
  notes?: string
  topics?: string
  homework?: string
  [key: string]: unknown
}

interface SessionsModalProps {
  viewingStudent: ParentStudent | null
  onClose: () => void
  viewingSubject: ParentEnrollment | null
  onSelectSubject: (subject: ParentEnrollment | null) => void
  sessionsPage: number
  onPageChange: (page: number) => void
  childSessions: ChildSession[]
  isSessionsLoading: boolean
  sessionsStartDate: string
  onStartDateChange: (date: string) => void
  sessionsEndDate: string
  onEndDateChange: (date: string) => void
}

export const SessionsModal = ({
  viewingStudent,
  onClose,
  viewingSubject,
  onSelectSubject,
  sessionsPage,
  onPageChange,
  childSessions,
  isSessionsLoading,
  sessionsStartDate,
  onStartDateChange,
  sessionsEndDate,
  onEndDateChange,
}: SessionsModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!viewingStudent) return
    const first = containerRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    first?.focus()
  }, [viewingStudent])

  if (!viewingStudent) return null

  const enrollments = (viewingStudent.enrollments || []) as {
    teacherName: string
    date?: string
    sessionsTotal?: number
    sessionsUsed?: number
    subject?: string
    teacher?: string
  }[]

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12"
      role="dialog"
      aria-modal="true"
      aria-label={viewingSubject ? `مواعيد حصص: ${viewingSubject.subject}` : 'سجل المواعيد'}
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-2 md:duration-300 md:animate-in md:slide-in-from-bottom-8">
        <div className="relative flex shrink-0 items-center justify-between overflow-hidden bg-primary p-4 text-on-primary">
          <div className="absolute start-0 top-0 -ms-12 -mt-12 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 end-0 h-16 w-16 -translate-x-8 translate-y-8 rounded-full bg-white/5 blur-lg"></div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/20 backdrop-blur-sm">
              <Calendar size={20} className="text-on-primary" />
            </div>
            <div className="text-start">
              <h2 className="text-base font-medium leading-tight tracking-tight">
                {viewingStudent.name}
              </h2>
              <p className="mt-0.5 text-micro font-normal uppercase tracking-widest text-primary opacity-80">
                {viewingSubject ? `مواعيد حصص: ${viewingSubject.subject}` : 'سجل مواعيد الحصص'}
              </p>
            </div>
          </div>
          <div className="relative z-10 ms-4 flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/10 px-2 py-1 backdrop-blur-sm">
              <input
                type="date"
                aria-label="تاريخ البداية"
                className="cursor-pointer border-none bg-transparent p-0 text-micro font-normal text-on-primary outline-none dark:[color-scheme:dark]"
                value={sessionsStartDate}
                onChange={(e) => onStartDateChange(e.target.value)}
              />
              <span className="text-micro text-white/60">←</span>
              <input
                type="date"
                aria-label="تاريخ النهاية"
                className="cursor-pointer border-none bg-transparent p-0 text-micro font-normal text-on-primary outline-none dark:[color-scheme:dark]"
                value={sessionsEndDate}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="relative z-10 flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-all hover:bg-white/20"
            aria-label="إغلاق"
          >
            <X size={14} />
          </button>
        </div>

        <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
          {!viewingSubject ? (
            <div className="grid grid-cols-1 gap-3">
              {enrollments.map((en, idx: number) => (
                <button
                  key={idx}
                  onClick={() => onSelectSubject(en)}
                  className="group flex items-center justify-between rounded-xl border border-border bg-surface p-4 text-start transition-all hover:border-primary/30 hover:bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary transition-all group-hover:bg-primary group-hover:text-on-primary">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <h4 className="mb-0.5 text-xs font-medium text-main">{en.subject}</h4>
                      <p className="text-micro font-normal uppercase tracking-tight text-muted">
                        المعلمة: {en.teacher}
                      </p>
                    </div>
                  </div>
                  <ChevronLeft
                    size={16}
                    className="transform text-muted transition-all group-hover:-translate-x-1 group-hover:text-primary"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    onSelectSubject(null)
                    onPageChange(1)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1 text-micro font-medium text-primary transition-all hover:bg-primary-soft"
                >
                  <ChevronRight size={12} /> العودة للمواد
                </button>
                {(() => {
                  const filtered = childSessions.filter(
                    (s) =>
                      s.subject === viewingSubject.subject &&
                      (s.status === 'completed' ||
                        s.status === 'absent' ||
                        s.status === 'cancelled') &&
                      s.date >= sessionsStartDate &&
                      s.date <= sessionsEndDate,
                  )
                  const totalPages = Math.ceil(filtered.length / 7)
                  if (totalPages <= 1) return null
                  return (
                    <div className="flex items-center gap-2">
                      <button
                        aria-label="الصفحة السابقة"
                        disabled={sessionsPage === 1}
                        onClick={() => onPageChange(Math.max(1, sessionsPage - 1))}
                        className="flex h-6 w-6 items-center justify-center rounded-lg border border-border text-muted transition-all hover:bg-surface disabled:opacity-30"
                      >
                        <ChevronRight size={14} />
                      </button>
                      <span className="text-micro font-medium text-muted">
                        {sessionsPage} / {totalPages}
                      </span>
                      <button
                        aria-label="الصفحة التالية"
                        disabled={sessionsPage === totalPages}
                        onClick={() => onPageChange(Math.min(totalPages, sessionsPage + 1))}
                        className="flex h-6 w-6 items-center justify-center rounded-lg border border-border text-muted transition-all hover:bg-surface disabled:opacity-30"
                      >
                        <ChevronLeft size={14} />
                      </button>
                    </div>
                  )
                })()}
              </div>

              {isSessionsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={`parent-${i}`}
                      className="h-16 animate-pulse rounded-xl border border-border bg-surface"
                    />
                  ))}
                </div>
              ) : (
                <div className="relative ms-2 space-y-4 border-s-2 border-primary/10 ps-5">
                  {(() => {
                    const filtered = childSessions
                      .filter(
                        (s) =>
                          s.subject === viewingSubject.subject &&
                          (s.status === 'completed' ||
                            s.status === 'absent' ||
                            s.status === 'cancelled') &&
                          s.date >= sessionsStartDate &&
                          s.date <= sessionsEndDate,
                      )
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    return filtered
                      .slice((sessionsPage - 1) * 7, sessionsPage * 7)
                      .map((session, sIdx) => (
                        <div key={sIdx} className="relative">
                          <div
                            className={cn(
                              'absolute -end-[27px] top-1 h-3 w-3 rounded-full border-[3px] bg-card',
                              session.status === 'completed' ? 'border-success' : 'border-error',
                            )}
                          ></div>
                          <div className="group rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/30">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-medium text-main">
                                  {format(new Date(session.date), 'eeee, d MMMM', { locale: ar })}
                                </p>
                              </div>
                              <div
                                className={cn(
                                  'rounded-full px-2 py-0.5 text-micro font-medium uppercase tracking-widest',
                                  session.status === 'completed'
                                    ? 'bg-success text-on-success'
                                    : 'bg-error text-on-error',
                                )}
                              >
                                {session.status === 'completed' ? 'حضر' : 'غائب'}
                              </div>
                            </div>
                            {session.notes && (
                              <div className="mt-2 border-t border-border pt-2">
                                <div className="flex gap-1.5">
                                  <div className="w-0.5 shrink-0 rounded-full bg-primary" />
                                  <p className="text-micro font-normal italic leading-relaxed text-muted">
                                    {session.notes}
                                  </p>
                                </div>
                              </div>
                            )}
                            {session.topics && (
                              <div className="mt-2 border-t border-border pt-2">
                                <p className="text-micro font-bold text-main">
                                  <span className="text-success">✓</span> تم إنجازه:{' '}
                                  <span className="font-normal text-muted">{session.topics}</span>
                                </p>
                              </div>
                            )}
                            {session.homework && (
                              <div className="mt-1.5">
                                <p className="text-micro font-bold text-main">
                                  <span className="text-warning dark:text-primary">★</span> الواجب:{' '}
                                  <span className="font-normal text-muted">{session.homework}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

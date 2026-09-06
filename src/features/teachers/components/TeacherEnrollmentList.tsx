import { CheckCircle2, Trash2 } from 'lucide-react'
import { cn } from '../../../lib/utils'
import type { Student, Enrollment } from '../../../types'

interface TeacherEnrollmentListProps {
  enrolledStudents: Student[]
  teacherId: string
  teacherName: string
  onLogAttendance: (student: Student, enrollment: Enrollment) => void
  onUnenroll: (student: Student, teacherName: string) => void
  isTeacherView: boolean
}

export const TeacherEnrollmentList = ({
  enrolledStudents,
  teacherId,
  teacherName,
  onLogAttendance,
  onUnenroll,
  isTeacherView,
}: TeacherEnrollmentListProps) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 border-b border-border pb-2">
      <div className="rounded-lg bg-primary-soft px-3 py-1">
        <span className="text-xs font-bold text-primary">{enrolledStudents.length}</span>
      </div>
      <h4 className="text-xs text-muted">الطلاب المسجلون</h4>
    </div>
    <div className="space-y-2">
      {enrolledStudents.map((student) => {
        const enrollment = (student.enrollments || []).find(
          (e: Enrollment) =>
            (e.teacherId && e.teacherId === teacherId) || e.teacher === teacherName,
        ) ?? { sessionsUsed: 0, sessionsTotal: 0, subject: '', isFrozen: false }
        const actualUsed = enrollment.sessionsUsed || 0
        const remaining = (enrollment.sessionsTotal || 0) - actualUsed
        const isLow = remaining <= 2
        const progressPercent = enrollment.sessionsTotal
          ? Math.round((actualUsed / enrollment.sessionsTotal) * 100)
          : 0

        return (
          <div
            key={student.id}
            className={cn(
              'group rounded-2xl border border-border bg-surface p-3 transition-all',
              (enrollment as Enrollment).isFrozen && 'opacity-50 grayscale',
              isLow ? 'border-error' : 'hover:border-primary/30',
            )}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <h5 className="text-sm font-medium text-main">{student.name}</h5>
                  {isLow && (
                    <span className="animate-pulse rounded-lg bg-error-soft px-1.5 py-0.5 text-xs text-error">
                      رصيد منخفض
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg border border-border bg-card px-1.5 py-0.5 text-xs text-muted">
                    {student.grade}
                  </span>
                  <span className="text-xs text-muted">{enrollment.subject}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => onLogAttendance(student, enrollment as Enrollment)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-success transition-all hover:bg-success hover:text-on-success"
                  title="تسجيل حضور"
                  aria-label="تسجيل حضور"
                >
                  <CheckCircle2 size={14} />
                </button>
                {!isTeacherView && (
                  <button
                    onClick={() => onUnenroll(student, teacherName)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-error transition-all hover:bg-error hover:text-on-error"
                    title="إلغاء التسجيل"
                    aria-label="إلغاء التسجيل"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {[...Array(enrollment.sessionsTotal || 0)].map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-md border font-mono text-xs transition-all',
                      idx < actualUsed
                        ? 'border-success bg-success text-on-success'
                        : idx === actualUsed
                          ? 'border-primary bg-surface text-primary'
                          : 'border-border bg-surface text-muted',
                    )}
                  >
                    {idx < actualUsed ? <CheckCircle2 size={10} /> : idx + 1}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="max-w-[120px] flex-1">
                  <div className="mb-1 flex justify-between text-xs text-muted">
                    <span>الإنجاز</span>
                    <span className="tabular-nums">{progressPercent}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-hover">
                    <div
                      className={cn('h-full rounded-full', isLow ? 'bg-error' : 'bg-info')}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                <div className="px-2 text-center">
                  <p className="mb-0.5 text-xs leading-none text-muted">الرصيد</p>
                  <p className={cn('font-mono text-xs', isLow ? 'text-error' : 'text-success')}>
                    {remaining}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  </div>
)

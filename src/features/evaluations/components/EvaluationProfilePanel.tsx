import { useMemo } from 'react'
import { BookOpen, Calendar, TrendingUp } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { ProgressBar } from '../../../shared/components/ui'
import { averageRatingOf } from '../types/constants'
import type { Student, Evaluation } from '../../../types'

interface EvaluationProfilePanelProps {
  student: Student
  evaluations: Evaluation[]
}

export const EvaluationProfilePanel = ({ student, evaluations }: EvaluationProfilePanelProps) => {
  const studentEvals = useMemo(
    () => (evaluations || []).filter((ev) => ev.studentId === student.id),
    [evaluations, student.id],
  )
  const totalXP = studentEvals.reduce((s, ev) => s + (ev.points || 0), 0)
  const totalSessions = (student?.enrollments || []).reduce((s, en) => s + en.sessionsTotal, 0)
  const usedSessions = (student?.enrollments || []).reduce((s, en) => s + en.sessionsUsed, 0)
  const progress = totalSessions > 0 ? Math.round((usedSessions / totalSessions) * 100) : 0
  const avgRating = averageRatingOf(studentEvals)

  return (
    <div className="space-y-3">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          {
            icon: BookOpen,
            value: (student?.enrollments || []).length,
            label: 'المواد',
            color: 'text-primary bg-primary-soft dark:bg-primary/10',
          },
          {
            icon: Calendar,
            value: `${usedSessions}/${totalSessions}`,
            label: 'الحصص',
            color: 'text-info-strong bg-info-soft',
          },
          {
            icon: TrendingUp,
            value: `${progress}%`,
            label: 'الحضور',
            color: 'text-success-strong bg-success-soft',
          },
        ].map((item, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-2 text-center">
            <div
              className={cn(
                'mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-md',
                item.color,
              )}
            >
              <item.icon size={11} />
            </div>
            <p className="text-xs font-bold tabular-nums text-main">{item.value}</p>
            <p className="text-micro text-muted">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      {totalSessions > 0 && (
        <div>
          <div className="mb-1 flex justify-between text-micro text-muted">
            <span>تقدم الحصص</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <ProgressBar
            value={progress}
            variant={progress >= 75 ? 'success' : progress >= 50 ? 'info' : 'error'}
            className="h-1.5"
          />
        </div>
      )}

      {/* Enrollments */}
      {(student?.enrollments || []).length > 0 && (
        <div className="space-y-1.5">
          <h5 className="flex items-center gap-1 text-micro font-bold text-muted">
            <BookOpen size={10} /> المواد
          </h5>
          {(student?.enrollments || []).map((en, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-2.5 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-main">{en.subject}</p>
                <p className="text-micro text-muted">
                  {typeof en.teacher === 'string' ? en.teacher : en.teacher?.name}
                </p>
              </div>
              <p className="shrink-0 text-xs font-bold tabular-nums text-main">
                {en.sessionsUsed}/{en.sessionsTotal}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Rating summary */}
      {studentEvals.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-micro font-bold text-muted">متوسط التقييم</span>
            <span className="text-sm font-black tabular-nums text-main">{avgRating || '—'}</span>
          </div>
          {totalXP > 0 && (
            <div className="mt-1 flex items-center justify-between">
              <span className="text-micro font-bold text-muted">إجمالي XP</span>
              <span className="text-sm font-black tabular-nums text-primary">{totalXP}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

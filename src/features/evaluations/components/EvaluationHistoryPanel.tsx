import { useMemo, useState } from 'react'
import { History, ChevronDown, Trash2 } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { format } from 'date-fns'
import { RATING_OPTIONS } from '../types/constants'
import type { Student, Evaluation } from '../../../types'

interface EvaluationHistoryPanelProps {
  student: Student
  evaluations: Evaluation[]
  canDelete: (ev: Evaluation) => boolean
  onDelete: (id: string) => void
}

export const EvaluationHistoryPanel = ({
  student,
  evaluations,
  canDelete,
  onDelete,
}: EvaluationHistoryPanelProps) => {
  const [visibleCount, setVisibleCount] = useState(3)
  const studentEvals = useMemo(
    () =>
      (evaluations || [])
        .filter((ev) => ev.studentId === student?.id)
        .sort(
          (a, b) =>
            new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime(),
        ),
    [evaluations, student?.id],
  )

  return (
    <div className="space-y-1.5">
      <h5 className="flex items-center gap-1 text-micro font-bold text-muted">
        <History size={10} /> سجل التقييمات
        <span className="rounded bg-primary-soft px-1 py-0.5 text-micro font-bold text-primary">
          {studentEvals.length}
        </span>
      </h5>
      {studentEvals.length > 0 ? (
        <>
          {studentEvals.slice(0, visibleCount).map((ev) => {
            const r = RATING_OPTIONS.find((ro) => ro.value === ev.rating) || RATING_OPTIONS[0]
            return (
              <div key={ev.id} className="rounded-lg border border-border bg-surface p-2">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span
                      className={cn(
                        'flex items-center gap-0.5 rounded px-1.5 py-0.5 text-micro font-bold',
                        r.pill,
                      )}
                    >
                      <r.icon size={8} />
                      {ev.rating}
                    </span>
                    {ev.points > 0 && (
                      <span className="rounded bg-primary-soft px-1 py-0.5 text-micro font-bold text-primary dark:bg-primary/10">
                        +{ev.points}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-micro text-muted">
                      {format(new Date(ev.created_at || ev.date), 'dd/MM')}
                    </span>
                    {canDelete(ev) && (
                      <button
                        onClick={() => onDelete(ev.id)}
                        aria-label={`حذف تقييم ${format(new Date(ev.created_at || ev.date), 'dd/MM')}`}
                        className="rounded p-1 text-muted transition-colors hover:bg-error-soft hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-micro leading-relaxed text-muted">
                  {ev.notes || 'بدون ملاحظات'}
                </p>
              </div>
            )
          })}
          {studentEvals.length > visibleCount && (
            <button
              onClick={() => setVisibleCount((prev) => prev + 3)}
              className="flex w-full items-center justify-center gap-1 rounded-lg border border-border bg-surface py-2 text-micro font-bold text-muted transition-all hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <ChevronDown size={12} />
              المزيد ({studentEvals.length - visibleCount})
            </button>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-border py-6 text-center">
          <History size={16} className="mx-auto mb-1 text-muted" />
          <p className="text-xs font-bold text-muted">لا يوجد سجل</p>
        </div>
      )}
    </div>
  )
}

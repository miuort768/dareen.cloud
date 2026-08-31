import { useState } from 'react'
import { CheckCircle, Circle, BookOpen, FileText, ClipboardList } from 'lucide-react'
import type { TodayTask } from './types'

interface TodayTasksProps {
  tasks: TodayTask[]
}

const typeConfig: Record<
  string,
  { icon: typeof BookOpen; label: string; color: string; bg: string }
> = {
  homework: {
    icon: FileText,
    label: 'واجب',
    color: 'text-warning',
    bg: 'bg-warning-soft dark:bg-warning-soft',
  },
  review: {
    icon: ClipboardList,
    label: 'مراجعة',
    color: 'text-info',
    bg: 'bg-info-soft dark:bg-info-soft',
  },
  quiz: {
    icon: ClipboardList,
    label: 'اختبار',
    color: 'text-error',
    bg: 'bg-error-soft dark:bg-error-soft',
  },
  session: {
    icon: BookOpen,
    label: 'حصة',
    color: 'text-primary',
    bg: 'bg-primary-soft dark:bg-primary/10',
  },
}

export const TodayTasks = ({ tasks }: TodayTasksProps) => {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const completedCount = tasks.filter((t) => completedIds.has(t.id)).length

  return (
    <div className="rounded-3xl border border-border bg-surface p-4 shadow-sm transition-colors duration-300 dark:border-primary/20 dark:bg-card sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-main dark:text-main">مهام اليوم</h3>
        <span className="rounded-lg bg-primary-soft px-2.5 py-1 text-[11px] font-bold tabular-nums text-primary dark:bg-primary/10 dark:text-primary">
          {completedCount}/{tasks.length}
        </span>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => {
          const isDone = completedIds.has(task.id)
          const config = typeConfig[task.type] || typeConfig.session!

          return (
            <button
              key={task.id}
              onClick={() => toggle(task.id)}
              className={`flex min-h-12 w-full items-center gap-3 rounded-xl border p-3 text-start transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] ${
                isDone
                  ? 'border-border bg-surface opacity-60 dark:border-border dark:bg-surface'
                  : 'border-border bg-surface hover:border-primary/30 hover:shadow-sm dark:border-border dark:bg-surface dark:hover:border-primary/30'
              }`}
              aria-label={`${isDone ? 'إلغاء' : 'تحديد'} ${task.subject}`}
              role="checkbox"
              aria-checked={isDone}
            >
              {isDone ? (
                <CheckCircle size={18} className="shrink-0 text-success" />
              ) : (
                <Circle size={18} className="shrink-0 text-border dark:text-border" />
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs font-bold ${isDone ? 'text-muted line-through dark:text-muted' : 'text-main dark:text-main'}`}
                >
                  {task.subject}
                </p>
                {task.time && (
                  <p className="mt-0.5 text-[11px] text-muted dark:text-muted">{task.time}</p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-bold ${config.bg} ${config.color}`}
              >
                {config.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

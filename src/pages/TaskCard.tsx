import { CheckCircle2, Calendar, Rocket, RefreshCcw, Trash2, ClipboardList } from 'lucide-react'
import { cn } from '../lib/utils'
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG, type Task } from '../features/tasks/types'

interface TaskCardProps {
  task: Task
  onUpdateStatus: (id: string, status: Task['status']) => void
  onDelete: (id: string) => void
}

export const TaskCard = ({ task, onUpdateStatus, onDelete }: TaskCardProps) => {
  const isCompleted = task.status === 'completed'
  const priority = TASK_PRIORITY_CONFIG[task.priority]
  const status = TASK_STATUS_CONFIG[task.status]
  const PriorityIcon = priority.icon
  const StatusIcon = status.icon

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-none border border-border bg-card p-5 shadow-soft transition-all duration-normal hover:-translate-y-0.5 hover:shadow-elevation-1',
        isCompleted && 'opacity-60',
        !isCompleted && priority.bar,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-current',
            priority.badge,
          )}
        >
          <PriorityIcon size={16} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                'min-w-0 text-sm font-black leading-snug text-main',
                isCompleted && 'line-through opacity-50',
              )}
            >
              {task.title}
            </h3>
            <span
              className={cn(
                'shrink-0 rounded-full border border-current px-2.5 py-0.5 text-micro font-bold',
                priority.badge,
              )}
            >
              {priority.label}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-xs font-medium leading-relaxed text-muted">
            {task.description || 'لا يوجد وصف إضافي لهذه المهمة.'}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-micro font-bold text-muted">
              <Calendar size={11} />
              {task.dueDate}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-micro font-bold',
                status.color,
              )}
            >
              <StatusIcon size={11} />
              {status.label}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-divider pt-3">
        {task.status !== 'completed' ? (
          <button
            onClick={() =>
              onUpdateStatus(task.id, task.status === 'pending' ? 'in-progress' : 'completed')
            }
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]',
              task.status === 'pending'
                ? 'bg-primary text-on-primary hover:bg-primary-hover'
                : 'bg-success text-on-success hover:bg-success-hover',
            )}
          >
            {task.status === 'pending' ? <Rocket size={12} /> : <CheckCircle2 size={12} />}
            {task.status === 'pending' ? 'بدء التنفيذ' : 'إكمال المهمة'}
          </button>
        ) : (
          <button
            onClick={() => onUpdateStatus(task.id, 'pending')}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-micro font-bold text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <RefreshCcw size={12} />
            إعادة
          </button>
        )}
        <button
          onClick={() => onDelete(task.id)}
          aria-label={`حذف المهمة: ${task.title}`}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-soft text-error transition-all hover:bg-error hover:text-on-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}

export const EmptyTaskState = () => (
  <div className="col-span-full rounded-2xl border-2 border-dashed border-border bg-surface py-14 text-center">
    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-soft">
      <ClipboardList size={24} className="text-on-primary" />
    </div>
    <h2 className="mb-1 text-base font-semibold text-main">قائمة المهام</h2>
    <p className="text-micro font-bold uppercase tracking-wider text-primary">
      لم يتم العثور على مهام تطابق معايير البحث
    </p>
  </div>
)

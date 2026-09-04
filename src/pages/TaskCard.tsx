import { CheckCircle2, Calendar, Rocket, RefreshCcw, Trash2, ClipboardList } from 'lucide-react'
import { cn } from '../lib/utils'
import type { Task } from '../features/tasks/types'

interface TaskCardProps {
  task: Task
  onUpdateStatus: (id: string, status: Task['status']) => void
  onDelete: (id: string) => void
}

export const TaskCard = ({ task, onUpdateStatus, onDelete }: TaskCardProps) => {
  const isCompleted = task.status === 'completed'

  const priorityBadge =
    task.priority === 'high'
      ? { text: 'عالية', colors: 'text-error-dark dark:text-error bg-error-soft border-error' }
      : task.priority === 'medium'
        ? {
            text: 'متوسطة',
            colors:
              'text-warning-dark dark:text-primary bg-warning-soft dark:bg-primary-soft border-warning dark:border-primary',
          }
        : { text: 'منخفضة', colors: 'text-primary bg-primary-soft border-primary' }

  return (
    <div
      className={cn(
        'relative rounded-2xl border-2 border-border bg-card p-5 shadow-sm transition-all hover:shadow-md',
        isCompleted && 'opacity-60',
        !isCompleted &&
          (task.priority === 'high'
            ? 'border-s-error'
            : task.priority === 'medium'
              ? 'border-s-warning'
              : 'border-s-primary'),
      )}
    >
      {!isCompleted && (
        <div
          className={cn(
            'absolute end-0 top-0 h-24 w-24 -translate-x-12 -translate-y-12 opacity-5',
            task.priority === 'high'
              ? 'bg-error'
              : task.priority === 'medium'
                ? 'bg-warning'
                : 'bg-primary',
          )}
        />
      )}
      <div className="mb-3 flex items-start justify-between">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            {isCompleted && <CheckCircle2 size={14} className="shrink-0 text-success" />}
            <h3
              className={cn(
                'text-sm font-bold leading-tight text-main dark:text-inverse',
                isCompleted && 'line-through opacity-50',
              )}
            >
              {task.title}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={11} className="text-muted" />
            <span className="text-micro font-bold uppercase tracking-wider text-muted">
              الموعد: {task.dueDate}
            </span>
          </div>
        </div>
        <div
          className={cn(
            'shrink-0 rounded-2xl border px-2.5 py-1 text-micro font-bold uppercase tracking-wider',
            priorityBadge.colors,
          )}
        >
          {priorityBadge.text}
        </div>
      </div>

      <p className="mb-4 line-clamp-2 text-xs font-medium leading-relaxed text-dim dark:text-muted">
        {task.description || 'لا يوجد وصف إضافي لهذه المهمة...'}
      </p>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex gap-2">
          {task.status !== 'completed' ? (
            <button
              onClick={() =>
                onUpdateStatus(task.id, task.status === 'pending' ? 'in-progress' : 'completed')
              }
              className={cn(
                'inline-flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-micro font-bold uppercase tracking-wider shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                task.status === 'pending'
                  ? 'border-primary bg-primary-soft text-primary hover:bg-primary-soft'
                  : 'border-success bg-success-soft text-success-dark hover:bg-success-soft dark:text-success',
              )}
            >
              {task.status === 'pending' ? <Rocket size={12} /> : <CheckCircle2 size={12} />}
              {task.status === 'pending' ? 'بدء التنفيذ' : 'اكتملت'}
            </button>
          ) : (
            <button
              onClick={() => onUpdateStatus(task.id, 'pending')}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-micro font-bold uppercase tracking-wider text-muted transition-colors hover:text-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <RefreshCcw size={12} />
              إعادة
            </button>
          )}
        </div>
        <button
          onClick={() => onDelete(task.id)}
          aria-label={`حذف المهمة: ${task.title}`}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-error-soft text-error transition-all hover:bg-error-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}

export const EmptyTaskState = () => (
  <div className="col-span-full rounded-2xl border border-border bg-card p-8 py-14 text-center shadow-sm">
    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-soft">
      <ClipboardList size={24} className="text-on-primary" />
    </div>
    <h2 className="mb-1 text-base font-semibold text-main">قائمة المهام</h2>
    <p className="text-micro font-bold uppercase tracking-wider text-primary">
      لم يتم العثور على مهام تطابق معايير البحث
    </p>
  </div>
)

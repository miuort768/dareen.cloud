import { Link } from 'react-router-dom'
import { ListTodo, ChevronLeft, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardTask as Task } from '../types'
import { Button } from '../../../shared/components/ui'
import { Badge } from '../../../shared/components/ui'

interface TasksAndRequestsProps {
  tasks: Task[]
}

export const TasksAndRequests = ({ tasks }: TasksAndRequestsProps) => {
  const urgentCount = tasks.filter((t) => t.priority === 'high').length

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft dark:bg-primary/10">
            <ListTodo size={14} className="text-primary dark:text-primary" />
          </div>
          <h3 className="text-sm font-black text-main">المهام والطلبات</h3>
          {urgentCount > 0 && (
            <span className="rounded-md bg-error-soft px-1.5 py-0.5 text-[10px] font-bold text-error dark:bg-error-soft dark:text-error">
              {urgentCount} عاجلة
            </span>
          )}
        </div>
        <Link to="/tasks">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            aria-label="عرض المهام"
          >
            <ChevronLeft size={14} />
          </Button>
        </Link>
      </div>

      <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className={cn(
                'flex items-center gap-2.5 rounded-2xl border p-3 transition-colors duration-200',
                task.priority === 'high'
                  ? 'border-error-soft bg-error-soft'
                  : task.priority === 'medium'
                    ? 'border-warning-soft bg-warning-soft'
                    : 'border-border bg-surface dark:border-border dark:bg-hover',
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  task.priority === 'high'
                    ? 'bg-card text-error dark:bg-hover dark:text-error'
                    : task.priority === 'medium'
                      ? 'bg-card text-warning dark:bg-hover dark:text-warning'
                      : 'bg-primary-soft text-primary dark:bg-primary/10 dark:text-primary',
                )}
              >
                {task.priority === 'high' ? <AlertTriangle size={13} /> : <Clock size={13} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-main">{task.title}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-[11px] font-medium text-muted">{task.dueDate}</span>
                  {task.priority === 'high' && (
                    <Badge variant="destructive" className="text-[10px]">
                      عاجل
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-50">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-surface dark:bg-hover">
              <ListTodo size={18} className="text-dim" />
            </div>
            <p className="text-[11px] font-bold text-muted">لا توجد مهام نشطة حالياً</p>
          </div>
        )}
      </div>

      <div className="mt-3">
        <Link to="/tasks" className="w-full">
          <Button className="w-full" size="sm">
            عرض كافة المهام
          </Button>
        </Link>
      </div>
    </div>
  )
}

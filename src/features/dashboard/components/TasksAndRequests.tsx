import { Link } from 'react-router-dom'
import { ListTodo, ChevronLeft, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardTask as Task } from '../types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TasksAndRequestsProps {
  tasks: Task[]
}

export const TasksAndRequests = ({ tasks }: TasksAndRequestsProps) => {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[13px] font-bold text-main dark:text-main">
          <ListTodo size={13} className="text-primary dark:text-primary" />
          المهام والطلبات
        </h3>
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
                'flex items-center gap-2.5 rounded-xl border p-2.5 transition-all',
                task.priority === 'high'
                  ? 'border-error bg-error-soft'
                  : task.priority === 'medium'
                    ? 'border-warning bg-warning-soft'
                    : 'border-border bg-background dark:border-border dark:bg-surface',
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  task.priority === 'high'
                    ? 'bg-error-soft text-error'
                    : task.priority === 'medium'
                      ? 'bg-warning-soft text-warning'
                      : 'bg-primary-soft text-primary',
                )}
              >
                {task.priority === 'high' ? <AlertTriangle size={13} /> : <Clock size={13} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-main dark:text-main">
                  {task.title}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-[11px] font-medium text-muted dark:text-muted">
                    {task.dueDate}
                  </span>
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
              <ListTodo size={18} className="text-dim dark:text-dim" />
            </div>
            <p className="text-[11px] font-bold text-muted dark:text-muted">
              لا توجد مهام نشطة حالياً
            </p>
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

import { Link } from 'react-router-dom'
import { ListTodo, ChevronLeft, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardTask as Task } from '../types'
import { Button } from '../../../shared/components/ui'
import { Badge } from '../../../shared/components/ui'
import { DashboardSectionHead } from './DashboardSectionHead'

interface TasksAndRequestsProps {
  tasks: Task[]
  limit?: number
}

export const TasksAndRequests = ({ tasks, limit = 5 }: TasksAndRequestsProps) => {
  const urgentCount = tasks.filter((t) => t.priority === 'high').length

  return (
    <div className="flex h-full flex-col">
      <DashboardSectionHead
        icon={ListTodo}
        title="المهام والطلبات"
        afterTitle={
          urgentCount > 0 ? (
            <span className="rounded-md bg-error-soft px-1.5 py-0.5 text-[10px] font-bold text-error-strong">
              {urgentCount} عاجلة
            </span>
          ) : null
        }
        action={
          <Link
            to="/tasks"
            className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl"
              aria-label="عرض المهام"
            >
              <ChevronLeft size={15} />
            </Button>
          </Link>
        }
      />

      <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.slice(0, limit).map((task) => (
            <div
              key={task.id}
              className={cn(
                'flex items-center gap-2.5 rounded-xl border p-3 transition-colors duration-normal',
                task.priority === 'high'
                  ? 'border-error-soft bg-error-soft'
                  : task.priority === 'medium'
                    ? 'border-warning-soft bg-warning-soft'
                    : 'border-border bg-surface',
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  task.priority === 'high'
                    ? 'bg-card text-error-strong'
                    : task.priority === 'medium'
                      ? 'bg-card text-warning-strong'
                      : 'bg-primary-soft text-primary',
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
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-surface">
              <ListTodo size={18} className="text-dim" />
            </div>
            <p className="text-xs font-bold text-muted">لا توجد مهام نشطة حالياً</p>
          </div>
        )}
      </div>

      <div className="mt-3">
        <Link
          to="/tasks"
          className="w-full outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Button className="w-full" size="sm">
            عرض كافة المهام
          </Button>
        </Link>
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  Trash2,
  Calendar,
} from 'lucide-react'
import { api } from '../../../lib/api'
import { MobilePage, usePullToRefresh } from '../../../shared/components/mobile'
import { MobileTopBar } from '../../../shared/components/mobile/MobileTopBar'
import { fadeUpStatic } from '../../../shared/animations/fadeUp'
import { cn } from '../../../lib/utils'
import { triggerHaptic } from '../../../lib/haptics'

interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  category?: string
}

const PRIORITY_CONFIG = {
  high: {
    label: 'عالية',
    color: 'text-error dark:text-error',
    bg: 'bg-error-soft dark:bg-error/10',
    dot: 'bg-error dark:bg-error',
  },
  medium: {
    label: 'متوسطة',
    color: 'text-warning dark:text-warning',
    bg: 'bg-warning-soft dark:bg-warning/10',
    dot: 'bg-warning dark:bg-warning',
  },
  low: {
    label: 'منخفضة',
    color: 'text-success dark:text-success',
    bg: 'bg-success-soft dark:bg-success/10',
    dot: 'bg-success dark:bg-success',
  },
}

const STATUS_CONFIG = {
  pending: { label: 'قيد الانتظار', icon: Clock, color: 'text-warning dark:text-warning' },
  'in-progress': {
    label: 'قيد التنفيذ',
    icon: AlertCircle,
    color: 'text-primary dark:text-primary',
  },
  completed: { label: 'مكتملة', icon: CheckCircle2, color: 'text-success dark:text-success' },
}

export const MobileTasks = () => {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | Task['status']>('all')
  const [search, setSearch] = useState('')

  const {
    data: tasks = [],
    isLoading,
    refetch,
  } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const raw = await api.get<Task[]>('/tasks')
      return Array.isArray(raw) ? raw.map((t) => ({ ...t, status: t.status || 'pending' })) : []
    },
  })

  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({
    onRefresh: async () => {
      await refetch()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Task['status'] }) =>
      api.patch(`/tasks/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const stats = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    }),
    [tasks],
  )

  const filtered = useMemo(() => {
    let result = tasks
    if (filter !== 'all') result = result.filter((t) => t.status === filter)
    if (search.trim())
      result = result.filter((t) => t.title.includes(search) || t.description?.includes(search))
    return result
  }, [tasks, filter, search])

  const cycleStatus = (task: Task) => {
    triggerHaptic('light')
    const next: Record<string, Task['status']> = {
      pending: 'in-progress',
      'in-progress': 'completed',
      completed: 'pending',
    }
    const newStatus = next[task.status] ?? 'pending'
    updateMutation.mutate({ id: task.id, status: newStatus })
  }

  const handleDelete = (task: Task) => {
    triggerHaptic('medium')
    deleteMutation.mutate(task.id)
  }

  return (
    <MobilePage>
      <MobileTopBar title="المهام" subtitle={`${stats.total} مهمة`} />

      {/* Pull to refresh */}
      <motion.div
        animate={{ height: isRefreshing ? 44 : pullDistance }}
        className="flex items-center justify-center overflow-hidden"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-primary dark:text-primary">
          {isRefreshing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>جاري التحديث...</span>
            </>
          ) : pullDistance > 40 ? (
            <>
              <RefreshCw size={16} className="animate-pulse" />
              <span>اترك للتحديث</span>
            </>
          ) : (
            <span className="text-muted dark:text-muted">اسحب للتحديث</span>
          )}
        </div>
      </motion.div>

      <div {...handlers} className="space-y-4 px-4 pb-28">
        {/* Stats row */}
        <motion.div {...fadeUpStatic} className="grid grid-cols-3 gap-2">
          {(
            [
              {
                key: 'pending',
                label: 'قيد الانتظار',
                count: stats.pending,
                color: 'text-warning dark:text-warning',
                bg: 'bg-warning-soft dark:bg-warning/10',
              },
              {
                key: 'in-progress',
                label: 'قيد التنفيذ',
                count: stats.inProgress,
                color: 'text-primary dark:text-primary',
                bg: 'bg-primary-soft dark:bg-primary/10',
              },
              {
                key: 'completed',
                label: 'مكتملة',
                count: stats.completed,
                color: 'text-success dark:text-success',
                bg: 'bg-success-soft dark:bg-success/10',
              },
            ] as const
          ).map((s) => (
            <button
              key={s.key}
              onClick={() => {
                triggerHaptic('light')
                setFilter(filter === s.key ? 'all' : s.key)
              }}
              className={cn(
                'rounded-xl border p-3 text-center transition-all',
                filter === s.key
                  ? `${s.bg} border-current ${s.color}`
                  : 'border-border bg-card dark:border-border dark:bg-card',
              )}
            >
              <p className={cn('text-lg font-bold tabular-nums', s.color)}>{s.count}</p>
              <p className="mt-0.5 text-[10px] font-bold text-muted dark:text-muted">{s.label}</p>
            </button>
          ))}
        </motion.div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في المهام..."
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-main outline-none transition-all placeholder:text-muted focus-visible:border-primary dark:border-border dark:bg-card dark:text-main dark:placeholder:text-muted dark:focus-visible:border-primary"
          />
        </div>

        {/* Task list */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft dark:bg-primary/10">
              <CheckCircle2 size={28} className="text-primary/30 dark:text-primary/30" />
            </div>
            <p className="text-sm font-bold text-muted dark:text-muted">لا توجد مهام</p>
            <p className="text-muted/60 mt-1 text-[11px] dark:text-dim">
              أضف مهمة جديدة من الزر أدناه
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((task, i) => {
              const priority = PRIORITY_CONFIG[task.priority]
              const status = STATUS_CONFIG[task.status]
              const StatusIcon = status.icon
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="rounded-xl border border-border bg-card p-4 dark:border-border dark:bg-card"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => cycleStatus(task)}
                      className="mt-0.5 shrink-0"
                      aria-label={`تغيير حالة: ${status.label}`}
                    >
                      <StatusIcon size={18} className={status.color} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'text-sm font-bold text-main dark:text-main',
                          task.status === 'completed' && 'line-through opacity-60',
                        )}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="mt-1 line-clamp-2 text-[11px] text-muted dark:text-muted">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={cn(
                            'rounded-lg px-2 py-0.5 text-[10px] font-bold',
                            priority.bg,
                            priority.color,
                          )}
                        >
                          {priority.label}
                        </span>
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-muted dark:text-muted">
                            <Calendar size={10} />{' '}
                            {new Date(task.dueDate).toLocaleDateString('ar-EG', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(task)}
                      className="text-error/50 dark:text-error/40 dark:hover:bg-error/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-error-soft hover:text-error dark:hover:text-error"
                      aria-label="حذف المهمة"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </MobilePage>
  )
}

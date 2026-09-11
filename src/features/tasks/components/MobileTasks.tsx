import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Loader2,
  RefreshCw,
  Trash2,
  CalendarDays,
  ListTodo,
  Plus,
  AlertTriangle,
} from 'lucide-react'
import { api, safeArray } from '../../../lib/api'
import { MobilePage, usePullToRefresh, BottomSheet } from '../../../shared/components/mobile'
import { SkeletonCard, EmptyState } from '../../../shared/components/ui'
import { cn } from '../../../lib/utils'
import { triggerHaptic } from '../../../lib/haptics'
import { confirm } from '../../../lib/confirmDialog'
import { useShowNotification } from '../../../context/AppContext'
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG, type Task, type TaskPriority } from '../types'
import { useTaskMutations } from '../hooks/useTaskMutations'
import { TasksHeader } from './TasksHeader'
import type { StatusFilter } from './TasksHeader'

interface TaskFilters {
  title: string
  description: string
  priority: TaskPriority
  dueDate: string
}

const EMPTY_FILTERS: TaskFilters = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: new Date().toLocaleDateString('en-CA'),
}

/** واجهة الهاتف — بنفس لغة صفحة «أبنائي»: هيدر ملون مع بطاقات إحصائية، checkbox متحرك، إنشاء عبر BottomSheet */
export const MobileTasks = () => {
  const showNotification = useShowNotification()
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState<TaskFilters>(EMPTY_FILTERS)

  const {
    data: tasks = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const raw = await api.get<Task[]>('/tasks')
      return safeArray<Task>(raw).map((t) => ({ ...t, status: t.status || 'pending' }))
    },
  })

  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({
    onRefresh: async () => {
      await refetch()
    },
  })

  const { createTask, updateTaskStatus, deleteTask } = useTaskMutations()

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'completed').length
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      completed,
      score: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
    }
  }, [tasks])

  const filtered = useMemo(() => {
    let result = tasks
    if (filter !== 'all') result = result.filter((t) => t.status === filter)
    const q = search.trim().toLowerCase()
    if (q)
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q),
      )
    // المكتملة آخرًا، ثم حسب تاريخ التسليم تصاعديًا
    return [...result].sort((a, b) => {
      if ((a.status === 'completed') !== (b.status === 'completed'))
        return a.status === 'completed' ? 1 : -1
      return (a.dueDate || '').localeCompare(b.dueDate || '')
    })
  }, [tasks, filter, search])

  const toggleComplete = (task: Task) => {
    triggerHaptic(task.status === 'completed' ? 'light' : 'medium')
    updateTaskStatus.mutate({
      id: task.id,
      status: task.status === 'completed' ? 'pending' : 'completed',
    })
  }

  const handleDelete = async (task: Task) => {
    triggerHaptic('medium')
    if (!(await confirm(`حذف المهمة "${task.title}"؟`))) return
    deleteTask.mutate(task.id)
  }

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || createTask.isPending) return
    try {
      await createTask.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        dueDate: form.dueDate,
      })
      triggerHaptic('medium')
      showNotification('تمت إضافة المهمة بنجاح', 'success')
      setForm(EMPTY_FILTERS)
      setSheetOpen(false)
    } catch {
      showNotification('تعذر حفظ المهمة، حاول مجددًا', 'error')
    }
  }

  const quickDate = (offsetDays: number) =>
    new Date(Date.now() + offsetDays * 86400000).toLocaleDateString('en-CA')

  return (
    <MobilePage>
      <div {...handlers}>
        {/* السحب للتحديث */}
        <motion.div
          animate={{ height: isRefreshing ? 44 : pullDistance }}
          className="flex items-center justify-center overflow-hidden"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            {isRefreshing ? (
              <>
                <Loader2 size={16} className="animate-spin" strokeWidth={1.7} />
                <span>جاري التحديث...</span>
              </>
            ) : pullDistance > 40 ? (
              <>
                <RefreshCw size={16} className="animate-pulse" strokeWidth={1.7} />
                <span>أفلت للتحديث</span>
              </>
            ) : (
              <span className="text-muted">اسحب للتحديث</span>
            )}
          </div>
        </motion.div>

        {/* Hero — بنفس لغة صفحة أبنائي */}
        <div className="px-2 pt-2">
          <TasksHeader
            stats={stats}
            searchTerm={search}
            onSearchChange={setSearch}
            filterStatus={filter}
            onFilterStatusChange={setFilter}
            onAdd={() => setSheetOpen(true)}
          />
        </div>

        {/* المحتوى */}
        <div className="space-y-2 px-2 pb-28 pt-4">
          {isLoading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-dashed border-error-soft bg-error-soft py-10 text-center">
              <AlertTriangle size={26} className="mx-auto mb-2 text-error" strokeWidth={1.5} />
              <p className="text-xs font-bold text-main">تعذر تحميل المهام</p>
              <button
                onClick={() => refetch()}
                className="mx-auto mt-3 rounded-2xl bg-primary px-4 py-2 text-micro font-bold text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              compact
              title={search ? 'لا نتائج مطابقة للبحث' : 'لا توجد مهام هنا'}
              subtitle={
                search ? `جرّب كلمة أخرى بدل "${search}"` : 'أضف مهمتك الأولى من زر (+) بالأسفل'
              }
              className="rounded-2xl border border-dashed border-border bg-card"
            />
          ) : (
            filtered.map((task, i) => {
              const priority = TASK_PRIORITY_CONFIG[task.priority]
              const statusMeta = TASK_STATUS_CONFIG[task.status]
              const done = task.status === 'completed'
              const todayStr = new Date().toLocaleDateString('en-CA')
              const overdue = !done && !!task.dueDate && task.dueDate < todayStr
              const isToday = task.dueDate === todayStr

              return (
                <motion.article
                  key={task.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.24), duration: 0.3 }}
                  className={cn(
                    'relative overflow-hidden rounded-none border border-s-2 border-border bg-card p-4 shadow-elevation-1',
                    done ? 'opacity-70' : priority.bar,
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox متحرك */}
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => toggleComplete(task)}
                      aria-label={done ? `إعادة فتح: ${task.title}` : `إكمال: ${task.title}`}
                      aria-pressed={done}
                      className={cn(
                        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                        done
                          ? 'border-success bg-success text-on-success'
                          : 'border-border-strong bg-transparent text-transparent hover:border-primary',
                      )}
                    >
                      <AnimatePresence>
                        {done && (
                          <motion.span
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                          >
                            <Check size={14} strokeWidth={3} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    {/* النص */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'text-sm font-bold leading-snug text-main',
                          done && 'line-through decoration-2 opacity-60',
                        )}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-muted">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-1 overflow-hidden whitespace-nowrap">
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold',
                            priority.badge,
                          )}
                        >
                          {priority.label}
                        </span>
                        {!done && (
                          <span
                            className={cn(
                              'shrink-0 rounded-full bg-surface px-1.5 py-0.5 text-[9px] font-bold',
                              statusMeta.color,
                            )}
                          >
                            {statusMeta.label}
                          </span>
                        )}
                        {task.dueDate && (
                          <span
                            className={cn(
                              'flex min-w-0 items-center gap-1 truncate rounded-full px-1.5 py-0.5 text-[9px] font-bold tabular-nums',
                              overdue
                                ? 'bg-error-soft text-error'
                                : isToday
                                  ? 'bg-warning-soft text-warning dark:bg-primary-soft dark:text-primary'
                                  : 'bg-surface text-muted',
                            )}
                          >
                            <CalendarDays size={9} strokeWidth={1.7} />
                            {new Date(`${task.dueDate}T00:00:00`).toLocaleDateString('ar-EG', {
                              month: 'short',
                              day: 'numeric',
                            })}
                            {overdue && ' · متأخرة'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* حذف */}
                    <button
                      onClick={() => handleDelete(task)}
                      disabled={deleteTask.isPending}
                      aria-label={`حذف المهمة: ${task.title}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-error text-on-error transition-colors hover:bg-error-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95 disabled:opacity-50"
                    >
                      <Trash2 size={14} strokeWidth={1.7} />
                    </button>
                  </div>
                </motion.article>
              )
            })
          )}
        </div>
      </div>

      {/* FAB — إنشاء مهمة */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          triggerHaptic('light')
          setSheetOpen(true)
        }}
        aria-label="إضافة مهمة جديدة"
        className="fixed bottom-24 end-4 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-elevation-3 transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus md:hidden"
      >
        <Plus size={24} strokeWidth={2} />
      </motion.button>

      {/* ورقة الإنشاء */}
      <BottomSheet
        open={sheetOpen}
        onOpenChange={(v) => {
          triggerHaptic('light')
          setSheetOpen(v)
        }}
        title="مهمة جديدة"
        subtitle="أضف مهمة للفريق"
        footer={
          <button
            type="submit"
            form="mobile-task-form"
            disabled={createTask.isPending || !form.title.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-xs font-bold text-on-primary shadow-elevation-2 shadow-black/20 transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] disabled:opacity-50"
          >
            {createTask.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" /> جاري الحفظ...
              </>
            ) : (
              <>
                <Plus size={14} /> إضافة المهمة
              </>
            )}
          </button>
        }
      >
        <form id="mobile-task-form" onSubmit={submitCreate} className="space-y-4">
          {/* العنوان */}
          <div className="space-y-1.5">
            <label
              htmlFor="m-task-title"
              className="text-micro font-bold uppercase tracking-wide text-muted"
            >
              عنوان المهمة
            </label>
            <input
              id="m-task-title"
              required
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="مثال: تجهيز تقرير الأسبوع..."
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs font-bold text-main outline-none transition-all placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-focus"
            />
          </div>

          {/* الوصف */}
          <div className="space-y-1.5">
            <label
              htmlFor="m-task-desc"
              className="text-micro font-bold uppercase tracking-wide text-muted"
            >
              الوصف (اختياري)
            </label>
            <textarea
              id="m-task-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="تفاصيل المهمة..."
              className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-xs font-bold text-main outline-none transition-all placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-focus"
            />
          </div>

          {/* الأولوية */}
          <div className="space-y-1.5">
            <p className="text-micro font-bold uppercase tracking-wide text-muted">الأولوية</p>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(TASK_PRIORITY_CONFIG) as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light')
                    setForm({ ...form, priority: p })
                  }}
                  aria-pressed={form.priority === p}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-2xl border py-2.5 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                    form.priority === p
                      ? cn(TASK_PRIORITY_CONFIG[p].badge, 'border-current')
                      : 'border-border text-muted hover:text-main',
                  )}
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      form.priority === p ? TASK_PRIORITY_CONFIG[p].dot : 'bg-border',
                    )}
                  />
                  {TASK_PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* التاريخ */}
          <div className="space-y-1.5">
            <label
              htmlFor="m-task-date"
              className="text-micro font-bold uppercase tracking-wide text-muted"
            >
              تاريخ التسليم
            </label>
            <div className="flex gap-1.5">
              {[
                { label: 'اليوم', value: quickDate(0) },
                { label: 'غدًا', value: quickDate(1) },
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light')
                    setForm({ ...form, dueDate: d.value })
                  }}
                  className={cn(
                    'rounded-2xl border px-3 py-2 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                    form.dueDate === d.value
                      ? 'border-primary bg-primary-soft text-primary'
                      : 'border-border text-muted hover:text-main',
                  )}
                >
                  {d.label}
                </button>
              ))}
              <input
                id="m-task-date"
                type="date"
                aria-label="اختيار تاريخ التسليم"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="min-w-0 flex-1 rounded-2xl border border-border bg-background px-2 py-2 text-micro font-bold text-main outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-focus"
              />
            </div>
          </div>
        </form>
      </BottomSheet>
    </MobilePage>
  )
}

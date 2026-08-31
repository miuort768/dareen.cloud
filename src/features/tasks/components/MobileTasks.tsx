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
  Search,
  X,
  AlertTriangle,
} from 'lucide-react'
import { api, safeArray } from '../../../lib/api'
import { MobilePage, usePullToRefresh, BottomSheet } from '../../../shared/components/mobile'
import { SkeletonCard, EmptyState } from '../../../shared/components/ui'
import { fadeUpStatic } from '../../../shared/animations/fadeUp'
import { cn } from '../../../lib/utils'
import { triggerHaptic } from '../../../lib/haptics'
import { confirm } from '../../../lib/confirmDialog'
import { useShowNotification } from '../../../context/AppContext'
import {
  TASK_PRIORITY_CONFIG,
  TASK_STATUS_CONFIG,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from '../types'
import { useTaskMutations } from '../hooks/useTaskMutations'

type StatusFilter = 'all' | TaskStatus

const RING_RADIUS = 30
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

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

/** واجهة الهاتف — تصميم تطبيقي فاخر: بطاقة إنجاز بحلقة، تبويبات لاصقة، checkbox متحرك، إنشاء عبر BottomSheet */
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

  const stats = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      rate:
        tasks.length > 0
          ? Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100)
          : 0,
    }),
    [tasks],
  )

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

  const tabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all', label: 'الكل', count: stats.total },
    { key: 'pending', label: 'معلقة', count: stats.pending },
    { key: 'in-progress', label: 'جارية', count: stats.inProgress },
    { key: 'completed', label: 'مكتملة', count: stats.completed },
  ]

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

        {/* بطاقة الإنجاز */}
        <motion.div {...fadeUpStatic} className="px-4 pt-3">
          <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-primary via-primary-deep to-primary p-4">
            <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true">
              <svg width="100%" height="100%">
                <defs>
                  <pattern
                    id="tasks-hero-grid"
                    x="0"
                    y="0"
                    width="22"
                    height="22"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="2" cy="2" r="1.2" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#tasks-hero-grid)" />
              </svg>
            </div>

            <div className="relative z-10 flex items-center gap-4">
              {/* حلقة نسبة الإنجاز */}
              <div
                className="relative h-[76px] w-[76px] shrink-0"
                role="img"
                aria-label={`نسبة الإنجاز ${stats.rate} بالمئة`}
              >
                <svg viewBox="0 0 76 76" className="h-full w-full -rotate-90">
                  <circle
                    cx="38"
                    cy="38"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth="7"
                  />
                  <motion.circle
                    cx="38"
                    cy="38"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="white"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
                    animate={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - stats.rate / 100) }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-black tabular-nums text-on-primary">
                    {stats.rate}%
                  </span>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white/85">إنجاز المهام</p>
                <p className="mt-0.5 text-micro font-bold text-white/65">
                  أكملت {stats.completed} من {stats.total} مهمة
                </p>
                <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                  {tabs.slice(1).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => {
                        triggerHaptic('light')
                        setFilter(filter === t.key ? 'all' : t.key)
                      }}
                      className={cn(
                        'rounded-none px-2 py-1.5 text-center backdrop-blur-sm transition-colors',
                        filter === t.key ? 'bg-white/25 ring-1 ring-white/40' : 'bg-white/10',
                      )}
                    >
                      <p className="text-sm font-bold tabular-nums leading-none text-on-primary">
                        {t.count}
                      </p>
                      <p className="mt-1 text-micro font-bold text-white/70">{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* التبويبات اللاصقة */}
      <div className="bg-background/95 sticky top-14 z-30 mt-3 px-4 pb-2 pt-2 backdrop-blur-sm">
        <div className="flex gap-1 rounded-none border border-border bg-card p-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                triggerHaptic('light')
                setFilter(tab.key)
              }}
              aria-pressed={filter === tab.key}
              className={cn(
                'relative min-w-0 flex-1 rounded-none px-1 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                filter === tab.key
                  ? 'bg-primary font-bold text-on-primary shadow-elevation-1'
                  : 'font-bold text-muted hover:text-main',
              )}
            >
              <span className="block truncate text-micro">{tab.label}</span>
              <span
                className={cn(
                  'block text-micro tabular-nums leading-tight',
                  filter === tab.key ? 'text-on-primary/80' : 'text-muted/70',
                )}
              >
                {tab.count}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* البحث */}
      <div className="px-4 pb-3 pt-1">
        <div className="relative">
          <Search size={13} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="مسح البحث"
              className="absolute end-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-surface p-1.5 text-muted transition-colors hover:text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <X size={11} strokeWidth={2} />
            </button>
          )}
          <input
            type="search"
            aria-label="بحث في المهام"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في المهام..."
            className="w-full rounded-none border border-border bg-card py-2.5 pe-10 ps-9 text-xs font-bold text-main outline-none transition-all placeholder:text-muted focus-visible:border-primary"
          />
        </div>
      </div>

      {/* المحتوى */}
      <div className="space-y-2 px-4 pb-28">
        {isLoading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : isError ? (
          <div className="bg-error-soft/50 rounded-none border border-dashed border-error-soft py-10 text-center">
            <AlertTriangle size={26} className="mx-auto mb-2 text-error" strokeWidth={1.5} />
            <p className="text-xs font-bold text-main">تعذر تحميل المهام</p>
            <button
              onClick={() => refetch()}
              className="mx-auto mt-3 rounded-none bg-primary px-4 py-2 text-micro font-bold text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
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
            className="rounded-none border border-dashed border-border bg-card"
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
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.24), duration: 0.3 }}
                className={cn(
                  'relative overflow-hidden rounded-none border bg-card p-3.5 ps-4',
                  done ? 'border-border opacity-70' : 'border-border',
                )}
              >
                {/* شريط الأولوية على الحافة */}
                {!done && (
                  <span
                    className={cn('absolute inset-y-0 start-0 w-1', priority.bar)}
                    aria-hidden="true"
                  />
                )}

                <div className="flex items-start gap-3">
                  {/* Checkbox متحرك */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => toggleComplete(task)}
                    aria-label={done ? `إعادة فتح: ${task.title}` : `إكمال: ${task.title}`}
                    aria-pressed={done}
                    className={cn(
                      'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
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
                          <Check size={13} strokeWidth={3} />
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
                      <p className="mt-1 line-clamp-2 text-micro font-medium leading-relaxed text-muted">
                        {task.description}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span
                        className={cn(
                          'rounded-none px-2 py-0.5 text-micro font-bold',
                          priority.badge,
                        )}
                      >
                        {priority.label}
                      </span>
                      {!done && (
                        <span
                          className={cn(
                            'rounded-none bg-surface px-2 py-0.5 text-micro font-bold',
                            statusMeta.color,
                          )}
                        >
                          {statusMeta.label}
                        </span>
                      )}
                      {task.dueDate && (
                        <span
                          className={cn(
                            'flex items-center gap-1 rounded-none px-2 py-0.5 text-micro font-bold tabular-nums',
                            overdue
                              ? 'bg-error-soft text-error'
                              : isToday
                                ? 'bg-warning-soft text-warning dark:bg-primary-soft dark:text-primary'
                                : 'text-muted',
                          )}
                        >
                          <CalendarDays size={10} strokeWidth={1.7} />
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
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none text-muted transition-colors hover:bg-error-soft hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
                  >
                    <Trash2 size={14} strokeWidth={1.7} />
                  </button>
                </div>
              </motion.article>
            )
          })
        )}
      </div>

      {/* FAB — إنشاء مهمة */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          triggerHaptic('light')
          setSheetOpen(true)
        }}
        aria-label="إضافة مهمة جديدة"
        className="fixed bottom-24 end-4 z-40 flex h-14 w-14 items-center justify-center rounded-none bg-primary text-on-primary shadow-elevation-3 transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus md:hidden"
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
            className="flex w-full items-center justify-center gap-2 rounded-none bg-primary py-3.5 text-xs font-bold text-on-primary shadow-elevation-1 transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] disabled:opacity-50"
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
              className="w-full rounded-none border border-border bg-background px-4 py-3 text-xs font-bold text-main outline-none transition-all placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-focus"
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
              className="w-full resize-none rounded-none border border-border bg-background px-4 py-3 text-xs font-bold text-main outline-none transition-all placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-focus"
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
                    'flex items-center justify-center gap-1.5 rounded-none border py-2.5 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
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
                    'rounded-none border px-3 py-2 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
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
                className="min-w-0 flex-1 rounded-none border border-border bg-background px-2 py-2 text-micro font-bold text-main outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-focus"
              />
            </div>
          </div>
        </form>
      </BottomSheet>
    </MobilePage>
  )
}

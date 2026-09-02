import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle2,
  Plus,
  Search,
  RefreshCcw,
  ListTodo,
  Clock,
  AlertTriangle,
  Trash2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'
import { api, safeArray } from '../lib/api'
import { confirm } from '../lib/confirmDialog'
import { useAcademyName, useShowNotification } from '../context/AppContext'
import { PageLoader } from '../components/ui/PageLoader'
import type { Task, TaskPriority } from '../features/tasks/types'
import { TASK_PRIORITY_CONFIG } from '../features/tasks/types'
import { useTaskMutations } from '../features/tasks/hooks/useTaskMutations'
import { MobileTasks } from '../features/tasks/components/MobileTasks'
import { TaskCard, EmptyTaskState } from './TaskCard'
import { TaskFormModal } from './TaskFormModal'

const particles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 5 + 2,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 3,
}))

export interface NewTaskDraft {
  title: string
  description: string
  priority: TaskPriority
  dueDate: string
}

const EMPTY_DRAFT: NewTaskDraft = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: new Date().toLocaleDateString('en-CA'),
}

export const Tasks = () => {
  const academyName = useAcademyName()
  const showNotification = useShowNotification()
  useEffect(() => {
    document.title = `المهام | ${academyName}`
  }, [academyName])

  const [filterPriority, setFilterPriority] = useState<'all' | TaskPriority>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTask, setNewTask] = useState<NewTaskDraft>(EMPTY_DRAFT)

  // البيانات من قاعدة البيانات عبر /tasks (React Query) — بلا أي تخزين محلي
  const {
    data: tasks = [],
    isLoading: loading,
    isError,
    refetch,
  } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => api.get<Task[]>('/tasks'),
    select: (data) => safeArray<Task>(data).map((t) => ({ ...t, status: t.status || 'pending' })),
  })

  const { createTask, updateTaskStatus, deleteTask, deleteManyTasks } = useTaskMutations()

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.title.trim() || createTask.isPending) return
    try {
      await createTask.mutateAsync({
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        priority: newTask.priority,
        dueDate: newTask.dueDate,
      })
      showNotification('تمت إضافة المهمة بنجاح', 'success')
      setShowAddForm(false)
      setNewTask(EMPTY_DRAFT)
    } catch (error) {
      console.error('Error adding task:', error)
      showNotification('تعذر حفظ المهمة، حاول مجددًا', 'error')
    }
  }

  const handleDeleteCompleted = async () => {
    const completedIds = tasks.filter((t) => t.status === 'completed').map((t) => t.id)
    if (completedIds.length === 0) return
    if (!(await confirm(`حذف ${completedIds.length} مهمة مكتملة؟`))) return
    await deleteManyTasks(completedIds)
    showNotification('تم حذف المهام المكتملة', 'success')
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesPriority = filterPriority === 'all' || t.priority === filterPriority
      const q = searchTerm.toLowerCase()
      const matchesSearch =
        t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
      return matchesPriority && matchesSearch
    })
  }, [tasks, filterPriority, searchTerm])

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    score:
      tasks.length > 0
        ? Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100)
        : 0,
  }

  const kpiCards = useMemo(
    () => [
      {
        label: 'إجمالي المهام',
        value: stats.total,
        icon: ListTodo,
        gradient: 'from-primary/20 to-primary/5',
        iconBg: 'bg-primary/10 text-primary',
        accent: 'bg-primary',
      },
      {
        label: 'معلقة',
        value: stats.pending,
        icon: Clock,
        gradient: 'from-warning-soft to-transparent dark:from-primary-soft',
        iconBg: 'bg-warning-soft text-warning dark:bg-primary-soft dark:text-primary',
        accent: 'bg-warning dark:bg-primary',
      },
      {
        label: 'قيد التنفيذ',
        value: stats.inProgress,
        icon: RefreshCcw,
        gradient: 'from-info-soft to-transparent',
        iconBg: 'bg-info-soft text-info',
        accent: 'bg-info',
      },
      {
        label: 'تم الإنجاز',
        value: stats.completed,
        icon: CheckCircle2,
        gradient: 'from-success-soft to-transparent',
        iconBg: 'bg-success-soft text-success',
        accent: 'bg-success',
      },
    ],
    [stats.total, stats.pending, stats.inProgress, stats.completed],
  )

  if (loading && tasks.length === 0) return <PageLoader />

  return (
    <>
      <div className="block md:hidden">
        <MobileTasks />
      </div>
      <div className="relative hidden min-h-full bg-background md:block" dir="rtl">
        <div className="mx-auto max-w-page space-y-4 px-3">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative overflow-hidden rounded-none bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-6 md:p-8"
          >
            {particles.map((p) => (
              <motion.div
                key={p.id}
                aria-hidden="true"
                className="pointer-events-none absolute rounded-full bg-white/10"
                style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: 'easeInOut',
                }}
              />
            ))}
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="rounded-none bg-white/15 p-2 backdrop-blur-sm">
                    <ListTodo className="text-on-primary" size={20} />
                  </div>
                  <span className="text-xs font-medium text-white/70">الإدارة</span>
                </div>
                <h1 className="mb-1 text-2xl font-bold text-on-primary md:text-3xl">
                  المهام والطلبات
                </h1>
                <p className="text-sm text-white/70">إدارة وتكليف المهام للمعلمات</p>
              </div>
              <div className="flex items-center gap-4 rounded-none border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-center">
                  <p className="mb-1 text-xs text-white/60">نسبة الإنجاز</p>
                  <p className="text-2xl font-bold tabular-nums text-on-primary">{stats.score}%</p>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="text-center">
                  <p className="mb-1 text-xs text-white/60">المهام</p>
                  <p className="text-2xl font-bold tabular-nums text-on-primary">{stats.total}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            data-stats
          >
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {kpiCards.map((kpi, i) => {
                const Icon = kpi.icon
                return (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.06 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={cn(
                      'relative overflow-hidden rounded-none border border-border bg-gradient-to-br p-4',
                      kpi.gradient,
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className={cn('rounded-none p-2', kpi.iconBg)}>
                        <Icon size={16} />
                      </div>
                      <div className={cn('h-1 w-12 rounded-none', kpi.accent)} />
                    </div>
                    <p className="mb-1 text-xs text-muted">{kpi.label}</p>
                    <p className="text-2xl font-bold tabular-nums text-main">{kpi.value}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* البحث + فلاتر الأولوية */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex flex-col items-center gap-3 lg:flex-row">
              <div className="relative w-full flex-1">
                <Search
                  className="absolute start-4 top-1/2 -translate-y-1/2 text-primary"
                  size={14}
                />
                <input
                  type="text"
                  aria-label="بحث عن مهمة"
                  placeholder="ابحث عن مهمة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-none border border-border bg-card px-4 py-3 ps-10 text-xs font-bold text-main shadow-sm transition-all placeholder:text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                />
              </div>

              {/* فلاتر الأولوية */}
              <div className="no-scrollbar flex w-full shrink-0 gap-1.5 overflow-x-auto md:w-auto">
                {(['all', 'high', 'medium', 'low'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setFilterPriority(key)}
                    aria-pressed={filterPriority === key}
                    className={cn(
                      'whitespace-nowrap rounded-none border px-3 py-2 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                      filterPriority === key
                        ? key !== 'all'
                          ? cn(TASK_PRIORITY_CONFIG[key].badge, 'border-current')
                          : 'border-primary bg-primary-soft text-primary'
                        : 'border-border bg-card text-muted hover:text-main',
                    )}
                  >
                    {key === 'all' ? 'الكل' : TASK_PRIORITY_CONFIG[key].label}
                  </button>
                ))}
                {stats.completed > 0 && (
                  <button
                    onClick={handleDeleteCompleted}
                    disabled={deleteTask.isPending}
                    className="ms-auto flex shrink-0 items-center gap-1 whitespace-nowrap rounded-none px-3 py-2 text-micro font-bold text-error transition-colors hover:bg-error-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
                  >
                    <Trash2 size={12} /> حذف المكتملة ({stats.completed})
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* حالة الخطأ */}
          {isError ? (
            <div className="bg-error-soft/50 rounded-none border border-dashed border-error-soft py-16 text-center">
              <AlertTriangle size={32} className="mx-auto mb-3 text-error" strokeWidth={1.5} />
              <p className="text-sm font-bold text-main">تعذر تحميل المهام</p>
              <p className="mt-1 text-xs text-muted">تحقق من الاتصال ثم أعد المحاولة</p>
              <button
                onClick={() => refetch()}
                className="mx-auto mt-4 block rounded-none bg-primary px-5 py-2.5 text-xs font-bold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task, idx) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.03 * Math.min(idx, 10) }}
                    >
                      <TaskCard
                        task={task}
                        onUpdateStatus={(id, status) => updateTaskStatus.mutate({ id, status })}
                        onDelete={(id) => deleteTask.mutate(id)}
                      />
                    </motion.div>
                  ))
                ) : (
                  <EmptyTaskState />
                )}
              </div>
            </motion.div>
          )}

          {showAddForm && (
            <TaskFormModal
              data={newTask}
              onChange={setNewTask}
              onSubmit={handleAddTask}
              onClose={() => setShowAddForm(false)}
            />
          )}
        </div>

        {/* زر الإضافة العائم */}
        <motion.button
          onClick={() => setShowAddForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="إنشاء مهمة جديدة"
          className="fixed bottom-6 end-6 z-50 flex h-14 w-14 items-center justify-center rounded-none bg-primary text-on-primary shadow-xl transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Plus size={24} />
        </motion.button>
      </div>
    </>
  )
}

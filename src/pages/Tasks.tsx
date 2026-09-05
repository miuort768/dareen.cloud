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
import { PageHeader, ErrorState } from '../shared/components/ui'
import { TaskCard, EmptyTaskState } from './TaskCard'
import { TaskFormModal } from './TaskFormModal'

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
        iconBg: 'bg-primary-soft text-primary',
      },
      {
        label: 'معلقة',
        value: stats.pending,
        icon: Clock,
        iconBg: 'bg-warning-soft text-warning-strong',
      },
      {
        label: 'قيد التنفيذ',
        value: stats.inProgress,
        icon: RefreshCcw,
        iconBg: 'bg-info-soft text-info-strong',
      },
      {
        label: 'تم الإنجاز',
        value: stats.completed,
        icon: CheckCircle2,
        iconBg: 'bg-success-soft text-success-strong',
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
          {/* Header — unified PageHeader pattern */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <PageHeader
              title="المهام والطلبات"
              subtitle="إدارة وتكليف المهام للمعلمات"
              icon={<ListTodo size={22} />}
              action={
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-on-primary shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 active:scale-[0.98]"
                >
                  <Plus size={16} /> مهمة جديدة
                </button>
              }
              meta={
                <>
                  <span className="inline-flex items-center rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-bold tabular-nums text-muted">
                    المهام: {stats.total}
                  </span>
                  <span className="inline-flex items-center rounded-lg border border-success-soft bg-success-soft px-2.5 py-1 text-[11px] font-bold tabular-nums text-success-strong">
                    الإنجاز: {stats.score}%
                  </span>
                </>
              }
            />
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
                    className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl',
                          kpi.iconBg,
                        )}
                      >
                        <Icon size={16} />
                      </div>
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
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 ps-10 text-xs font-bold text-main shadow-sm transition-all placeholder:text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
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
                      'whitespace-nowrap rounded-2xl border px-3 py-2 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
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
                    className="ms-auto flex shrink-0 items-center gap-1 whitespace-nowrap rounded-2xl px-3 py-2 text-micro font-bold text-error transition-colors hover:bg-error-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
                  >
                    <Trash2 size={12} /> حذف المكتملة ({stats.completed})
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* حالة الخطأ */}
          {isError ? (
            <div className="rounded-card border border-border bg-card">
              <ErrorState
                icon={AlertTriangle}
                title="تعذر تحميل المهام"
                message="تحقق من الاتصال ثم أعد المحاولة"
                onRetry={() => refetch()}
                retryLabel="إعادة المحاولة"
              />
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
          className="fixed bottom-[calc(96px+env(safe-area-inset-bottom,0px))] end-4 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-xl transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus md:bottom-6 md:end-6"
        >
          <Plus size={24} />
        </motion.button>
      </div>
    </>
  )
}

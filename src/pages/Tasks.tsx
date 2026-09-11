import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, AlertTriangle, Trash2 } from 'lucide-react'
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
import { TasksHeader } from '../features/tasks/components/TasksHeader'
import type { StatusFilter } from '../features/tasks/components/TasksHeader'
import { ErrorState } from '../shared/components/ui'
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
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all')
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
      const matchesStatus = filterStatus === 'all' || t.status === filterStatus
      const q = searchTerm.toLowerCase()
      const matchesSearch =
        t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
      return matchesPriority && matchesStatus && matchesSearch
    })
  }, [tasks, filterPriority, filterStatus, searchTerm])

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

  if (loading && tasks.length === 0) return <PageLoader />

  return (
    <>
      <div className="block md:hidden">
        <MobileTasks />
      </div>
      <div className="relative hidden min-h-full bg-background md:block" dir="rtl">
        <div className="mx-auto max-w-page space-y-4 px-2 pb-16 md:pb-12">
          {/* Hero — بنفس لغة صفحة أبنائي */}
          <TasksHeader
            stats={stats}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            onAdd={() => setShowAddForm(true)}
          />

          {/* فلاتر الأولوية + حذف المكتملة */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="no-scrollbar flex w-full gap-1.5 overflow-x-auto">
              {(['all', 'high', 'medium', 'low'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setFilterPriority(key)}
                  aria-pressed={filterPriority === key}
                  className={cn(
                    'whitespace-nowrap rounded-full border px-3 py-2 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
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
                  className="ms-auto flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-micro font-bold text-error transition-colors hover:bg-error-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
                >
                  <Trash2 size={12} /> حذف المكتملة ({stats.completed})
                </button>
              )}
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
          className="fixed bottom-[calc(96px+env(safe-area-inset-bottom,0px))] end-4 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-elevation-4 transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus md:bottom-6 md:end-6"
        >
          <Plus size={24} />
        </motion.button>
      </div>
    </>
  )
}

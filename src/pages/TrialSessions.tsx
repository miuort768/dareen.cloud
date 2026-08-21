import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  Clock,
  Users,
  X,
  CalendarDays,
  Eye,
  EyeOff,
  Download,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { api } from '../lib/api'
import { socketService } from '../lib/socket'
import { SOCKET_EVENTS } from '../lib/socket-events'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ErrorBanner } from '../shared/components/ui/ErrorState'
import { TrialSessionCard } from './TrialSessionCard'
import { TrialSessionFormModal } from './TrialSessionFormModal'
import { TrialSessionDrawer } from './TrialSessionDrawer'
import { useUIStore } from '../store/uiStore'
import { useAcademyName } from '../context/AppContext'
import { Skeleton } from '../shared/components/ui/Skeleton'

export interface TrialSession {
  id: string
  studentName: string
  parentPhone: string
  subject: string
  teacherId: string
  teacherName: string
  date: string
  time: string
  status: 'pending' | 'completed' | 'cancelled' | 'converted'
  notes: string
  created_at: string
}

interface StatsData {
  total: number
  completed: number
  pending: number
  cancelled: number
  converted?: number
}

const PAID_STORAGE_KEY = 'paidTrialSessions'
const ITEMS_PER_PAGE = 10

const getPaidIds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(PAID_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const Counter = ({ value, duration = 800 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  const ref = useRef<number | null>(null)
  useEffect(() => {
    if (ref.current) cancelAnimationFrame(ref.current)
    const start = performance.now()
    const from = countRef.current
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = Math.round(from + (value - from) * eased)
      countRef.current = next
      setCount(next)
      if (progress < 1) ref.current = requestAnimationFrame(animate)
    }
    ref.current = requestAnimationFrame(animate)
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current)
    }
  }, [value, duration])
  return <>{count}</>
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
}

const statusFilters = [
  {
    key: 'pending',
    label: 'بانتظار',
    color: 'text-warning font-black',
    bg: 'bg-warning/20 border-warning/40',
    activeBg: 'bg-warning',
    activeText: 'text-on-warning font-black',
    dot: 'bg-warning',
  },
  {
    key: 'completed',
    label: 'تمت',
    color: 'text-success font-black',
    bg: 'bg-success/20 border-success/40',
    activeBg: 'bg-success',
    activeText: 'text-on-success font-black',
    dot: 'bg-success',
  },
  {
    key: 'cancelled',
    label: 'ملغية',
    color: 'text-error font-black',
    bg: 'bg-error/20 border-error/40',
    activeBg: 'bg-error',
    activeText: 'text-on-error font-black',
    dot: 'bg-error',
  },
  {
    key: 'converted',
    label: 'محولة',
    color: 'text-info font-black',
    bg: 'bg-info/20 border-info/40',
    activeBg: 'bg-info',
    activeText: 'text-on-info font-black',
    dot: 'bg-info',
  },
]

const TrialSessionsSkeleton = () => (
  <div className="min-h-screen bg-background pb-24" dir="rtl">
    <div className="mx-auto max-w-page px-3">
      {/* Header skeleton */}
      <div className="pb-2 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div>
              <Skeleton className="mb-1 h-5 w-36 rounded-lg" />
              <Skeleton className="h-3 w-48 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      </div>
      {/* KPI skeleton */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-3.5">
            <div className="mb-2 flex items-center gap-1.5">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
            <Skeleton className="mb-1 h-7 w-14 rounded-lg" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        ))}
      </div>
      {/* Toolbar skeleton */}
      <div className="mb-4 rounded-2xl border border-border bg-card p-4 lg:p-5">
        <Skeleton className="mb-3 h-11 w-full rounded-xl" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-8 shrink-0 rounded-lg"
              style={{ width: `${60 + Math.random() * 30}px` }}
            />
          ))}
        </div>
      </div>
      {/* Cards skeleton */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="mb-3 rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
          <div className="mb-3 grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="space-y-1">
                <Skeleton className="h-2.5 w-12 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t border-border pt-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton
                key={j}
                className="h-8 rounded-xl"
                style={{ width: `${70 + Math.random() * 20}px` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)

export const TrialSessions = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `جلسات المراجعة | ${academyName}`
  }, [academyName])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterSubject, setFilterSubject] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)
  const [deleteAllTyped, setDeleteAllTyped] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [drawerSession, setDrawerSession] = useState<TrialSession | null>(null)
  const [showPaid, setShowPaid] = useState(false)
  const [paidIds, setPaidIds] = useState<string[]>(() => getPaidIds())
  const [currentPage, setCurrentPage] = useState(1)
  const [form, setForm] = useState({
    studentName: '',
    parentPhone: '',
    subject: '',
    teacherId: '',
    teacherName: '',
    date: '',
    time: '',
    notes: '',
  })
  const queryClient = useQueryClient()
  const showNotification = useUIStore((s) => s.showNotification)

  const {
    data: trials = [],
    isLoading,
    isError: isTrialsError,
  } = useQuery({
    queryKey: ['trial-sessions'],
    queryFn: () => api.get<TrialSession[]>('/trial-sessions'),
    refetchInterval: 30000,
  })

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get<Record<string, unknown>[]>('/teachers'),
  })

  const { data: stats } = useQuery<StatsData>({
    queryKey: ['trial-sessions-stats'],
    queryFn: () => api.get<StatsData>('/trial-sessions/stats'),
  })

  const addMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      editingId ? api.put(`/trial-sessions/${editingId}`, data) : api.post('/trial-sessions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trial-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] })
      setShowModal(false)
      setEditingId(null)
      resetForm()
      showNotification(editingId ? 'تم تحديث الحصة' : 'تمت إضافة الحصة', 'success')
    },
    onError: (err: Error) => showNotification('حدث خطأ: ' + err.message, 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/trial-sessions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trial-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] })
      setConfirmId(null)
      showNotification('تم حذف الحصة', 'success')
    },
    onError: (err: Error) => showNotification('حدث خطأ: ' + err.message, 'error'),
  })

  const deleteAllMutation = useMutation({
    mutationFn: () => api.delete('/trial-sessions/all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trial-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] })
      setConfirmDeleteAll(false)
      showNotification('تم حذف جميع الحصص', 'success')
    },
    onError: (err: Error) => showNotification('حدث خطأ: ' + err.message, 'error'),
  })

  const convertMutation = useMutation({
    mutationFn: (id: string) => api.post(`/trial-sessions/${id}/convert`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trial-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
      showNotification('تم تحويل العميل إلى طالب', 'success')
    },
    onError: (err: Error) => showNotification('حدث خطأ: ' + err.message, 'error'),
  })

  useEffect(() => {
    const socket = socketService.connect()
    if (!socket) return
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['trial-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] })
    }
    socket.on(SOCKET_EVENTS.TRIAL_SESSION_UPDATED, handleUpdate)
    return () => {
      socket.off(SOCKET_EVENTS.TRIAL_SESSION_UPDATED, handleUpdate)
    }
  }, [queryClient])

  const resetForm = () =>
    setForm({
      studentName: '',
      parentPhone: '',
      subject: '',
      teacherId: '',
      teacherName: '',
      date: '',
      time: '',
      notes: '',
    })

  const openEdit = (t: TrialSession) => {
    setForm({
      studentName: t.studentName,
      parentPhone: t.parentPhone,
      subject: t.subject || '',
      teacherId: t.teacherId || '',
      teacherName: t.teacherName || '',
      date: t.date,
      time: t.time || '',
      notes: t.notes || '',
    })
    setEditingId(t.id)
    setShowModal(true)
  }

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`)
  }

  const handleWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/[^0-9]/g, '')
    window.open(`https://wa.me/${cleaned}`, '_blank')
  }

  const handlePaid = (id: string) => {
    const next = [...paidIds, id]
    localStorage.setItem(PAID_STORAGE_KEY, JSON.stringify(next))
    setPaidIds(next)
    queryClient.invalidateQueries({ queryKey: ['trial-sessions'] })
    showNotification('تم تحديد كمدفوع', 'success')
  }

  const subjects = [
    ...new Set(trials.map((t: TrialSession) => t.subject).filter(Boolean)),
  ] as string[]

  const filtered = useMemo(
    () =>
      trials.filter((t: TrialSession) => {
        const isPaid = paidIds.includes(t.id)
        const matchPaidFilter = showPaid ? isPaid : !isPaid
        const matchSearch =
          !search ||
          t.studentName.toLowerCase().includes(search.toLowerCase()) ||
          t.parentPhone.includes(search)
        const matchStatus = !filterStatus || t.status === filterStatus
        const matchSubject = !filterSubject || t.subject === filterSubject
        return matchPaidFilter && matchSearch && matchStatus && matchSubject
      }),
    [trials, paidIds, showPaid, search, filterStatus, filterSubject],
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedFiltered = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  const paginatedGroups = useMemo(() => {
    const g = new Map<string, TrialSession[]>()
    for (const t of paginatedFiltered) {
      const key = t.parentPhone || t.id
      const arr = g.get(key) || []
      arr.push(t)
      g.set(key, arr)
    }
    return g
  }, [paginatedFiltered])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterStatus, filterSubject, showPaid])

  const conversionRate = stats?.total
    ? Math.round(((stats.completed + (stats.converted || 0)) / stats.total) * 100)
    : 0

  if (isLoading) return <TrialSessionsSkeleton />

  if (isTrialsError) {
    return (
      <div className="min-h-screen bg-background pb-24" dir="rtl">
        <div className="mx-auto max-w-page px-4 pt-6 md:px-6 md:pt-10">
          <ErrorBanner />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background pb-24"
      dir="rtl"
    >
      <div className="relative z-10 mx-auto max-w-page px-4 md:px-6">
        {/* ===== HEADER ===== */}
        <motion.div variants={itemVariants} className="pb-2 pt-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
                <BookOpen size={16} className="text-primary" />
              </div>
              <div>
                <h1 className="font-outfit text-lg font-black text-main md:text-xl">
                  جلسات المراجعة
                </h1>
                <p className="text-[11px] text-muted">{stats?.total || 0} حصة مسجلة في النظام</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setConfirmDeleteAll(true)
                  setDeleteAllTyped('')
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-error bg-error px-3.5 text-[11px] font-extrabold text-on-error shadow-md transition-all duration-200 hover:bg-error-hover active:scale-95"
                title="حذف جميع الحصص"
              >
                <Trash2 size={13} /> حذف الكل
              </button>
              <button
                onClick={() => {
                  setEditingId(null)
                  resetForm()
                  setShowModal(true)
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-[11px] font-bold text-on-primary shadow-sm shadow-primary/10 transition-all duration-200 hover:bg-primary-hover active:scale-95"
              >
                <Plus size={13} /> جدولة جديدة
              </button>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-surface px-4 text-[11px] font-bold text-muted transition-all duration-200 hover:border-primary/20 hover:text-main">
                <Download size={13} /> تحميل التقرير
              </button>
            </div>
          </div>
        </motion.div>

        {/* ===== KPI STATS ===== */}
        <motion.div variants={itemVariants} className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: 'معدل التحويل',
              value: `${conversionRate}%`,
              sub: `${stats?.converted || 0} تحويل`,
              icon: TrendingUp,
              color: 'text-primary',
              iconBg: 'bg-primary-soft',
            },
            {
              label: 'قيد الانتظار',
              value: stats?.pending || 0,
              sub: 'بانتظار الموعد',
              icon: Clock,
              color: 'text-warning',
              iconBg: 'bg-warning/10',
            },
            {
              label: 'تمت بنجاح',
              value: stats?.completed || 0,
              sub: 'حصة ناجحة',
              icon: CheckCircle2,
              color: 'text-success',
              iconBg: 'bg-success/10',
            },
            {
              label: 'إجمالي الحصص',
              value: stats?.total || 0,
              sub: 'جميع الحصص',
              icon: BookOpen,
              color: 'text-primary',
              iconBg: 'bg-primary-soft',
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-3.5 transition-all duration-300 hover:shadow-elevation-1"
            >
              <div className="mb-2 flex items-center gap-1.5">
                <div
                  className={cn('flex h-7 w-7 items-center justify-center rounded-lg', stat.iconBg)}
                >
                  <stat.icon size={12} className={stat.color} />
                </div>
                <span className="truncate text-[10px] font-medium text-muted">{stat.label}</span>
              </div>
              <div className={cn('font-outfit text-xl font-black tabular-nums', stat.color)}>
                {typeof stat.value === 'number' ? <Counter value={stat.value} /> : stat.value}
              </div>
              <div className="mt-1 text-[10px] font-medium text-muted">{stat.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ===== MAIN CONTENT ===== */}
        <motion.div
          variants={itemVariants}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1 dark:shadow-none"
        >
          {/* Toolbar: search + filters */}
          <div className="border-b border-border p-4 lg:p-5">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث باسم الطالب أو رقم الهاتف..."
                  aria-label="بحث عن حصة"
                  className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-10 text-[13px] text-main outline-none transition-all duration-200 placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
                />
                {search && (
                  <button
                    aria-label="مسح البحث"
                    onClick={() => setSearch('')}
                    className="absolute left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-all hover:text-main"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowPaid(!showPaid)}
                className={cn(
                  'flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 text-[11px] font-bold transition-all duration-200',
                  showPaid
                    ? 'bg-success/10 border-success/20 text-success'
                    : 'border-border bg-surface text-muted hover:border-primary/20 hover:text-main',
                )}
                aria-label={showPaid ? 'إظهار غير المدفوعة' : 'إظهار المدفوعة'}
              >
                {showPaid ? <Eye size={13} /> : <EyeOff size={13} />}
                <span className="hidden sm:inline">المدفوعة</span>
              </button>
              <div className="shrink-0 rounded-xl border border-border bg-surface px-3 py-2.5">
                <span className="text-[13px] font-bold tabular-nums text-main">
                  {filtered.length}
                </span>
              </div>
            </div>

            {/* Status filter pills */}
            <div className="scrollbar-none mt-3 flex items-center gap-2 overflow-x-auto">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterStatus('')}
                className={cn(
                  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-bold transition-all duration-200',
                  !filterStatus
                    ? 'border-primary bg-primary text-on-primary shadow-sm shadow-primary/10'
                    : 'border-border/60 hover:border-current/40 border bg-primary-soft text-primary',
                )}
              >
                الكل
                <span
                  className={cn(
                    'min-w-[16px] rounded-md px-1.5 py-0.5 text-center text-[9px] font-bold',
                    !filterStatus ? 'bg-white/20' : 'border-border/60 border bg-surface text-muted',
                  )}
                >
                  {trials.length}
                </span>
              </motion.button>
              {statusFilters.map((sf) => {
                const isActive = filterStatus === sf.key
                const count = trials.filter((t: TrialSession) => t.status === sf.key).length
                return (
                  <motion.button
                    key={sf.key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilterStatus(isActive ? '' : sf.key)}
                    className={cn(
                      'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-bold transition-all duration-200',
                      isActive
                        ? `${sf.activeBg} ${sf.activeText} border-current/20 shadow-sm`
                        : `${sf.bg} ${sf.color} border-border/60 hover:border-current/40 border`,
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', sf.dot)} />
                    {sf.label}
                    <span
                      className={cn(
                        'min-w-[16px] rounded-md px-1.5 py-0.5 text-center text-[9px] font-bold',
                        isActive ? 'bg-white/20' : 'border-border/60 border bg-surface text-muted',
                      )}
                    >
                      {count}
                    </span>
                  </motion.button>
                )
              })}
              {filterStatus && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFilterStatus('')}
                  className="hover:bg-error/20 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-error-soft text-error transition-all"
                >
                  <X size={13} />
                </motion.button>
              )}
            </div>

            {/* Subject filter — dropdown */}
            {subjects.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <CalendarDays size={13} className="shrink-0 text-muted" />
                <div className="relative flex-1 sm:max-w-[220px]">
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    aria-label="تصفية حسب المادة"
                    className="h-9 w-full appearance-none rounded-xl border border-border bg-surface pe-8 ps-3 text-[12px] font-bold text-main outline-none transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
                  >
                    <option value="">كل المواد</option>
                    {subjects.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 text-muted">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </span>
                </div>
                {filterSubject && (
                  <button
                    onClick={() => setFilterSubject('')}
                    aria-label="إزالة فلتر المادة"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-error-soft text-error transition-all hover:bg-error/20"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Cards List / Inline Modal / Inline Drawer */}
          <div className="p-2.5 sm:p-4">
            {showModal ? (
              <TrialSessionFormModal
                editingId={editingId}
                form={form}
                teachers={teachers}
                isSaving={addMutation.isPending}
                onChange={setForm}
                onSubmit={(e) => {
                  e.preventDefault()
                  addMutation.mutate(form)
                }}
                onClose={() => {
                  setShowModal(false)
                  setEditingId(null)
                  resetForm()
                }}
              />
            ) : drawerSession ? (
              <TrialSessionDrawer
                session={drawerSession}
                onClose={() => setDrawerSession(null)}
                onCall={handleCall}
                onWhatsApp={handleWhatsApp}
                onConvert={(id) => {
                  convertMutation.mutate(id)
                  setDrawerSession(null)
                }}
                onEdit={(s) => {
                  setDrawerSession(null)
                  openEdit(s)
                }}
                onPaid={handlePaid}
                isConverting={convertMutation.isPending}
              />
            ) : filtered.length === 0 ? (
              <div className="py-14 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft">
                  <Users size={28} className="text-primary/40" />
                </div>
                <p className="mb-1 text-sm font-bold text-main">
                  {search || filterStatus || filterSubject
                    ? 'لا توجد نتائج للبحث'
                    : showPaid
                      ? 'لا توجد حصص مدفوعة'
                      : 'لا توجد حصص تجريبية'}
                </p>
                <p className="mb-4 text-[11px] text-muted">
                  {search || filterStatus || filterSubject
                    ? 'حاول تغيير معايير البحث'
                    : showPaid
                      ? 'لم تتم دفع أي حصة بعد'
                      : 'ابدأ بإضافة أول حصة تجريبية'}
                </p>
                {!search && !filterStatus && !filterSubject && !showPaid && (
                  <button
                    onClick={() => {
                      resetForm()
                      setShowModal(true)
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-on-primary transition-all hover:bg-primary-hover active:scale-[0.98]"
                  >
                    <Plus size={14} /> إضافة حصة
                  </button>
                )}
              </div>
            ) : (
              <motion.div variants={containerVariants} className="space-y-3">
                {Array.from(paginatedGroups.entries()).map(([phone, sessions]) => (
                  <motion.div key={phone} variants={itemVariants}>
                    {sessions.length > 1 && (
                      <div className="mb-2 flex items-center gap-2 px-3 py-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-[11px] font-bold text-primary" dir="ltr">
                          {phone}
                        </span>
                        <span className="text-[10px] text-muted">({sessions.length} حصص)</span>
                      </div>
                    )}
                    <div className="space-y-3">
                      {sessions.map((t) => (
                        <TrialSessionCard
                          key={t.id}
                          session={t}
                          onConvert={(id) => convertMutation.mutate(id)}
                          onEdit={openEdit}
                          onDelete={(id) => setConfirmId(id)}
                          onCall={handleCall}
                          onWhatsApp={handleWhatsApp}
                          onCardClick={() => setDrawerSession(t)}
                          onPaid={handlePaid}
                          isPaid={paidIds.includes(t.id)}
                          isConverting={convertMutation.isPending}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && filtered.length > 0 && (
              <div className="mt-6 flex items-center justify-center gap-2 border-t border-border pt-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted transition-all hover:bg-hover disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="الصفحة التالية"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl text-[12px] font-bold transition-all',
                      page === currentPage
                        ? 'bg-primary text-on-primary shadow-sm shadow-primary/10'
                        : 'border border-border bg-surface text-muted hover:bg-hover',
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted transition-all hover:bg-hover disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="الصفحة السابقة"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* FAB Button */}
        <motion.button
          onClick={() => {
            setEditingId(null)
            resetForm()
            setShowModal(true)
          }}
          className="fixed bottom-8 left-8 z-40 hidden h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary-hover active:scale-95 md:flex"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          aria-label="إضافة حصة جديدة"
        >
          <Plus size={22} />
        </motion.button>

        {/* Confirm Delete */}
        <AnimatePresence>
          {confirmId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm dark:bg-black/70 md:items-center md:p-4"
              dir="rtl"
            >
              {/* Mobile: bottom sheet */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="w-full overflow-hidden rounded-t-3xl bg-card md:hidden"
              >
                <div className="flex justify-center pb-1 pt-3">
                  <div className="h-1 w-10 rounded-full bg-border" />
                </div>
                <div className="flex items-center gap-3 bg-error px-5 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                    <AlertTriangle size={20} className="text-on-error" />
                  </div>
                  <h3 className="text-sm font-bold text-on-error">تأكيد الحذف</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm font-bold text-main">هل أنت متأكد من حذف هذه الحصة؟</p>
                  <p className="mt-1 text-[11px] text-muted">لا يمكن التراجع عن هذا الإجراء</p>
                </div>
                <div className="flex gap-2 px-5 pb-8">
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    className="flex-1 rounded-xl bg-surface py-3 text-xs font-bold text-muted transition-all hover:bg-hover active:scale-[0.98]"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmId) deleteMutation.mutate(confirmId)
                    }}
                    disabled={deleteMutation.isPending}
                    className="flex-1 rounded-xl bg-error py-3 text-xs font-bold text-on-error transition-all hover:bg-error-hover active:scale-[0.98] disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? 'جاري الحذف...' : 'حذف'}
                  </button>
                </div>
              </motion.div>
              {/* Desktop: centered modal */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="border-error/50 hidden w-full max-w-sm overflow-hidden rounded-none border-2 bg-card shadow-2xl md:block"
              >
                <div className="flex items-center justify-between bg-error px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                      <AlertTriangle size={20} className="text-on-error" />
                    </div>
                    <h3 className="text-sm font-bold text-on-error">تأكيد الحذف</h3>
                  </div>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="bg-error/15 hover:bg-error/25 flex h-8 w-8 items-center justify-center rounded-full text-error transition-all"
                    aria-label="إغلاق"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-sm font-bold text-main">هل أنت متأكد من الحذف؟</p>
                </div>
                <div className="flex gap-2 px-5 pb-5">
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    className="flex-1 rounded-xl bg-surface py-3 text-xs font-bold text-muted transition-all hover:bg-hover active:scale-[0.98]"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmId) deleteMutation.mutate(confirmId)
                    }}
                    disabled={deleteMutation.isPending}
                    className="flex-1 rounded-xl bg-error py-3 text-xs font-bold text-on-error transition-all hover:bg-error-hover active:scale-[0.98] disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? 'جاري الحذف...' : 'حذف'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
          {confirmDeleteAll && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm dark:bg-black/70 md:items-center md:p-4"
              dir="rtl"
            >
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="border-error/50 w-full overflow-hidden rounded-none border-2 bg-card shadow-2xl md:max-w-sm"
              >
                <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-border md:hidden" />
                <div className="flex items-center justify-between bg-error px-5 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                      <Trash2 size={18} className="text-on-error" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-on-error">حذف جميع الحصص</h3>
                      <p className="text-on-error/70 mt-0.5 text-[10px]">
                        لا يمكن التراجع عن هذا الإجراء
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmDeleteAll(false)}
                    className="bg-error/15 hover:bg-error/25 flex h-8 w-8 items-center justify-center rounded-full text-error transition-all"
                    aria-label="إغلاق"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="p-5">
                  <p className="mb-1 text-sm font-bold text-main">
                    هل أنت متأكد من حذف جميع الحصص؟
                  </p>
                  <p className="text-xs leading-relaxed text-muted">
                    سيتم{' '}
                    <span className="font-bold text-error">حذف جميع جلسات المراجعة نهائيًا</span>{' '}
                    ولن يمكن استعادتها.
                  </p>
                  <div className="mt-4">
                    <label className="mb-1.5 block text-[11px] font-bold text-muted">
                      اكتب{' '}
                      <span dir="ltr" className="font-black text-error">
                        dareen
                      </span>{' '}
                      للتأكيد
                    </label>
                    <input
                      dir="ltr"
                      value={deleteAllTyped}
                      onChange={(e) => setDeleteAllTyped(e.target.value)}
                      placeholder="dareen"
                      className="focus-visible:ring-error/10 placeholder:text-muted/40 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-center text-[13px] font-black tracking-widest text-main outline-none transition-all duration-200 focus-visible:border-error focus-visible:ring-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && deleteAllTyped.trim().toLowerCase() === 'dareen')
                          deleteAllMutation.mutate()
                      }}
                      aria-label="اكتب dareen للتأكيد"
                    />
                  </div>
                </div>
                <div className="flex gap-2 p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteAll(false)}
                    className="flex-1 rounded-xl bg-surface py-3.5 text-xs font-bold text-muted transition-all hover:bg-hover active:scale-[0.98]"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteAllMutation.mutate()}
                    disabled={
                      deleteAllMutation.isPending ||
                      deleteAllTyped.trim().toLowerCase() !== 'dareen'
                    }
                    className="shadow-error/20 flex-1 rounded-xl bg-error py-3.5 text-xs font-bold text-on-error shadow-sm transition-all hover:bg-error-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deleteAllMutation.isPending ? 'جاري الحذف...' : 'حذف الكل'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

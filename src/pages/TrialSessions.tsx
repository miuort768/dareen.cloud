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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { cn } from '../lib/utils'
import { api } from '../lib/api'
import { socketService } from '../lib/socket'
import { SOCKET_EVENTS } from '../lib/socket-events'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ErrorBanner } from '../shared/components/ui/ErrorState'
import { EmptyState } from '../shared/components/ui/EmptyState'
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

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
}

const statusFilterItems = [
  { key: '', label: 'الكل' },
  { key: 'pending', label: 'بانتظار', dot: 'bg-warning' },
  { key: 'completed', label: 'تمت', dot: 'bg-success' },
  { key: 'cancelled', label: 'ملغية', dot: 'bg-error' },
  { key: 'converted', label: 'محولة', dot: 'bg-primary' },
]

const TrialSessionsSkeleton = () => (
  <div className="min-h-full bg-background pb-4 md:pb-8" dir="rtl">
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
        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-9 w-16 shrink-0 rounded-xl" />
          <Skeleton className="h-10 w-12 shrink-0 rounded-xl" />
        </div>
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-10 w-24 shrink-0 rounded-xl" />
          <Skeleton className="h-10 w-28 shrink-0 rounded-xl" />
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
  const [filterTeacher, setFilterTeacher] = useState<string>('')
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'created-desc'>('date-desc')
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
    queryFn: () => api.get<{ id: string; name: string }[]>('/teachers'),
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

  const handleExportReport = () => {
    const statusLabels: Record<string, string> = {
      pending: 'قيد الانتظار',
      completed: 'تمت بنجاح',
      cancelled: 'ملغية',
      converted: 'محولة',
    }
    const headers = [
      'الطالب',
      'هاتف ولي الأمر',
      'المادة',
      'المعلمة',
      'التاريخ',
      'الوقت',
      'الحالة',
      'ملاحظات',
    ]
    const rows = sortedFiltered.map((t: TrialSession) => [
      t.studentName,
      t.parentPhone,
      t.subject,
      t.teacherName || '',
      t.date,
      t.time || '',
      statusLabels[t.status] || t.status,
      (t.notes || '').replace(/\r?\n/g, ' '),
    ])
    const escapeCell = (v: string) => `"${String(v).replace(/"/g, '""')}"`
    const csv = '\uFEFF' + [headers, ...rows].map((r) => r.map(escapeCell).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `تقرير-جلسات-المراجعة-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showNotification('تم تحميل التقرير بنجاح', 'success')
  }

  const subjects = [
    ...new Set(trials.map((t: TrialSession) => t.subject).filter(Boolean)),
  ] as string[]

  const teacherNames = [
    ...new Set(trials.map((t: TrialSession) => t.teacherName).filter(Boolean)),
  ] as string[]

  const hasActiveFilters = !!(search || filterStatus || filterSubject || filterTeacher || showPaid)

  const clearAllFilters = () => {
    setSearch('')
    setFilterStatus('')
    setFilterSubject('')
    setFilterTeacher('')
    setShowPaid(false)
  }

  const filtered = useMemo(
    () =>
      trials.filter((t: TrialSession) => {
        const isPaid = paidIds.includes(t.id)
        const matchPaidFilter = showPaid ? isPaid : !isPaid
        const q = search.trim().toLowerCase()
        const matchSearch =
          !q ||
          t.studentName.toLowerCase().includes(q) ||
          t.parentPhone.includes(search) ||
          (t.subject || '').toLowerCase().includes(q) ||
          (t.teacherName || '').toLowerCase().includes(q)
        const matchStatus = !filterStatus || t.status === filterStatus
        const matchSubject = !filterSubject || t.subject === filterSubject
        const matchTeacher = !filterTeacher || t.teacherName === filterTeacher
        return matchPaidFilter && matchSearch && matchStatus && matchSubject && matchTeacher
      }),
    [trials, paidIds, showPaid, search, filterStatus, filterSubject, filterTeacher],
  )

  const sortedFiltered = useMemo(() => {
    const arr = [...filtered]
    const sessionKey = (t: TrialSession) => `${t.date || ''} ${t.time || ''}`
    arr.sort((a, b) => {
      if (sortBy === 'created-desc') return (b.created_at || '').localeCompare(a.created_at || '')
      return sortBy === 'date-desc'
        ? sessionKey(b).localeCompare(sessionKey(a))
        : sessionKey(a).localeCompare(sessionKey(b))
    })
    return arr
  }, [filtered, sortBy])

  const totalPages = Math.ceil(sortedFiltered.length / ITEMS_PER_PAGE)
  const paginatedFiltered = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedFiltered.slice(start, start + ITEMS_PER_PAGE)
  }, [sortedFiltered, currentPage])

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
  }, [search, filterStatus, filterSubject, filterTeacher, sortBy, showPaid])

  const conversionRate = stats?.total
    ? Math.round(((stats.completed + (stats.converted || 0)) / stats.total) * 100)
    : 0

  if (isLoading) return <TrialSessionsSkeleton />

  if (isTrialsError) {
    return (
      <div className="min-h-full bg-background pb-4 md:pb-8" dir="rtl">
        <div className="mx-auto max-w-page px-2.5 pt-6 sm:px-4 md:px-6 md:pt-10">
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
      className="min-h-full bg-background pb-4 md:pb-8"
      dir="rtl"
    >
      <div className="relative z-10 mx-auto max-w-page px-2.5 sm:px-4 md:px-6">
        {/* ===== HEADER ===== */}
        <motion.div variants={itemVariants} className="mb-5">
          <div className="rounded-card border border-border bg-card p-4 shadow-card md:p-5">
            {/* Mobile layout */}
            <div className="md:hidden">
              <div className="flex items-center gap-2.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-deep shadow-elevation-2 shadow-primary/20">
                  <CalendarDays size={20} className="text-on-primary" />
                </div>
                <div>
                  <h1 className="font-outfit text-lg font-black text-main">جلسات المراجعة</h1>
                  <p className="text-[11px] text-muted">{stats?.total || 0} حصة مسجلة في النظام</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingId(null)
                  resetForm()
                  setShowModal(true)
                }}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-deep px-4 text-xs font-bold text-on-primary shadow-elevation-2 shadow-primary/25 transition-all hover:shadow-elevation-3 hover:shadow-primary/30 active:scale-95"
              >
                <Plus size={16} /> جدولة جديدة
              </button>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportReport}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-bold text-main transition-all hover:border-primary/20 hover:text-primary active:scale-95"
                >
                  <Download size={16} /> تحميل التقرير
                </button>
                <button
                  onClick={() => {
                    setConfirmDeleteAll(true)
                    setDeleteAllTyped('')
                  }}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-error px-4 text-xs font-extrabold text-on-error shadow-elevation-1 transition-all hover:bg-error-hover active:scale-95"
                >
                  <Trash2 size={16} /> حذف الكل
                </button>
              </div>
            </div>

            {/* Desktop layout */}
            <div className="hidden items-center justify-between gap-4 md:flex">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-deep shadow-elevation-2 shadow-primary/25">
                  <CalendarDays size={22} className="text-on-primary" />
                </div>
                <div>
                  <h1 className="font-outfit text-xl font-black text-main">جلسات المراجعة</h1>
                  <p className="text-[11px] text-muted">{stats?.total || 0} حصة مسجلة في النظام</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportReport}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-bold text-main transition-all hover:border-primary/20 hover:text-primary active:scale-95"
                >
                  <Download size={15} /> تحميل التقرير
                </button>
                <button
                  onClick={() => {
                    setConfirmDeleteAll(true)
                    setDeleteAllTyped('')
                  }}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl bg-error px-4 text-xs font-extrabold text-on-error shadow-elevation-1 transition-all hover:bg-error-hover active:scale-95"
                >
                  <Trash2 size={15} /> حذف الكل
                </button>
                <button
                  onClick={() => {
                    setEditingId(null)
                    resetForm()
                    setShowModal(true)
                  }}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-deep px-5 text-xs font-bold text-on-primary shadow-elevation-2 shadow-primary/25 transition-all hover:shadow-elevation-3 hover:shadow-primary/30 active:scale-95"
                >
                  <Plus size={15} /> جدولة جديدة
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ===== KPI STATS ===== */}
        <motion.div variants={itemVariants} className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: 'قيد الانتظار',
              value: stats?.pending || 0,
              sub: 'بانتظار الموعد',
              icon: Clock,
              color: 'text-warning',
              iconBg: 'bg-white/50 dark:bg-white/10',
              card: 'border-warning-soft bg-warning-soft',
            },
            {
              label: 'إجمالي الحصص',
              value: stats?.total || 0,
              sub: 'جميع الحصص',
              icon: BookOpen,
              color: 'text-primary',
              iconBg: 'bg-white/50 dark:bg-white/10',
              card: 'border-primary-soft bg-primary-soft',
            },
            {
              label: 'تمت بنجاح',
              value: stats?.completed || 0,
              sub: 'حصة ناجحة',
              icon: CheckCircle2,
              color: 'text-success',
              iconBg: 'bg-white/50 dark:bg-white/10',
              card: 'border-success-soft bg-success-soft',
            },
            {
              label: 'معدل التحويل',
              value: `${conversionRate}%`,
              sub: 'من إجمالي الحصص',
              icon: TrendingUp,
              color: 'text-info',
              iconBg: 'bg-white/50 dark:bg-white/10',
              card: 'border-info-soft bg-info-soft',
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
              className={cn(
                'rounded-2xl border p-4 shadow-elevation-0 transition-all duration-slow hover:shadow-elevation-1',
                stat.card,
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="truncate text-xs font-bold text-main">{stat.label}</span>
                <div
                  className={cn('flex h-8 w-8 items-center justify-center rounded-xl', stat.iconBg)}
                >
                  <stat.icon size={14} className={stat.color} />
                </div>
              </div>
              <div className={cn('font-outfit text-2xl font-black tabular-nums', stat.color)}>
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
                  className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث باسم الطالب أو رقم الهاتف..."
                  aria-label="بحث عن حصة"
                  className="h-11 w-full rounded-xl border border-border bg-surface pe-10 ps-10 text-sm text-main outline-none transition-all duration-normal placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
                />
                {search && (
                  <button
                    aria-label="مسح البحث"
                    onClick={() => setSearch('')}
                    className="absolute end-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-all hover:text-main"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowPaid(!showPaid)}
                className={cn(
                  'flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 text-[11px] font-bold transition-all duration-normal',
                  showPaid
                    ? 'border-success-soft bg-success-soft text-success'
                    : 'border-border bg-surface text-muted hover:border-primary/20 hover:text-main',
                )}
                aria-label={showPaid ? 'إظهار غير المدفوعة' : 'إظهار المدفوعة'}
              >
                {showPaid ? <Eye size={13} /> : <EyeOff size={13} />}
                <span className="hidden sm:inline">المدفوعة</span>
              </button>
            </div>

            {/* Filter chips: status + subject */}
            <div className="mt-3 space-y-2">
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
                {statusFilterItems.map((item) => {
                  const isActive = filterStatus === item.key
                  return (
                    <button
                      key={item.key || 'all'}
                      onClick={() => setFilterStatus(item.key)}
                      aria-pressed={isActive}
                      className={cn(
                        'flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-bold transition-all active:scale-95',
                        isActive
                          ? 'border-primary bg-primary text-on-primary shadow-elevation-1'
                          : 'border-border bg-surface text-muted hover:border-primary/20 hover:text-main',
                      )}
                    >
                      {item.dot && (
                        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', item.dot)} />
                      )}
                      {item.label}
                    </button>
                  )
                })}
              </div>
              {subjects.length > 0 && (
                <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
                  <button
                    onClick={() => setFilterSubject('')}
                    aria-pressed={filterSubject === ''}
                    className={cn(
                      'flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-bold transition-all active:scale-95',
                      filterSubject === ''
                        ? 'border-primary bg-primary text-on-primary shadow-elevation-1'
                        : 'border-border bg-surface text-muted hover:border-primary/20 hover:text-main',
                    )}
                  >
                    <BookOpen size={12} />
                    كل المواد
                  </button>
                  {subjects.map((s) => {
                    const isActive = filterSubject === s
                    return (
                      <button
                        key={s}
                        onClick={() => setFilterSubject(s)}
                        aria-pressed={isActive}
                        className={cn(
                          'flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-bold transition-all active:scale-95',
                          isActive
                            ? 'border-primary bg-primary text-on-primary shadow-elevation-1'
                            : 'border-border bg-surface text-muted hover:border-primary/20 hover:text-main',
                        )}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Teacher filter + sort + results summary */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="relative">
                  <select
                    value={filterTeacher}
                    onChange={(e) => setFilterTeacher(e.target.value)}
                    aria-label="فلترة حسب المعلمة"
                    className="h-9 w-full appearance-none rounded-xl border border-border bg-surface pe-8 ps-3 text-[11px] font-bold text-main outline-none transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
                  >
                    <option value="">كل المعلمات</option>
                    {teacherNames.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 text-muted"
                  />
                </div>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as 'date-desc' | 'date-asc' | 'created-desc')
                    }
                    aria-label="ترتيب النتائج"
                    className="h-9 w-full appearance-none rounded-xl border border-border bg-surface pe-8 ps-3 text-[11px] font-bold text-main outline-none transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
                  >
                    <option value="date-desc">تاريخ الحصة (الأحدث)</option>
                    <option value="date-asc">تاريخ الحصة (الأقدم)</option>
                    <option value="created-desc">الأحدث إضافة</option>
                  </select>
                  <ChevronDown
                    size={12}
                    className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 text-muted"
                  />
                </div>
                <span className="ms-auto text-[11px] font-bold text-muted">
                  {filtered.length} من {trials.length} حصة
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="flex h-9 items-center gap-1 rounded-xl border border-error-soft bg-error-soft px-3 text-[11px] font-bold text-error transition-all hover:bg-error-light active:scale-95"
                  >
                    <X size={12} /> مسح الفلاتر
                  </button>
                )}
              </div>
            </div>
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
              <EmptyState
                compact
                icon={Users}
                iconClassName="text-primary/40"
                title={
                  hasActiveFilters
                    ? 'لا توجد نتائج مطابقة'
                    : showPaid
                      ? 'لا توجد حصص مدفوعة'
                      : 'لا توجد حصص تجريبية'
                }
                subtitle={
                  hasActiveFilters
                    ? 'حاول تغيير معايير البحث أو مسح الفلاتر'
                    : showPaid
                      ? 'لم تتم دفع أي حصة بعد'
                      : 'ابدأ بإضافة أول حصة تجريبية'
                }
                action={
                  hasActiveFilters ? (
                    <button
                      onClick={clearAllFilters}
                      className="inline-flex h-11 items-center gap-2 rounded-xl border border-error-soft bg-error-soft px-5 text-xs font-bold text-error transition-all hover:bg-error-light active:scale-[0.98] md:h-9"
                    >
                      <X size={14} /> مسح الفلاتر
                    </button>
                  ) : !showPaid ? (
                    <button
                      onClick={() => {
                        resetForm()
                        setShowModal(true)
                      }}
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-xs font-bold text-on-primary transition-all hover:bg-primary-hover active:scale-[0.98] md:h-9"
                    >
                      <Plus size={14} /> إضافة حصة
                    </button>
                  ) : undefined
                }
              />
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
            {totalPages > 1 && sortedFiltered.length > 0 && (
              <div className="mt-6 flex items-center justify-center gap-2 border-t border-border pt-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-muted transition-all hover:bg-hover disabled:cursor-not-allowed disabled:opacity-30 md:h-9 md:w-9"
                  aria-label="الصفحة التالية"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-xl text-xs font-bold transition-all md:h-9 md:w-9',
                      page === currentPage
                        ? 'bg-primary text-on-primary shadow-elevation-1 shadow-primary/10'
                        : 'border border-border bg-surface text-muted hover:bg-hover',
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-muted transition-all hover:bg-hover disabled:cursor-not-allowed disabled:opacity-30 md:h-9 md:w-9"
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
          className="fixed bottom-8 end-8 z-40 hidden h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-elevation-3 shadow-primary/20 transition-all duration-normal hover:bg-primary-hover active:scale-95 md:flex"
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
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 md:h-9 md:w-9">
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
                className="hidden w-full max-w-sm overflow-hidden rounded-2xl border-2 border-error bg-card shadow-2xl md:block"
              >
                <div className="flex items-center justify-between bg-error px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 md:h-9 md:w-9">
                      <AlertTriangle size={20} className="text-on-error" />
                    </div>
                    <h3 className="text-sm font-bold text-on-error">تأكيد الحذف</h3>
                  </div>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-on-error transition-all hover:bg-white/25"
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
                className="w-full overflow-hidden rounded-2xl border-2 border-error bg-card shadow-2xl md:max-w-sm"
              >
                <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-border md:hidden" />
                <div className="flex items-center justify-between bg-error px-5 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                      <Trash2 size={18} className="text-on-error" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-on-error">حذف جميع الحصص</h3>
                      <p className="mt-0.5 text-[10px] text-white/90">
                        لا يمكن التراجع عن هذا الإجراء
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmDeleteAll(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-on-error transition-all hover:bg-white/25"
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
                      aria-label="كلمة التأكيد للحذف"
                      value={deleteAllTyped}
                      onChange={(e) => setDeleteAllTyped(e.target.value)}
                      placeholder="dareen"
                      className="w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-center text-sm font-black tracking-widest text-main outline-none transition-all duration-normal placeholder:text-muted focus-visible:border-error focus-visible:ring-2 focus-visible:ring-error-soft"
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
                    className="flex-1 rounded-xl bg-error py-3.5 text-xs font-bold text-on-error shadow-elevation-1 transition-all hover:bg-error-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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

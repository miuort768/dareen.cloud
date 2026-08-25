import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  ArrowLeft,
  Wallet,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useShowNotification, useIsLoading } from '../context/AppContext'
import { Skeleton } from '../shared/components/ui'
import { CURRENCY_SYMBOL } from '../config/constants'
import type { Student } from '../types'

interface StudentInvoiceData {
  id: string
  studentId: string
  studentName: string
  amount: number
  description: string
  date: string
  dueDate: string
  status: 'paid' | 'pending' | 'overdue'
  currency?: string
  notes?: string
}

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 4 + Math.random() * 18,
  delay: Math.random() * 5,
  duration: 6 + Math.random() * 8,
}))

const statusConfig = {
  paid: {
    label: 'ظ…ط¯ظپظˆط¹ط©',
    icon: CheckCircle,
    textCls: 'text-success',
    bgCls: 'bg-success/10 dark:bg-success/15',
    borderCls: 'border-success/30 dark:border-success/20',
  },
  pending: {
    label: 'ظ…ط¹ظ„ظ‚ط©',
    icon: Clock,
    textCls: 'text-warning',
    bgCls: 'bg-warning/10 dark:bg-warning/15',
    borderCls: 'border-warning/30 dark:border-warning/20',
  },
  overdue: {
    label: 'ظ…طھط£ط®ط±ط©',
    icon: AlertCircle,
    textCls: 'text-error',
    bgCls: 'bg-error/10 dark:bg-error/15',
    borderCls: 'border-error/30 dark:border-error/20',
  },
} as const

type FilterStatus = 'all' | 'paid' | 'pending' | 'overdue'

const STATUS_PILLS: { key: FilterStatus; label: string }[] = [
  { key: 'all', label: 'ط§ظ„ظƒظ„' },
  { key: 'paid', label: 'ظ…ط¯ظپظˆط¹ط©' },
  { key: 'pending', label: 'ظ…ط¹ظ„ظ‚ط©' },
  { key: 'overdue', label: 'ظ…طھط£ط®ط±ط©' },
]

const HeroSkeleton = () => (
  <div className="from-success/10 via-success/[6%] border-border/60 relative overflow-hidden border-b bg-gradient-to-br to-background dark:border-white/[0.06] dark:from-surface dark:via-hover dark:to-surface">
    <div className="mx-auto max-w-page px-2.5 pb-8 pt-4 sm:px-4">
      <div className="mb-6 flex items-center gap-2.5">
        <Skeleton className="h-8 w-8 rounded-xl" />
        <Skeleton className="h-9 w-9 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24 rounded-lg" />
          <Skeleton className="h-2 w-32 rounded-lg" />
        </div>
      </div>
      <div className="space-y-2 py-4 text-center">
        <Skeleton className="mx-auto h-2.5 w-20 rounded-lg" />
        <Skeleton className="mx-auto h-9 w-40 rounded-xl" />
        <div className="mt-3 flex justify-center gap-4">
          <Skeleton className="h-3 w-16 rounded-lg" />
          <Skeleton className="h-3 w-16 rounded-lg" />
          <Skeleton className="h-3 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
)

const KpiSkeleton = () => (
  <div className="grid grid-cols-3 gap-2.5">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="dark:bg-card/80 rounded-2xl border border-border bg-card p-3.5 shadow-sm dark:border-white/[0.06]"
      >
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-2 w-10 rounded-lg" />
            <Skeleton className="h-3.5 w-16 rounded-lg" />
            <Skeleton className="h-2 w-12 rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </div>
)

const ListSkeleton = () => (
  <div className="space-y-2.5">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="dark:bg-card/80 rounded-2xl border border-border bg-card p-4 shadow-sm dark:border-white/[0.06]"
      >
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-3 w-28 rounded-lg" />
          <Skeleton className="h-5 w-14 rounded-lg" />
        </div>
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-2.5 w-20 rounded-lg" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20 rounded-lg" />
          <Skeleton className="h-2.5 w-16 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
)

export const ParentPaymentHistory = () => {
  useEffect(() => {
    document.title = 'ط³ط¬ظ„ ط§ظ„ط¯ظپط¹ط§طھ | ظˆظ„ظٹ ط§ظ„ط£ظ…ط±'
  }, [])
  const navigate = useNavigate()
  const showNotification = useShowNotification()
  const authLoading = useIsLoading()
  const [invoices, setInvoices] = useState<StudentInvoiceData[]>([])
  const [children, setChildren] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterChild, setFilterChild] = useState<string>('all')

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      try {
        setLoading(true)
        const [studentsData, invData] = await Promise.all([
          api.get<Student[]>('/parents/my-children'),
          api.get<StudentInvoiceData[]>('/invoices/me/student'),
        ])
        if (cancelled) return
        const students = Array.isArray(studentsData) ? studentsData : []
        const allInv = Array.isArray(invData) ? invData : []
        setChildren(students)
        const childIds = new Set(students.map((s) => s.id))
        setInvoices(allInv.filter((inv) => childIds.has(inv.studentId)))
      } catch (error) {
        console.error('Error fetching payment data:', error)
        if (!cancelled) showNotification('ظپط´ظ„ طھط­ظ…ظٹظ„ ط³ط¬ظ„ ط§ظ„ط¯ظپط¹ط§طھ', 'error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => {
      cancelled = true
    }
  }, [showNotification])

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((inv) => {
        const matchesSearch =
          inv.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.studentName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'all' || inv.status === filterStatus
        const matchesChild = filterChild === 'all' || inv.studentId === filterChild
        return matchesSearch && matchesStatus && matchesChild
      }),
    [invoices, searchTerm, filterStatus, filterChild],
  )

  const stats = useMemo(
    () => ({
      total: invoices.reduce((sum, i) => sum + i.amount, 0),
      paid: invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
      pending: invoices.filter((i) => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0),
      overdue: invoices.filter((i) => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0),
      paidCount: invoices.filter((i) => i.status === 'paid').length,
      pendingCount: invoices.filter((i) => i.status === 'pending').length,
      overdueCount: invoices.filter((i) => i.status === 'overdue').length,
    }),
    [invoices],
  )

  const isEmpty = invoices.length === 0
  const noResults = filteredInvoices.length === 0 && !isEmpty
  const reportCurrency = invoices[0]?.currency || CURRENCY_SYMBOL

  if (authLoading || loading) {
    return (
      <div className="min-h-full overflow-x-hidden pb-24" dir="rtl">
        <HeroSkeleton />
        <div className="mx-auto max-w-page space-y-4 px-2.5 pt-4 sm:px-4">
          <KpiSkeleton />
          <Skeleton className="h-10 w-full rounded-xl" />
          <ListSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative min-h-full overflow-x-hidden bg-surface pb-24 font-sans dark:bg-surface"
      dir="rtl"
    >
      {/* Hero */}
      <div className="from-success/10 via-success/[6%] border-border/60 relative overflow-hidden border-b bg-gradient-to-br to-background dark:border-white/[0.06] dark:from-surface dark:via-hover dark:to-surface">
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
          {PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="bg-success/30 absolute rounded-full"
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
              animate={{ y: [0, -30, 0], opacity: [0.1, 0.45, 0.1] }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        <div className="relative z-10 mx-auto max-w-page px-2.5 pb-6 pt-4 sm:px-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success text-on-success shadow-sm">
                <Wallet size={16} />
              </div>
              <div>
                <h1 className="text-sm font-bold text-main dark:text-main">
                  ط³ط¬ظ„ ط§ظ„ط¯ظپط¹ط§طھ
                </h1>
                <p className="dark:text-main/40 text-[8px] text-muted">
                  ظپظˆط§طھظٹط± ط£ط¨ظ†ط§ط¦ظƒ ظˆظ…ط¯ظپظˆط¹ط§طھظƒ
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="dark:text-main/40 flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted transition-all hover:bg-surface hover:text-main dark:border-white/[0.06] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:hover:text-white"
              aria-label="ط±ط¬ظˆط¹"
            >
              <ArrowLeft size={14} />
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="py-4 text-center"
          >
            <p className="dark:text-main/40 mb-1 text-[9px] font-bold text-muted">
              ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظپظˆط§طھظٹط±
            </p>
            <motion.p
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className="text-3xl font-bold tabular-nums tracking-tight text-main dark:text-main"
            >
              {stats.total.toLocaleString()}{' '}
              <span className="dark:text-main/40 me-1 text-sm font-bold text-muted">
                {reportCurrency}
              </span>
            </motion.p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <div className="flex items-center gap-1">
                <CheckCircle size={10} className="text-success" />
                <span className="dark:text-main/40 text-[8px] font-bold text-muted">
                  ظ…ط¯ظپظˆط¹ط©: <span className="text-main dark:text-main">{stats.paidCount}</span>
                </span>
              </div>
              <div className="bg-border/60 h-3 w-px dark:bg-white/10" />
              <div className="flex items-center gap-1">
                <Clock size={10} className="text-warning" />
                <span className="dark:text-main/40 text-[8px] font-bold text-muted">
                  ظ…ط¹ظ„ظ‚ط©: <span className="text-main dark:text-main">{stats.pendingCount}</span>
                </span>
              </div>
              <div className="bg-border/60 h-3 w-px dark:bg-white/10" />
              <div className="flex items-center gap-1">
                <AlertCircle size={10} className="text-error" />
                <span className="dark:text-main/40 text-[8px] font-bold text-muted">
                  ظ…طھط£ط®ط±ط©:{' '}
                  <span className="text-main dark:text-main">{stats.overdueCount}</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto -mt-2 max-w-page space-y-3 px-2.5 pb-16 sm:px-4">
        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-2.5"
        >
          {[
            {
              title: 'ظ…ط¯ظپظˆط¹ط©',
              value: stats.paid,
              count: stats.paidCount,
              icon: CheckCircle,
              accent: 'success' as const,
            },
            {
              title: 'ظ…ط¹ظ„ظ‚ط©',
              value: stats.pending,
              count: stats.pendingCount,
              icon: Clock,
              accent: 'warning' as const,
            },
            {
              title: 'ظ…طھط£ط®ط±ط©',
              value: stats.overdue,
              count: stats.overdueCount,
              icon: AlertCircle,
              accent: 'error' as const,
            },
          ].map((kpi) => {
            const gradients = {
              success: 'from-success/20 to-success/5 dark:from-surface dark:to-transparent',
              warning: 'from-warning/20 to-warning/5 dark:from-primary-soft dark:to-transparent',
              error: 'from-error/20 to-error/5 dark:from-error-soft dark:to-transparent',
            }
            const iconBg = {
              success: 'bg-success/10 text-success dark:bg-success/15 dark:text-success',
              warning: 'bg-warning/10 text-warning dark:bg-warning/15 dark:text-warning',
              error: 'bg-error/10 text-error dark:bg-error/15 dark:text-error',
            }
            const Icon = kpi.icon
            return (
              <motion.div
                key={kpi.title}
                whileHover={{ scale: 1.01, y: -1 }}
                className="dark:bg-card/80 relative overflow-hidden rounded-2xl border border-border bg-card p-3.5 shadow-sm transition-all hover:shadow-md dark:border-white/[0.06]"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br opacity-[0.03] ${gradients[kpi.accent]}`}
                />
                <div
                  className={`absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r ${gradients[kpi.accent]}`}
                />
                <div className="relative flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBg[kpi.accent]}`}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="dark:text-main/40 text-[9px] font-bold text-muted">{kpi.title}</p>
                    <p className="mt-0.5 text-sm font-bold tabular-nums leading-none text-main dark:text-main">
                      {kpi.value.toLocaleString()}{' '}
                      <span className="dark:text-main/40 text-[8px] font-bold text-muted">
                        {reportCurrency}
                      </span>
                    </p>
                    <p className="dark:text-main/40 mt-1 text-[8px] font-bold text-muted">
                      {kpi.count} ظپط§طھظˆط±ط©
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2.5"
        >
          {/* Status Pills */}
          <div className="flex flex-wrap gap-1.5">
            {STATUS_PILLS.map((pill) => {
              const active = filterStatus === pill.key
              return (
                <button
                  key={pill.key}
                  onClick={() => setFilterStatus(pill.key)}
                  className={`rounded-xl px-3 py-1.5 text-[10px] font-bold transition-all ${
                    active
                      ? 'bg-gradient-to-l from-primary to-primary-deep text-on-primary shadow-sm dark:from-primary dark:to-accent'
                      : 'dark:text-main/40 border border-border bg-card text-muted hover:bg-surface dark:border-white/[0.06] dark:bg-white/[0.06] dark:hover:bg-white/[0.1]'
                  }`}
                >
                  {pill.label}
                </button>
              )
            })}
          </div>

          {/* Child + Search Row */}
          <div className="flex items-center gap-2">
            {children.length > 1 && (
              <div className="no-scrollbar flex shrink-0 gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setFilterChild('all')}
                  className={`whitespace-nowrap rounded-xl px-2.5 py-1.5 text-[10px] font-bold transition-all ${
                    filterChild === 'all'
                      ? 'bg-gradient-to-l from-primary to-primary-deep text-on-primary shadow-sm dark:from-primary dark:to-accent'
                      : 'dark:text-main/40 border border-border bg-card text-muted hover:bg-surface dark:border-white/[0.06] dark:bg-white/[0.06] dark:hover:bg-white/[0.1]'
                  }`}
                >
                  ط§ظ„ظƒظ„
                </button>
                {children.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setFilterChild(c.id)}
                    className={`whitespace-nowrap rounded-xl px-2.5 py-1.5 text-[10px] font-bold transition-all ${
                      filterChild === c.id
                        ? 'bg-gradient-to-l from-primary to-primary-deep text-on-primary shadow-sm dark:from-primary dark:to-accent'
                        : 'dark:text-main/40 border border-border bg-card text-muted hover:bg-surface dark:border-white/[0.06] dark:bg-white/[0.06] dark:hover:bg-white/[0.1]'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex-1">
              <Search
                className="dark:text-main/40 absolute start-3 top-1/2 -translate-y-1/2 text-muted"
                size={12}
              />
              <input
                aria-label="ط¨ط­ط«"
                placeholder="ط¨ط­ط«..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-border bg-card py-2 pe-3 ps-8 text-[10px] font-bold text-main outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-white/[0.06] dark:bg-white/[0.06] dark:text-main dark:placeholder:text-white/30"
              />
            </div>
          </div>
        </motion.div>

        {/* Desktop Table */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="dark:bg-card/80 hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm dark:border-white/[0.06] md:block"
        >
          <table className="w-full border-collapse text-start">
            <thead>
              <tr className="border-border/40 border-b bg-surface dark:border-white/[0.06] dark:bg-white/[0.04]">
                <th className="dark:text-main/40 px-4 py-3 text-start text-[8px] font-bold text-muted">
                  ط§ظ„ط§ط¨ظ†
                </th>
                <th className="dark:text-main/40 px-4 py-3 text-start text-[8px] font-bold text-muted">
                  ط§ظ„ط¨ظٹط§ظ†
                </th>
                <th className="dark:text-main/40 px-4 py-3 text-center text-[8px] font-bold text-muted">
                  ط§ظ„ظ…ط¨ظ„ط؛
                </th>
                <th className="dark:text-main/40 px-4 py-3 text-center text-[8px] font-bold text-muted">
                  ط§ظ„طھط§ط±ظٹط®
                </th>
                <th className="dark:text-main/40 px-4 py-3 text-center text-[8px] font-bold text-muted">
                  ط§ظ„ط§ط³طھط­ظ‚ط§ظ‚
                </th>
                <th className="dark:text-main/40 px-4 py-3 text-center text-[8px] font-bold text-muted">
                  ط§ظ„ط­ط§ظ„ط©
                </th>
              </tr>
            </thead>
            <tbody className="divide-border/40 divide-y dark:divide-white/[0.06]">
              <AnimatePresence>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv, i) => {
                    const status = statusConfig[inv.status]
                    const StatusIcon = status.icon
                    return (
                      <motion.tr
                        key={inv.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-surface/50 transition-colors dark:hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold text-main dark:text-main">
                            {inv.studentName}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold text-main dark:text-main">
                            {inv.description}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-[10px] font-bold tabular-nums text-main dark:text-main">
                          {inv.amount.toLocaleString()}{' '}
                          <span className="dark:text-main/40 text-[8px] text-muted">
                            {inv.currency || CURRENCY_SYMBOL}
                          </span>
                        </td>
                        <td className="dark:text-main/40 px-4 py-3 text-center text-[8px] text-muted">
                          {inv.date}
                        </td>
                        <td className="dark:text-main/40 px-4 py-3 text-center text-[8px] text-muted">
                          {inv.dueDate}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[8px] font-bold ${status.bgCls} ${status.textCls} ${status.borderCls}`}
                          >
                            <StatusIcon size={9} />
                            {status.label}
                          </span>
                        </td>
                      </motion.tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                        <FileText size={18} />
                      </div>
                      <p className="dark:text-main/40 text-[10px] font-bold text-muted">
                        {noResults
                          ? 'ظ„ط§ طھظˆط¬ط¯ ظ†طھط§ط¦ط¬ ظ…ط·ط§ط¨ظ‚ط©'
                          : 'ظ„ط§ طھظˆط¬ط¯ ظپظˆط§طھظٹط± ط¨ط¹ط¯'}
                      </p>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>

        {/* Mobile Cards */}
        <div className="space-y-2.5 md:hidden">
          <AnimatePresence>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv, i) => {
                const status = statusConfig[inv.status]
                const StatusIcon = status.icon
                return (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: i * 0.04 }}
                    className="dark:bg-card/80 rounded-2xl border border-border bg-card p-3.5 shadow-sm dark:border-white/[0.06]"
                  >
                    {/* Top Row */}
                    <div className="mb-2.5 flex items-center justify-between">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary-soft dark:bg-primary/10">
                          <Wallet size={11} className="text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-bold text-main dark:text-main">
                            {inv.description}
                          </p>
                          <p className="dark:text-main/40 flex items-center gap-1 text-[7px] text-muted">
                            <Users size={8} />
                            {inv.studentName}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-lg border px-2 py-0.5 text-[8px] font-bold ${status.bgCls} ${status.textCls} ${status.borderCls}`}
                      >
                        <StatusIcon size={8} />
                        {status.label}
                      </span>
                    </div>
                    {/* Bottom Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="dark:text-main/40 mb-0.5 text-[7px] font-bold text-muted">
                            ط§ظ„ظ…ط¨ظ„ط؛
                          </p>
                          <span className="font-mono text-xs font-bold tabular-nums text-main dark:text-main">
                            {inv.amount.toLocaleString()}{' '}
                            <span className="dark:text-main/40 text-[8px] text-muted">
                              {inv.currency || CURRENCY_SYMBOL}
                            </span>
                          </span>
                        </div>
                        <div className="bg-border/40 h-5 w-px dark:bg-white/10" />
                        <div>
                          <p className="dark:text-main/40 mb-0.5 text-[7px] font-bold text-muted">
                            ط§ظ„ط§ط³طھط­ظ‚ط§ظ‚
                          </p>
                          <span className="dark:text-main/40 text-[8px] text-muted">
                            {inv.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div className="dark:bg-card/80 rounded-2xl border border-dashed border-border bg-card py-16 text-center dark:border-white/[0.06]">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary dark:bg-primary/10">
                  <FileText size={18} />
                </div>
                <p className="dark:text-main/40 text-[10px] font-bold text-muted">
                  {noResults
                    ? 'ظ„ط§ طھظˆط¬ط¯ ظ†طھط§ط¦ط¬ ظ…ط·ط§ط¨ظ‚ط©'
                    : 'ظ„ط§ طھظˆط¬ط¯ ظپظˆط§طھظٹط± ط¨ط¹ط¯'}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default ParentPaymentHistory

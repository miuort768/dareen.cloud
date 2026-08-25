import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Wallet,
  BarChart3,
  Filter,
  DollarSign,
} from 'lucide-react'
import { api } from '../lib/api'
import { useCurrentUser, useShowNotification, useAcademyName } from '../context/AppContext'
import { type TeacherInvoice, INVOICE_STATUS, normalizeInvoiceStatus } from '../types/invoice'
import { Skeleton } from '../shared/components/ui'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { CURRENCY_SYMBOL } from '../config/constants'
import { cn } from '../lib/utils'

const particles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 5 + 2,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 3,
}))

const statusConfig = (status: string) => {
  switch (normalizeInvoiceStatus(status)) {
    case INVOICE_STATUS.PAID:
      return {
        label: 'مدفوعة',
        icon: CheckCircle,
        cls: 'bg-success/10 text-success border-success/20',
      }
    case INVOICE_STATUS.PROCESSING:
      return {
        label: 'قيد المعالجة',
        icon: Clock,
        cls: 'bg-warning/10 text-warning border-warning/20',
      }
    case INVOICE_STATUS.REVIEWED:
      return {
        label: 'تمت المراجعة',
        icon: AlertTriangle,
        cls: 'bg-info/10 text-info border-info/20',
      }
    default:
      return {
        label: 'غير مدفوعة',
        icon: AlertTriangle,
        cls: 'bg-error/10 text-error border-error/20',
      }
  }
}

export const TeacherPaymentHistory = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `سجل الدفعات | ${academyName}`
  }, [academyName])
  const currentUser = useCurrentUser()
  const showNotification = useShowNotification()
  const [invoices, setInvoices] = useState<TeacherInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [period, setPeriod] = useState('all')
  const [fabOpen, setFabOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fetch = async () => {
      try {
        setLoading(true)
        const data = await api.get<TeacherInvoice[]>('/invoices/me/teacher')
        if (cancelled) return
        const all = Array.isArray(data) ? data : (data as { data?: TeacherInvoice[] }).data || []
        const teacherName = currentUser?.teacherName || currentUser?.name || ''
        const mine = all.filter(
          (inv) =>
            (inv.teacherId && inv.teacherId === currentUser?.id) ||
            (inv.teacher && inv.teacher.trim().toLowerCase() === teacherName.trim().toLowerCase()),
        )
        setInvoices(mine.map((inv) => ({ ...inv, id: String(inv.id) })))
      } catch (error) {
        console.error('Error fetching invoices:', error)
        if (!cancelled) showNotification('فشل تحميل سجل الدفعات', 'error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch()
    return () => {
      cancelled = true
    }
  }, [currentUser?.id, currentUser?.teacherName, currentUser?.name, showNotification])

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((inv) => {
        const matchesSearch =
          inv.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.specialization.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'all' || inv.status === filterStatus
        const matchesPeriod =
          period === 'all' ||
          (() => {
            const d = new Date(inv.date)
            const now = new Date()
            if (isNaN(d.getTime())) return true
            if (period === 'year') return d.getFullYear() === now.getFullYear()
            if (period === 'quarter')
              return (
                d.getFullYear() === now.getFullYear() &&
                Math.floor(d.getMonth() / 3) === Math.floor(now.getMonth() / 3)
              )
            if (period === 'month')
              return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
            return true
          })()
        return matchesSearch && matchesStatus && matchesPeriod
      }),
    [invoices, searchTerm, filterStatus, period],
  )

  const stats = useMemo(() => {
    const result = { total: 0, paid: 0, processing: 0, overdue: 0, unpaid: 0 }
    invoices.forEach((inv) => {
      result.total += inv.amount
      const s = normalizeInvoiceStatus(inv.status)
      if (s === INVOICE_STATUS.PAID) result.paid += inv.amount
      else if (s === INVOICE_STATUS.PROCESSING) result.processing += inv.amount
      else result.unpaid += inv.amount
    })
    return result
  }, [invoices])

  const paidCount = useMemo(
    () => invoices.filter((i) => normalizeInvoiceStatus(i.status) === INVOICE_STATUS.PAID).length,
    [invoices],
  )
  const pendingCount = useMemo(
    () =>
      invoices.filter((i) => normalizeInvoiceStatus(i.status) === INVOICE_STATUS.PROCESSING).length,
    [invoices],
  )
  const overdueCount = useMemo(
    () =>
      invoices.filter((i) => {
        const s = normalizeInvoiceStatus(i.status)
        return s !== INVOICE_STATUS.PAID && s !== INVOICE_STATUS.PROCESSING
      }).length,
    [invoices],
  )

  const kpiCards = useMemo(
    () => [
      {
        label: 'إجمالي الفواتير',
        value: invoices.length,
        icon: DollarSign,
        gradient: 'from-primary/20 to-primary/5',
        iconBg: 'bg-primary/10 text-primary',
        accent: 'bg-primary',
      },
      {
        label: 'مدفوعة',
        value: paidCount,
        icon: CheckCircle,
        gradient: 'from-success/20 to-success/5',
        iconBg: 'bg-success/10 text-success',
        accent: 'bg-success',
      },
      {
        label: 'قيد المعالجة',
        value: pendingCount,
        icon: Clock,
        gradient: 'from-warning/20 to-warning/5',
        iconBg: 'bg-warning/10 text-warning',
        accent: 'bg-warning',
      },
      {
        label: 'غير مدفوعة',
        value: overdueCount,
        icon: AlertTriangle,
        gradient: 'from-error/20 to-error/5',
        iconBg: 'bg-error/10 text-error',
        accent: 'bg-error',
      },
    ],
    [invoices.length, paidCount, pendingCount, overdueCount],
  )

  const periodOptions = useMemo(
    () => [
      { value: 'all', label: 'جميع الفترات' },
      { value: 'month', label: 'شهري' },
      { value: 'quarter', label: 'ربع سنوي' },
      { value: 'year', label: 'سنوي' },
    ],
    [],
  )

  const fabActions = useMemo(
    () => [
      {
        icon: BarChart3,
        label: 'إحصائيات',
        onClick: () => document.querySelector('[data-kpi]')?.scrollIntoView({ behavior: 'smooth' }),
      },
      {
        icon: Filter,
        label: 'تصفية',
        onClick: () =>
          document.querySelector('[data-search]')?.scrollIntoView({ behavior: 'smooth' }),
      },
    ],
    [],
  )

  if (loading) {
    return (
      <div className="min-h-full overflow-x-hidden pb-24" dir="rtl">
        <div className="mx-auto max-w-page space-y-4 px-2 pt-4">
          <Skeleton className="h-36 rounded-2xl" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-full overflow-x-hidden pb-24" dir="rtl">
      <div className="mx-auto max-w-page px-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-6 md:p-8"
        >
          {particles.map((p) => (
            <motion.div
              key={p.id}
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
                <div className="rounded-xl bg-white/15 p-2 backdrop-blur-sm">
                  <Wallet className="text-white" size={20} />
                </div>
                <span className="text-xs font-medium text-white/70">المالية</span>
              </div>
              <h1 className="mb-1 text-2xl font-bold text-on-primary md:text-3xl">سجل الدفعات</h1>
              <p className="text-sm text-white/70">سجل المدفوعات والمستحقات المالية</p>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-center">
                <p className="mb-1 text-xs text-white/60">الإجمالي</p>
                <p className="text-2xl font-bold tabular-nums text-white">
                  {stats.total.toFixed(3)}
                </p>
                <p className="text-[10px] text-white/50">{CURRENCY_SYMBOL}</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <p className="mb-1 text-xs text-white/60">الفاتورة</p>
                <p className="text-lg font-bold text-white">{paidCount}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          data-kpi
        >
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
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
                    'border-border/50 relative overflow-hidden rounded-xl border bg-gradient-to-br p-4',
                    kpi.gradient,
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn('rounded-lg p-2', kpi.iconBg)}>
                      <Icon size={16} />
                    </div>
                    <div className={cn('h-1 w-12 rounded-full', kpi.accent)} />
                  </div>
                  <p className="mb-1 text-xs text-muted">{kpi.label}</p>
                  <p className="text-2xl font-bold tabular-nums text-main">{kpi.value}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          data-search
        >
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
              <input
                aria-label="بحث"
                placeholder="بحث بالتخصص..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-border bg-card py-3 pe-3 ps-9 text-xs font-bold text-main transition-all placeholder:text-muted focus:border-primary focus:outline-none"
              />
            </div>
            <div className="relative">
              <Filter className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="تصفية"
                className="w-full cursor-pointer appearance-none rounded-xl border border-border bg-card py-3 pe-3 ps-9 text-xs font-bold text-main transition-all focus:border-primary focus:outline-none"
              >
                <option value="all">جميع الحالات</option>
                <option value={INVOICE_STATUS.PAID}>مدفوعة</option>
                <option value={INVOICE_STATUS.PROCESSING}>قيد المعالجة</option>
                <option value={INVOICE_STATUS.REVIEWED}>تمت المراجعة</option>
                <option value={INVOICE_STATUS.UNPAID}>غير مدفوعة</option>
              </select>
            </div>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1 text-[10px] font-bold text-muted">الفترة</p>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl border border-border bg-card py-3 pe-3 ps-3 text-xs font-bold text-main transition-all focus:border-primary focus:outline-none"
              >
                {periodOptions.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <button
                onClick={() => window.print()}
                className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-on-primary transition-all"
              >
                طباعة
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="border-border/30 hidden overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md md:block">
            <table className="w-full border-collapse text-start">
              <thead>
                <tr className="bg-surface/50 border-border/30 border-b">
                  <th className="px-5 py-3.5 text-start text-[10px] font-bold text-muted">
                    التخصص
                  </th>
                  <th className="px-5 py-3.5 text-center text-[10px] font-bold text-muted">
                    المبلغ
                  </th>
                  <th className="px-5 py-3.5 text-center text-[10px] font-bold text-muted">
                    طريقة الدفع
                  </th>
                  <th className="px-5 py-3.5 text-center text-[10px] font-bold text-muted">
                    التاريخ
                  </th>
                  <th className="px-5 py-3.5 text-center text-[10px] font-bold text-muted">
                    الحالة
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border/20 divide-y">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv) => {
                    const status = statusConfig(inv.status)
                    const StatusIcon = status.icon
                    return (
                      <tr key={inv.id} className="hover:bg-surface/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-bold text-main">
                            {inv.specialization || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center font-mono text-xs font-bold tabular-nums text-main">
                          {inv.amount.toFixed(3)}{' '}
                          <span className="text-[9px] text-muted">{CURRENCY_SYMBOL}</span>
                        </td>
                        <td className="px-5 py-3.5 text-center text-[10px] text-muted">
                          {inv.paymentMethod || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-center text-[10px] text-muted">
                          {inv.date
                            ? format(new Date(inv.date), 'dd MMM yyyy', { locale: ar })
                            : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-bold ${status.cls}`}
                          >
                            <StatusIcon size={10} />
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                        <FileText size={20} />
                      </div>
                      <p className="text-xs font-bold text-muted">
                        {searchTerm || filterStatus !== 'all'
                          ? 'لا توجد نتائج مطابقة'
                          : 'لا توجد دفعات بعد'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv, i) => {
                const status = statusConfig(inv.status)
                const StatusIcon = status.icon
                return (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-border/30 rounded-2xl border bg-card p-4 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
                          <Wallet size={13} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-main">
                            {inv.specialization || 'بدون تخصص'}
                          </p>
                          <p className="text-[10px] text-muted">
                            {inv.date
                              ? format(new Date(inv.date), 'dd MMM yyyy', { locale: ar })
                              : '—'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-bold ${status.cls}`}
                      >
                        <StatusIcon size={10} />
                        {status.label}
                      </span>
                    </div>
                    <div className="border-border/20 flex items-center justify-between border-t pt-3">
                      <div className="flex items-center gap-2">
                        <DollarSign size={12} className="text-muted" />
                        <span className="font-mono text-sm font-bold tabular-nums text-main">
                          {inv.amount.toFixed(3)}{' '}
                          <span className="text-[9px] text-muted">{CURRENCY_SYMBOL}</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-muted">{inv.paymentMethod || '—'}</span>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div className="border-border/30 rounded-2xl border border-dashed bg-card py-16 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <FileText size={20} />
                </div>
                <p className="text-xs font-bold text-muted">
                  {searchTerm || filterStatus !== 'all'
                    ? 'لا توجد نتائج مطابقة'
                    : 'لا توجد دفعات بعد'}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {fabOpen &&
            fabActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.3, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.3, y: 20 }}
                transition={{ delay: 0.05 * (fabActions.length - 1 - i) }}
                className="flex items-center gap-2"
              >
                <span className="whitespace-nowrap rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold shadow-sm">
                  {action.label}
                </span>
                <button
                  onClick={() => {
                    action.onClick()
                    setFabOpen(false)
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl"
                >
                  <action.icon size={18} />
                </button>
              </motion.div>
            ))}
        </AnimatePresence>
        <motion.button
          onClick={() => setFabOpen(!fabOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg text-on-primary shadow-xl transition-all',
            fabOpen ? 'rotate-45 bg-error' : 'bg-primary',
          )}
        >
          <Wallet size={22} />
        </motion.button>
      </div>
    </div>
  )
}

export default TeacherPaymentHistory

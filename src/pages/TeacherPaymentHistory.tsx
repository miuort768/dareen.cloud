import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileCheck,
  FileText,
  Wallet,
  BarChart3,
  Filter,
  DollarSign,
  Printer,
} from 'lucide-react'
import { api } from '../lib/api'
import { useCurrentUser, useShowNotification, useAcademyName } from '../context/AppContext'
import { type TeacherInvoice, INVOICE_STATUS, normalizeInvoiceStatus } from '../types/invoice'
import { Skeleton } from '../shared/components/ui'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { CURRENCY_SYMBOL } from '../config/constants'
import { cn } from '../lib/utils'

const statusConfig = (status: string) => {
  switch (normalizeInvoiceStatus(status)) {
    case INVOICE_STATUS.PAID:
      return {
        label: 'مدفوعة',
        icon: CheckCircle,
        cls: 'bg-success-soft text-success border-success-soft',
      }
    case INVOICE_STATUS.PROCESSING:
      return {
        label: 'قيد المعالجة',
        icon: Clock,
        cls: 'bg-warning-soft text-warning border-warning-soft',
      }
    case INVOICE_STATUS.REVIEWED:
      return {
        label: 'تمت المراجعة',
        icon: FileCheck,
        cls: 'bg-info-soft text-info border-info-soft',
      }
    default:
      return {
        label: 'غير مدفوعة',
        icon: AlertTriangle,
        cls: 'bg-error-soft text-error border-error-soft',
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
        const q = searchTerm.trim().toLowerCase()
        const matchesSearch =
          !q ||
          (inv.specialization || '').toLowerCase().includes(q) ||
          (inv.paymentMethod || '').toLowerCase().includes(q) ||
          String(inv.amount || '').includes(q)
        const matchesStatus =
          filterStatus === 'all' || normalizeInvoiceStatus(inv.status) === filterStatus
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
    const result = { total: 0, paid: 0, processing: 0, unpaid: 0 }
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
        gradient: 'from-success-soft to-transparent',
        iconBg: 'bg-success-soft text-success',
        accent: 'bg-success',
      },
      {
        label: 'قيد المعالجة',
        value: pendingCount,
        icon: Clock,
        gradient: 'from-warning-soft to-transparent',
        iconBg: 'bg-warning-soft text-warning',
        accent: 'bg-warning',
      },
      {
        label: 'غير مدفوعة',
        value: overdueCount,
        icon: AlertTriangle,
        gradient: 'from-error-soft to-transparent',
        iconBg: 'bg-error-soft text-error',
        accent: 'bg-error',
      },
    ],
    [invoices.length, paidCount, pendingCount, overdueCount],
  )

  const periodOptions = useMemo(
    () => [
      { value: 'all', label: 'جميع الفترات' },
      { value: 'month', label: 'هذا الشهر' },
      { value: 'quarter', label: 'هذا الربع' },
      { value: 'year', label: 'هذه السنة' },
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
      <div
        className="from-primary-soft/40 min-h-full overflow-x-hidden bg-gradient-to-b via-background to-background pb-24"
        dir="rtl"
      >
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
    <div
      className="from-primary-soft/40 relative min-h-full overflow-x-hidden bg-gradient-to-b via-background to-background pb-24"
      dir="rtl"
    >
      <div className="mx-auto max-w-page px-2">
        {/* Hero — internally divided: identity | stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative mb-4 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"
        >
          <div className="pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="bg-success/10 pointer-events-none absolute -bottom-20 -start-16 h-48 w-48 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
                <Wallet size={22} className="text-on-primary" />
              </div>
              <div>
                <h1 className="text-xl font-black leading-tight text-main">سجل الدفعات</h1>
                <p className="mt-0.5 text-xs text-muted">سجل المدفوعات والمستحقات المالية</p>
              </div>
            </div>

            <div className="hidden h-12 w-px bg-border lg:block" />

            <div className="grid flex-1 grid-cols-2 gap-2">
              <div className="rounded-xl border border-border bg-surface px-3 py-2.5 text-center">
                <p className="text-lg font-black tabular-nums leading-none text-primary">
                  {stats.total.toFixed(3)}
                </p>
                <p className="mt-1 text-[10px] font-bold text-muted">الإجمالي {CURRENCY_SYMBOL}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface px-3 py-2.5 text-center">
                <p className="text-lg font-black tabular-nums leading-none text-success">
                  {paidCount}
                </p>
                <p className="mt-1 text-[10px] font-bold text-muted">فواتير مدفوعة</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* KPI cards */}
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
                    'relative overflow-hidden rounded-xl border border-border bg-gradient-to-br p-4',
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

        {/* Toolbar — search + filters + print in one organized card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          data-search
        >
          <div className="mb-4 space-y-3 rounded-2xl border border-border bg-card p-3.5">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
              <input
                aria-label="بحث"
                placeholder="بحث بالتخصص أو طريقة الدفع أو المبلغ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-surface pe-3 ps-9 text-xs font-bold text-main transition-all placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <div className="relative">
                <Filter
                  className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted"
                  size={14}
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  aria-label="تصفية حسب الحالة"
                  className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-border bg-surface pe-3 ps-9 text-xs font-bold text-main transition-all focus-visible:border-primary focus-visible:outline-none"
                >
                  <option value="all">جميع الحالات</option>
                  <option value={INVOICE_STATUS.PAID}>مدفوعة</option>
                  <option value={INVOICE_STATUS.PROCESSING}>قيد المعالجة</option>
                  <option value={INVOICE_STATUS.REVIEWED}>تمت المراجعة</option>
                  <option value={INVOICE_STATUS.UNPAID}>غير مدفوعة</option>
                </select>
              </div>
              <div className="relative">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  aria-label="تصفية حسب الفترة"
                  className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-border bg-surface px-3 text-xs font-bold text-main transition-all focus-visible:border-primary focus-visible:outline-none"
                >
                  {periodOptions.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => window.print()}
                className="col-span-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-on-primary transition-all hover:bg-primary-hover active:scale-[0.98] lg:col-span-1"
              >
                <Printer size={14} /> طباعة
              </button>
            </div>
          </div>
        </motion.div>

        {/* Table (desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="hidden overflow-hidden rounded-2xl border border-divider bg-card shadow-sm md:block">
            <table className="w-full border-collapse text-start">
              <thead>
                <tr className="border-b border-divider bg-surface">
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
              <tbody className="divide-y divide-divider">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv) => {
                    const status = statusConfig(inv.status)
                    const StatusIcon = status.icon
                    return (
                      <tr key={inv.id} className="transition-colors hover:bg-surface">
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
                        {searchTerm || filterStatus !== 'all' || period !== 'all'
                          ? 'لا توجد نتائج مطابقة'
                          : 'لا توجد دفعات بعد'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Cards (mobile) */}
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
                    className="rounded-2xl border border-divider bg-card p-4 shadow-sm transition-all hover:shadow-md"
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
                    <div className="flex items-center justify-between border-t border-divider pt-3">
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
              <div className="rounded-2xl border border-dashed border-divider bg-card py-16 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <FileText size={20} />
                </div>
                <p className="text-xs font-bold text-muted">
                  {searchTerm || filterStatus !== 'all' || period !== 'all'
                    ? 'لا توجد نتائج مطابقة'
                    : 'لا توجد دفعات بعد'}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* FAB — mobile only */}
      <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3 md:hidden">
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
          aria-label={fabOpen ? 'إغلاق' : 'إجراءات سريعة'}
          aria-expanded={fabOpen}
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

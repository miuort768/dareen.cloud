import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Search, Receipt, CheckCircle, Clock, AlertCircle, Printer, Eye, X } from 'lucide-react'
import { api } from '../lib/api'
import { useCurrentUser, useAcademyName } from '../context/AppContext'
import { Skeleton, Table, PageHeader } from '../shared/components/ui'
import type { Column } from '../shared/components/ui'
import { CURRENCY_SYMBOL } from '../config/constants'
import { cn } from '../lib/utils'
import { normalizeInvoiceStatus, INVOICE_STATUS_LABEL, type InvoiceStatus } from '../types/invoice'

interface StudentInvoice {
  id: string
  studentId: string
  studentName?: string
  amount: number
  description?: string
  date: string
  dueDate?: string
  status: string
  currency?: string
}

interface StatusConfig {
  label: string
  icon: typeof CheckCircle
  color: string
  bg: string
}

const statusConfig: Record<InvoiceStatus, StatusConfig> = {
  paid: {
    label: INVOICE_STATUS_LABEL.paid,
    icon: CheckCircle,
    color: 'text-success',
    bg: 'bg-success-soft',
  },
  pending: {
    label: INVOICE_STATUS_LABEL.pending,
    icon: Clock,
    color: 'text-warning',
    bg: 'bg-warning-soft',
  },
  reviewed: {
    label: INVOICE_STATUS_LABEL.reviewed,
    icon: Eye,
    color: 'text-info',
    bg: 'bg-info-soft',
  },
  overdue: {
    label: INVOICE_STATUS_LABEL.overdue,
    icon: AlertCircle,
    color: 'text-error',
    bg: 'bg-error-soft',
  },
  partially_paid: {
    label: INVOICE_STATUS_LABEL.partially_paid,
    icon: CheckCircle,
    color: 'text-primary',
    bg: 'bg-primary-soft',
  },
  unpaid: {
    label: INVOICE_STATUS_LABEL.unpaid,
    icon: AlertCircle,
    color: 'text-error',
    bg: 'bg-error-soft',
  },
}

const money = (v: unknown): number => Number(v) || 0

const formatDate = (raw?: string | null): string => {
  if (!raw) return '—'
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  return format(d, 'd MMM yyyy', { locale: ar })
}

export const StudentInvoices = () => {
  const academyName = useAcademyName()
  const isAdmin = useCurrentUser()?.role === 'admin'
  useEffect(() => {
    document.title = `${isAdmin ? 'فواتير الطلاب' : 'فواتيري'} | ${academyName}`
  }, [academyName, isAdmin])
  const currentUser = useCurrentUser()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | InvoiceStatus>('all')

  // /invoices/me/student is role-aware: students get their own invoices,
  // parents their children's, admins the full list (server-side scoping).
  const { data: invoices = [], isLoading: loading } = useQuery<StudentInvoice[]>({
    queryKey: ['student-invoices', currentUser?.role],
    queryFn: async () => {
      const data = await api.get<StudentInvoice[]>('/invoices/me/student')
      return Array.isArray(data) ? data : []
    },
    enabled: !!currentUser,
  })

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((inv) => {
        const haystack = `${inv.description ?? ''} ${inv.studentName ?? ''}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
        const matchesStatus =
          filterStatus === 'all' || normalizeInvoiceStatus(inv.status) === filterStatus
        return haystack && matchesStatus
      }),
    [invoices, searchTerm, filterStatus],
  )

  // Currency policy: admin scope sums EGP only; student/parent scope sums the
  // dominant currency of their own invoices. Other currencies are excluded from
  // totals (warning shown) and remain visible in the list.
  const { primaryCurrency, mixedCount, scopedInvoices } = useMemo(() => {
    const byCur: Record<string, number> = {}
    invoices.forEach((inv) => {
      const c = inv.currency || 'EGP'
      byCur[c] = (byCur[c] || 0) + (Number(inv.amount) || 0)
    })
    const entries = Object.entries(byCur).sort((a, b) => b[1] - a[1])
    const target = isAdmin ? 'EGP' : entries[0]?.[0] || 'EGP'
    const scoped = invoices.filter((inv) => (inv.currency || 'EGP') === target)
    return {
      primaryCurrency: target,
      mixedCount: invoices.length - scoped.length,
      scopedInvoices: scoped,
    }
  }, [invoices, isAdmin])

  const stats = useMemo(() => {
    const normalized = scopedInvoices.map((inv) => ({
      ...inv,
      norm: normalizeInvoiceStatus(inv.status),
    }))
    const sum = (s: InvoiceStatus) =>
      normalized.filter((i) => i.norm === s).reduce((acc, i) => acc + (Number(i.amount) || 0), 0)
    const count = (s: InvoiceStatus) => normalized.filter((i) => i.norm === s).length
    return {
      total: normalized.reduce((acc, i) => acc + (Number(i.amount) || 0), 0),
      paid: sum('paid'),
      pending: sum('pending'),
      overdue: sum('overdue'),
      paidCount: count('paid'),
      pendingCount: count('pending'),
      overdueCount: count('overdue'),
    }
  }, [scopedInvoices])

  const kpiCards = useMemo(
    () => [
      {
        label: 'مدفوعة',
        value: stats.paid,
        count: stats.paidCount,
        icon: CheckCircle,
        bg: 'bg-success-soft text-success-strong',
      },
      {
        label: 'معلقة',
        value: stats.pending,
        count: stats.pendingCount,
        icon: Clock,
        bg: 'bg-warning-soft text-warning-strong',
      },
      {
        label: 'متأخرة',
        value: stats.overdue,
        count: stats.overdueCount,
        icon: AlertCircle,
        bg: 'bg-error-soft text-error',
      },
    ],
    [stats],
  )

  const columns = useMemo<Column<StudentInvoice>[]>(() => {
    const cols: Column<StudentInvoice>[] = []
    if (isAdmin) {
      cols.push({
        key: 'studentName',
        header: 'الطالب',
        mobileLabel: 'الطالب',
        render: (inv) => (
          <span className="text-sm font-bold text-main">{inv.studentName || '—'}</span>
        ),
      })
    }
    cols.push(
      {
        key: 'description',
        header: 'البيان',
        mobileLabel: 'البيان',
        render: (inv) => (
          <span className="text-sm font-bold text-main">{inv.description || '—'}</span>
        ),
      },
      {
        key: 'amount',
        header: 'المبلغ',
        align: 'center',
        mobileLabel: 'المبلغ',
        render: (inv) => (
          <span className="text-sm font-bold tabular-nums text-main">
            {money(inv.amount).toLocaleString()}{' '}
            <span className="text-xs text-muted">{CURRENCY_SYMBOL}</span>
          </span>
        ),
      },
      {
        key: 'date',
        header: 'التاريخ',
        align: 'center',
        hideOnMobile: true,
        render: (inv) => <span className="text-xs text-muted">{formatDate(inv.date)}</span>,
      },
      {
        key: 'dueDate',
        header: 'الاستحقاق',
        align: 'center',
        mobileLabel: 'الاستحقاق',
        render: (inv) => {
          const norm = normalizeInvoiceStatus(inv.status)
          return (
            <span
              className={cn('text-xs', norm === 'overdue' ? 'font-bold text-error' : 'text-muted')}
            >
              {formatDate(inv.dueDate)}
            </span>
          )
        },
      },
      {
        key: 'status',
        header: 'الحالة',
        align: 'center',
        mobileLabel: 'الحالة',
        render: (inv) => {
          const status = statusConfig[normalizeInvoiceStatus(inv.status)]
          const Icon = status.icon
          return (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold',
                status.bg,
                status.color,
              )}
            >
              <Icon size={12} />
              {status.label}
            </span>
          )
        },
      },
    )
    return cols
  }, [isAdmin])

  if (loading) {
    return (
      <div
        className="from-primary-soft/40 min-h-full bg-gradient-to-b via-background to-background pb-8"
        dir="rtl"
      >
        <div className="mx-auto max-w-5xl space-y-4 px-2.5 pt-6 sm:px-6">
          <Skeleton className="h-28 rounded-2xl" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div
      className="from-primary-soft/40 min-h-full bg-gradient-to-b via-background to-background pb-8"
      dir="rtl"
    >
      <div className="mx-auto max-w-5xl px-2.5 sm:px-6">
        {/* Header — unified PageHeader pattern */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <PageHeader
            title={isAdmin ? 'فواتير الطلاب' : 'فواتيري'}
            subtitle="متابعة الرسوم والمدفوعات الدراسية"
            icon={<Receipt size={22} />}
            action={
              <button
                onClick={() => window.print()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary shadow-elevation-1 transition-all duration-normal hover:bg-primary-hover hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">طباعة</span>
              </button>
            }
            toolbar={
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search
                    className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted"
                    size={15}
                  />
                  <input
                    aria-label="بحث في الفواتير"
                    placeholder={isAdmin ? 'بحث بالبيان أو اسم الطالب...' : 'بحث بالبيان...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-surface pe-10 ps-10 text-xs font-bold text-main outline-none transition-all duration-normal focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted outline-none transition-colors hover:text-main focus-visible:ring-2 focus-visible:ring-focus"
                      aria-label="مسح البحث"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                  aria-label="تصفية حسب الحالة"
                  className="h-11 cursor-pointer appearance-none rounded-xl border border-border bg-surface px-4 text-xs font-bold text-main outline-none transition-all duration-normal hover:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
                >
                  <option value="all">الكل</option>
                  <option value="paid">مدفوعة</option>
                  <option value="pending">معلقة</option>
                  <option value="reviewed">تمت المراجعة</option>
                  <option value="overdue">متأخرة</option>
                  <option value="partially_paid">مدفوعة جزئيًا</option>
                  <option value="unpaid">غير مدفوعة</option>
                </select>
              </div>
            }
            meta={
              <span className="inline-flex items-center rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-bold tabular-nums text-muted">
                الإجمالي: {stats.total.toLocaleString()} {primaryCurrency}
              </span>
            }
          />
        </motion.div>

        {mixedCount > 0 && (
          <p className="mb-4 flex items-center gap-1.5 rounded-xl bg-warning-soft px-3 py-2 text-[11px] font-bold text-warning-strong">
            <AlertCircle size={13} className="shrink-0" />
            {mixedCount} فاتورة بعملة مختلفة غير مضممة في الإجماليات
          </p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
            {kpiCards.map((kpi, i) => {
              const Icon = kpi.icon
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.04 }}
                  whileHover={{ y: -2 }}
                  className="rounded-xl border border-border bg-card p-4 transition-all duration-normal hover:shadow-elevation-1"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={cn('flex h-9 w-9 items-center justify-center rounded-lg', kpi.bg)}
                    >
                      <Icon size={16} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold tabular-nums text-main">
                    {kpi.value.toLocaleString()}{' '}
                    <span className="text-xs text-muted">{primaryCurrency}</span>
                  </p>
                  <p className="mt-1 text-[11px] text-muted">
                    {kpi.label} · {kpi.count} فاتورة
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted"
                size={15}
              />
              <input
                aria-label="بحث في الفواتير"
                placeholder={isAdmin ? 'بحث بالبيان أو اسم الطالب...' : 'بحث بالبيان...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface py-3 pe-10 ps-10 text-xs font-bold text-main outline-none transition-all duration-normal focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted outline-none transition-colors hover:text-main focus-visible:ring-2 focus-visible:ring-focus"
                  aria-label="مسح البحث"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              aria-label="تصفية حسب الحالة"
              className="h-11 cursor-pointer appearance-none rounded-xl border border-border bg-surface px-4 text-xs font-bold text-main outline-none transition-all duration-normal hover:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
            >
              <option value="all">الكل</option>
              <option value="paid">مدفوعة</option>
              <option value="pending">معلقة</option>
              <option value="reviewed">تمت المراجعة</option>
              <option value="overdue">متأخرة</option>
              <option value="partially_paid">مدفوعة جزئيًا</option>
              <option value="unpaid">غير مدفوعة</option>
            </select>
          </div>
        </motion.div>

        {/* Data table — shared DataTable (desktop table + mobile cards) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Table<StudentInvoice>
            data={filteredInvoices}
            columns={columns}
            headerVariant="surface"
            getId={(inv) => inv.id}
            emptyMessage={
              searchTerm || filterStatus !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا توجد فواتير بعد'
            }
          />
        </motion.div>
      </div>
    </div>
  )
}

export default StudentInvoices

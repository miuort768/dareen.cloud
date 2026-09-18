import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  Search,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  Printer,
  Eye,
  X,
  Wallet,
} from 'lucide-react'
import { api } from '../lib/api'
import { useCurrentUser, useAcademyName } from '../context/AppContext'
import { Skeleton, Table, StatCard } from '../shared/components/ui'
import { GradientHeroCard } from '../shared/components/GradientHeroCard'
import type { Column } from '../shared/components/ui'
import { CURRENCY_SYMBOL } from '../config/constants'
import { cn } from '../lib/utils'
import {
  INVOICE_STATUS_META,
  INVOICE_STATUS_ORDER,
  normalizeInvoiceStatus,
  type InvoiceStatus,
} from '../types/invoice'

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

const statusIcons: Record<InvoiceStatus, typeof CheckCircle> = {
  paid: CheckCircle,
  pending: Clock,
  reviewed: Eye,
  overdue: AlertCircle,
  partially_paid: CheckCircle,
  unpaid: AlertCircle,
}

const money = (v: unknown): number => Number(v) || 0

const formatDate = (raw?: string | null): string => {
  if (!raw) return '—'
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  return format(d, 'd MMM yyyy', { locale: ar })
}

const periodOptions = [
  { value: 'all', label: 'جميع الفترات' },
  { value: 'month', label: 'هذا الشهر' },
  { value: 'quarter', label: 'هذا الربع' },
  { value: 'year', label: 'هذه السنة' },
] as const

type Period = (typeof periodOptions)[number]['value']

const selectCls =
  'h-11 cursor-pointer appearance-none rounded-xl border border-border bg-surface px-4 text-xs font-bold text-main outline-none transition-all duration-normal hover:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10'

export const StudentInvoices = () => {
  const academyName = useAcademyName()
  const isAdmin = useCurrentUser()?.role === 'admin'
  useEffect(() => {
    document.title = `${isAdmin ? 'فواتير الطلاب' : 'فواتيري'} | ${academyName}`
  }, [academyName, isAdmin])
  const currentUser = useCurrentUser()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | InvoiceStatus>('all')
  const [period, setPeriod] = useState<Period>('all')

  // /invoices/me/student is role-aware: students get their own invoices,
  // parents their children's, admins the full list (server-side scoping).
  const { data: invoices = [], isLoading: loading } = useQuery<StudentInvoice[]>({
    queryKey: ['student-invoices', currentUser?.role, period],
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
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
          })()
        return haystack && matchesStatus && matchesPeriod
      }),
    [invoices, searchTerm, filterStatus, period],
  )

  // Currency policy: admin scope sums EGP only; student scope sums the
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
      totalCount: normalized.length,
      paidCount: count('paid'),
      pendingCount: count('pending'),
      overdueCount: count('overdue'),
    }
  }, [scopedInvoices])

  const kpiCards = useMemo(
    () => [
      {
        title: 'الإجمالي',
        value: stats.total.toLocaleString(),
        unit: primaryCurrency,
        badge: `${stats.totalCount} فاتورة`,
        icon: Wallet,
        variant: 'soft-primary' as const,
      },
      {
        title: 'مدفوعة',
        value: stats.paid.toLocaleString(),
        unit: primaryCurrency,
        badge: `${stats.paidCount} فاتورة`,
        icon: CheckCircle,
        variant: 'soft-success' as const,
      },
      {
        title: 'معلقة',
        value: stats.pending.toLocaleString(),
        unit: primaryCurrency,
        badge: `${stats.pendingCount} فاتورة`,
        icon: Clock,
        variant: 'soft-warning' as const,
      },
      {
        title: 'متأخرة',
        value: stats.overdue.toLocaleString(),
        unit: primaryCurrency,
        badge: `${stats.overdueCount} فاتورة`,
        icon: AlertCircle,
        variant: 'soft-error' as const,
      },
    ],
    [stats, primaryCurrency],
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
          <span className="font-mono text-sm font-bold tabular-nums text-main">
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
          const norm = normalizeInvoiceStatus(inv.status)
          const meta = INVOICE_STATUS_META[norm]
          const Icon = statusIcons[norm]
          return (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold',
                meta.bgCls,
                meta.textCls,
              )}
            >
              <Icon size={12} />
              {meta.label}
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
        <div className="mx-auto max-w-page pt-1 sm:px-4">
          <Skeleton className="h-[150px] rounded-2xl" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
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
      <div className="mx-auto max-w-page pt-1 sm:px-4">
        {/* Hero — gradient hero like the schedule/attendance pages */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <GradientHeroCard
            icon={Receipt}
            title={isAdmin ? 'فواتير الطلاب' : 'فواتيري'}
            subtitle="متابعة الرسوم والمدفوعات الدراسية"
            end={
              <button
                onClick={() => window.print()}
                className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-3.5 text-xs font-bold text-on-primary shadow-elevation-1 outline-none backdrop-blur-sm transition-all hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">طباعة</span>
              </button>
            }
          />
        </motion.div>

        {/* Controls toolbar — search + filters in a neutral card below the hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="my-4 rounded-xl border border-border bg-card p-3 shadow-elevation-1 md:my-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative flex-1 sm:min-w-[180px]">
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
                className={selectCls}
              >
                <option value="all">الكل</option>
                {INVOICE_STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {INVOICE_STATUS_META[s].label}
                  </option>
                ))}
              </select>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
                aria-label="تصفية حسب الفترة"
                className={selectCls}
              >
                {periodOptions.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {mixedCount > 0 && (
          <p className="mb-4 flex items-center gap-1.5 rounded-xl bg-warning-soft px-3 py-2 text-[11px] font-bold text-warning-strong">
            <AlertCircle size={13} className="shrink-0" />
            {mixedCount} فاتورة بعملة مختلفة غير مضممة في الإجماليات
          </p>
        )}

        {/* KPI cards — colored StatCard strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kpiCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.04 }}
              >
                <StatCard
                  title={card.title}
                  value={card.value}
                  unit={card.unit}
                  badge={card.badge}
                  icon={card.icon}
                  variant={card.variant}
                  watermark
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Data table — shared DataTable (desktop table + mobile cards) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Table<StudentInvoice>
            data={filteredInvoices}
            columns={columns}
            headerVariant="surface"
            getId={(inv) => inv.id}
            emptyMessage={
              searchTerm || filterStatus !== 'all' || period !== 'all'
                ? 'لا توجد نتائج مطابقة'
                : 'لا توجد فواتير بعد'
            }
            mobileCard={(inv) => {
              const norm = normalizeInvoiceStatus(inv.status)
              const meta = INVOICE_STATUS_META[norm]
              const StatusIcon = statusIcons[norm]
              const overdue = norm === 'overdue'
              return (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                      <Receipt size={14} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-main">
                        {inv.studentName || inv.description || '—'}
                      </p>
                      <p className="truncate text-[10px] font-bold text-muted">
                        {inv.studentName ? inv.description : formatDate(inv.date)}
                      </p>
                      <p
                        className={cn(
                          'mt-0.5 text-[10px] font-bold',
                          overdue ? 'text-error' : 'text-muted',
                        )}
                      >
                        الاستحقاق: {formatDate(inv.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="font-mono text-sm font-black tabular-nums text-main">
                      {money(inv.amount).toLocaleString()}{' '}
                      <span className="text-[10px] font-bold text-muted">{CURRENCY_SYMBOL}</span>
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold',
                        meta.bgCls,
                        meta.textCls,
                      )}
                    >
                      <StatusIcon size={10} />
                      {meta.label}
                    </span>
                  </div>
                </div>
              )
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}

export default StudentInvoices

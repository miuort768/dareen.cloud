import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Wallet,
  Users,
  Eye,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useShowNotification, useIsLoading } from '../context/AppContext'
import { Skeleton, PageHeader, Table } from '../shared/components/ui'
import type { Column } from '../shared/components/ui'
import { cn } from '../lib/utils'
import { CURRENCY_SYMBOL } from '../config/constants'
import { INVOICE_STATUS, normalizeInvoiceStatus, type InvoiceStatus } from '../types/invoice'
import type { Student } from '../types'

interface StudentInvoiceData {
  id: string
  studentId: string
  studentName: string
  amount: number
  description: string
  date: string
  dueDate: string
  status: string
  currency?: string
  notes?: string
}

const statusConfig: Record<
  InvoiceStatus,
  {
    label: string
    icon: typeof CheckCircle
    textCls: string
    bgCls: string
  }
> = {
  paid: { label: 'مدفوعة', icon: CheckCircle, textCls: 'text-success', bgCls: 'bg-success-soft' },
  pending: { label: 'معلقة', icon: Clock, textCls: 'text-warning', bgCls: 'bg-warning-soft' },
  overdue: { label: 'متأخرة', icon: AlertCircle, textCls: 'text-error', bgCls: 'bg-error-soft' },
  reviewed: { label: 'تمت المراجعة', icon: Eye, textCls: 'text-info', bgCls: 'bg-info-soft' },
  partially_paid: {
    label: 'مدفوعة جزئياً',
    icon: CheckCircle,
    textCls: 'text-primary',
    bgCls: 'bg-primary-soft',
  },
  unpaid: { label: 'غير مدفوعة', icon: AlertCircle, textCls: 'text-error', bgCls: 'bg-error-soft' },
}

type FilterStatus = 'all' | 'paid' | 'pending' | 'overdue'

const STATUS_PILLS: { key: FilterStatus; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'paid', label: 'مدفوعة' },
  { key: 'pending', label: 'معلقة' },
  { key: 'overdue', label: 'متأخرة' },
]

const HeroSkeleton = () => (
  <div className="mx-auto max-w-page px-2.5 pt-4 sm:px-4">
    <Skeleton className="h-[150px] rounded-2xl" />
  </div>
)

const ListSkeleton = () => (
  <div className="space-y-2.5">
    {[1, 2, 3].map((i) => (
      <div key={i} className="rounded-2xl border border-border bg-card p-4 shadow-elevation-1">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-3 w-28 rounded-lg" />
          <Skeleton className="h-5 w-14 rounded-lg" />
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
    document.title = 'سجل الدفعات | ولي الأمر'
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
        if (!cancelled) showNotification('فشل تحميل سجل الدفعات', 'error')
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
        const q = searchTerm.trim().toLowerCase()
        const matchesSearch =
          !q ||
          (inv.description || '').toLowerCase().includes(q) ||
          (inv.studentName || '').toLowerCase().includes(q)
        const matchesStatus =
          filterStatus === 'all' || normalizeInvoiceStatus(inv.status) === filterStatus
        const matchesChild = filterChild === 'all' || inv.studentId === filterChild
        return matchesSearch && matchesStatus && matchesChild
      }),
    [invoices, searchTerm, filterStatus, filterChild],
  )

  // Family-scope currency policy: totals sum the DOMINANT currency only.
  // Invoices in other currencies are listed but excluded from sums (warning shown).
  const { primaryCurrency, mixedCount, scopedInvoices } = useMemo(() => {
    const byCur: Record<string, number> = {}
    invoices.forEach((i) => {
      const c = i.currency || 'EGP'
      byCur[c] = (byCur[c] || 0) + (Number(i.amount) || 0)
    })
    const entries = Object.entries(byCur).sort((a, b) => b[1] - a[1])
    const primary = entries[0]?.[0] || CURRENCY_SYMBOL
    const scoped = invoices.filter((i) => (i.currency || 'EGP') === primary)
    return {
      primaryCurrency: primary,
      mixedCount: invoices.length - scoped.length,
      scopedInvoices: scoped,
    }
  }, [invoices])

  const stats = useMemo(
    () => ({
      total: scopedInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0),
      paid: scopedInvoices
        .filter((i) => normalizeInvoiceStatus(i.status) === INVOICE_STATUS.PAID)
        .reduce((sum, i) => sum + (Number(i.amount) || 0), 0),
      pending: scopedInvoices
        .filter((i) => normalizeInvoiceStatus(i.status) === INVOICE_STATUS.PENDING)
        .reduce((sum, i) => sum + (Number(i.amount) || 0), 0),
      overdue: scopedInvoices
        .filter((i) => normalizeInvoiceStatus(i.status) === INVOICE_STATUS.OVERDUE)
        .reduce((sum, i) => sum + (Number(i.amount) || 0), 0),
      paidCount: scopedInvoices.filter(
        (i) => normalizeInvoiceStatus(i.status) === INVOICE_STATUS.PAID,
      ).length,
      pendingCount: scopedInvoices.filter(
        (i) => normalizeInvoiceStatus(i.status) === INVOICE_STATUS.PENDING,
      ).length,
      overdueCount: scopedInvoices.filter(
        (i) => normalizeInvoiceStatus(i.status) === INVOICE_STATUS.OVERDUE,
      ).length,
    }),
    [scopedInvoices],
  )

  const isEmpty = invoices.length === 0
  const noResults = filteredInvoices.length === 0 && !isEmpty

  const columns = useMemo<Column<StudentInvoiceData>[]>(
    () => [
      {
        key: 'studentName',
        header: 'الطالب',
        mobileLabel: 'الطالب',
        render: (inv) => (
          <span className="flex items-center gap-1.5 text-xs font-bold text-main">
            <Users size={11} className="shrink-0 text-muted" />
            {inv.studentName}
          </span>
        ),
      },
      {
        key: 'description',
        header: 'الوصف',
        mobileLabel: 'الوصف',
        render: (inv) => <span className="text-xs font-bold text-main">{inv.description}</span>,
      },
      {
        key: 'amount',
        header: 'المبلغ',
        align: 'center',
        mobileLabel: 'المبلغ',
        render: (inv) => (
          <span className="font-mono text-xs font-bold tabular-nums text-main">
            {(Number(inv.amount) || 0).toLocaleString()}{' '}
            <span className="text-[10px] text-muted">{CURRENCY_SYMBOL}</span>
          </span>
        ),
      },
      {
        key: 'date',
        header: 'التاريخ',
        align: 'center',
        hideOnMobile: true,
        render: (inv) => <span className="text-[11px] text-muted">{inv.date}</span>,
      },
      {
        key: 'status',
        header: 'الحالة',
        align: 'center',
        mobileLabel: 'الحالة',
        render: (inv) => {
          const status = statusConfig[normalizeInvoiceStatus(inv.status)]
          const StatusIcon = status.icon
          return (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold',
                status.bgCls,
                status.textCls,
              )}
            >
              <StatusIcon size={10} />
              {status.label}
            </span>
          )
        },
      },
      {
        key: 'dueDate',
        header: 'الاستحقاق',
        align: 'center',
        mobileLabel: 'الاستحقاق',
        render: (inv) => (
          <span
            className={cn(
              'text-[11px]',
              normalizeInvoiceStatus(inv.status) === INVOICE_STATUS.OVERDUE
                ? 'font-bold text-error'
                : 'text-muted',
            )}
          >
            {inv.dueDate}
          </span>
        ),
      },
    ],
    [],
  )

  if (authLoading || loading) {
    return (
      <div
        className="from-primary-soft/40 min-h-full overflow-x-hidden bg-gradient-to-b via-background to-background"
        dir="rtl"
      >
        <HeroSkeleton />
        <div className="mx-auto max-w-page space-y-4 px-2.5 pt-4 sm:px-4">
          <ListSkeleton />
        </div>
      </div>
    )
  }

  const statusCells = [
    {
      title: 'مدفوعة',
      value: stats.paid,
      count: stats.paidCount,
      icon: CheckCircle,
      cellBg: 'bg-success-soft',
      text: 'text-success',
    },
    {
      title: 'معلقة',
      value: stats.pending,
      count: stats.pendingCount,
      icon: Clock,
      cellBg: 'bg-warning-soft',
      text: 'text-warning',
    },
    {
      title: 'متأخرة',
      value: stats.overdue,
      count: stats.overdueCount,
      icon: AlertCircle,
      cellBg: 'bg-error-soft',
      text: 'text-error',
    },
  ]

  return (
    <div
      className="from-primary-soft/40 relative min-h-full overflow-x-hidden bg-gradient-to-b via-background to-background font-sans"
      dir="rtl"
    >
      <div className="mx-auto max-w-page space-y-4 px-2.5 pt-4 sm:px-4">
        {/* Header — unified PageHeader pattern */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <PageHeader
            title="سجل الدفعات"
            subtitle="متابعة فواتير ومستحقات أبنائك"
            icon={<Wallet size={22} />}
            action={
              <button
                onClick={() => navigate(-1)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted outline-none transition-all hover:bg-hover hover:text-main focus-visible:ring-2 focus-visible:ring-focus"
                aria-label="رجوع"
              >
                <ArrowLeft size={15} />
              </button>
            }
            meta={
              <span className="inline-flex items-center rounded-lg border border-primary-soft bg-primary-soft px-2.5 py-1 text-[11px] font-bold tabular-nums text-primary">
                الإجمالي: {stats.total.toLocaleString()} {primaryCurrency}
              </span>
            }
          />
        </motion.div>

        {/* Status breakdown — inline chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-2"
        >
          {statusCells.map((cell) => {
            const Icon = cell.icon
            return (
              <div
                key={cell.title}
                className="rounded-xl border border-border bg-surface px-3 py-2.5 text-center"
              >
                <p
                  className={cn(
                    'flex items-center justify-center gap-1 text-base font-black tabular-nums leading-none',
                    cell.text,
                  )}
                >
                  <Icon size={12} />
                  {cell.value.toLocaleString()}
                </p>
                <p className="mt-1 text-[10px] font-bold text-muted">
                  {cell.title} · {cell.count}
                </p>
              </div>
            )
          })}
        </motion.div>

        {mixedCount > 0 && (
          <p className="flex items-center gap-1.5 rounded-xl bg-warning-soft px-3 py-2 text-[11px] font-bold text-warning-strong">
            <AlertCircle size={13} className="shrink-0" />
            {mixedCount} فاتورة بعملة مختلفة غير مضممة في الإجماليات
          </p>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2.5"
        >
          <div className="flex flex-wrap gap-1.5">
            {STATUS_PILLS.map((pill) => {
              const active = filterStatus === pill.key
              return (
                <button
                  key={pill.key}
                  onClick={() => setFilterStatus(pill.key)}
                  className={cn(
                    'rounded-xl px-3.5 py-1.5 text-[11px] font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus',
                    active
                      ? 'bg-primary text-on-primary shadow-elevation-1'
                      : 'border border-border bg-card text-muted hover:bg-hover',
                  )}
                >
                  {pill.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            {children.length > 1 && (
              <div className="no-scrollbar flex shrink-0 gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setFilterChild('all')}
                  className={cn(
                    'whitespace-nowrap rounded-xl px-3 py-1.5 text-[11px] font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus',
                    filterChild === 'all'
                      ? 'bg-primary text-on-primary shadow-elevation-1'
                      : 'border border-border bg-card text-muted hover:bg-hover',
                  )}
                >
                  الكل
                </button>
                {children.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setFilterChild(c.id)}
                    className={cn(
                      'whitespace-nowrap rounded-xl px-3 py-1.5 text-[11px] font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus',
                      filterChild === c.id
                        ? 'bg-primary text-on-primary shadow-elevation-1'
                        : 'border border-border bg-card text-muted hover:bg-hover',
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={13} />
              <input
                aria-label="بحث"
                placeholder="بحث بالبيان أو اسم الطالب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-card py-2 pe-3 ps-9 text-[11px] font-bold text-main outline-none transition-all placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
              />
            </div>
          </div>
        </motion.div>

        {/* Data table — shared DataTable (desktop table + mobile cards) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Table<StudentInvoiceData>
            data={filteredInvoices}
            columns={columns}
            headerVariant="surface"
            getId={(inv) => inv.id}
            emptyMessage={noResults ? 'لا توجد نتائج مطابقة' : 'لا توجد فواتير بعد'}
          />
        </motion.div>
      </div>
    </div>
  )
}

export default ParentPaymentHistory

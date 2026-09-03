import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  FileText,
  Search,
  Filter,
  Receipt,
  Plus,
  Calendar,
  CreditCard,
} from 'lucide-react'
import { getCurrencySymbol, CURRENCY_SYMBOL } from '../../../config/constants'

interface Transaction {
  id: string | number
  type: 'income' | 'expense'
  category?: string
  description: string
  amount: number
  date: string
  currency?: string
  studentName?: string
  status?: string
  invoiceNumber?: string
  paymentMethod?: string
}

interface TransactionsLogProps {
  transactions: Transaction[]
  onPreviewInvoice?: (inv: string) => void
  onAddTransaction: () => void
  reportCurrency?: string
}

const PER_PAGE = 8

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  completed: { label: 'مكتمل', cls: 'bg-success-soft text-success border border-success-soft' },
  pending: { label: 'معلق', cls: 'bg-warning-soft text-warning border border-warning-soft' },
  cancelled: { label: 'ملغي', cls: 'bg-error-soft text-error border border-error-soft' },
}

const TransactionRow = ({
  t,
  onPreviewInvoice,
}: {
  t: Transaction
  onPreviewInvoice?: (inv: string) => void
}) => {
  const [expanded, setExpanded] = useState(false)
  const isIncome = t.type === 'income'
  const badge = t.status ? STATUS_BADGE[t.status] : null
  // Each row is displayed in its OWN currency — a 1 KWD session must never
  // render as "1 EGP" (1 KWD ≈ 164 EGP). Currency values are ISO codes.
  const rowCurrency = getCurrencySymbol(t.currency || 'EGP')

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
    >
      {/* Main row */}
      <div
        className="flex cursor-pointer items-center justify-between gap-3 p-3.5"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Avatar icon */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
              isIncome ? 'bg-success-soft text-success' : 'bg-error-soft text-error'
            }`}
          >
            {isIncome ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate text-xs font-bold text-main">{t.description}</h4>
              {t.category && (
                <span className="shrink-0 rounded-lg border border-border bg-surface px-2 py-0.5 text-[10px] font-bold text-muted">
                  {t.category}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-[10px] font-medium text-muted">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {t.date}
              </span>
              {t.studentName && (
                <>
                  <span>•</span>
                  <span className="truncate">{t.studentName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Amount & Status */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="text-end">
            <p
              className={`text-sm font-extrabold tabular-nums ${isIncome ? 'text-success' : 'text-error'}`}
            >
              {isIncome ? '+' : '-'}
              {(t.amount ?? 0).toLocaleString()} {rowCurrency}
            </p>
            {badge && (
              <span
                className={`mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold ${badge.cls}`}
              >
                {badge.label}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {t.invoiceNumber && onPreviewInvoice && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPreviewInvoice(t.invoiceNumber!)
                }}
                className="rounded-xl p-1.5 text-muted transition-all hover:bg-primary-soft hover:text-primary"
                title="عرض الفاتورة"
              >
                <Eye size={15} />
              </button>
            )}
            <div className="rounded-xl p-1.5 text-muted transition-all group-hover:text-main">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-divider bg-surface"
          >
            <div className="space-y-2 p-3.5 text-xs text-muted">
              {t.invoiceNumber && (
                <div className="flex items-center gap-2">
                  <FileText size={13} className="text-primary" />
                  <span>رقم الفاتورة:</span>
                  <span className="font-bold text-main">{t.invoiceNumber}</span>
                </div>
              )}
              {t.paymentMethod && (
                <div className="flex items-center gap-2">
                  <CreditCard size={13} className="text-primary" />
                  <span>طريقة الدفع:</span>
                  <span className="font-bold text-main">{t.paymentMethod}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Receipt size={13} className="text-primary" />
                <span>نوع المعاملة:</span>
                <span className="font-bold text-main">{isIncome ? 'إيراد' : 'مصروف'}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export const TransactionsLog = ({
  transactions,
  onPreviewInvoice,
  onAddTransaction,
  reportCurrency = CURRENCY_SYMBOL,
}: TransactionsLogProps) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesType = filterType === 'all' || t.type === filterType
      const matchesSearch =
        !searchQuery ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.studentName || '').toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [transactions, filterType, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paged = filtered.slice(0, page * PER_PAGE)

  const stats = useMemo(() => {
    // Sums only rows in the report currency — mixing KWD amounts into an EGP
    // total silently overstates/understates by the exchange factor.
    const inReport = (t: Transaction) => (t.currency || 'EGP') === reportCurrency
    const inc = filtered
      .filter((t) => t.type === 'income' && inReport(t))
      .reduce((s, t) => s + (t.amount || 0), 0)
    const exp = filtered
      .filter((t) => t.type === 'expense' && inReport(t))
      .reduce((s, t) => s + (t.amount || 0), 0)
    return { inc, exp }
  }, [filtered, reportCurrency])

  return (
    <div className="overflow-hidden rounded-none border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 border-b border-divider p-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
            <Receipt size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-main">سجل المعاملات المالية</h2>
            <p className="mt-0.5 text-xs text-muted">
              إجمالي <span className="font-bold text-main">{filtered.length}</span> معاملة مسجلة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddTransaction}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-on-primary shadow-sm transition-all hover:bg-primary-hover active:scale-95"
          >
            <Plus size={14} /> إضافة معاملة
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col items-center justify-between gap-3 border-b border-divider bg-surface p-3 sm:flex-row">
        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="بحث بالوصف، التصنيف، الطالب..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-xl border border-border bg-card py-2 pe-3 ps-8 text-xs font-bold text-main outline-none transition-all focus:border-primary focus:ring-2 focus:ring-focus"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex w-full items-center justify-center gap-1 rounded-xl border border-border bg-card p-1 sm:w-auto">
          <button
            onClick={() => {
              setFilterType('all')
              setPage(1)
            }}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'shadow-xs bg-primary text-on-primary'
                : 'text-muted hover:text-main'
            }`}
          >
            الكل ({transactions.length})
          </button>
          <button
            onClick={() => {
              setFilterType('income')
              setPage(1)
            }}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              filterType === 'income'
                ? 'shadow-xs bg-success text-on-success'
                : 'text-muted hover:text-main'
            }`}
          >
            إيرادات (+{stats.inc.toLocaleString()} {getCurrencySymbol(reportCurrency)})
          </button>
          <button
            onClick={() => {
              setFilterType('expense')
              setPage(1)
            }}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              filterType === 'expense'
                ? 'shadow-xs bg-error text-on-error'
                : 'text-muted hover:text-main'
            }`}
          >
            مصروفات (-{stats.exp.toLocaleString()} {getCurrencySymbol(reportCurrency)})
          </button>
        </div>
      </div>

      {/* Rows List */}
      <div className="space-y-2.5 p-4">
        {paged.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface py-12 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-muted">
              <Filter size={20} />
            </div>
            <p className="text-xs font-bold text-main">لا توجد معاملات مطابقة</p>
            <p className="mt-1 text-[10px] text-muted">جرب البحث بكلمات مختلفة أو تغيير الفلتر</p>
          </div>
        ) : (
          paged.map((t) => <TransactionRow key={t.id} t={t} onPreviewInvoice={onPreviewInvoice} />)
        )}
      </div>

      {/* Pagination / Load More */}
      {totalPages > 1 && page < totalPages && (
        <div className="px-4 pb-4 pt-0">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="w-full rounded-xl border border-primary/20 bg-primary-soft py-2.5 text-xs font-bold text-primary transition-all hover:bg-primary/15 active:scale-[0.99]"
          >
            عرض المزيد ({filtered.length - page * PER_PAGE} متبقي)
          </button>
        </div>
      )}
    </div>
  )
}

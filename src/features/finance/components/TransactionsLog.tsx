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
import { CURRENCY_SYMBOL } from '../../../config/constants'

interface Transaction {
  id: string | number
  type: 'income' | 'expense'
  category?: string
  description: string
  amount: number
  date: string
  studentName?: string
  status?: 'pending' | 'completed' | 'cancelled'
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
  completed: { label: 'مكتمل', cls: 'bg-success/10 text-success border border-success/20' },
  pending: { label: 'معلق', cls: 'bg-warning/10 text-warning border border-warning/20' },
  cancelled: { label: 'ملغي', cls: 'bg-error/10 text-error border border-error/20' },
}

const TransactionRow = ({
  t,
  onPreviewInvoice,
  currency = CURRENCY_SYMBOL,
}: {
  t: Transaction
  onPreviewInvoice?: (inv: string) => void
  currency?: string
}) => {
  const [expanded, setExpanded] = useState(false)
  const isIncome = t.type === 'income'
  const badge = t.status ? STATUS_BADGE[t.status] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-border/60 hover:border-primary/40 group relative overflow-hidden rounded-2xl border bg-card transition-all shadow-sm hover:shadow-md"
    >
      {/* Main row */}
      <div
        className="flex cursor-pointer items-center justify-between gap-3 p-3.5"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Avatar icon */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
              isIncome ? 'bg-success/15 text-success' : 'bg-error/15 text-error'
            }`}
          >
            {isIncome ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate text-xs font-bold text-main">{t.description}</h4>
              {t.category && (
                <span className="shrink-0 rounded-lg bg-surface border border-border/50 px-2 py-0.5 text-[10px] font-bold text-muted">
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
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-end">
            <p className={`text-sm font-extrabold tabular-nums ${isIncome ? 'text-success' : 'text-error'}`}>
              {isIncome ? '+' : '-'}
              {(t.amount ?? 0).toLocaleString()} {currency}
            </p>
            {badge && (
              <span className={`mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold ${badge.cls}`}>
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
            className="overflow-hidden bg-surface/50 border-t border-border/40"
          >
            <div className="p-3.5 space-y-2 text-xs text-muted">
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
    const inc = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0)
    const exp = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0)
    return { inc, exp }
  }, [filtered])

  return (
    <div className="border-border/60 overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Header */}
      <div className="border-border/40 flex flex-col justify-between gap-3 border-b p-4 md:flex-row md:items-center">
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
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-on-primary transition-all hover:bg-primary-hover active:scale-95 shadow-sm"
          >
            <Plus size={14} /> إضافة معاملة
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="border-b border-border/40 bg-surface/50 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
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
            className="w-full rounded-xl border border-border bg-card py-2 pe-3 ps-8 text-xs font-bold text-main outline-none focus:border-primary focus:ring-2 focus:ring-focus transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border w-full sm:w-auto justify-center">
          <button
            onClick={() => {
              setFilterType('all')
              setPage(1)
            }}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              filterType === 'all' ? 'bg-primary text-on-primary shadow-xs' : 'text-muted hover:text-main'
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
              filterType === 'income' ? 'bg-success text-on-success shadow-xs' : 'text-muted hover:text-main'
            }`}
          >
            إيرادات (+{stats.inc.toLocaleString()})
          </button>
          <button
            onClick={() => {
              setFilterType('expense')
              setPage(1)
            }}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              filterType === 'expense' ? 'bg-error text-on-error shadow-xs' : 'text-muted hover:text-main'
            }`}
          >
            مصروفات (-{stats.exp.toLocaleString()})
          </button>
        </div>
      </div>

      {/* Rows List */}
      <div className="space-y-2.5 p-4">
        {paged.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border rounded-2xl bg-surface/30">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-muted">
              <Filter size={20} />
            </div>
            <p className="text-xs font-bold text-main">لا توجد معاملات مطابقة</p>
            <p className="mt-1 text-[10px] text-muted">جرب البحث بكلمات مختلفة أو تغيير الفلتر</p>
          </div>
        ) : (
          paged.map((t) => (
            <TransactionRow
              key={t.id}
              t={t}
              onPreviewInvoice={onPreviewInvoice}
              currency={reportCurrency}
            />
          ))
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

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MoreHorizontal,
  FileText,
} from 'lucide-react'

interface Transaction {
  id: number
  type: 'income' | 'expense'
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

const PER_PAGE = 5

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  completed: { label: 'مكتمل', cls: 'bg-success/[10%] text-success' },
  pending: { label: 'معلق', cls: 'bg-warning/[10%] text-warning' },
  cancelled: { label: 'ملغي', cls: 'bg-error/[10%] text-error' },
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-border/40 hover:border-border/80 group relative overflow-hidden rounded-xl border bg-card transition-all"
    >
      {/* Main row */}
      <div
        className="flex cursor-pointer items-center gap-3 p-3"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
      >
        {/* Avatar circle */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isIncome ? 'bg-success/[12%]' : 'bg-error/[10%]'}`}
        >
          {isIncome ? (
            <ArrowUpRight size={13} className="text-success" />
          ) : (
            <ArrowDownRight size={13} className="text-error/70" />
          )}
        </div>
        {/* Description & meta */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-bold text-main">{t.description}</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="text-[8px] text-muted">{t.date}</span>
            {t.studentName && (
              <>
                <span className="text-[6px] text-muted">•</span>
                <span className="truncate text-[8px] text-muted">{t.studentName}</span>
              </>
            )}
          </div>
        </div>
        {/* Amount */}
        <div className="shrink-0 text-left">
          <p
            className={`text-[11px] font-bold tabular-nums ${isIncome ? 'text-success' : 'text-error'}`}
          >
            {isIncome ? '+' : '-'}
            {(t.amount ?? 0).toLocaleString()}
          </p>
          {badge && (
            <span
              className={`mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[7px] font-bold ${badge.cls}`}
            >
              {badge.label}
            </span>
          )}
        </div>
        {/* Actions */}
        <div className="flex items-center gap-0.5">
          {t.invoiceNumber && onPreviewInvoice && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPreviewInvoice(t.invoiceNumber!)
              }}
              className="rounded-lg p-1 text-muted transition-all hover:bg-surface hover:text-main"
              title="عرض الفاتورة"
            >
              <Eye size={12} />
            </button>
          )}
          <div className="text-muted transition-all group-hover:text-main">
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
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
            className="overflow-hidden"
          >
            <div className="border-border/30 mx-3 space-y-1.5 border-t px-3 pb-3 pt-0">
              {t.invoiceNumber && (
                <div className="flex items-center gap-1.5 text-[8px] font-bold text-muted">
                  <FileText size={10} /> فاتورة:{' '}
                  <span className="text-main">{t.invoiceNumber}</span>
                </div>
              )}
              {t.paymentMethod && (
                <div className="flex items-center gap-1.5 text-[8px] font-bold text-muted">
                  <MoreHorizontal size={10} /> وسيلة الدفع:{' '}
                  <span className="text-main">{t.paymentMethod}</span>
                </div>
              )}
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
}: TransactionsLogProps) => {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(transactions.length / PER_PAGE))
  const paged = transactions.slice(0, page * PER_PAGE)

  return (
    <div className="border-border/60 overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-border/40 flex items-center justify-between border-b p-3.5">
        <div>
          <h2 className="text-xs font-bold text-main">سجل المعاملات</h2>
          <p className="mt-0.5 text-[8px] text-muted">{transactions.length} معاملة</p>
        </div>
        <button
          onClick={onAddTransaction}
          className="flex items-center gap-1 rounded-xl bg-primary px-2.5 py-1.5 text-[8px] font-bold text-on-primary transition-all hover:bg-primary-hover active:scale-95"
        >
          + إضافة
        </button>
      </div>
      <div className="space-y-2 p-3">
        {paged.length === 0 ? (
          <div className="py-6 text-center opacity-50">
            <p className="text-[9px] font-bold text-muted">لا توجد معاملات بعد</p>
          </div>
        ) : (
          paged.map((t) => <TransactionRow key={t.id} t={t} onPreviewInvoice={onPreviewInvoice} />)
        )}
      </div>
      {totalPages > 1 && page < totalPages && (
        <div className="px-3 pb-3 pt-0">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="w-full rounded-xl bg-primary/[6%] py-2 text-[8px] font-bold text-primary transition-all hover:bg-primary/[12%] active:scale-[0.99]"
          >
            عرض المزيد ({transactions.length - page * PER_PAGE} متبقي)
          </button>
        </div>
      )}
    </div>
  )
}

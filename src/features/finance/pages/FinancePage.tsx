import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Plus,
  CalendarCheck,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  Wallet,
  Receipt,
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import { TransactionsLog } from '../components/TransactionsLog'
import { FinanceCharts } from '../components/FinanceCharts'
import { FinanceStats } from '../components/FinanceStats'
import { AddTransactionModal } from '../components/AddTransactionModal'
import { InvoicePreviewModal } from '../components/InvoicePreviewModal'
import { FixedExpensesManager } from '../components/FixedExpensesManager'
import { useFinance } from '../hooks/useFinance'
import { useNavigate } from 'react-router-dom'
import { getCurrencySymbol } from '../../../config/constants'

interface PendingInvoice {
  id: string
  studentName: string
  amount: number
  date: string
  dueDate: string
  description: string
  status: 'paid' | 'pending' | 'overdue'
  items?: { description: string; date?: string; amount: number }[]
}

export const Finance = () => {
  const { state, actions } = useFinance()
  const navigate = useNavigate()
  const [fabOpen, setFabOpen] = useState(false)
  const [previewInvoice, setPreviewInvoice] = useState<PendingInvoice | null>(null)

  useEffect(() => {
    document.title = 'المالية | دارين السابعة للتعليم والتدريب'
  }, [])

  const handleFabAction = (action: string) => {
    setFabOpen(false)
    switch (action) {
      case 'add':
        actions.setShowAddModal(true)
        break
      case 'invoice':
        navigate('/student-invoices')
        break
      case 'convert':
        actions.handleConvertAllFixedExpenses()
        break
    }
  }

  const handlePreviewInvoice = useMemo(
    () => (invNumber: string) => {
      const t = state.filteredTransactions?.find(
        (tr) => tr.invoiceNumber === invNumber || String(tr.id).includes(invNumber),
      )
      if (t) {
        setPreviewInvoice({
          id: invNumber,
          studentName: t.studentName || 'طالب',
          amount: t.amount || 0,
          date: t.date || new Date().toISOString(),
          dueDate: t.date || new Date().toISOString(),
          description: t.description || '',
          status:
            t.status === 'completed' ? 'paid' : t.status === 'pending' ? 'pending' : 'overdue',
        })
      }
    },
    [state.filteredTransactions],
  )

  const loading = state.loading

  if (loading) {
    return (
      <div className="min-h-full space-y-6 bg-surface p-4">
        <div className="h-28 animate-pulse rounded-2xl bg-card" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={`finance-${i}`} className="h-28 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-card" />
      </div>
    )
  }

  return (
    <div className="relative min-h-full overflow-x-hidden pb-28" dir="rtl">
      <div className="mx-auto max-w-page space-y-6 px-2.5 sm:px-4 md:px-6">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-2xl border border-transparent bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-6 dark:border-primary/20 dark:from-slate-950 dark:via-indigo-950/90 dark:to-slate-950 md:p-8"
        >
          <div className="absolute inset-0 opacity-[0.04]">
            <svg width="100%" height="100%">
              <defs>
                <pattern
                  id="finance-hero-grid"
                  x="0"
                  y="0"
                  width="28"
                  height="28"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1" fill="white" />
                  <circle cx="16" cy="16" r="0.8" fill="white" opacity="0.4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#finance-hero-grid)" />
            </svg>
          </div>
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-xl bg-white/15 p-2 backdrop-blur-sm">
                  <TrendingUp className="text-white" size={20} />
                </div>
                <span className="text-xs font-medium text-white/70">المالية</span>
              </div>
              <h1 className="mb-1 text-2xl font-bold text-on-primary md:text-3xl">
                الإدارة المالية
              </h1>
              <p className="text-sm text-white/70">نظرة شاملة على التدفقات المالية للمعهد</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => actions.refresh?.()}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-bold text-white/80 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
              >
                <RefreshCcw size={13} /> تحديث
              </button>
              <button
                onClick={() => navigate('/monthly-closing')}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-bold text-white/80 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
              >
                <CalendarCheck size={13} /> تسوية
              </button>
            </div>
          </div>
          {/* Summary bar */}
          <div className="relative z-10 mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-success-soft p-1.5">
                <ArrowUpRight className="text-success" size={14} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/50">إيرادات الشهر</p>
                <p className="text-sm font-bold tabular-nums text-on-primary">
                  {(state.monthIncome || 0).toLocaleString()}{' '}
                  {getCurrencySymbol(state.reportCurrency)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-error-soft p-1.5">
                <ArrowDownRight className="text-error" size={14} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/50">مصاريف الشهر</p>
                <p className="text-sm font-bold tabular-nums text-on-primary">
                  {(state.monthExpenses || 0).toLocaleString()}{' '}
                  {getCurrencySymbol(state.reportCurrency)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-info-soft p-1.5">
                <Wallet className="text-info" size={14} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/50">صافي الربح</p>
                <p className="text-sm font-bold tabular-nums text-on-primary">
                  {(state.netProfit || 0).toLocaleString()}{' '}
                  {getCurrencySymbol(state.reportCurrency)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FinanceStats
            totalIncome={state.totalIncome || 0}
            monthIncome={state.monthIncome || 0}
            totalExpenses={state.totalExpenses || 0}
            monthExpenses={state.monthExpenses || 0}
            totalFixedExpenses={state.totalFixedExpenses || 0}
            netProfit={state.netProfit || 0}
            monthProfit={(state.monthIncome || 0) - (state.monthExpenses || 0)}
            reportCurrency={state.reportCurrency as string}
          />
        </motion.div>

        {/* Expenses Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <FixedExpensesManager
            expenses={state.fixedExpenses || []}
            onUpdateExpense={actions.handleUpdateFixedExpense}
            onConvertAll={actions.handleConvertAllFixedExpenses}
            onClearAll={actions.handleClearAllFixedExpenses}
          />
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FinanceCharts
            monthlyData={state.monthlyData || []}
            pieData={state.pieData || []}
            totalExpenses={state.totalExpenses || 0}
            reportCurrency={state.reportCurrency as string}
          />
        </motion.div>

        {/* Transaction Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <TransactionsLog
            transactions={state.filteredTransactions || []}
            onPreviewInvoice={handlePreviewInvoice}
            onAddTransaction={() => actions.setShowAddModal(true)}
          />
        </motion.div>
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {fabOpen &&
            [
              { icon: Plus, label: 'إضافة معاملة', action: 'add' as const },
              { icon: Receipt, label: 'فاتورة جديدة', action: 'invoice' as const },
              { icon: RefreshCcw, label: 'ترحيل المصروفات', action: 'convert' as const },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.3, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.3, y: 20 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-center gap-2"
              >
                <span className="whitespace-nowrap rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold shadow-sm">
                  {item.label}
                </span>
                <button
                  onClick={() => handleFabAction(item.action)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl active:scale-95"
                >
                  <item.icon size={18} />
                </button>
              </motion.div>
            ))}
        </AnimatePresence>
        <motion.button
          onClick={() => setFabOpen(!fabOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'h-13 w-13 flex items-center justify-center rounded-2xl text-on-primary shadow-xl transition-all',
            fabOpen ? 'rotate-45 bg-error' : 'bg-primary',
          )}
        >
          <Plus size={24} />
        </motion.button>
      </div>

      <AddTransactionModal
        isOpen={state.showAddModal}
        onClose={() => actions.setShowAddModal(false)}
        onAdd={actions.handleAddTransaction}
      />
      <InvoicePreviewModal
        isOpen={!!previewInvoice}
        onClose={() => setPreviewInvoice(null)}
        invoice={
          previewInvoice || {
            id: '',
            studentName: '',
            amount: 0,
            date: '',
            dueDate: '',
            description: '',
            status: 'pending',
          }
        }
      />
    </div>
  )
}

export default Finance

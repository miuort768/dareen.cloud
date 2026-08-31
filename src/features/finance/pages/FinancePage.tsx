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
        <div className="h-28 animate-pulse rounded-none bg-card" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={`finance-${i}`} className="h-28 animate-pulse rounded-none bg-card" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-none bg-card" />
      </div>
    )
  }

  return (
    <div className="relative min-h-full overflow-x-hidden bg-background pb-28" dir="rtl">
      <div className="mx-auto max-w-page space-y-6 px-2.5 sm:px-4 md:px-6">
        {/* Hero — clean divided card with finance identity */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-none border border-border bg-card p-5 shadow-sm md:p-6"
        >
          <div className="bg-success/10 pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -start-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex items-center gap-4">
              <div className="shadow-success/30 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-success shadow-lg">
                <TrendingUp size={22} className="text-on-success" />
              </div>
              <div>
                <h1 className="text-xl font-black leading-tight text-main">الإدارة المالية</h1>
                <p className="mt-0.5 text-xs text-muted">نظرة شاملة على التدفقات المالية للمعهد</p>
              </div>
            </div>

            <div className="hidden h-12 w-px bg-border lg:block" />

            <div className="grid flex-1 grid-cols-3 gap-2">
              {[
                {
                  label: 'إيرادات الشهر',
                  value: (state.monthIncome || 0).toLocaleString(),
                  icon: ArrowUpRight,
                  tone: 'text-success',
                },
                {
                  label: 'مصاريف الشهر',
                  value: (state.monthExpenses || 0).toLocaleString(),
                  icon: ArrowDownRight,
                  tone: 'text-error',
                },
                {
                  label: 'صافي الربح',
                  value: (state.netProfit || 0).toLocaleString(),
                  icon: Wallet,
                  tone: 'text-info',
                },
              ].map((s) => {
                const Icon = s.icon
                return (
                  <div
                    key={s.label}
                    className="rounded-xl border border-border bg-surface px-2 py-2.5 text-center"
                  >
                    <p className={cn('text-base font-black tabular-nums leading-none', s.tone)}>
                      {s.value}
                      <span className="ms-1 text-[9px] font-bold text-muted">
                        {getCurrencySymbol(state.reportCurrency)}
                      </span>
                    </p>
                    <p className="mt-1 flex items-center justify-center gap-1 text-[10px] font-bold text-muted">
                      <Icon size={10} className={s.tone} />
                      {s.label}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => actions.refresh?.()}
                className="flex h-10 items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 text-xs font-bold text-main transition-all hover:bg-hover active:scale-95"
              >
                <RefreshCcw size={13} /> تحديث
              </button>
              <button
                onClick={() => navigate('/monthly-closing')}
                className="flex h-10 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-xs font-bold text-on-primary shadow-sm transition-all hover:bg-primary-hover active:scale-95"
              >
                <CalendarCheck size={13} /> تسوية
              </button>
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
            reportCurrency={state.reportCurrency as string}
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
                  className="flex h-11 w-11 items-center justify-center rounded-none bg-primary text-on-primary shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl active:scale-95"
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
            'h-13 w-13 flex items-center justify-center rounded-none text-on-primary shadow-xl transition-all',
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

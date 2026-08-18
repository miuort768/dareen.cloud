import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  Wifi,
  Megaphone,
  Building2,
  Home,
  Wrench,
  MoreHorizontal,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import type { FixedExpense } from '../../../types'
import { CURRENCY_SYMBOL } from '../../../config/constants'

interface FixedExpensesManagerProps {
  expenses: FixedExpense[]
  onUpdateExpense: (id: number, amount: string) => void
  onConvertAll: () => void
  onClearAll: () => void
}

const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ size?: number }>; gradient: string; on: string }
> = {
  كهرباء: {
    icon: Zap,
    gradient: 'bg-gradient-to-br from-warning/80 to-warning',
    on: 'text-on-warning',
  },
  انترنت: { icon: Wifi, gradient: 'bg-gradient-to-br from-info/80 to-info', on: 'text-on-info' },
  تسويق: {
    icon: Megaphone,
    gradient: 'bg-gradient-to-br from-error/80 to-error',
    on: 'text-on-error',
  },
  ايجار: {
    icon: Building2,
    gradient: 'bg-gradient-to-br from-primary/80 to-primary',
    on: 'text-on-primary',
  },
  مكتب: {
    icon: Home,
    gradient: 'bg-gradient-to-br from-success/80 to-success',
    on: 'text-on-success',
  },
  صيانة: {
    icon: Wrench,
    gradient: 'bg-gradient-to-br from-accent/80 to-accent',
    on: 'text-on-accent',
  },
}

const DEFAULT_ICON = MoreHorizontal
const DEFAULT_GRADIENT = 'bg-gradient-to-br from-primary/80 to-primary'
const DEFAULT_ON = 'text-on-primary'

const ExpenseCard = ({
  expense,
  onUpdate,
}: {
  expense: FixedExpense
  onUpdate: (id: number, val: string) => void
}) => {
  const [val, setVal] = useState(expense.amount?.toString() || '')
  const cfg = CATEGORY_CONFIG[expense.name] || {
    icon: DEFAULT_ICON,
    gradient: DEFAULT_GRADIENT,
    on: DEFAULT_ON,
  }
  const Icon = cfg.icon

  useEffect(() => {
    setVal(expense.amount?.toString() || '')
  }, [expense.amount])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -1 }}
      className="border-border/60 relative overflow-hidden rounded-2xl border bg-card p-3 shadow-sm transition-all hover:shadow-md"
    >
      <div className="mb-2.5 flex items-center gap-2.5">
        <div
          className={`h-8 w-8 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center ${cfg.on} shadow-sm`}
        >
          <Icon size={13} />
        </div>
        <span className="text-[10px] font-bold text-main">{expense.name}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          aria-label={`مبلغ ${expense.name}`}
          step="any"
          className="border-border/60 flex-1 rounded-xl border bg-surface px-2.5 py-1.5 text-xs font-bold text-main outline-none transition-all [appearance:textfield] focus:border-primary [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          placeholder="0"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => onUpdate(expense.id, val)}
        />
        <span className="text-[9px] font-bold text-muted">{CURRENCY_SYMBOL}</span>
      </div>
      {Number(val) > 0 && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((Number(val) / 1000) * 100, 100)}%` }}
            transition={{ duration: 0.6 }}
            className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient}`}
          />
        </div>
      )}
    </motion.div>
  )
}

export const FixedExpensesManager = ({
  expenses,
  onUpdateExpense,
  onConvertAll,
  onClearAll,
}: FixedExpensesManagerProps) => {
  const total = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)

  return (
    <div className="border-border/60 overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-border/40 flex flex-col justify-between gap-3 border-b p-3.5 md:flex-row md:items-center">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 to-primary text-on-primary shadow-sm">
            <Building2 size={13} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-main">المصروفات التشغيلية</h2>
            <p className="mt-0.5 text-[8px] text-muted">
              <span className="font-bold tabular-nums text-main">{total.toLocaleString()}</span>{' '}
              {CURRENCY_SYMBOL} إجمالي المصروفات
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={onConvertAll}
            className="flex items-center gap-1 rounded-xl bg-primary px-2.5 py-1.5 text-[8px] font-bold text-on-primary transition-all hover:bg-primary-hover active:scale-95"
          >
            <RotateCcw size={10} /> ترحيل
          </button>
          <button
            onClick={onClearAll}
            className="border-error/30 bg-error/[6%] hover:bg-error/[10%] flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-[8px] font-bold text-error transition-all active:scale-95"
          >
            <Trash2 size={10} /> تصفير
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
        {expenses.map((item) => (
          <ExpenseCard key={item.id} expense={item} onUpdate={onUpdateExpense} />
        ))}
      </div>
    </div>
  )
}

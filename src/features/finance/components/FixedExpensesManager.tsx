import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  Wifi,
  Megaphone,
  Building2,
  Home,
  Wrench,
  RotateCcw,
  Trash2,
  Code2,
  Award,
  XCircle,
  HelpCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FixedExpense } from '../../../types'
import { CURRENCY_SYMBOL } from '../../../config/constants'

interface FixedExpensesManagerProps {
  expenses: FixedExpense[]
  onUpdateExpense: (id: number, amount: string) => void
  onConvertAll: () => void
  onClearAll: () => void
}

interface CategoryCfg {
  icon: LucideIcon
  gradient: string
  on: string
  accentBorder: string
}

const CATEGORY_RULES: { keywords: string[]; cfg: CategoryCfg }[] = [
  {
    keywords: ['طھط·ظˆظٹط±', 'ظ…ظ†طµط©', 'ط§ظ„ظ…ظ†طµط©', 'ط¨ط±ظ…ط¬ط©', 'ظƒظˆط¯'],
    cfg: {
      icon: Code2,
      gradient: 'bg-gradient-to-br from-primary/90 to-primary-hover',
      on: 'text-on-primary',
      accentBorder: 'border-primary/40',
    },
  },
  {
    keywords: ['ط¨ظˆظ†طµ', 'ط§ظ„ظ…ط¯ظٹط±', 'ظ…ظƒط§ظپط£ط©', 'ظ…ط¯ظٹط±'],
    cfg: {
      icon: Award,
      gradient: 'bg-gradient-to-br from-warning/90 to-warning',
      on: 'text-on-warning',
      accentBorder: 'border-warning/40',
    },
  },
  {
    keywords: ['ظƒظ‡ط±ط¨ط§ط،', 'ط·ط§ظ‚ط©'],
    cfg: {
      icon: Zap,
      gradient: 'bg-gradient-to-br from-warning to-warning',
      on: 'text-on-warning',
      accentBorder: 'border-warning',
    },
  },
  {
    keywords: ['ط§ظ†طھط±ظ†طھ', 'ظ†طھ', 'ط´ط¨ظƒط©'],
    cfg: {
      icon: Wifi,
      gradient: 'bg-gradient-to-br from-info to-info',
      on: 'text-on-info',
      accentBorder: 'border-info',
    },
  },
  {
    keywords: ['طھط³ظˆظٹظ‚', 'ط§ط¹ظ„ط§ظ†', 'ط¥ط¹ظ„ط§ظ†', 'ظ†ط«ط±ظٹط§طھ'],
    cfg: {
      icon: Megaphone,
      gradient: 'bg-gradient-to-br from-error to-error',
      on: 'text-on-error',
      accentBorder: 'border-error',
    },
  },
  {
    keywords: ['ط§ظٹط¬ط§ط±', 'ط¥ظٹط¬ط§ط±', 'ظ…ظ‚ط±', 'ظ…ط±ظƒط²'],
    cfg: {
      icon: Building2,
      gradient: 'bg-gradient-to-br from-primary/90 to-primary',
      on: 'text-on-primary',
      accentBorder: 'border-primary/40',
    },
  },
  {
    keywords: ['ظ…ظƒطھط¨', 'ط§ط¯ظˆط§طھ'],
    cfg: {
      icon: Home,
      gradient: 'bg-gradient-to-br from-success to-success',
      on: 'text-on-success',
      accentBorder: 'border-success',
    },
  },
  {
    keywords: ['طµظٹط§ظ†ط©', 'ط§طµظ„ط§ط­'],
    cfg: {
      icon: Wrench,
      gradient: 'bg-gradient-to-br from-accent to-accent',
      on: 'text-on-accent',
      accentBorder: 'border-accent',
    },
  },
  {
    keywords: ['ظ…ظ„ط؛ظٹط©', 'ط¥ظ„ط؛ط§ط،', 'ط§ظ„ط؛ط§ط،'],
    cfg: {
      icon: XCircle,
      gradient: 'bg-gradient-to-br from-error/90 to-error',
      on: 'text-on-error',
      accentBorder: 'border-error/40',
    },
  },
]

const DEFAULT_CFG: CategoryCfg = {
  icon: HelpCircle,
  gradient: 'bg-gradient-to-br from-primary/80 to-primary',
  on: 'text-on-primary',
  accentBorder: 'border-primary/30',
}

function getCategoryCfg(name: string): CategoryCfg {
  const lowerName = name.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => lowerName.includes(kw))) {
      return rule.cfg
    }
  }
  return DEFAULT_CFG
}

const ExpenseCard = ({
  expense,
  onUpdate,
}: {
  expense: FixedExpense
  onUpdate: (id: number, val: string) => void
}) => {
  const [val, setVal] = useState(expense.amount?.toString() || '')
  const cfg = getCategoryCfg(expense.name)
  const Icon = cfg.icon

  useEffect(() => {
    setVal(expense.amount?.toString() || '')
  }, [expense.amount])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md ${cfg.accentBorder}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`h-9 w-9 rounded-xl ${cfg.gradient} flex items-center justify-center ${cfg.on} shrink-0 shadow-sm`}
          >
            <Icon size={16} />
          </div>
          <div>
            <span className="block text-xs font-bold text-main">{expense.name}</span>
            <span className="block text-[10px] text-muted">ظ…طµط±ظˆظپ طھط´ط؛ظٹظ„ظٹ</span>
          </div>
        </div>
      </div>

      <div className="mt-1 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            aria-label={`ظ…ط¨ظ„ط؛ ${expense.name}`}
            step="any"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-main outline-none transition-all [appearance:textfield] focus:border-primary focus:ring-2 focus:ring-focus [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            placeholder="0"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => onUpdate(expense.id, val)}
          />
        </div>
        <span className="shrink-0 text-xs font-bold text-primary">{CURRENCY_SYMBOL}</span>
      </div>

      {Number(val) > 0 && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((Number(val) / 5000) * 100, 100)}%` }}
            transition={{ duration: 0.6 }}
            className={`h-full rounded-full ${cfg.gradient}`}
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
    <div className="overflow-hidden rounded-none border border-border bg-card shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-divider p-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
            <Building2 size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-main">
              ط§ظ„ظ…طµط±ظˆظپط§طھ ط§ظ„طھط´ط؛ظٹظ„ظٹط© ظˆط§ظ„طھط·ظˆظٹط±
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…طµط±ظˆظپط§طھ:{' '}
              <span className="font-bold tabular-nums text-primary">{total.toLocaleString()}</span>{' '}
              {CURRENCY_SYMBOL}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onConvertAll}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-on-primary shadow-sm transition-all hover:bg-primary-hover active:scale-95"
          >
            <RotateCcw size={13} /> طھط±ط­ظٹظ„ ظ„ظ„ظ…ط¹ط§ظ…ظ„ط§طھ
          </button>
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 rounded-xl border border-error-soft bg-error-soft px-3 py-2 text-xs font-bold text-error transition-all hover:bg-error-soft active:scale-95"
          >
            <Trash2 size={13} /> طھطµظپظٹط± ط§ظ„ظ…ط¨ط§ظ„ط؛
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {expenses.map((item) => (
          <ExpenseCard key={item.id} expense={item} onUpdate={onUpdateExpense} />
        ))}
      </div>
    </div>
  )
}

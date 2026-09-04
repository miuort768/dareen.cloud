import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface FinanceStatsProps {
  totalIncome: number
  monthIncome: number
  totalExpenses: number
  monthExpenses: number
  totalFixedExpenses: number
  netProfit: number
  monthProfit: number
  reportCurrency?: string
  profitMargin?: string
}

const Counter = ({
  value,
  prefix = '',
  suffix = '',
}: {
  value: number
  prefix?: string
  suffix?: string
}) => (
  <motion.span
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
    className="tabular-nums"
  >
    {prefix}
    {value.toLocaleString()}
    {suffix}
  </motion.span>
)

const KPICard = ({
  title,
  value,
  icon: Icon,
  monthValue,
  monthLabel = 'الشهر',
  tone,
  note,
}: {
  title: string
  value: number
  icon: LucideIcon
  monthValue: number
  monthLabel?: string
  tone: string
  note?: string
}) => (
  <motion.div
    whileHover={{ scale: 1.01, y: -1 }}
    className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md"
  >
    <div className="relative p-3.5">
      <div className="mb-2 flex items-start justify-between">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl', tone)}>
          <Icon size={14} />
        </div>
        {note && <span className="text-[9px] font-bold text-muted">{note}</span>}
      </div>
      <p className="text-[10px] font-bold text-muted">{title}</p>
      <p className="mt-0.5 text-lg font-bold leading-none text-main">
        <Counter value={value} />
      </p>
      <div className="mt-2 flex items-center gap-1.5 border-t border-divider pt-2">
        <span className="text-[8px] font-bold text-muted">{monthLabel}</span>
        <span className="text-[10px] font-bold tabular-nums text-main">
          <Counter value={monthValue} />
        </span>
      </div>
    </div>
  </motion.div>
)

export const FinanceStats = ({
  totalIncome,
  monthIncome,
  totalExpenses,
  monthExpenses,
  totalFixedExpenses,
  netProfit,
  monthProfit,
  profitMargin = '0',
}: FinanceStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" dir="rtl">
      <KPICard
        title="إجمالي الإيرادات"
        value={totalIncome}
        icon={TrendingUp}
        monthValue={monthIncome}
        tone="bg-success-soft text-success-strong"
      />
      <KPICard
        title="إجمالي المصروفات"
        value={totalExpenses}
        icon={TrendingDown}
        monthValue={monthExpenses}
        tone="bg-error-soft text-error"
        note="رواتب + يدوية + ثابتة"
      />
      <KPICard
        title="المصروفات التشغيلية"
        value={totalFixedExpenses}
        icon={Wallet}
        monthValue={totalFixedExpenses}
        monthLabel="شهريًا"
        tone="bg-warning-soft text-warning-strong"
      />
      <KPICard
        title="صافي الربح"
        value={netProfit}
        icon={DollarSign}
        monthValue={monthProfit}
        tone="bg-primary-soft text-primary"
        note={totalIncome > 0 ? `هامش: ${profitMargin}%` : undefined}
      />
    </div>
  )
}

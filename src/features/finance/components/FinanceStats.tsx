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
    whileHover={{ y: -2 }}
    transition={{ duration: 0.2 }}
    className="rounded-3xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-elevation-1"
  >
    {/* Icon + note */}
    <div className="mb-4 flex items-start justify-between">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-2xl', tone)}>
        <Icon size={18} />
      </div>
      {note && (
        <span className="rounded-full bg-hover px-2 py-0.5 text-[10px] font-medium text-muted">
          {note}
        </span>
      )}
    </div>
    {/* Label */}
    <p className="text-xs font-medium text-muted">{title}</p>
    {/* Main value */}
    <p className="mt-1 text-2xl font-black leading-none tracking-tight text-main">
      <Counter value={value} />
    </p>
    {/* Month divider */}
    <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3">
      <span className="text-[11px] font-medium text-muted">{monthLabel}:</span>
      <span className="text-xs font-bold tabular-nums text-main">
        <Counter value={monthValue} />
      </span>
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

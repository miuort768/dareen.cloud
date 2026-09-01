import { TrendingUp, Wallet } from 'lucide-react'
import { getCurrencySymbol } from '@/config/constants'

interface FinancialSnapshotProps {
  monthNetProfit: number
  monthRevenue: number
  expectedCollection: number
  currency?: string
}

export const FinancialSnapshot = ({
  monthNetProfit,
  monthRevenue,
  expectedCollection,
  currency,
}: FinancialSnapshotProps) => {
  const sym = getCurrencySymbol(currency)

  const items = [
    {
      label: 'أرباح هذا الشهر',
      value: monthNetProfit,
      icon: TrendingUp,
      tone: 'bg-success-soft text-success dark:bg-success-soft dark:text-success',
    },
    {
      label: 'المستحق لك',
      value: expectedCollection,
      icon: Wallet,
      tone: 'bg-primary-soft text-primary dark:bg-primary/10 dark:text-primary',
    },
    {
      label: 'الإيرادات',
      value: monthRevenue,
      icon: Wallet,
      tone: 'bg-info-soft text-info-strong dark:bg-info-soft dark:text-info-strong',
    },
  ]

  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-main dark:text-main">
        <Wallet size={14} className="text-primary dark:text-primary" />
        الملخص المالي
      </h3>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 transition-colors duration-300 dark:border-border dark:bg-hover"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.tone}`}
            >
              <item.icon size={16} />
            </div>
            <p className="min-w-0 flex-1 truncate text-xs font-bold text-muted dark:text-muted">
              {item.label}
            </p>
            <span className="shrink-0 text-base font-black tabular-nums text-main dark:text-main">
              {item.value.toLocaleString('ar-EG')}{' '}
              <span className="text-[11px] font-bold text-muted dark:text-muted">{sym}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

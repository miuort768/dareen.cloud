import { TrendingUp, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
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
      color: 'text-success',
      bg: 'bg-success-soft',
      border: 'border-success-soft',
      valueColor: 'text-success',
    },
    {
      label: 'المستحق لك',
      value: expectedCollection,
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-primary-soft',
      border: 'border-primary/30',
      valueColor: 'text-primary',
    },
    {
      label: 'الإيرادات',
      value: monthRevenue,
      icon: Wallet,
      color: 'text-primary',
      bg: 'bg-primary-soft',
      border: 'border-primary/30',
      valueColor: 'text-primary',
    },
  ]

  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-[13px] font-bold text-main dark:text-main">
        <Wallet size={13} className="text-success dark:text-primary" />
        الملخص المالي
      </h3>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.label}
            className={cn('flex items-center gap-3 rounded-xl border p-3', item.bg, item.border)}
          >
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                item.bg,
              )}
            >
              <item.icon size={16} className={item.color} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-muted dark:text-muted">{item.label}</p>
            </div>
            <span className={cn('text-sm font-semibold tabular-nums', item.valueColor)}>
              {item.value.toLocaleString('ar-EG')}{' '}
              <span className="text-[11px] font-bold">{sym}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

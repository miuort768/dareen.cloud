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

  const collectRate =
    expectedCollection > 0
      ? Math.min(Math.round((monthRevenue / expectedCollection) * 100), 100)
      : 100

  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-main dark:text-main">
        <Wallet size={14} className="text-primary dark:text-primary" />
        الملخص المالي
      </h3>

      {expectedCollection > 0 && (
        <div className="mb-4 rounded-2xl border border-border bg-surface p-3.5 dark:border-border dark:bg-hover">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-main dark:text-main">
              نسبة التحصيل الشهري
            </span>
            <span className="text-[11px] font-black tabular-nums text-primary dark:text-primary">
              {collectRate}%
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-hover dark:bg-surface"
            role="progressbar"
            aria-valuenow={collectRate}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="نسبة التحصيل"
          >
            <div
              className="h-full rounded-full bg-success transition-all duration-700"
              style={{ width: `${Math.max(collectRate, 4)}%` }}
            />
          </div>
        </div>
      )}

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

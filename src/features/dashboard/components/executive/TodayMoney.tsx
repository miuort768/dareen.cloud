import { memo } from 'react'
import { Wallet, Banknote, TrendingUp } from 'lucide-react'
import type { ExecutiveStats } from '../../services/executiveService'
import { CURRENCY_SYMBOL } from '@/config/constants'

interface MoneyStatProps {
  icon: typeof Wallet
  label: string
  value: number
  accent: string
  iconBg: string
}

const MoneyStat = memo(function MoneyStat({
  icon: Icon,
  label,
  value,
  accent,
  iconBg,
}: MoneyStatProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 md:p-5">
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon size={15} strokeWidth={1.9} className={accent} />
        </span>
        <p className="truncate text-[11px] font-bold text-muted">{label}</p>
      </div>
      <p className="font-dash text-xl font-black tabular-nums leading-none tracking-tight text-main md:text-2xl lg:text-[28px]">
        {(value ?? 0).toLocaleString('en-US')}
        <span className="ms-1.5 text-[11px] font-bold text-dim">{CURRENCY_SYMBOL}</span>
      </p>
    </div>
  )
})

export const TodayMoney = memo(function TodayMoney({ stats }: { stats: ExecutiveStats }) {
  return (
    <div
      className="grid grid-cols-1 overflow-hidden rounded-2xl border border-border bg-card font-dash lg:grid-cols-3"
      dir="rtl"
    >
      <div className="relative border-divider bg-primary-soft lg:border-e">
        <MoneyStat
          icon={Wallet}
          label="إيرادات اليوم"
          value={stats.todayRevenue}
          accent="text-primary"
          iconBg="bg-card"
        />
      </div>
      <div className="border-t border-divider lg:border-e lg:border-t-0">
        <MoneyStat
          icon={Banknote}
          label="المقبوضات نقدًا"
          value={stats.cashToday}
          accent="text-success"
          iconBg="bg-success-soft"
        />
      </div>
      <div className="border-t border-divider lg:border-t-0">
        <MoneyStat
          icon={TrendingUp}
          label="صافي ربح اليوم"
          value={stats.todayProfit}
          accent="text-info"
          iconBg="bg-info-soft"
        />
      </div>
    </div>
  )
})

import { memo } from 'react'
import { Wallet, Banknote, TrendingUp } from 'lucide-react'
import type { ExecutiveStats } from '../../services/executiveService'
import { CURRENCY_SYMBOL } from '@/config/constants'
import { cn } from '@/lib/utils'

interface MoneyStatProps {
  icon: typeof Wallet
  label: string
  sublabel: string
  value: number
  accent: string
  iconBg: string
  trendBadge?: string
}

const MoneyStat = memo(function MoneyStat({
  icon: Icon,
  label,
  sublabel,
  value,
  accent,
  iconBg,
}: MoneyStatProps) {
  return (
    <div className="hover:bg-surface/50 group relative flex min-w-0 flex-1 flex-col justify-between gap-3 p-5 transition-colors duration-normal">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-soft transition-transform duration-normal group-hover:scale-110',
              iconBg,
            )}
          >
            <Icon size={16} strokeWidth={2} className={accent} />
          </span>
          <div>
            <p className="text-xs font-semibold text-main">{label}</p>
            <p className="text-[10px] text-muted">{sublabel}</p>
          </div>
        </div>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-dash text-2xl font-bold tabular-nums leading-none tracking-tight text-main md:text-3xl">
          {(value ?? 0).toLocaleString('en-US')}
        </span>
        <span className="border-border/80 inline-flex items-center rounded-md border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-dim shadow-soft">
          {CURRENCY_SYMBOL}
        </span>
      </div>
    </div>
  )
})

export const TodayMoney = memo(function TodayMoney({ stats }: { stats: ExecutiveStats }) {
  return (
    <div
      className="grid grid-cols-1 overflow-hidden rounded-[24px] border border-border bg-card font-dash shadow-elevation-1 lg:grid-cols-3"
      dir="rtl"
    >
      <div className="bg-primary-soft/30 relative border-b border-divider lg:border-b-0 lg:border-e">
        <MoneyStat
          icon={Wallet}
          label="إيرادات اليوم"
          sublabel="التحصيلات المسجلة اليوم"
          value={stats.todayRevenue}
          accent="text-primary"
          iconBg="bg-primary-soft text-primary border border-primary/20"
        />
      </div>
      <div className="border-b border-divider lg:border-b-0 lg:border-e">
        <MoneyStat
          icon={Banknote}
          label="المقبوضات نقدًا"
          sublabel="إجمالي النقد لهذا الشهر"
          value={stats.cashMonth}
          accent="text-success"
          iconBg="bg-success-soft text-success border border-success/20"
        />
      </div>
      <div>
        <MoneyStat
          icon={TrendingUp}
          label="صافي ربح اليوم"
          sublabel="بعد خصم المصروفات المقدرة"
          value={stats.todayProfit}
          accent="text-info"
          iconBg="bg-info-soft text-info border border-info/20"
        />
      </div>
    </div>
  )
})

import { Link } from 'react-router-dom'
import { ChevronLeft, TrendingUp, TrendingDown, HandCoins } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CURRENCY_SYMBOL } from '@/config/constants'
import type { DashboardStats } from '../types'

export const MoneyStrip = ({ stats }: { stats: DashboardStats }) => {
  const profit = stats.monthNetProfit || 0
  const profitable = profit >= 0

  return (
    <Link
      to="/finance"
      className="group block rounded-2xl border border-border bg-card p-4 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
      dir="rtl"
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-muted">صافي ربح الشهر</p>
          <p
            className={cn(
              'mt-1 font-dash text-[26px] font-black tabular-nums leading-none tracking-tight',
              profitable ? 'text-success' : 'text-error',
            )}
          >
            {profitable ? '+' : ''}
            {profit.toLocaleString('en-US')}
            <span className="ms-1.5 text-xs font-bold text-dim">{CURRENCY_SYMBOL}</span>
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface text-muted transition-colors group-hover:bg-hover group-hover:text-main">
          <ChevronLeft size={16} />
        </span>
      </div>

      <div className="mt-3.5 grid grid-cols-3 gap-2 border-t border-divider pt-3">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={13} strokeWidth={1.9} className="shrink-0 text-success" />
          <div className="min-w-0">
            <p className="truncate text-[9px] font-bold text-muted">إيرادات</p>
            <p className="truncate text-[11px] font-black tabular-nums text-main">
              {(stats.monthRevenue || 0).toLocaleString('en-US')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 border-s border-divider ps-2">
          <TrendingDown size={13} strokeWidth={1.9} className="shrink-0 text-warning" />
          <div className="min-w-0">
            <p className="truncate text-[9px] font-bold text-muted">مصروفات</p>
            <p className="truncate text-[11px] font-black tabular-nums text-main">
              {(stats.monthExpenses || 0).toLocaleString('en-US')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 border-s border-divider ps-2">
          <HandCoins size={13} strokeWidth={1.9} className="shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="truncate text-[9px] font-bold text-muted">تحصيل متوقع</p>
            <p className="truncate text-[11px] font-black tabular-nums text-primary">
              {(stats.expectedCollection || 0).toLocaleString('en-US')}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}

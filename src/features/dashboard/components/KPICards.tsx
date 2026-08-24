import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CURRENCY_SYMBOL } from '@/config/constants'
import type { DashboardStats } from '../types'

interface KPICardsProps {
  stats: DashboardStats
}

interface KPICardData {
  title: string
  value: string | number
  icon: LucideIcon
  color: string
  accent?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  prefix?: string
  formatter?: (val: number) => string
  size: 'lg' | 'sm'
}

const colorMap: Record<string, { bg: string; text: string; ring: string; accent: string }> = {
  primary: {
    bg: 'bg-primary-soft dark:bg-primary/10',
    text: 'text-primary dark:text-primary',
    ring: 'ring-border dark:ring-accent/20',
    accent: 'bg-primary dark:bg-primary',
  },
  success: {
    bg: 'bg-success-soft',
    text: 'text-success',
    ring: 'ring-border',
    accent: 'bg-success',
  },
  info: { bg: 'bg-info-soft', text: 'text-info', ring: 'ring-border', accent: 'bg-info' },
  warning: {
    bg: 'bg-warning-soft dark:bg-primary/5',
    text: 'text-warning dark:text-primary',
    ring: 'ring-border dark:ring-accent/20',
    accent: 'bg-warning dark:bg-primary',
  },
}

const KPICard = ({ item, index }: { item: KPICardData; index: number }) => {
  const Icon = item.icon
  const c = colorMap[item.color] || colorMap.primary || { bg: '', text: '', ring: '', accent: '' }
  const isLarge = item.size === 'lg'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-sm dark:border-border dark:bg-card',
        isLarge ? 'lg:col-span-2' : 'lg:col-span-1',
      )}
    >
      {/* Accent bar */}
      <div className={cn('absolute bottom-0 start-0 top-0 w-1', c.accent)} />

      <div className={cn('p-5', isLarge ? 'md:p-6' : 'md:p-5')}>
        <div className="mb-3 flex items-start justify-between">
          <div
            className={cn(
              c.bg,
              c.ring,
              'flex items-center justify-center rounded-xl ring-1',
              isLarge ? 'h-12 w-12' : 'h-10 w-10',
            )}
          >
            <Icon size={isLarge ? 20 : 16} className={c.text} />
          </div>
          {item.trend && (
            <div
              className={cn(
                'flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold',
                item.trend === 'up'
                  ? 'bg-success-soft text-success'
                  : item.trend === 'down'
                    ? 'bg-error-soft text-error'
                    : 'bg-surface text-muted dark:bg-hover dark:text-muted',
              )}
            >
              {item.trend === 'up' ? (
                <TrendingUp size={10} />
              ) : item.trend === 'down' ? (
                <TrendingDown size={10} />
              ) : null}
              {item.trendValue}
            </div>
          )}
        </div>

        <div className="space-y-0.5">
          <p
            className={cn(
              'font-bold tabular-nums tracking-tight text-main dark:text-main',
              isLarge ? 'text-3xl' : 'text-2xl',
            )}
          >
            {item.formatter && typeof item.value === 'number'
              ? item.formatter(item.value)
              : item.value}
            {item.prefix && (
              <span className="me-1 text-xs font-medium text-muted">{item.prefix}</span>
            )}
          </p>
          <p className="text-xs font-medium text-muted dark:text-muted">{item.title}</p>
        </div>
      </div>
    </motion.div>
  )
}

export const KPICards = ({ stats }: KPICardsProps) => {
  const netProfit = (stats.totalRevenue || 0) - (stats.totalExpenses || 0)
  const profitTrend =
    netProfit > 0 ? ('up' as const) : netProfit < 0 ? ('down' as const) : ('neutral' as const)
  const revenueGrowth =
    stats.monthRevenue && stats.monthRevenue > 0
      ? `+${Math.round((stats.monthRevenue / (stats.totalRevenue || 1)) * 100)}%`
      : '0%'

  const cards: KPICardData[] = [
    {
      title: 'إجمالي الإيرادات',
      value: stats.totalRevenue || 0,
      icon: DollarSign,
      color: 'success',
      trend: 'up',
      trendValue: revenueGrowth,
      prefix: CURRENCY_SYMBOL,
      formatter: (val: number) => val.toLocaleString(),
      size: 'sm',
    },
    {
      title: 'إجمالي الطلاب',
      value: stats.studentsCount,
      icon: Users,
      color: 'primary',
      trend: stats.studentsCount > 0 ? 'up' : 'neutral',
      trendValue: `${stats.studentsCount}`,
      size: 'sm',
    },
    {
      title: 'الحصص المنجزة',
      value: stats.completedSessions || 0,
      icon: BookOpen,
      color: 'info',
      trend: stats.monthCompletedSessions > 0 ? 'up' : 'neutral',
      trendValue: `${stats.monthCompletedSessions} هذا الشهر`,
      size: 'sm',
    },
    {
      title: 'صافي الربح',
      value: netProfit,
      icon: Wallet,
      color: profitTrend === 'up' ? 'success' : profitTrend === 'down' ? 'warning' : 'info',
      trend: profitTrend,
      trendValue: profitTrend === 'up' ? 'إيجابي' : profitTrend === 'down' ? 'سلبي' : '—',
      prefix: CURRENCY_SYMBOL,
      formatter: (val: number) => val.toLocaleString(),
      size: 'sm',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
      {cards.map((card, i) => (
        <KPICard key={`kpi-${i}`} item={card} index={i} />
      ))}
    </div>
  )
}

import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  GraduationCap,
  DollarSign,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from 'lucide-react'
import { CURRENCY_SYMBOL } from '../../../config/constants'
import type { DashboardStats as Stats } from '../types'

interface DashboardStatsProps {
  stats: Stats
  isTeacher: boolean
}

interface StatCardData {
  title: string
  value: string | number
  icon: LucideIcon
  color: string
  trend?: { value: number; isUp: boolean }
  prefix?: string
  formatter?: (val: number) => string
}

const colorMap: Record<string, { bg: string; text: string; light: string; ring: string }> = {
  primary: {
    bg: 'bg-primary/10 dark:bg-primary/10',
    text: 'text-primary dark:text-primary',
    light: 'bg-primary/[0.04] dark:bg-primary/[0.04]',
    ring: 'ring-primary/20 dark:ring-accent-soft',
  },
  success: {
    bg: 'bg-success-soft',
    text: 'text-success',
    light: 'bg-success/[0.04]',
    ring: 'ring-success-soft',
  },
  info: { bg: 'bg-info-soft', text: 'text-info', light: 'bg-info/[0.04]', ring: 'ring-info-soft' },
  warning: {
    bg: 'bg-warning-soft',
    text: 'text-warning',
    light: 'bg-warning/[0.04]',
    ring: 'ring-warning-soft',
  },
  error: {
    bg: 'bg-error-soft',
    text: 'text-error',
    light: 'bg-error/[0.04]',
    ring: 'ring-error-soft',
  },
}

const StatCard = ({ item, index }: { item: StatCardData; index: number }) => {
  const Icon = item.icon
  const c = colorMap[item.color] || colorMap.primary || { bg: '', text: '', light: '', ring: '' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevation-2 dark:border-primary/20 dark:bg-card"
    >
      <div className="mb-3 flex items-start justify-between">
        <div
          className={`h-10 w-10 rounded-xl ring-1 ${c.ring} ${c.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon size={18} className={c.text} />
        </div>
        {item.trend && (
          <div
            className={`flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 text-[10px] font-bold ${item.trend.isUp ? 'bg-success-soft text-success' : 'bg-error-soft text-error'}`}
          >
            {item.trend.isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
            <span>{item.trend.value}%</span>
          </div>
        )}
      </div>

      <p className="mb-1 text-2xl font-bold tabular-nums leading-none tracking-tight text-main dark:text-main md:text-[28px]">
        {item.formatter && typeof item.value === 'number' ? item.formatter(item.value) : item.value}
        {item.prefix && <span className="me-1 text-xs font-medium text-muted">{item.prefix}</span>}
      </p>
      <p className="text-[13px] font-medium text-muted dark:text-muted">{item.title}</p>
    </motion.div>
  )
}

export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => {
  // لا اتجاهات مُختلقة — النظام لا يحتفظ بسابعة سابقة للمقارنة، فلا شارات Trend

  const cards: StatCardData[] = [
    {
      title: 'إجمالي الطلاب',
      value: stats.studentsCount,
      icon: Users,
      color: 'primary',
    },
    {
      title: 'الاشتراكات النشطة',
      value: stats.totalEnrollments,
      icon: BookOpen,
      color: 'success',
    },
    {
      title: 'حصص اليوم',
      value: stats.todaySessions,
      icon: CalendarCheck,
      color: 'info',
    },
    {
      title: 'الحصص المنفذة',
      value: stats.completedSessions,
      icon: CheckCircle2,
      color: 'success',
    },
  ]

  const adminCards: StatCardData[] = [
    {
      title: 'إجمالي المعلمين',
      value: stats.teachersCount,
      icon: GraduationCap,
      color: 'warning',
    },
    {
      title: 'إجمالي الإيرادات',
      value: stats.totalRevenue || 0,
      icon: TrendingUp,
      color: 'success',
      prefix: CURRENCY_SYMBOL,
      formatter: (val: number) => val.toLocaleString(),
    },
    {
      title: 'إجمالي المصروفات',
      value: stats.totalExpenses || 0,
      icon: TrendingDown,
      color: 'error',
      prefix: CURRENCY_SYMBOL,
      formatter: (val: number) => val.toLocaleString(),
    },
    {
      title: 'صافي الربح',
      value: stats.totalNetProfit || 0,
      icon: DollarSign,
      color: 'info',
      prefix: CURRENCY_SYMBOL,
      formatter: (val: number) => val.toLocaleString(),
    },
  ]

  const allCards = [...cards, ...(!isTeacher ? adminCards : [])]

  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
      {allCards.map((card, i) => (
        <StatCard key={`stat-${i}`} item={card} index={i} />
      ))}
    </div>
  )
}

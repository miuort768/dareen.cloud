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
import { StatCard } from '../../../shared/components/ui/StatCard'
import type { DashboardStats as Stats } from '../types'

interface DashboardStatsProps {
  stats: Stats
  isTeacher: boolean
}

interface StatCardData {
  title: string
  value: string | number
  icon: LucideIcon
  variant: 'soft-primary' | 'soft-success' | 'soft-warning' | 'soft-error' | 'soft-info' | 'primary'
  prefix?: string
  formatter?: (val: number) => string
}

/** الشبكة الموحدة فوق StatCard المشترك — Tinted ناعمة ولمسة Solid في الختام */
export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => {
  const cards: StatCardData[] = [
    {
      title: 'إجمالي الطلاب',
      value: stats.studentsCount,
      icon: Users,
      variant: 'soft-primary',
    },
    {
      title: 'الاشتراكات النشطة',
      value: stats.totalEnrollments,
      icon: BookOpen,
      variant: 'soft-success',
    },
    {
      title: 'حصص اليوم',
      value: stats.todaySessions,
      icon: CalendarCheck,
      variant: 'soft-info',
    },
    {
      title: 'الحصص المنفذة',
      value: stats.completedSessions,
      icon: CheckCircle2,
      variant: 'soft-primary',
    },
  ]

  const adminCards: StatCardData[] = [
    {
      title: 'إجمالي المعلمين',
      value: stats.teachersCount,
      icon: GraduationCap,
      variant: 'soft-warning',
    },
    {
      title: 'إجمالي الإيرادات',
      value: stats.totalRevenue || 0,
      icon: TrendingUp,
      variant: 'soft-success',
      prefix: CURRENCY_SYMBOL,
      formatter: (val: number) => val.toLocaleString(),
    },
    {
      title: 'إجمالي المصروفات',
      value: stats.totalExpenses || 0,
      icon: TrendingDown,
      variant: 'soft-error',
      prefix: CURRENCY_SYMBOL,
      formatter: (val: number) => val.toLocaleString(),
    },
    {
      title: 'صافي الربح',
      value: stats.totalNetProfit || 0,
      icon: DollarSign,
      variant: 'soft-info',
      prefix: CURRENCY_SYMBOL,
      formatter: (val: number) => val.toLocaleString(),
    },
  ]

  const allCards = [...cards, ...(!isTeacher ? adminCards : [])]

  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
      {allCards.map((card, i) => {
        const isLast = isTeacher && i === allCards.length - 1
        return (
          <motion.div
            key={`stat-${i}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <StatCard
              title={card.title}
              value={
                card.formatter && typeof card.value === 'number'
                  ? card.formatter(card.value)
                  : card.value
              }
              icon={card.icon}
              variant={isLast ? 'primary' : card.variant}
              watermark
              unit={card.prefix}
              className="h-full"
            />
          </motion.div>
        )
      })}
    </div>
  )
}

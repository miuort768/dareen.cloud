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
    bg: 'bg-primary-soft dark:bg-primary/10',
    text: 'text-primary',
    light: 'bg-primary/[0.04] dark:bg-primary/[0.04]',
    ring: 'ring-primary/20',
  },
  success: {
    bg: 'bg-success-soft',
    text: 'text-success-strong',
    light: 'bg-success/[0.04]',
    ring: 'ring-success-soft',
  },
  info: {
    bg: 'bg-info-soft',
    text: 'text-info-strong',
    light: 'bg-info/[0.04]',
    ring: 'ring-info-soft',
  },
  warning: {
    bg: 'bg-warning-soft',
    text: 'text-warning-strong',
    light: 'bg-warning/[0.04]',
    ring: 'ring-warning-soft',
  },
  error: {
    bg: 'bg-error-soft',
    text: 'text-error-strong',
    light: 'bg-error/[0.04]',
    ring: 'ring-error-soft',
  },
}

/** بطاقة إحصائية ملونة ناعمة — خلفية ملونة كاملة + رقاقة أيقونة بيضاء */
const TintedStatCard = ({ item, index }: { item: StatCardData; index: number }) => {
  const Icon = item.icon
  const c = colorMap[item.color] || colorMap.primary!

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-slow hover:-translate-y-1 hover:shadow-elevation-2 ${c.bg} ${
        item.color === 'primary' ? 'border-primary/20' : 'border-transparent'
      }`}
    >
      {/* أيقونة كبيرة شفافة كزخرفة زاوية */}
      <Icon
        size={72}
        strokeWidth={1}
        className={`pointer-events-none absolute -bottom-3 -end-3 opacity-[0.08] ${c.text}`}
        aria-hidden="true"
      />
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-card ring-1 ${c.ring} shadow-sm transition-transform duration-slow group-hover:rotate-3 group-hover:scale-110`}
      >
        <Icon size={18} className={c.text} />
      </div>
      <p className="mb-1 text-2xl font-black tabular-nums leading-none tracking-tight text-main md:text-[28px]">
        {item.formatter && typeof item.value === 'number' ? item.formatter(item.value) : item.value}
        {item.prefix && <span className="me-1 text-xs font-bold text-muted">{item.prefix}</span>}
      </p>
      <p className="text-sm font-bold text-muted">{item.title}</p>
    </motion.div>
  )
}

/** بطاقة إحصائية صلبة بلون الهوية — لمسة جسورة في الشبكة */
const SolidStatCard = ({ item, index }: { item: StatCardData; index: number }) => {
  const Icon = item.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative overflow-hidden rounded-2xl bg-primary p-5 shadow-lg shadow-primary/25 transition-all duration-slow hover:-translate-y-1"
    >
      <div
        className="pointer-events-none absolute -bottom-4 -end-4 h-24 w-24 rounded-full bg-white/10 blur-xl"
        aria-hidden="true"
      />
      <Icon
        size={72}
        strokeWidth={1}
        className="pointer-events-none absolute -bottom-3 -end-3 text-on-primary opacity-10"
        aria-hidden="true"
      />
      <div className="relative z-10">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-transform duration-slow group-hover:rotate-3 group-hover:scale-110">
          <Icon size={18} className="text-on-primary" />
        </div>
        <p className="mb-1 text-2xl font-black tabular-nums leading-none tracking-tight text-on-primary md:text-[28px]">
          {item.formatter && typeof item.value === 'number'
            ? item.formatter(item.value)
            : item.value}
          {item.prefix && (
            <span className="me-1 text-xs font-bold text-on-primary opacity-75">{item.prefix}</span>
          )}
        </p>
        <p className="text-sm font-bold text-on-primary opacity-85">{item.title}</p>
      </div>
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
      color: 'primary',
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
      {allCards.map((card, i) =>
        isTeacher && i === allCards.length - 1 ? (
          <SolidStatCard key={`stat-${i}`} item={card} index={i} />
        ) : (
          <TintedStatCard key={`stat-${i}`} item={card} index={i} />
        ),
      )}
    </div>
  )
}

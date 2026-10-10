import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  GraduationCap,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import { CURRENCY_SYMBOL } from '../../../config/constants'
import { StatCard } from '../../../shared/components/ui/StatCard'
import type { DashboardStats as Stats } from '../types'

interface DashboardStatsProps {
  stats: Stats
  isTeacher: boolean
  /** على الهاتف: مستطيل واحد يتبدّل بين المؤشرات تلقائيًا (نقاط + أسهم) */
  carousel?: boolean
}

interface StatCardData {
  title: string
  value: string | number
  icon: LucideIcon
  variant: 'soft-primary' | 'soft-success' | 'soft-warning' | 'soft-error' | 'soft-info' | 'primary'
  prefix?: string
  formatter?: (val: number) => string
}

const ROTATE_MS = 4000

/** شريط المؤشرات على الهاتف — مستطيل واحد يتبدّل تلقائيًا مع نقاط وأسهم */
const StatsCarousel = ({ cards }: { cards: StatCardData[] }) => {
  const count = cards.length
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)

  const go = (next: number, dir: number) => {
    setDirection(dir)
    setIndex(((next % count) + count) % count)
  }

  useEffect(() => {
    if (paused || count <= 1) return
    const timer = setInterval(() => {
      setDirection(1)
      setIndex((prev) => (prev + 1) % count)
    }, ROTATE_MS)
    return () => clearInterval(timer)
  }, [paused, count])

  const card = cards[index]
  if (!card) return null
  const Icon = card.icon
  const isLast = index === count - 1

  return (
    <div
      className="relative"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, x: direction * 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -48 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
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
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* مؤشر تقدّم الدورة */}
      {!paused && count > 1 && (
        <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-border">
          <motion.div
            key={`progress-${index}`}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: ROTATE_MS / 1000, ease: 'linear' }}
            className="h-full rounded-full bg-primary"
          />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(index - 1, -1)}
          aria-label="المؤشر السابق"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-main outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
        >
          <ChevronRight size={18} />
        </button>

        <div className="flex items-center gap-1.5" role="tablist" aria-label="مؤشرات اللوحة">
          {cards.map((c, i) => (
            <button
              key={`dot-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={c.title}
              onClick={() => go(i, i > index ? 1 : -1)}
              className={cn(
                'h-2 rounded-full outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-focus',
                i === index ? 'w-6 bg-primary' : 'w-2 bg-border hover:bg-muted',
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(index + 1, 1)}
          aria-label="المؤشر التالي"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-main outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>
      </div>
    </div>
  )
}

/** الشبكة الموحدة فوق StatCard المشترك — Tinted ناعمة ولمسة Solid في الختام */
export const DashboardStats = ({ stats, isTeacher, carousel = false }: DashboardStatsProps) => {
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

  if (carousel) {
    return <StatsCarousel cards={allCards} />
  }

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

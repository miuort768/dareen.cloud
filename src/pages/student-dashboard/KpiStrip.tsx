import { CheckCircle2, CalendarCheck, BookOpen, CalendarRange } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { StudentStats } from './types'

interface KpiStripProps {
  stats: StudentStats
}

type Tone = 'success' | 'primary' | 'info' | 'warning'

/** Soft palette: card bg stays neutral, accent colour on the value & icon */
const CARD_SOFT: Record<Tone, { card: string; icon: string; value: string; bar: string }> = {
  success: {
    card: 'bg-card border-border',
    icon: 'bg-success-soft text-success-strong',
    value: 'text-success-strong',
    bar: 'bg-success',
  },
  primary: {
    card: 'bg-card border-border',
    icon: 'bg-primary-soft text-primary',
    value: 'text-primary',
    bar: 'bg-primary',
  },
  info: {
    card: 'bg-card border-border',
    icon: 'bg-info-soft text-info-strong',
    value: 'text-info-strong',
    bar: 'bg-info',
  },
  warning: {
    card: 'bg-card border-border',
    icon: 'bg-warning-soft text-warning-strong',
    value: 'text-warning-strong',
    bar: 'bg-warning',
  },
}

interface CardSpec {
  key: string
  icon: LucideIcon
  tone: Tone
  title: string
  value: string
  unit?: string
  caption: string
  bar?: number
}

/** شريط مؤشرات بريميوم — مربعات مشبعة بألوان لاحقة + أرقام كبرى مع شريط تقدم على الخلفية */
export const KpiStrip = ({ stats }: KpiStripProps) => {
  const cards: CardSpec[] = [
    {
      key: 'attendance',
      icon: CheckCircle2,
      tone: 'success',
      title: 'نسبة الحضور',
      value: String(stats.attendanceRate),
      unit: '%',
      caption: `حاضر ${stats.attendance} · غياب ${stats.absence}`,
      bar: stats.attendanceRate,
    },
    {
      key: 'sessions-used',
      icon: CalendarCheck,
      tone: 'primary',
      title: 'حصص منفذة',
      value: String(stats.sessionsUsed),
      unit: `من ${stats.sessionsTotal}`,
      caption: 'من إجمالي حصصك',
      bar:
        stats.sessionsTotal > 0 ? Math.round((stats.sessionsUsed / stats.sessionsTotal) * 100) : 0,
    },
    {
      key: 'curriculum',
      icon: BookOpen,
      tone: 'info',
      title: 'تقدم المنهج',
      value: String(stats.curriculumProgress),
      unit: '%',
      caption: 'مكتمل من خطتك',
      bar: stats.curriculumProgress,
    },
    {
      key: 'total',
      icon: CalendarRange,
      tone: 'warning',
      title: 'إجمالي الحصص',
      value: String(stats.sessionsTotal),
      caption: 'في برنامجك الدراسي',
    },
  ]

  return (
    <section aria-label="مؤشرات سريعة" className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        const tone = CARD_SOFT[card.tone]
        return (
          <article
            key={card.key}
            className={cn(
              'rounded-3xl border p-4 shadow-soft transition-all duration-slow hover:-translate-y-0.5 hover:shadow-elevation-1 sm:p-5',
              tone.card,
            )}
          >
            {/* Icon + optional bar% chip */}
            <div className="flex items-start justify-between gap-2">
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                  tone.icon,
                )}
              >
                <Icon size={18} />
              </span>
              {card.bar !== undefined && (
                <span className="hidden rounded-full bg-hover px-2 py-0.5 text-[10px] font-bold tabular-nums text-muted sm:block">
                  {card.bar}%
                </span>
              )}
            </div>

            {/* Value */}
            <p className="mt-4 flex items-baseline gap-1">
              <span
                className={cn(
                  'font-dash text-3xl font-black tabular-nums leading-none',
                  tone.value,
                )}
              >
                {card.value}
              </span>
              {card.unit && (
                <span className="text-xs font-bold tabular-nums text-muted">{card.unit}</span>
              )}
            </p>

            {/* Title & caption */}
            <p className="mt-1.5 truncate text-xs font-bold text-main">{card.title}</p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-muted">{card.caption}</p>

            {/* Progress bar */}
            {card.bar !== undefined && (
              <div
                role="progressbar"
                aria-valuenow={card.bar}
                aria-valuemin={0}
                aria-valuemax={100}
                className="mt-3 h-1 overflow-hidden rounded-full bg-border"
              >
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-1000 ease-out',
                    tone.bar,
                  )}
                  style={{ width: `${Math.max(0, Math.min(100, card.bar))}%` }}
                />
              </div>
            )}
          </article>
        )
      })}
    </section>
  )
}

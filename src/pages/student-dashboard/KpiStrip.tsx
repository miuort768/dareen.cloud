import { CheckCircle2, CalendarCheck, BookOpen, CalendarRange } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { StudentStats } from './types'

interface KpiStripProps {
  stats: StudentStats
}

type Tone = 'success' | 'primary' | 'info' | 'warning'

const CARD_SOFT: Record<Tone, { border: string; icon: string; value: string; bar: string }> = {
  success: {
    border: 'hover:border-success/30',
    icon: 'bg-success-soft text-success border border-success/20',
    value: 'text-main',
    bar: 'bg-success',
  },
  primary: {
    border: 'hover:border-primary/30',
    icon: 'bg-primary-soft text-primary border border-primary/20',
    value: 'text-main',
    bar: 'bg-primary',
  },
  info: {
    border: 'hover:border-info/30',
    icon: 'bg-info-soft text-info border border-info/20',
    value: 'text-main',
    bar: 'bg-info',
  },
  warning: {
    border: 'hover:border-warning/30',
    icon: 'bg-warning-soft text-warning border border-warning/20',
    value: 'text-main',
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

/** شريط مؤشرات بريميوم للوحة تحكم الطالب */
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
    <section
      aria-label="مؤشرات سريعة"
      className="grid grid-cols-2 gap-3 font-dash sm:grid-cols-4 md:gap-4"
    >
      {cards.map((card) => {
        const Icon = card.icon
        const tone = CARD_SOFT[card.tone]
        return (
          <article
            key={card.key}
            className={cn(
              'border-border/80 bg-surface/40 group relative flex flex-col justify-between rounded-[22px] border p-4 shadow-soft transition-all duration-normal hover:-translate-y-0.5 hover:bg-card hover:shadow-elevation-1 sm:p-5',
              tone.border,
            )}
          >
            {/* Icon + optional bar% chip */}
            <div className="flex items-start justify-between gap-2">
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-soft transition-transform duration-normal group-hover:scale-110',
                  tone.icon,
                )}
              >
                <Icon size={18} strokeWidth={2} />
              </span>
              {card.bar !== undefined && (
                <span className="border-border/60 hidden rounded-full border bg-surface px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted shadow-soft sm:block">
                  {card.bar}%
                </span>
              )}
            </div>

            {/* Value */}
            <div className="mt-4">
              <p className="flex items-baseline gap-1">
                <span
                  className={cn(
                    'font-dash text-2xl font-bold tabular-nums leading-none tracking-tight sm:text-3xl',
                    tone.value,
                  )}
                >
                  {card.value}
                </span>
                {card.unit && (
                  <span className="text-xs font-semibold tabular-nums text-muted">{card.unit}</span>
                )}
              </p>

              {/* Title & caption */}
              <p className="mt-2 truncate text-xs font-semibold text-main">{card.title}</p>
              <p className="mt-0.5 truncate text-[11px] font-normal text-muted">{card.caption}</p>
            </div>

            {/* Progress bar */}
            {card.bar !== undefined && (
              <div
                role="progressbar"
                aria-valuenow={card.bar}
                aria-valuemin={0}
                aria-valuemax={100}
                className="bg-border/60 mt-3.5 h-1.5 overflow-hidden rounded-full"
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

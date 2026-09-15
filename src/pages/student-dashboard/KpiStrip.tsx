import { CheckCircle2, CalendarCheck, BookOpen, CalendarRange } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ProgressBar } from '../../shared/components/ui'
import { cn } from '../../lib/utils'
import type { StudentStats } from './types'

interface KpiStripProps {
  stats: StudentStats
}

type Tone = 'success' | 'primary' | 'info' | 'warning'

const ICON_TILE: Record<Tone, string> = {
  success: 'bg-success-soft text-success-strong',
  primary: 'bg-primary-soft text-primary',
  info: 'bg-info-soft text-info-strong',
  warning: 'bg-warning-soft text-warning-strong',
}

const BAR_VARIANT: Record<Tone, 'success' | 'primary' | 'info' | 'warning'> = {
  success: 'success',
  primary: 'primary',
  info: 'info',
  warning: 'warning',
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

/** شريط مؤشرات بريميوم — أرقام كبرى مع شريط تقدم ورموز ملونة */
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
        return (
          <article
            key={card.key}
            className="rounded-2xl border border-border bg-card p-3.5 shadow-elevation-1 transition-all duration-normal hover:shadow-elevation-2 sm:p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                  ICON_TILE[card.tone],
                )}
              >
                <Icon size={17} />
              </span>
              {card.bar !== undefined && (
                <span className="hidden text-[9px] font-black tabular-nums text-muted sm:block">
                  {card.bar}%
                </span>
              )}
            </div>

            <p className="mt-3 flex items-baseline gap-1">
              <span className="font-dash text-2xl font-black tabular-nums leading-none text-main">
                {card.value}
              </span>
              {card.unit && (
                <span className="text-[11px] font-black tabular-nums text-muted">{card.unit}</span>
              )}
            </p>
            <p className="mt-1 truncate text-[11px] font-black text-main">{card.title}</p>
            <p className="mt-0.5 truncate text-[10px] font-bold text-muted">{card.caption}</p>

            {card.bar !== undefined && (
              <div className="mt-2.5">
                <ProgressBar value={card.bar} variant={BAR_VARIANT[card.tone]} size="sm" animate />
              </div>
            )}
          </article>
        )
      })}
    </section>
  )
}

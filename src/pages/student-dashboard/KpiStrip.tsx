import { CheckCircle2, CalendarCheck, BookOpen, CalendarRange } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { StudentStats } from './types'

interface KpiStripProps {
  stats: StudentStats
}

type Tone = 'success' | 'primary' | 'info' | 'warning'

const CARD_FILL: Record<Tone, string> = {
  success: 'bg-success text-on-success',
  primary: 'bg-primary text-on-primary',
  info: 'bg-info text-on-info',
  warning: 'bg-warning text-on-warning',
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
        return (
          <article
            key={card.key}
            className={cn(
              'rounded-2xl p-3.5 shadow-elevation-1 transition-all duration-normal hover:shadow-elevation-2 sm:p-4',
              CARD_FILL[card.tone],
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-current">
                <Icon size={17} />
              </span>
              {card.bar !== undefined && (
                <span className="hidden rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-black tabular-nums opacity-90 sm:block">
                  {card.bar}%
                </span>
              )}
            </div>

            <p className="mt-3 flex items-baseline gap-1">
              <span className="font-dash text-2xl font-black tabular-nums leading-none lg:text-3xl">
                {card.value}
              </span>
              {card.unit && (
                <span className="text-[11px] font-black tabular-nums opacity-80">{card.unit}</span>
              )}
            </p>
            <p className="mt-1 truncate text-[11px] font-black opacity-90">{card.title}</p>
            <p className="mt-0.5 truncate text-[10px] font-bold opacity-70">{card.caption}</p>

            {card.bar !== undefined && (
              <div
                role="progressbar"
                aria-valuenow={card.bar}
                aria-valuemin={0}
                aria-valuemax={100}
                className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/25"
              >
                <div
                  className="h-full rounded-full bg-white/80 transition-all duration-1000 ease-out"
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

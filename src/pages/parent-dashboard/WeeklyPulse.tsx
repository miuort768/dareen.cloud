import { CheckCircle2, XCircle, ClipboardList, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { WeeklyPulseStats } from './types'
import { CountUp } from '../../shared/components/CountUp'
import { cn } from '../../lib/utils'

interface WeeklyPulseProps {
  stats: WeeklyPulseStats
}

type Tone = 'success' | 'error' | 'info' | 'primary'

const CARD_FILL: Record<Tone, string> = {
  success: 'bg-success text-on-success',
  error: 'bg-error text-on-error',
  info: 'bg-info text-on-info',
  primary: 'bg-primary text-on-primary',
}

const ICON_FG: Record<Tone, string> = {
  success: 'text-on-success',
  error: 'text-on-error',
  info: 'text-on-info',
  primary: 'text-on-primary',
}

interface TileSpec {
  key: Tone
  icon: LucideIcon
  label: string
  value: number
  caption: string
  bar?: number
}

/** شريط نبض الأسبوع — صناديق مشبعة بألوان الحالة مع رقائق زجاجية وأرقام كبرى */
export const WeeklyPulse = ({ stats }: WeeklyPulseProps) => {
  const tiles: TileSpec[] = [
    {
      key: 'success',
      icon: CheckCircle2,
      label: 'حصص منجزة',
      value: stats.completed,
      caption: `حضور ${stats.attendanceRate}% · ${stats.weeklyCompleted} هذا الأسبوع`,
      bar: stats.attendanceRate,
    },
    {
      key: 'error',
      icon: XCircle,
      label: 'حصص ملغاة',
      value: stats.cancelled,
      caption: 'من إجمالي تسجيلات أبنائك',
    },
    {
      key: 'info',
      icon: ClipboardList,
      label: 'حصص اليوم',
      value: stats.todayCount,
      caption: 'في جدول اليوم',
    },
    {
      key: 'primary',
      icon: TrendingUp,
      label: 'التقدم الأكاديمي',
      value: stats.academicProgress,
      caption: 'من الخطة الأكاديمية المخطط لها',
      bar: stats.academicProgress,
    },
  ]

  return (
    <section aria-label="نبض الأسبوع" className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
      {tiles.map((tile) => {
        const Icon = tile.icon
        return (
          <article
            key={tile.key}
            className={cn(
              'relative overflow-hidden rounded-2xl p-3.5 shadow-elevation-1 transition-all duration-normal hover:-translate-y-0.5 hover:shadow-elevation-2 sm:p-4',
              CARD_FILL[tile.key],
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 ${ICON_FG[tile.key]}`}
              >
                <Icon size={18} />
              </span>
              {tile.bar !== undefined && (
                <span className="hidden text-[10px] font-black tabular-nums text-on-success opacity-70 sm:block">
                  {tile.bar}%
                </span>
              )}
            </div>

            <div className="mt-3 min-w-0">
              <CountUp
                value={tile.value}
                format={tile.key === 'primary' ? (n) => `${n}%` : undefined}
                className={cn(
                  'font-dash text-2xl font-black tabular-nums leading-none tracking-tight lg:text-3xl',
                  tile.key === 'success' && 'text-on-success',
                  tile.key === 'error' && 'text-on-error',
                  tile.key === 'info' && 'text-on-info',
                  tile.key === 'primary' && 'text-on-primary',
                )}
              />
              <p
                className={cn(
                  'mt-1 truncate text-xs font-medium',
                  tile.key === 'success' && 'text-on-success opacity-70',
                  tile.key === 'error' && 'text-on-error opacity-70',
                  tile.key === 'info' && 'text-on-info opacity-70',
                  tile.key === 'primary' && 'text-on-primary opacity-70',
                )}
              >
                {tile.label}
              </p>
              <p
                className={cn(
                  'mt-0.5 truncate text-micro font-medium opacity-60',
                  tile.key === 'success' && 'text-on-success',
                  tile.key === 'error' && 'text-on-error',
                  tile.key === 'info' && 'text-on-info',
                  tile.key === 'primary' && 'text-on-primary',
                )}
              >
                {tile.caption}
              </p>

              {tile.bar !== undefined && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/25">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{ width: `${Math.min(Math.max(tile.bar, 0), 100)}%` }}
                  />
                </div>
              )}
            </div>
          </article>
        )
      })}
    </section>
  )
}

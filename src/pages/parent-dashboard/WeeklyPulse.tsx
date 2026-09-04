import { CheckCircle2, XCircle, ClipboardList, TrendingUp } from 'lucide-react'
import type { WeeklyPulseStats } from './types'
import { CountUp } from '../../shared/components/CountUp'

interface WeeklyPulseProps {
  stats: WeeklyPulseStats
}

export const WeeklyPulse = ({ stats }: WeeklyPulseProps) => {
  const tiles = [
    {
      icon: CheckCircle2,
      label: 'حصص منجزة',
      value: stats.completed,
      hint: stats.weeklyCompleted > 0 ? `${stats.weeklyCompleted} هذا الأسبوع` : undefined,
      tone: 'text-success',
      bg: 'bg-success-soft',
    },
    {
      icon: XCircle,
      label: 'حصص ملغاة',
      value: stats.cancelled,
      tone: 'text-error',
      bg: 'bg-error-soft',
    },
    {
      icon: ClipboardList,
      label: 'حصص اليوم',
      value: stats.todayCount,
      tone: 'text-info',
      bg: 'bg-info-soft',
    },
    {
      icon: TrendingUp,
      label: 'التقدم الأكاديمي',
      value: `${stats.academicProgress}%`,
      tone: 'text-primary',
      bg: 'bg-primary-soft',
    },
  ]

  return (
    <section aria-label="نبض الأسبوع" className="grid grid-cols-2 gap-3">
      {tiles.map((tile) => {
        const Icon = tile.icon
        const numeric =
          typeof tile.value === 'number'
            ? tile.value
            : parseInt(String(tile.value).replace('%', ''), 10) || 0
        return (
          <div
            key={tile.label}
            className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all duration-300 hover:shadow-elevation-1"
          >
            <div
              className={`mb-2.5 flex h-9 w-9 items-center justify-center rounded-2xl ${tile.bg}`}
            >
              <Icon size={16} className={tile.tone} />
            </div>
            <CountUp
              value={numeric}
              format={typeof tile.value === 'number' ? undefined : (n) => `${n}%`}
              className="block text-xl font-black tabular-nums leading-none text-main"
            />
            <p className="mt-1.5 text-[11px] font-bold text-muted">{tile.label}</p>
            {tile.hint && (
              <p className={`mt-0.5 text-[10px] font-black ${tile.tone}`}>{tile.hint}</p>
            )}
          </div>
        )
      })}
    </section>
  )
}

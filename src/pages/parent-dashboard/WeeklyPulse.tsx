import { CheckCircle2, XCircle, ClipboardList, TrendingUp } from 'lucide-react'
import type { WeeklyPulseStats } from './types'

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
        return (
          <div
            key={tile.label}
            className="rounded-3xl border border-border bg-surface p-4 shadow-sm transition-all duration-300 hover:shadow-elevation-1"
          >
            <div
              className={`mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl ${tile.bg}`}
            >
              <Icon size={16} className={tile.tone} />
            </div>
            <p className="text-xl font-black tabular-nums leading-none text-main">{tile.value}</p>
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

import { motion } from 'framer-motion'
import { Sparkles, Star, Flame, BookOpen, Trophy } from 'lucide-react'
import { RANK_ICON_MAP } from '../../shared/utils/ranks'
import { CountUp } from '../../shared/components/CountUp'
import { cn } from '../../lib/utils'

interface RankJourneyProps {
  points: number
  rank: { name: string; icon: string }
  nextRankName: string | null
  pointsNeeded: number
}

const BADGES = [
  { icon: Star, label: 'نقطة أولى', at: 1, tile: 'bg-primary-soft', text: 'text-primary' },
  { icon: Flame, label: '100 نقطة', at: 100, tile: 'bg-success-soft', text: 'text-success-strong' },
  { icon: Sparkles, label: '500 نقطة', at: 500, tile: 'bg-info-soft', text: 'text-info-strong' },
  {
    icon: BookOpen,
    label: '1000 نقطة',
    at: 1000,
    tile: 'bg-warning-soft',
    text: 'text-warning-strong',
  },
] as const

export const RankJourney = ({ points, rank, nextRankName, pointsNeeded }: RankJourneyProps) => {
  const RankIcon = RANK_ICON_MAP[rank.icon] || Star
  const nextRankMin = points + pointsNeeded
  const prevMilestone = BADGES.filter((b) => b.at <= points).pop()?.at ?? 0
  const span = Math.max(nextRankMin - prevMilestone, 1)
  const pct = nextRankName
    ? Math.min(Math.round(((points - prevMilestone) / span) * 100), 100)
    : 100

  return (
    <section
      aria-label="رحلة الرتب"
      className="rounded-3xl border border-border bg-card p-6 shadow-soft transition-colors duration-slow"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary">
            <Trophy size={14} />
          </div>
          <h3 className="text-sm font-black text-main">رحلة الرتب</h3>
        </div>
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover text-on-primary shadow-elevation-2">
            <RankIcon size={19} />
          </div>
          <div className="min-w-0 text-end">
            <p className="truncate text-sm font-black text-main">{rank.name}</p>
            <p className="text-[11px] font-bold text-muted">رتبتك الحالية</p>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover px-4 py-3 text-center shadow-elevation-1">
        <CountUp
          value={points}
          className="block font-dash text-2xl font-black tabular-nums leading-none text-on-primary"
        />
        <p className="mt-1 text-[10px] font-bold text-white/80">نقطة</p>
      </div>

      {nextRankName ? (
        <>
          <div className="relative h-2.5 overflow-hidden rounded-full bg-divider">
            <motion.div
              className="absolute inset-y-0 start-0 rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </div>
          <p className="mt-2 flex items-center justify-between gap-2 text-[11px] font-bold">
            <span className="truncate text-muted">
              التالي: <span className="font-black text-main">{nextRankName}</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-black text-primary">
              {pointsNeeded} نقطة متبقية
            </span>
          </p>
        </>
      ) : (
        <p className="rounded-2xl bg-success py-3 text-center text-[11px] font-black text-on-success">
          أعلى رتبة — أنت الأسطورة!
        </p>
      )}

      <div className="mt-4 grid grid-cols-4 gap-2">
        {BADGES.map((badge) => {
          const Icon = badge.icon
          const unlocked = points >= badge.at
          return (
            <div
              key={badge.label}
              className={cn(
                'rounded-2xl p-2 text-center transition-all duration-slow',
                unlocked
                  ? cn('hover:-translate-y-0.5 hover:shadow-elevation-1', badge.tile)
                  : 'bg-divider/40',
              )}
              title={badge.label}
            >
              <Icon size={15} className={cn('mx-auto', unlocked ? badge.text : 'text-muted')} />
              <p
                className={cn(
                  'mt-1 text-[9px] font-black leading-tight',
                  unlocked ? badge.text : 'text-muted',
                )}
              >
                {badge.label}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

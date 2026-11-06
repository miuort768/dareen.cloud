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
      className="border-border/80 p-5.5 rounded-[26px] border bg-card shadow-elevation-1 transition-all duration-normal hover:shadow-elevation-2 sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-soft">
            <Trophy size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-main">رحلة الرتب</h3>
            <p className="text-[11px] text-muted">تقدمك الإجمالي ونقاطك</p>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover text-on-primary shadow-elevation-2">
            <RankIcon size={20} />
          </div>
          <div className="min-w-0 text-end">
            <p className="truncate text-sm font-bold text-main">{rank.name}</p>
            <p className="text-[11px] font-normal text-muted">رتبتك الحالية</p>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-2xl bg-gradient-to-br from-primary via-primary-active to-primary-deep p-4 text-center text-on-primary shadow-elevation-1">
        <CountUp
          value={points}
          className="block font-dash text-3xl font-black tabular-nums leading-none text-on-primary"
        />
        <p className="mt-1.5 text-xs font-semibold text-white/90">إجمالي النقاط المكتسبة</p>
      </div>

      {nextRankName ? (
        <div className="space-y-2">
          <div className="relative h-3 overflow-hidden rounded-full bg-divider">
            <motion.div
              className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-primary to-primary-hover"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-muted">
              الرتبة القادمة: <span className="font-bold text-main">{nextRankName}</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-bold text-primary">
              {pointsNeeded} نقطة متبقية
            </span>
          </div>
        </div>
      ) : (
        <p className="rounded-2xl bg-success py-3 text-center text-xs font-bold text-on-success">
          أعلى رتبة — أنت الأسطورة! 🌟
        </p>
      )}

      <div className="mt-5 grid grid-cols-4 gap-2">
        {BADGES.map((badge) => {
          const Icon = badge.icon
          const unlocked = points >= badge.at
          return (
            <div
              key={badge.label}
              className={cn(
                'rounded-2xl p-2.5 text-center transition-all duration-slow',
                unlocked
                  ? `${badge.tile} border border-primary/20 shadow-elevation-1`
                  : 'bg-surface/50 opacity-50',
              )}
            >
              <div
                className={cn(
                  'mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl',
                  unlocked ? badge.text : 'text-muted',
                )}
              >
                <Icon size={16} />
              </div>
              <p
                className={cn(
                  'truncate text-[10px] font-bold',
                  unlocked ? 'text-main' : 'text-muted',
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

import { motion } from 'framer-motion'
import { Sparkles, Star, Flame, BookOpen, Trophy } from 'lucide-react'
import { RANK_ICON_MAP } from '../../shared/utils/ranks'
import { CountUp } from '../../shared/components/CountUp'

interface RankJourneyProps {
  points: number
  rank: { name: string; icon: string }
  nextRankName: string | null
  pointsNeeded: number
}

const BADGES = [
  { icon: Star, label: 'نقطة أولى', at: 1 },
  { icon: Flame, label: '100 نقطة', at: 100 },
  { icon: Sparkles, label: '500 نقطة', at: 500 },
  { icon: BookOpen, label: '1000 نقطة', at: 1000 },
]

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
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors duration-300"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
            <Trophy size={14} className="text-primary" />
          </div>
          <h3 className="text-sm font-black text-main">رحلة الرتب</h3>
        </div>
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary">
            <RankIcon size={19} />
          </div>
          <div className="min-w-0 text-end">
            <p className="truncate text-sm font-black text-main">{rank.name}</p>
            <p className="text-[11px] font-bold text-muted">رتبتك الحالية</p>
          </div>
        </div>
      </div>
      <div className="mb-4 rounded-2xl bg-primary-soft px-4 py-2.5 text-center">
        <CountUp
          value={points}
          className="block text-xl font-black tabular-nums leading-none text-primary"
        />
        <p className="mt-1 text-[10px] font-bold text-muted">نقطة</p>
      </div>

      {nextRankName ? (
        <>
          <div className="relative h-2 overflow-hidden rounded-full bg-divider">
            <motion.div
              className="absolute inset-y-0 start-0 rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </div>
          <p className="mt-2 flex items-center justify-between text-[11px] font-bold">
            <span className="text-muted">
              التالي: <span className="font-black text-main">{nextRankName}</span>
            </span>
            <span className="text-primary">{pointsNeeded} نقطة متبقية</span>
          </p>
        </>
      ) : (
        <p className="rounded-2xl bg-success-soft p-2.5 text-center text-[11px] font-black text-success">
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
              className={`rounded-2xl p-2 text-center transition-all duration-300 ${
                unlocked
                  ? 'bg-warning-soft hover:-translate-y-0.5 hover:shadow-elevation-1 dark:bg-primary-soft'
                  : 'bg-divider/40'
              }`}
              title={badge.label}
            >
              <Icon
                size={15}
                className={`mx-auto ${unlocked ? 'text-warning dark:text-primary' : 'text-muted'}`}
              />
              <p
                className={`mt-1 text-[9px] font-black leading-tight ${
                  unlocked ? 'text-warning dark:text-primary' : 'text-muted'
                }`}
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

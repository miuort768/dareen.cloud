import { motion } from 'framer-motion'
import { GraduationCap, Sparkles } from 'lucide-react'
import { RANK_ICON_MAP } from '../../shared/utils/ranks'
import { DashboardGreeting } from '../../shared/components/DashboardGreeting'
import { CountUp } from '../../shared/components/CountUp'

export interface GreetingStripProps {
  name: string
  grade: string
  points: number
  rank: { name: string; icon: string }
  rankProgress?: number
}

export const GreetingStrip = ({ name, grade, points, rank, rankProgress }: GreetingStripProps) => {
  const RankIcon = RANK_ICON_MAP[rank.icon] || GraduationCap
  const showProgress = typeof rankProgress === 'number' && rankProgress < 100

  return (
    <DashboardGreeting
      name={name}
      nightMessage="ليلة موفقة"
      end={
        <div
          className="w-40 rounded-2xl border border-white/20 bg-white/10 px-3.5 py-2.5 backdrop-blur-sm"
          aria-label={`النقاط الحالية ${points} نقطة، رتبة ${rank.name}`}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <RankIcon size={17} className="text-on-primary" />
            </div>
            <div className="min-w-0">
              <CountUp
                value={points}
                className="block text-sm font-black tabular-nums leading-none text-on-primary"
              />
              <p className="mt-0.5 truncate text-[10px] font-bold text-white/70">{rank.name}</p>
            </div>
          </div>
          {showProgress && (
            <div
              className="mt-2 h-1 overflow-hidden rounded-full bg-white/20"
              role="progressbar"
              aria-valuenow={rankProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="تقدمك للرتبة التالية"
            >
              <motion.div
                className="h-full rounded-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${rankProgress}%` }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.25 }}
              />
            </div>
          )}
        </div>
      }
      chips={[
        ...(grade
          ? [
              {
                icon: GraduationCap,
                label: grade,
              },
            ]
          : []),
        {
          icon: Sparkles,
          label: 'اجمع النقاط وارتقِ برتبتك',
        },
      ]}
    />
  )
}

import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { CalendarDays, GraduationCap, Sparkles } from 'lucide-react'
import { RANK_ICON_MAP } from '../../shared/utils/ranks'
import { TimeOfDayBadge } from '../../shared/components/TimeOfDayBadge'
import { CountUp } from '../../shared/components/CountUp'

interface GreetingStripProps {
  name: string
  grade: string
  points: number
  rank: { name: string; icon: string }
  rankProgress?: number
}

const getGreeting = (): string => {
  const h = new Date().getHours()
  if (h < 5) return 'ليلة موفقة'
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'يوم سعيد'
  return 'مساء الخير'
}

export const GreetingStrip = ({ name, grade, points, rank, rankProgress }: GreetingStripProps) => {
  const firstName = name.split(' ')[0] || name
  const RankIcon = RANK_ICON_MAP[rank.icon] || GraduationCap
  const showProgress = typeof rankProgress === 'number' && rankProgress < 100

  return (
    <section
      aria-label="ترحيب"
      className="relative overflow-hidden rounded-none bg-gradient-to-br from-primary via-primary-deep to-primary-hover shadow-elevation-2 transition-colors duration-300"
    >
      <div
        className="pointer-events-none absolute -end-20 -top-24 h-64 w-64 rounded-full border border-white/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -end-6 -top-10 h-36 w-36 rounded-full border border-white/5"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -start-12 h-44 w-44 rounded-full bg-white/5"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-tl from-transparent to-white/5"
        aria-hidden="true"
      />

      <div className="relative z-10 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-white/70">
              <CalendarDays size={12} />
              {format(new Date(), 'eeee، d MMMM yyyy', { locale: ar })}
            </p>
            <h1 className="text-xl font-black leading-tight text-on-primary md:text-2xl">
              {getGreeting()}، {firstName}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <TimeOfDayBadge variant="glass" />
            <div
              className="w-40 rounded-none border border-white/20 bg-white/10 px-3.5 py-2.5 backdrop-blur-sm"
              aria-label={`النقاط الحالية ${points} نقطة، رتبة ${rank.name}`}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-white/15">
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
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          {grade && (
            <span className="inline-flex items-center gap-1.5 rounded-none border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-on-primary backdrop-blur-sm">
              <GraduationCap size={12} />
              {grade}
            </span>
          )}
          <span className="text-on-primary/90 inline-flex items-center gap-1.5 rounded-none border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold backdrop-blur-sm">
            <Sparkles size={12} />
            اجمع النقاط وارتقِ برتبتك
          </span>
        </div>
      </div>
    </section>
  )
}

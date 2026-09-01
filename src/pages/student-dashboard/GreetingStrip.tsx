import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { CalendarDays, GraduationCap } from 'lucide-react'
import { RANK_ICON_MAP } from '../../shared/utils/ranks'

interface GreetingStripProps {
  name: string
  grade: string
  points: number
  rank: { name: string; icon: string }
}

const getGreeting = (): string => {
  const h = new Date().getHours()
  if (h < 5) return 'ليلة موفقة'
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'يوم سعيد'
  return 'مساء الخير'
}

/** هيرو ترحيب الطالب — تدرج primary مع شريحة الرتبة الزجاجية */
export const GreetingStrip = ({ name, grade, points, rank }: GreetingStripProps) => {
  const firstName = name.split(' ')[0] || name
  const RankIcon = RANK_ICON_MAP[rank.icon] || GraduationCap

  return (
    <section
      aria-label="ترحيب"
      className="relative overflow-hidden rounded-none bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-5 shadow-elevation-2 transition-colors duration-300 sm:p-6"
    >
      <div
        className="pointer-events-none absolute -end-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-14 -start-10 h-36 w-36 rounded-full bg-black/10 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-white/70">
            <CalendarDays size={12} />
            {format(new Date(), 'eeee، d MMMM yyyy', { locale: ar })}
          </p>
          <h1 className="text-xl font-black leading-tight text-on-primary md:text-2xl">
            {getGreeting()}، {firstName}
          </h1>
          {grade && <p className="mt-1 text-[11px] font-bold text-white/70">{grade}</p>}
        </div>

        <div
          className="flex shrink-0 items-center gap-2 rounded-none border border-white/20 bg-white/10 px-3.5 py-2 backdrop-blur-sm"
          aria-label={`النقاط الحالية ${points} نقطة، رتبة ${rank.name}`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-none bg-white/15">
            <RankIcon size={17} className="text-on-primary" />
          </div>
          <div>
            <p className="text-sm font-black tabular-nums leading-none text-on-primary">{points}</p>
            <p className="mt-1 text-[10px] font-bold text-white/70">{rank.name}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

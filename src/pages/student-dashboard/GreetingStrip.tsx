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

export const GreetingStrip = ({ name, grade, points, rank }: GreetingStripProps) => {
  const firstName = name.split(' ')[0] || name
  const RankIcon = RANK_ICON_MAP[rank.icon] || GraduationCap

  return (
    <section
      aria-label="ترحيب"
      className="relative overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-sm transition-colors duration-300 sm:p-6"
    >
      <div
        className="pointer-events-none absolute inset-y-0 start-0 w-1.5 bg-primary"
        aria-hidden="true"
      />

      <div className="flex flex-wrap items-center justify-between gap-4 ps-3">
        <div className="min-w-0">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-muted">
            <CalendarDays size={12} />
            {format(new Date(), 'eeee، d MMMM yyyy', { locale: ar })}
          </p>
          <h1 className="text-xl font-black leading-tight text-main md:text-2xl">
            {getGreeting()}، {firstName}
          </h1>
          {grade && <p className="mt-1 text-[11px] font-bold text-muted">{grade}</p>}
        </div>

        <div
          className="flex shrink-0 items-center gap-2 rounded-2xl border border-border px-3.5 py-2"
          aria-label={`النقاط الحالية ${points} نقطة، رتبة ${rank.name}`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
            <RankIcon size={17} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-black tabular-nums leading-none text-primary">{points}</p>
            <p className="mt-1 text-[10px] font-bold text-muted">{rank.name}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

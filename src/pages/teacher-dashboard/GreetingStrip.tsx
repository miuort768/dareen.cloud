import { Sparkles, Users, CalendarDays, CheckCircle2 } from 'lucide-react'
import { DashboardGreeting } from '../../shared/components/DashboardGreeting'
import { CountUp } from '../../shared/components/CountUp'

export interface GreetingStripProps {
  name: string
  studentsCount: number
  todayCount: number
  monthCompleted: number
  points?: number
}

export const GreetingStrip = ({
  name,
  studentsCount,
  todayCount,
  monthCompleted,
  points,
}: GreetingStripProps) => (
  <DashboardGreeting
    name={name}
    fallbackName="المعلمة"
    nightMessage="ليلة طيبة"
    hideTimeBadge
    end={
      typeof points === 'number' && points > 0 ? (
        <div
          className="flex items-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm"
          aria-label={`نقاطك ${points} نقطة`}
        >
          <Sparkles size={14} className="text-on-primary" />
          <CountUp
            value={points}
            className="text-sm font-black tabular-nums leading-none text-on-primary"
          />
        </div>
      ) : null
    }
    stats={[
      { icon: Users, label: studentsCount === 1 ? 'طالب' : 'طلاب', value: studentsCount },
      { icon: CalendarDays, label: 'حصص اليوم', value: todayCount },
      { icon: CheckCircle2, label: 'مكتملة', value: monthCompleted },
    ]}
  />
)

import type { User } from '../../../types/auth'
import type { DashboardStats } from '../types'
import { DashboardGreeting } from '../../../shared/components/DashboardGreeting'

interface HeroSectionProps {
  currentUser: User | null
  stats?: DashboardStats
}

export const HeroSection = ({ currentUser, stats }: HeroSectionProps) => {
  const attendanceRate = stats?.attendanceRate ?? 0

  const radius = 24
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (attendanceRate / 100) * circumference
  const tone =
    attendanceRate >= 90 ? 'text-success' : attendanceRate >= 75 ? 'text-warning' : 'text-error'

  return (
    <DashboardGreeting
      name={currentUser?.name || ''}
      fallbackName="المدير"
      nightMessage="ليلة موفقة"
      end={
        <div
          className="relative h-[58px] w-[58px] shrink-0"
          aria-label={`نسبة الحضور ${attendanceRate} بالمئة`}
        >
          <svg className="h-full w-full -rotate-90" viewBox="0 0 56 56" aria-hidden="true">
            <circle
              cx="28"
              cy="28"
              r={radius}
              fill="none"
              stroke="currentColor"
              className="text-white/20"
              strokeWidth="5"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={`${tone} transition-all duration-1000 ease-out`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-black tabular-nums leading-none text-on-primary">
              {attendanceRate}%
            </span>
            <span className="mt-0.5 text-[9px] font-bold text-white/90">الحضور</span>
          </div>
        </div>
      }
    />
  )
}

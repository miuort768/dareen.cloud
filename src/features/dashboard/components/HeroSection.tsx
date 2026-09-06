import type { User } from '../../../types/auth'
import type { DashboardStats } from '../types'

interface HeroSectionProps {
  currentUser: User | null
  stats?: DashboardStats
}

const getGreeting = (): string => {
  const h = new Date().getHours()
  if (h < 5) return 'تصبح على خير'
  if (h < 12) return 'صباح الخير'
  return 'مساء الخير'
}

const getFormattedDate = (): string => {
  return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

export const HeroSection = ({ currentUser, stats }: HeroSectionProps) => {
  const firstName = (currentUser?.name || 'المستخدم').split(' ')[0]
  const attendanceRate = stats?.attendanceRate ?? 0

  const radius = 24
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (attendanceRate / 100) * circumference
  const tone =
    attendanceRate >= 90 ? 'text-success' : attendanceRate >= 75 ? 'text-warning' : 'text-error'

  return (
    <div className="flex items-center justify-between gap-3 px-1" dir="rtl">
      <div className="min-w-0">
        <p className="mb-0.5 text-[11px] font-bold text-muted">{getFormattedDate()}</p>
        <h1 className="truncate font-dash text-[22px] font-black leading-tight tracking-tight text-main">
          {getGreeting()}، {firstName}
        </h1>
      </div>

      <div className="relative h-[54px] w-[54px] shrink-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 56 56">
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-border"
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
          <span className={`text-sm font-black tabular-nums leading-none ${tone}`}>
            {attendanceRate}%
          </span>
          <span className="mt-0.5 text-[9px] font-bold text-muted">الحضور</span>
        </div>
      </div>
    </div>
  )
}

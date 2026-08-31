import { Users, TrendingUp, Calendar } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import type { Student } from '../../types'

interface HeroSectionProps {
  name: string
  children: Student[]
  attendanceRate: number
  academicProgress: number
}

const getGreeting = (): string => {
  const h = new Date().getHours()
  if (h < 5) return 'تصبح على خير'
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'مساء الخير'
  return 'مساء الخير'
}

const getDayName = (): string => {
  return format(new Date(), 'eeee', { locale: ar })
}

const getFormattedDate = (): string => {
  return format(new Date(), 'd MMMM yyyy', { locale: ar })
}

const HeroStatRow = ({
  icon: Icon,
  label,
  value,
  iconBg,
  iconText,
}: {
  icon: LucideIcon
  label: string
  value: string
  iconBg: string
  iconText: string
}) => (
  <div className="flex items-center gap-2.5">
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
      <Icon size={16} className={iconText} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-muted">{label}</p>
      <p className="truncate text-sm font-black leading-tight text-main">{value}</p>
    </div>
  </div>
)

export const HeroSection = ({
  name,
  children,
  attendanceRate,
  academicProgress,
}: HeroSectionProps) => {
  const firstName = name.split(' ')[0] || name
  const totalEnrollments = children.reduce((sum, c) => sum + (c.enrollments?.length || 0), 0)

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (attendanceRate / 100) * circumference
  const tone =
    attendanceRate >= 90 ? 'text-success' : attendanceRate >= 75 ? 'text-warning' : 'text-error'

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-primary-light via-primary-soft to-card p-5 shadow-sm transition-colors duration-300 dark:border-primary/30 dark:from-card dark:via-surface dark:to-card sm:p-6 md:p-8">
      <div className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl dark:bg-primary/10" />
      <div className="pointer-events-none absolute -bottom-24 -start-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl dark:bg-primary/5" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Calendar size={12} />
              متابعة ولي الأمر
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
              {getDayName()} • {getFormattedDate()}
            </span>
          </div>

          <h1 className="mb-2 text-2xl font-black leading-tight text-main md:text-3xl">
            {getGreeting()}، {firstName}
          </h1>

          <p className="text-sm font-bold text-muted">
            {children.length} {children.length === 1 ? 'ابن مسجّل' : 'أبناء مسجلين'} •{' '}
            {totalEnrollments} {totalEnrollments === 1 ? 'مادة دراسية' : 'مواد دراسية'}
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-center gap-4 self-center rounded-2xl border border-border bg-surface p-4 shadow-sm sm:gap-5 md:self-auto">
          <div className="relative">
            <svg className="h-[92px] w-[92px] -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-divider"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={`${tone} transition-all duration-1000 ease-out`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xl font-black tabular-nums leading-none ${tone}`}>
                {attendanceRate}%
              </span>
              <span className="mt-1 text-[10px] font-bold text-muted">الحضور</span>
            </div>
          </div>

          <div className="h-16 w-px shrink-0 bg-divider" aria-hidden="true" />

          <div className="flex min-w-0 flex-col gap-3.5">
            <HeroStatRow
              icon={TrendingUp}
              label="التقدم الدراسي"
              value={`${academicProgress}%`}
              iconBg="bg-primary-soft"
              iconText="text-primary"
            />
            <HeroStatRow
              icon={Users}
              label="عدد الأبناء"
              value={String(children.length)}
              iconBg="bg-info-soft"
              iconText="text-info"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

import { Users, TrendingUp, Calendar } from 'lucide-react'
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

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-primary-light via-primary-soft to-card p-6 shadow-sm transition-all duration-300 dark:border-primary/30 dark:from-card dark:via-surface dark:to-card md:p-8">
      <div className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl dark:bg-primary/10" />
      <div className="pointer-events-none absolute -bottom-24 -start-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl dark:bg-primary/5" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Calendar size={12} />
              متابعة ولي الأمر • {getDayName()} ({getFormattedDate()})
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

        <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-end">
          <div className="relative shrink-0">
            <svg className="h-[110px] w-[110px] -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-border"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="text-primary transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black tabular-nums text-main">{attendanceRate}%</span>
              <span className="text-[10px] font-bold text-muted">متوسط الحضور</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted">التقدم الدراسي</p>
                <p className="text-base font-black tabular-nums text-main">{academicProgress}%</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info-soft text-info">
                <Users size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted">عدد الأبناء</p>
                <p className="text-base font-black tabular-nums text-main">{children.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

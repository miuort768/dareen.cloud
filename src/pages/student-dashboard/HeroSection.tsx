import { GraduationCap, Sparkles, TrendingUp, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface HeroSectionProps {
  name: string
  grade: string
  curriculum: string
  points: number
  rank: { name: string; icon: string; color: string }
  attendanceRate: number
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

export const HeroSection = ({
  name,
  grade,
  curriculum,
  points,
  rank,
  attendanceRate,
}: HeroSectionProps) => {
  const firstName = name.split(' ')[0] || name

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (attendanceRate / 100) * circumference

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-colors duration-300 dark:border-border dark:bg-card md:p-8">
      <div className="pointer-events-none absolute -end-20 -top-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl dark:bg-primary/5" />
      <div className="pointer-events-none absolute -bottom-20 -start-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl dark:bg-primary/5" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-sm font-medium text-muted dark:text-muted">
            {getGreeting()}، {firstName}
          </p>
          <h1 className="mb-4 text-2xl font-bold leading-tight text-main dark:text-main md:text-[30px]">
            {firstName}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {grade && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary dark:bg-primary/10 dark:text-primary">
                <GraduationCap size={12} /> {grade}
              </span>
            )}
            {curriculum && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted dark:border-border dark:bg-surface dark:text-muted">
                {curriculum}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted dark:border-border dark:bg-surface dark:text-muted">
              <Calendar size={11} /> {getDayName()}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative shrink-0">
            <svg className="h-[120px] w-[120px] -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-border dark:text-border"
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
                className="text-primary transition-all duration-1000 ease-out dark:text-primary"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-main dark:text-main">{attendanceRate}%</span>
              <span className="text-[11px] font-medium text-muted dark:text-muted">حضور</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 dark:border-border dark:bg-surface">
              <Sparkles size={14} className="text-primary dark:text-primary" />
              <span className="text-xs font-medium text-muted dark:text-muted">النقاط</span>
              <span className="text-sm font-bold text-main dark:text-main">{points}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 dark:border-border dark:bg-surface">
              <TrendingUp size={14} className="text-primary dark:text-primary" />
              <span className="text-xs font-medium text-muted dark:text-muted">الرتبة</span>
              <span className="text-xs font-bold text-main dark:text-main">{rank.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

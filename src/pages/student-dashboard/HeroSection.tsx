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
    <div className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-gradient-to-br from-primary-light via-primary-soft to-card p-6 shadow-sm transition-all duration-300 dark:border-primary/30 dark:from-card dark:via-surface dark:to-card md:p-8">
      <div className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl dark:bg-primary/10" />
      <div className="pointer-events-none absolute -bottom-24 -start-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl dark:bg-primary/5" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Sparkles size={12} />
              لوحة التحكم الدراسية
            </span>
            <span className="text-xs font-medium text-muted">
              <Calendar size={12} className="inline me-1" />
              {getDayName()}
            </span>
          </div>

          <h1 className="mb-3 text-2xl font-black leading-tight text-main md:text-3xl">
            {getGreeting()}، {firstName}
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            {grade && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                <GraduationCap size={13} /> {grade}
              </span>
            )}
            {curriculum && (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-muted">
                {curriculum}
              </span>
            )}
          </div>
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
                className="text-border/50"
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
              <span className="text-2xl font-black text-main tabular-nums">{attendanceRate}%</span>
              <span className="text-[10px] font-bold text-muted">نسبة الحضور</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted">إجمالي النقاط</p>
                <p className="text-base font-black text-main tabular-nums">{points}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                <TrendingUp size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted">الرتبة الحالية</p>
                <p className="text-xs font-extrabold text-main">{rank.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

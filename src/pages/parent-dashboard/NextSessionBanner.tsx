import { Clock, MapPin, GraduationCap, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface NextSessionBannerProps {
  todayTasks: {
    studentName: string
    subject: string
    teacher: string
    time: string
    period: string
  }[]
}

export const NextSessionBanner = ({ todayTasks }: NextSessionBannerProps) => {
  if (todayTasks.length === 0) {
    return (
      <div className="border-border/50 rounded-3xl border bg-surface p-6 shadow-sm transition-colors duration-300 dark:border-primary/20 dark:bg-card md:p-7">
        <div className="flex flex-col items-center gap-5 md:flex-row">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-soft dark:bg-primary/10">
            <Calendar size={24} className="text-primary dark:text-primary" />
          </div>
          <div className="text-center md:text-start">
            <p className="mb-1 text-lg font-bold text-main dark:text-main">لا توجد حصص اليوم</p>
            <p className="text-sm font-medium text-muted dark:text-muted">
              استمتع بيومك مع أبنائك.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const next = todayTasks[0]
  if (!next) return null

  return (
    <div className="border-border/50 overflow-hidden rounded-3xl border bg-surface shadow-sm transition-all duration-300 hover:shadow-elevation-1 dark:border-primary/20 dark:bg-card">
      <div className="p-5 md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft dark:bg-primary/10">
            <Clock size={16} className="text-primary dark:text-primary" />
          </div>
          <h3 className="text-base font-bold text-main dark:text-main md:text-lg">الحصة القادمة</h3>
          <span className="me-auto text-xs font-medium text-muted dark:text-muted">
            {format(new Date(), 'eeee', { locale: ar })}
          </span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-soft dark:bg-primary/10">
            <span className="text-xl font-bold text-primary dark:text-primary">
              {next.subject.charAt(0)}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-main dark:text-main md:text-lg">
              {next.subject}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted dark:text-muted">
                <GraduationCap size={12} /> {next.teacher}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted dark:text-muted">
                <MapPin size={12} /> {next.studentName}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl bg-primary-soft px-3.5 py-2 text-sm font-bold text-primary dark:bg-primary/10 dark:text-primary">
              <Clock size={14} />
              {next.time}
            </div>
            <span className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11px] font-semibold text-muted dark:border-border dark:bg-surface dark:text-muted">
              {next.period}
            </span>
          </div>
        </div>
      </div>

      {todayTasks.length > 1 && (
        <div className="border-t border-border bg-surface px-5 py-2.5 dark:border-border dark:bg-surface">
          <p className="text-center text-xs font-medium text-muted dark:text-muted">
            <span className="font-bold text-main dark:text-main">{todayTasks.length - 1}</span> حصص
            أخرى اليوم
          </p>
        </div>
      )}
    </div>
  )
}

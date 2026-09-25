import React from 'react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { CalendarDays, type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { TimeOfDayBadge } from './TimeOfDayBadge'
import { CountUp } from './CountUp'

export interface DashboardGreetingStat {
  label: string
  value: number
  formatter?: (value: number) => string
  icon?: LucideIcon
}

export interface DashboardGreetingChip {
  icon: LucideIcon
  label: string
}

export interface DashboardGreetingProps {
  name: string
  /** الاسم البديل عند غيابه (مثل «المعلمة») */
  fallbackName?: string
  /** رسالة آخر الليل (قبل 5 صباحًا) — لكل دور لمسة خاصة */
  nightMessage?: string
  /** سطر مساعد تحت الترحيب (مثل متابعة رحلة الابن) */
  subtitle?: React.ReactNode
  /** أداة عائمة في الأعلى (نقاط/حلقة حضور/بطاقة رتبة) */
  end?: React.ReactNode
  /** صف أرقام كبرى تحت الفاصل */
  stats?: DashboardGreetingStat[]
  /** شرائح شارة صغيرة في أسفل البطاقة */
  chips?: DashboardGreetingChip[]
  /** إخفاء شارة الوقت الدائرية النابضة (تُستخدم لتصميم هيرو المعلمة) */
  hideTimeBadge?: boolean
  className?: string
}

const getGreeting = (nightMessage: string): string => {
  const h = new Date().getHours()
  if (h < 5) return nightMessage
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'يوم سعيد'
  return 'مساء الخير'
}

/**
 * ترويسة ترحيب موحدة للوحات (معلم/طالب/ولي أمر) — هيرو اساسي متدرج
 * مع دوائر زخرفية زجاجية، تاريخ، شارة وقت، أداة علوية، وأرقام/شرائح سفلية.
 */
export const DashboardGreeting: React.FC<DashboardGreetingProps> = ({
  name,
  fallbackName = 'المستخدم',
  nightMessage = 'ليلة هادئة',
  subtitle,
  end,
  stats,
  chips,
  hideTimeBadge = false,
  className,
}) => {
  const firstName = (name || fallbackName).split(' ')[0] || fallbackName
  const hasFooter = Boolean(stats?.length || chips?.length)

  return (
    <section
      aria-label="ترحيب"
      className={cn(
        'relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-active to-primary-deep shadow-soft',
        className,
      )}
    >
      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-white/90">
              <CalendarDays size={12} />
              {format(new Date(), 'eeee، d MMMM yyyy', { locale: ar })}
            </p>
            <h1 className="text-xl font-black leading-tight text-on-primary md:text-2xl">
              {getGreeting(nightMessage)}، {firstName}
            </h1>
            {subtitle && <div className="mt-1">{subtitle}</div>}
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            {!hideTimeBadge && <TimeOfDayBadge variant="glass" />}
            {end}
          </div>
        </div>

        {hasFooter && (
          <div className="mt-5 border-t border-white/10 pt-4">
            {stats && stats.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {stats.map((stat) => {
                  const StatIcon = stat.icon
                  return (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-white/20 bg-white/10 px-2 py-2.5 backdrop-blur-sm sm:px-3 sm:py-3"
                    >
                      {StatIcon && (
                        <span className="mb-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-white/15 sm:h-7 sm:w-7">
                          <StatIcon size={13} className="text-on-primary" />
                        </span>
                      )}
                      <CountUp
                        value={stat.value}
                        format={stat.formatter}
                        className="block text-lg font-black tabular-nums leading-none text-on-primary sm:text-xl"
                      />
                      <p className="mt-1 truncate text-[10px] font-bold text-white/80 sm:text-[11px]">
                        {stat.label}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}

            {chips && chips.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {chips.map((chip) => {
                  const Icon = chip.icon
                  return (
                    <span
                      key={chip.label}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-on-primary backdrop-blur-sm"
                    >
                      <Icon size={12} />
                      {chip.label}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

DashboardGreeting.displayName = 'DashboardGreeting'

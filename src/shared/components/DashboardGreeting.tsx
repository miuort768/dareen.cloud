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
  className,
}) => {
  const firstName = (name || fallbackName).split(' ')[0] || fallbackName
  const hasFooter = Boolean(stats?.length || chips?.length)

  return (
    <section
      aria-label="ترحيب"
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover shadow-elevation-2',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -end-20 -top-24 h-64 w-64 rounded-full border border-white/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -end-6 -top-10 h-36 w-36 rounded-full border border-white/5"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -start-12 h-44 w-44 rounded-full bg-white/5"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-tl from-transparent to-white/5"
        aria-hidden="true"
      />

      <div className="relative z-10 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-white/70">
              <CalendarDays size={12} />
              {format(new Date(), 'eeee، d MMMM yyyy', { locale: ar })}
            </p>
            <h1 className="text-xl font-black leading-tight text-on-primary md:text-2xl">
              {getGreeting(nightMessage)}، {firstName}
            </h1>
            {subtitle && <div className="mt-1">{subtitle}</div>}
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <TimeOfDayBadge variant="glass" />
            {end}
          </div>
        </div>

        {hasFooter && (
          <div className="mt-5 border-t border-white/10 pt-4">
            {stats && stats.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <CountUp
                      value={stat.value}
                      format={stat.formatter}
                      className="block text-2xl font-black tabular-nums leading-none text-on-primary"
                    />
                    <p className="mt-1.5 text-[11px] font-bold text-white/70">{stat.label}</p>
                  </div>
                ))}
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

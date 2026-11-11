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
 * ترويسة ترحيب موحدة وعصرية للوحات التحكم على الحواسيب والأجهزة اللوحية
 * تصميم Double-Bezel فائق الفخامة مع إضاءة محيطية ولمسات زجاجية دقيقة.
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
        'to-primary-deep/40 group relative rounded-[30px] bg-gradient-to-br from-white/20 via-primary/30 p-1 shadow-elevation-2 transition-all duration-normal hover:shadow-elevation-3 sm:p-1.5',
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-[26px] border border-white/20 bg-gradient-to-br from-primary via-primary-active to-primary-deep shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]">
        {/* Background ambient lighting effects */}
        <div
          className="pointer-events-none absolute -start-20 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl transition-opacity duration-slow group-hover:opacity-80 lg:h-80 lg:w-80"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 -end-20 h-64 w-64 rounded-full bg-accent opacity-25 blur-3xl transition-opacity duration-slow group-hover:opacity-80 lg:h-80 lg:w-80"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-1/3 top-0 h-40 w-80 rounded-full bg-white/10 blur-3xl transition-opacity duration-slow"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.18),rgba(255,255,255,0))] opacity-80"
          aria-hidden="true"
        />

        <div className="relative z-10 p-5 sm:p-7 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-normal text-white/95 shadow-soft backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                <CalendarDays size={13} className="text-white/90" />
                <span>{format(new Date(), 'eeee، d MMMM yyyy', { locale: ar })}</span>
              </div>
              <h1 className="font-heading text-xl font-bold tracking-tight text-on-primary md:text-2xl lg:text-3xl xl:text-4xl">
                {getGreeting(nightMessage)}، {firstName}
              </h1>
              {subtitle && <div className="mt-2 text-sm text-white/90">{subtitle}</div>}
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              {!hideTimeBadge && <TimeOfDayBadge variant="glass" />}
              {end}
            </div>
          </div>

          {hasFooter && (
            <div className="mt-6 border-t border-white/15 pt-5 lg:mt-7 lg:pt-6">
              {stats && stats.length > 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4">
                  {stats.map((stat) => {
                    const StatIcon = stat.icon
                    return (
                      <div
                        key={stat.label}
                        className="group/stat sm:p-4.5 rounded-2xl border border-white/20 bg-white/10 p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md transition-all duration-normal hover:-translate-y-1 hover:bg-white/15 hover:shadow-elevation-2 lg:p-5"
                      >
                        {StatIcon && (
                          <span className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-on-primary transition-transform duration-normal group-hover/stat:scale-110 sm:h-9 sm:w-9 lg:h-10 lg:w-10">
                            <StatIcon size={16} className="text-on-primary" />
                          </span>
                        )}
                        <CountUp
                          value={stat.value}
                          format={stat.formatter}
                          className="block font-dash text-2xl font-bold tabular-nums leading-none tracking-tight text-on-primary sm:text-3xl lg:text-4xl"
                        />
                        <p className="mt-2.5 truncate text-[11px] font-medium text-white/90 sm:text-xs lg:text-sm">
                          {stat.label}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}

              {chips && chips.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  {chips.map((chip) => {
                    const Icon = chip.icon
                    return (
                      <span
                        key={chip.label}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-normal text-on-primary shadow-soft backdrop-blur-md transition-colors hover:bg-white/20"
                      >
                        <Icon size={13} />
                        {chip.label}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

DashboardGreeting.displayName = 'DashboardGreeting'

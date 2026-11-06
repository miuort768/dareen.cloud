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
          className="pointer-events-none absolute -start-20 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl transition-opacity duration-slow group-hover:opacity-80"
          aria-hidden="true"
        />
        <div
          className="bg-accent/25 pointer-events-none absolute -bottom-20 -end-20 h-64 w-64 rounded-full blur-3xl transition-opacity duration-slow group-hover:opacity-80"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.18),rgba(255,255,255,0))] opacity-80"
          aria-hidden="true"
        />

        <div className="relative z-10 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-normal text-white/95 shadow-soft backdrop-blur-md">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                <CalendarDays size={12} className="text-white/90" />
                <span>{format(new Date(), 'eeee، d MMMM yyyy', { locale: ar })}</span>
              </div>
              <h1 className="font-heading text-xl font-bold tracking-tight text-on-primary md:text-2xl lg:text-3xl">
                {getGreeting(nightMessage)}، {firstName}
              </h1>
              {subtitle && <div className="mt-1.5">{subtitle}</div>}
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              {!hideTimeBadge && <TimeOfDayBadge variant="glass" />}
              {end}
            </div>
          </div>

          {hasFooter && (
            <div className="mt-5 border-t border-white/15 pt-4">
              {stats && stats.length > 0 && (
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  {stats.map((stat) => {
                    const StatIcon = stat.icon
                    return (
                      <div
                        key={stat.label}
                        className="group/stat rounded-2xl border border-white/20 bg-white/10 p-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md transition-all duration-normal hover:bg-white/15 hover:shadow-elevation-1 sm:p-4"
                      >
                        {StatIcon && (
                          <span className="mb-2 flex h-7 w-7 items-center justify-center rounded-xl bg-white/20 text-on-primary transition-transform duration-normal group-hover/stat:scale-110 sm:h-8 sm:w-8">
                            <StatIcon size={14} className="text-on-primary" />
                          </span>
                        )}
                        <CountUp
                          value={stat.value}
                          format={stat.formatter}
                          className="block font-dash text-xl font-bold tabular-nums leading-none tracking-tight text-on-primary sm:text-2xl lg:text-3xl"
                        />
                        <p className="mt-2 truncate text-[11px] font-medium text-white/90 sm:text-xs">
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
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-normal text-on-primary shadow-soft backdrop-blur-md"
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
      </div>
    </section>
  )
}

DashboardGreeting.displayName = 'DashboardGreeting'

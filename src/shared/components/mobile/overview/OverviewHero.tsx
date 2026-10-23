import React from 'react'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface OverviewHeroStat {
  label: string
  value: string | number
  icon?: React.ReactNode
}

export interface OverviewHeroProps {
  badge?: string
  badgeIcon?: React.ReactNode
  title: string
  subtitle: string
  illustration?: React.ReactNode
  ctaText?: string
  onCtaClick?: () => void
  metric?: {
    value: string | number
    label: string
    sublabel?: string
  }
  chips?: Array<{
    label: string
    value: string | number
  }>
  className?: string
}

export const OverviewHero: React.FC<OverviewHeroProps> = ({
  badge = 'نظرة عامة',
  badgeIcon,
  title,
  subtitle,
  illustration,
  ctaText,
  onCtaClick,
  metric,
  chips,
  className,
}) => {
  return (
    <section
      aria-label="البنر الترحيبي"
      className={cn(
        'group relative overflow-hidden rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card to-card p-5 shadow-elevation-2 transition-all duration-normal hover:shadow-elevation-3',
        className,
      )}
      dir="rtl"
    >
      {/* Background ambient light effects */}
      <div
        className="pointer-events-none absolute -start-12 -top-12 h-44 w-44 rounded-full bg-primary/20 blur-3xl transition-opacity duration-slow group-hover:opacity-80"
        aria-hidden="true"
      />
      <div
        className="bg-accent/15 pointer-events-none absolute -bottom-10 -end-10 h-44 w-44 rounded-full blur-3xl transition-opacity duration-slow group-hover:opacity-80"
        aria-hidden="true"
      />

      {/* Decorative subtle pattern grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/[0.04] via-transparent to-transparent opacity-60"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-center justify-between gap-4">
        {/* Main Info */}
        <div className="min-w-0 flex-1 space-y-2">
          {/* Badge Pill */}
          {badge && (
            <div className="shadow-xs backdrop-blur-xs inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-black text-primary">
              {badgeIcon || <Sparkles size={12} className="animate-pulse text-primary" />}
              <span>{badge}</span>
            </div>
          )}

          {/* Title with subtle gradient feel */}
          <h2 className="text-xl font-black leading-tight tracking-tight text-main">{title}</h2>

          {/* Subtitle */}
          <p className="line-clamp-2 text-xs font-medium leading-relaxed text-muted">{subtitle}</p>

          {/* Chips Row (Optional quick insights) */}
          {chips && chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {chips.map((chip, idx) => (
                <div
                  key={idx}
                  className="border-border/80 bg-surface/90 backdrop-blur-xs inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold text-main"
                >
                  <span className="text-muted">{chip.label}:</span>
                  <span className="font-dash font-black text-primary">{chip.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Metric + CTA row */}
          {(ctaText || metric) && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {metric && (
                <div className="backdrop-blur-xs flex items-baseline gap-1.5 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5">
                  <span className="font-dash text-lg font-black leading-none text-primary">
                    {metric.value}
                  </span>
                  <span className="text-[10px] font-bold text-muted">{metric.label}</span>
                  {metric.sublabel && (
                    <span className="text-[9px] font-medium text-dim">({metric.sublabel})</span>
                  )}
                </div>
              )}

              {ctaText && (
                <button
                  type="button"
                  onClick={onCtaClick}
                  className="group/btn inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-black text-on-primary shadow-elevation-1 outline-none transition-all duration-fast hover:shadow-elevation-2 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.96]"
                >
                  <span>{ctaText}</span>
                  <ArrowLeft
                    size={14}
                    strokeWidth={2.4}
                    className="transition-transform duration-fast group-hover/btn:-translate-x-0.5"
                  />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mascot / Vector Hero Visual Container */}
        <div className="flex shrink-0 items-center justify-center">
          {illustration || (
            <div className="backdrop-blur-xs relative flex h-24 w-24 items-center justify-center rounded-[24px] border border-primary/20 bg-gradient-to-br from-primary/15 via-primary/5 to-surface shadow-elevation-2">
              <Sparkles size={40} className="text-primary" strokeWidth={1.8} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

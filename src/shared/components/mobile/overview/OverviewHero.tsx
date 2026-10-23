import React from 'react'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { cn } from '../../../lib/utils'

export interface OverviewHeroProps {
  badge?: string
  title: string
  subtitle: string
  illustration?: React.ReactNode
  ctaText?: string
  onCtaClick?: () => void
  metric?: {
    value: string | number
    label: string
  }
  className?: string
}

export const OverviewHero: React.FC<OverviewHeroProps> = ({
  badge = 'نظرة عامة',
  title,
  subtitle,
  illustration,
  ctaText,
  onCtaClick,
  metric,
  className,
}) => {
  return (
    <section
      aria-label="البنر الترحيبي"
      className={cn(
        'border-accent/20 to-accent-light/40 relative overflow-hidden rounded-[26px] border bg-gradient-to-br from-accent-soft via-card p-5 shadow-elevation-1 transition-all',
        className,
      )}
      dir="rtl"
    >
      {/* Decorative ambient blobs */}
      <div
        className="bg-accent/15 pointer-events-none absolute -start-10 -top-10 h-36 w-36 rounded-full blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-6 -end-6 h-36 w-36 rounded-full bg-primary/10 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-center justify-between gap-3">
        {/* Text content */}
        <div className="min-w-0 flex-1 space-y-1.5">
          {badge && (
            <div className="bg-accent/20 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black text-main">
              <Sparkles size={11} className="text-accent" />
              <span>{badge}</span>
            </div>
          )}

          <h2 className="text-lg font-black leading-tight tracking-tight text-main">{title}</h2>

          <p className="line-clamp-2 text-xs leading-relaxed text-muted">{subtitle}</p>

          {(ctaText || metric) && (
            <div className="flex items-center gap-3 pt-2">
              {metric && (
                <div className="flex items-baseline gap-1.5">
                  <span className="font-dash text-base font-black text-main">{metric.value}</span>
                  <span className="text-[10px] font-bold text-muted">{metric.label}</span>
                </div>
              )}

              {ctaText && (
                <button
                  type="button"
                  onClick={onCtaClick}
                  className="inline-flex items-center gap-1 rounded-xl bg-accent px-3 py-1.5 text-[11px] font-bold text-on-accent shadow-elevation-1 outline-none transition-transform duration-fast hover:opacity-95 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.96]"
                >
                  <span>{ctaText}</span>
                  <ArrowLeft size={13} strokeWidth={2.2} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mascot / 3D cut-out element */}
        <div className="flex shrink-0 items-center justify-center">
          {illustration || (
            <div className="bg-accent/20 border-accent/30 relative flex h-24 w-24 items-center justify-center rounded-3xl border shadow-elevation-2">
              <span className="text-4xl" role="img" aria-label="أيقونة">
                🌟
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

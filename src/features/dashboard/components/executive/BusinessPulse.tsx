import { memo } from 'react'
import { Activity, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react'
import type { ExecutivePulse } from '../../services/executiveService'
import { cn } from '@/lib/utils'

const PULSE_TEXT: Record<string, string> = {
  excellent: 'text-success',
  good: 'text-info',
  fair: 'text-warning',
  critical: 'text-error',
  unavailable: 'text-muted',
}

const PULSE_BADGE: Record<string, string> = {
  excellent: 'bg-success-soft text-success border-success/30',
  good: 'bg-info-soft text-info border-info/30',
  fair: 'bg-warning-soft text-warning border-warning/30',
  critical: 'bg-error-soft text-error border-error/30',
  unavailable: 'bg-surface text-muted border-border',
}

const PULSE_LABELS: Record<string, string> = {
  excellent: 'ممتاز',
  good: 'جيد',
  fair: 'متوسط',
  critical: 'حرج',
  unavailable: 'غير متاح',
}

const PULSE_ICONS: Record<string, typeof TrendingUp> = {
  excellent: TrendingUp,
  good: TrendingUp,
  fair: AlertTriangle,
  critical: AlertTriangle,
  unavailable: Activity,
}

const PULSE_ARC: Record<string, string> = {
  excellent: 'var(--bg-success)',
  good: 'var(--bg-info)',
  fair: 'var(--bg-warning)',
  critical: 'var(--bg-error)',
  unavailable: 'var(--text-muted)',
}

export const BusinessPulse = memo(function BusinessPulse({ pulse }: { pulse: ExecutivePulse }) {
  const arcColor = PULSE_ARC[pulse.status] || 'var(--text-muted)'
  const scoreColor = PULSE_TEXT[pulse.status] || 'text-muted'
  const LabelIcon = PULSE_ICONS[pulse.status] || Activity

  const score = Math.max(0, Math.min(100, Number(pulse.score) || 0))

  const radius = 46
  const arcLength = Math.PI * radius
  const offset = arcLength * (1 - score / 100)

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-card p-5 font-dash shadow-elevation-1 transition-all duration-normal hover:shadow-elevation-2"
      dir="rtl"
    >
      {/* Subtle ambient glow matching pulse tone */}
      <div
        className="pointer-events-none absolute inset-x-0 top-12 mx-auto h-28 w-28 rounded-full opacity-15 blur-2xl"
        style={{ backgroundColor: arcColor }}
        aria-hidden="true"
      />

      {/* Header + status badge */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
            <Activity size={13} className="text-primary" />
          </span>
          <h3 className="text-xs font-semibold text-main">مؤشر الأداء العام</h3>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium shadow-soft',
            PULSE_BADGE[pulse.status] || 'border-border bg-surface text-muted',
          )}
        >
          <LabelIcon size={10} />
          {PULSE_LABELS[pulse.status] || 'غير متاح'}
        </span>
      </div>

      {/* Semicircle gauge */}
      <div className="relative z-10 mx-auto mt-2 w-full max-w-[210px]">
        <svg viewBox="0 0 128 76" className="block w-full" aria-hidden="true">
          <path
            d="M 110 68 A 46 46 0 0 0 18 68"
            fill="none"
            stroke="var(--border)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 110 68 A 46 46 0 0 0 18 68"
            fill="none"
            stroke={arcColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0.5 flex flex-col items-center">
          <span
            className={cn(
              'text-3xl font-bold tabular-nums leading-none tracking-tight lg:text-4xl',
              scoreColor,
            )}
          >
            {score}
          </span>
          <span className="mt-1 text-[10px] font-medium text-muted">من 100</span>
        </div>
      </div>

      {/* Scale */}
      <div className="relative z-10 mx-auto flex w-full max-w-[210px] justify-between px-2 text-[10px] font-medium text-dim">
        <span>0</span>
        <span>100</span>
      </div>

      {/* Message */}
      <div className="relative z-10 mt-auto pt-3">
        <div className="border-border/80 bg-surface/70 flex items-start gap-2.5 rounded-xl border p-3 shadow-soft">
          <Sparkles size={14} className="mt-0.5 shrink-0 text-primary opacity-80" />
          <p className="text-[11px] leading-relaxed text-muted">{pulse.message}</p>
        </div>
      </div>
    </div>
  )
})

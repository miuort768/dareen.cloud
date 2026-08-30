import { memo } from 'react'
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react'
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
  excellent: 'bg-success-soft text-success border-border',
  good: 'bg-info-soft text-info border-border',
  fair: 'bg-warning-soft text-warning border-border',
  critical: 'bg-error-soft text-error border-border',
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
      className="flex h-full flex-col rounded-2xl border border-border bg-card p-3.5 font-dash"
      dir="rtl"
    >
      {/* Header + status badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
            <Activity size={13} className="text-primary" />
          </span>
          <h3 className="text-xs font-bold text-main">مؤشر الأداء</h3>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold',
            PULSE_BADGE[pulse.status] || 'border-border bg-surface text-muted',
          )}
        >
          <LabelIcon size={10} />
          {PULSE_LABELS[pulse.status] || 'غير متاح'}
        </span>
      </div>

      {/* Semicircle gauge — fills right → left (RTL) */}
      <div className="relative mx-auto mt-1 w-full max-w-[210px]">
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
          <span className={cn('text-[32px] font-black tabular-nums leading-none', scoreColor)}>
            {score}
          </span>
          <span className="mt-1 text-[9px] font-bold text-muted">من 100</span>
        </div>
      </div>

      {/* Scale */}
      <div className="mx-auto flex w-full max-w-[210px] justify-between px-2 text-[8px] font-bold text-dim">
        <span>0</span>
        <span>100</span>
      </div>

      {/* Message */}
      <div className="mt-auto pt-2">
        <p className="rounded-lg bg-surface p-2 text-center text-[10px] leading-relaxed text-muted">
          {pulse.message}
        </p>
      </div>
    </div>
  )
})

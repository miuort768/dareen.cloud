import { memo } from 'react';
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import type { ExecutivePulse } from '../../services/executiveService';
import { cn } from '@/lib/utils';

const PULSE_TEXT: Record<string, string> = {
    excellent: 'text-success',
    good: 'text-info',
    fair: 'text-warning',
    critical: 'text-error',
    unavailable: 'text-muted',
};

const PULSE_BADGE: Record<string, string> = {
    excellent: 'bg-success-soft text-success border-border',
    good: 'bg-info-soft text-info border-border',
    fair: 'bg-warning-soft text-warning border-border',
    critical: 'bg-error-soft text-error border-border',
    unavailable: 'bg-surface text-muted border-border',
};

const PULSE_LABELS: Record<string, string> = {
    excellent: 'ممتاز',
    good: 'جيد',
    fair: 'متوسط',
    critical: 'حرج',
    unavailable: 'غير متاح',
};

const PULSE_ICONS: Record<string, typeof TrendingUp> = {
    excellent: TrendingUp,
    good: TrendingUp,
    fair: AlertTriangle,
    critical: AlertTriangle,
    unavailable: Activity,
};

const PULSE_COLORS: Record<string, string> = {
    excellent: 'var(--bg-success)',
    good: 'var(--bg-info)',
    fair: 'var(--bg-warning)',
    critical: 'var(--bg-error)',
    unavailable: 'var(--text-muted)',
};

export const BusinessPulse = memo(function BusinessPulse({ pulse }: { pulse: ExecutivePulse }) {
    const color = PULSE_COLORS[pulse.status] || 'var(--text-muted)';
    const LabelIcon = PULSE_ICONS[pulse.status] || Activity;

    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pulse.score / 100) * circumference;

    return (
        <div className="rounded-2xl bg-card border border-border p-5 font-dash flex flex-col items-center" dir="rtl">
            <div className="flex items-center gap-2 mb-4 self-start">
                <Activity size={16} className="text-primary" />
                <h3 className="text-xs font-bold text-main">مؤشر الأداء</h3>
            </div>

            <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                    <circle
                        cx="64" cy="64" r={radius}
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    <circle
                        cx="64" cy="64" r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn("text-3xl font-bold tabular-nums", PULSE_TEXT[pulse.status] || 'text-muted')}>
                        {pulse.score}
                    </span>
                    <span className="text-[10px] text-muted mt-0.5">/ 100</span>
                </div>
            </div>

            <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold mt-3 border",
                PULSE_BADGE[pulse.status] || 'bg-surface text-muted border-border'
            )}>
                <LabelIcon size={11} />
                {PULSE_LABELS[pulse.status] || 'غير متاح'}
            </span>

            <p className="text-[10px] text-muted text-center mt-2 leading-relaxed">{pulse.message}</p>
        </div>
    );
});

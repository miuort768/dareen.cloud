import { memo } from 'react';
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import type { ExecutivePulse } from '../../services/executiveService';

const PULSE_COLORS: Record<string, string> = {
    excellent: 'var(--bg-success)',
    good: 'var(--bg-info)',
    fair: 'var(--bg-warning)',
    critical: 'var(--bg-error)',
    unavailable: 'var(--text-muted)',
};

const PULSE_TEXT: Record<string, string> = {
    excellent: 'text-success',
    good: 'text-info',
    fair: 'text-warning',
    critical: 'text-error',
    unavailable: 'text-muted',
};

const PULSE_BADGE: Record<string, string> = {
    excellent: 'bg-success-soft text-success',
    good: 'bg-info-soft text-info',
    fair: 'bg-warning-soft text-warning',
    critical: 'bg-error-soft text-error',
    unavailable: 'bg-muted/20 text-muted',
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

export const BusinessPulse = memo(function BusinessPulse({ pulse }: { pulse: ExecutivePulse }) {
    const color = PULSE_COLORS[pulse.status] || 'var(--text-muted)';
    const LabelIcon = PULSE_ICONS[pulse.status] || Activity;

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pulse.score / 100) * circumference;

    return (
        <div className="bg-card border border-border/50 shadow-soft rounded-card p-5 flex flex-col items-center">
            <h3 className="text-xs text-muted mb-4">مؤشر الأداء العام</h3>
            <div className="relative w-40 h-40">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    <defs>
                        <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                            <stop offset="100%" stopColor={color} stopOpacity="1" />
                        </linearGradient>
                        <filter id="pulseGlow">
                            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={color} floodOpacity="0.5" />
                        </filter>
                    </defs>
                    <circle
                        cx="80" cy="80" r={radius}
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="10"
                        strokeLinecap="round"
                    />
                    <circle
                        cx="80" cy="80" r={radius}
                        fill="none"
                        stroke="url(#pulseGradient)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        filter="url(#pulseGlow)"
                        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className={`text-4xl font-bold tabular-nums ${PULSE_TEXT[pulse.status] || 'text-muted'}`}
                    >
                        {pulse.score}
                    </span>
                    <span className="text-micro text-muted mt-0.5">/ 100</span>
                </div>
            </div>
            <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold mt-4 ${PULSE_BADGE[pulse.status] || 'bg-muted/20 text-muted'}`}
            >
                <LabelIcon size={12} />
                {PULSE_LABELS[pulse.status] || 'غير متاح'}
            </span>
            <p className="text-xs text-muted text-center mt-3 leading-relaxed">{pulse.message}</p>
        </div>
    );
});

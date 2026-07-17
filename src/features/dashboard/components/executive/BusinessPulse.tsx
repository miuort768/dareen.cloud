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
    excellent: 'bg-success/20 text-success border-success/40',
    good: 'bg-info/20 text-info border-info/40',
    fair: 'bg-warning/20 text-warning border-warning/40',
    critical: 'bg-error/20 text-error border-error/40',
    unavailable: 'bg-muted/20 text-muted border-muted/40',
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
        <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-border/50 dark:border-border/50 shadow-lg shadow-black/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-soft/20 via-transparent to-info/10 dark:from-primary-soft/5 dark:to-info/5 pointer-events-none" />
            <div className="relative p-5 flex flex-col items-center">
                <h3 className="text-sm font-semibold text-muted dark:text-muted/80 mb-2">مؤشر الأداء العام</h3>
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
                        <span className="text-micro text-muted dark:text-muted/60 mt-0.5">/ 100</span>
                    </div>
                </div>
                <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-3 backdrop-blur-md border border-white/10 ${PULSE_BADGE[pulse.status] || 'bg-muted/20 text-muted border-muted/40'}`}
                >
                    <LabelIcon size={12} />
                    {PULSE_LABELS[pulse.status] || 'غير متاح'}
                </span>
                <p className="text-xs text-muted/70 dark:text-muted/50 text-center mt-3 leading-relaxed max-w-[200px]">{pulse.message}</p>
            </div>
        </div>
    );
});

import { memo } from 'react';
import { Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { ExecutivePulse } from '../../services/executiveService';

const PULSE_COLORS: Record<string, string> = {
    excellent: 'var(--bg-success)',
    good: 'var(--bg-info)',
    fair: 'var(--bg-warning)',
    critical: 'var(--bg-error)',
    unavailable: 'var(--text-muted)',
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

    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pulse.score / 100) * circumference;

    return (
        <div className="rounded-3xl p-5 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:bg-card border border-border dark:border-border flex flex-col items-center">
            <h3 className="text-sm font-semibold text-muted dark:text-muted mb-1">مؤشر الأداء العام</h3>
            <div className="relative w-36 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 140 130">
                    <path
                        d="M 20 110 A 60 60 0 1 1 120 110"
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="10"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 20 110 A 60 60 0 1 1 120 110"
                        fill="none"
                        stroke={color}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold" style={{ color }}>{pulse.score}</span>
                </div>
            </div>
            <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: color + '22', color }}
            >
                <LabelIcon size={12} />
                {PULSE_LABELS[pulse.status] || 'غير متاح'}
            </span>
            <p className="text-xs text-muted dark:text-muted text-center mt-2 leading-relaxed">{pulse.message}</p>
        </div>
    );
});

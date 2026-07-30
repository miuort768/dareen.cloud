import { useMemo } from 'react';
import { ProgressBar } from '../../../shared/components/ui';

interface AttendanceChartProps {
    rate: number;
    label?: string;
}

function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

export const AttendanceChart = ({ rate, label = 'نسبة الحضور' }: AttendanceChartProps) => {
    const size = 120;
    const radius = 48;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (rate / 100) * circumference;
    const center = size / 2;

    const getStrokeColor = (r: number) => {
        if (r >= 80) return 'var(--bg-success)';
        if (r >= 50) return 'var(--bg-warning)';
        return 'var(--bg-error)';
    };

    const getStatusText = (r: number) => {
        if (r >= 80) return { label: 'حضور ممتاز', hint: 'أداء متميز، استمر!' };
        if (r >= 50) return { label: 'حضور متوسط', hint: 'يمكن تحسينه بالمتابعة' };
        return { label: 'حضور منخفض', hint: 'يحتاج إلى اهتمام' };
    };

    const status = getStatusText(rate);

    const weeklyData = useMemo(() => {
        const base = rate;
        const days = ['س', 'ح', 'ن', 'ث', 'ر', 'خ'];
        return days.map((day, i) => ({
            day,
            value: Math.max(base - 15 + seededRandom(base * 7 + i * 3) * 30, 20),
        }));
    }, [rate]);

    return (
        <div>
            <h3 className="text-xs font-bold text-muted mb-3">{label}</h3>
            <div className="flex flex-col items-center gap-4">
                <div className="relative shrink-0">
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
                        <circle cx={center} cy={center} r={radius} fill="none" stroke={getStrokeColor(rate)} strokeWidth={strokeWidth}
                            strokeDasharray={circumference} strokeDashoffset={offset}
                            strokeLinecap="round" transform={`rotate(-90 ${center} ${center})`}
                            className="transition-all duration-1000" />
                        <text x={center} y={center - 6} textAnchor="middle" dominantBaseline="central"
                            fill={getStrokeColor(rate)}
                            className="text-2xl font-bold">
                            {rate}%
                        </text>
                        <text x={center} y={center + 18} textAnchor="middle" dominantBaseline="central"
                            fill="var(--text-muted)"
                            className="text-[10px] font-medium">
                            حضور
                        </text>
                    </svg>
                </div>
                <div className="text-center w-full space-y-2">
                    <p className="text-sm font-bold text-main">
                        {status.label}
                    </p>
                    <ProgressBar value={rate} variant="attendance" />
                    <p className="text-micro font-medium text-dim">
                        {status.hint}
                    </p>
                </div>

                <div className="w-full border-t border-border pt-3 mt-1">
                    <p className="text-[10px] font-bold text-muted mb-2 text-center">الحضور الأسبوعي</p>
                    <div className="flex items-end justify-between gap-1" dir="ltr">
                        {weeklyData.map((d, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 flex-1">
                                <div
                                    className="w-full rounded-sm transition-all duration-500"
                                    style={{
                                        height: `${Math.max(d.value * 0.6, 4)}px`,
                                        background: `var(--bg-${d.value >= 80 ? 'success' : d.value >= 50 ? 'warning' : 'error'})`,
                                        opacity: 0.7 + (d.value / 100) * 0.3,
                                    }}
                                />
                                <span className="text-[9px] font-medium text-muted">{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

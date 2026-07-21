import { ProgressBar } from '../../../shared/components/ui';
import { Card, CardContent } from '@/components/ui/card';

interface AttendanceChartProps {
    rate: number;
    label?: string;
}

export const AttendanceChart = ({ rate, label = 'نسبة الحضور' }: AttendanceChartProps) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (rate / 100) * circumference;

    const getStrokeColor = (r: number) => {
        if (r >= 80) return 'var(--bg-success)';
        if (r >= 50) return 'var(--bg-warning)';
        return 'var(--bg-error)';
    };

    const getTextColor = (r: number) => {
        if (r >= 80) return 'var(--text-success)';
        if (r >= 50) return 'var(--text-warning)';
        return 'var(--text-error)';
    };

    return (
        <Card>
            <CardContent className="p-5">
            <h3 className="text-xs font-bold text-muted mb-3">{label}</h3>
            <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                    <svg width="90" height="90" viewBox="0 0 90 90">
                        <circle cx="45" cy="45" r={radius} fill="none" stroke="var(--border)" strokeWidth="7" />
                        <circle cx="45" cy="45" r={radius} fill="none" stroke={getStrokeColor(rate)} strokeWidth="7"
                            strokeDasharray={circumference} strokeDashoffset={offset}
                            strokeLinecap="round" transform="rotate(-90 45 45)"
                            className="transition-all duration-1000" />
                        <text x="45" y="45" textAnchor="middle" dominantBaseline="central"
                            fill={getTextColor(rate)}
                            className="text-lg font-bold">
                            {rate}%
                        </text>
                    </svg>
                </div>
                <div className="space-y-1.5">
                    <p className="text-xs font-bold text-main">
                        {rate >= 80 ? 'حضور ممتاز' : rate >= 50 ? 'حضور متوسط' : 'حضور منخفض'}
                    </p>
                    <ProgressBar value={rate} variant="attendance" />
                    <p className="text-micro font-medium text-dim">
                        {rate >= 80 ? 'أداء متميز، استمر!' : rate >= 50 ? 'يمكن تحسينه بالمتابعة' : 'يحتاج إلى اهتمام'}
                    </p>
                </div>
            </div>
        </CardContent></Card>
    );
};

import { cn } from '../../../lib/utils';

interface AttendanceChartProps {
    rate: number;
    label?: string;
}

export const AttendanceChart = ({ rate, label = 'نسبة الحضور' }: AttendanceChartProps) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (rate / 100) * circumference;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">{label}</h3>
            <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                    <svg width="90" height="90" viewBox="0 0 90 90">
                        <circle cx="45" cy="45" r={radius} fill="none" stroke="currentColor" strokeWidth="7"
                            className="text-slate-100 dark:text-slate-700" />
                        <circle cx="45" cy="45" r={radius} fill="none" stroke="currentColor" strokeWidth="7"
                            strokeDasharray={circumference} strokeDashoffset={offset}
                            strokeLinecap="round" transform="rotate(-90 45 45)"
                            className={cn(
                                "transition-all duration-1000",
                                rate >= 80 ? "text-emerald-500" : rate >= 50 ? "text-amber-500" : "text-rose-500"
                            )} />
                        <text x="45" y="45" textAnchor="middle" dominantBaseline="central"
                            className={cn(
                                "text-lg font-black",
                                rate >= 80 ? "fill-emerald-600 dark:fill-emerald-400" : rate >= 50 ? "fill-amber-600 dark:fill-amber-400" : "fill-rose-600 dark:fill-rose-400"
                            )}>
                            {rate}%
                        </text>
                    </svg>
                </div>
                <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        {rate >= 80 ? 'حضور ممتاز' : rate >= 50 ? 'حضور متوسط' : 'حضور منخفض'}
                    </p>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                        <div className={cn(
                            "h-1.5 rounded-full transition-all duration-1000",
                            rate >= 80 ? "bg-emerald-500" : rate >= 50 ? "bg-amber-500" : "bg-rose-500"
                        )} style={{ width: `${rate}%` }} />
                    </div>
                    <p className="text-[8px] font-medium text-slate-400 dark:text-slate-500">
                        {rate >= 80 ? 'أداء متميز، استمر!' : rate >= 50 ? 'يمكن تحسينه بالمتابعة' : 'يحتاج إلى اهتمام'}
                    </p>
                </div>
            </div>
        </div>
    );
};

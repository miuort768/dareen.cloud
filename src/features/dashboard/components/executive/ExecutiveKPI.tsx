import { memo } from 'react';
import { ExecutiveStats } from '../../services/executiveService';
import { TrendingUp, TrendingDown } from 'lucide-react';

const METRICS = (s: ExecutiveStats) => [
    { label: 'إيرادات اليوم', value: `${s.todayRevenue.toLocaleString()} ر.س`, icon: '💰', trend: 'up' },
    { label: 'الدفع النقدي', value: `${s.cashToday.toLocaleString()} ر.س`, icon: '💵', trend: 'up' },
    { label: 'الأرباح', value: `${s.todayProfit.toLocaleString()} ر.س`, icon: '📈', trend: 'up' },
    { label: 'الجلسات النشطة', value: `${s.activeSessions}`, icon: '📚', trend: 'up' },
    { label: 'نسبة الإشغال', value: `${s.occupancyRate}%`, icon: '📊', trend: s.occupancyRate > 75 ? 'up' : 'down' },
    { label: 'نسبة التجديد', value: `${s.renewalRate}%`, icon: '🔄', trend: 'up' },
    { label: 'غياب اليوم', value: `${s.todayAbsences}`, icon: '❌', trend: 'down' },
    { label: 'نسبة الحضور', value: `${s.attendanceRate}%`, icon: '✅', trend: s.attendanceRate > 90 ? 'up' : 'down' },
    { label: 'التقييم', value: `${s.avgRating.toFixed(1)} ⭐`, icon: '⭐', trend: 'up' },
    { label: 'تأخير', value: `${s.lateStarts}`, icon: '⏰', trend: 'down' },
    { label: 'طلاب جدد (أسبوع)', value: `${s.newStudentsThisWeek}`, icon: '🎓', trend: 'up' },
    { label: 'فواتير متأخرة', value: `${s.overdueInvoicesCount}`, icon: '⚠️', trend: 'down' },
];

export const ExecutiveKPI = memo(function ExecutiveKPI({ stats }: { stats: ExecutiveStats }) {
    if (!stats) return null;
    const metrics = METRICS(stats);

    return (
        <div className="rounded-3xl p-5 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">المؤشرات الرئيسية</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {metrics.map((m) => (
                    <div key={m.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-3 transition-all hover:shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-lg">{m.icon}</span>
                            {m.trend === 'up' ? (
                                <TrendingUp size={16} className="text-green-500" />
                            ) : (
                                <TrendingDown size={16} className="text-red-500" />
                            )}
                        </div>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">{m.value}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{m.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
});

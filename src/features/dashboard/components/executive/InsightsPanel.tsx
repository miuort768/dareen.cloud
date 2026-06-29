import { memo } from 'react';
import { ExecutiveStats } from '../../services/executiveService';
import { Lightbulb, TrendingUp } from 'lucide-react';

export const InsightsPanel = memo(function InsightsPanel({ stats }: { stats: ExecutiveStats }) {
    if (!stats) return null;

    const insights: { text: string; type: 'positive' | 'negative' | 'neutral' }[] = [];

    if (stats.occupancyRate < 60) {
        insights.push({ text: `نسبة الإشغال ${stats.occupancyRate}% — يمكن تحسين استغلال الموارد.`, type: 'negative' });
    } else if (stats.occupancyRate > 85) {
        insights.push({ text: `نسبة إشغال ممتازة ${stats.occupancyRate}% — استمر بنفس المستوى.`, type: 'positive' });
    } else {
        insights.push({ text: `نسبة الإشغال ${stats.occupancyRate}% — أداء جيد.`, type: 'neutral' });
    }

    if (stats.mostProfitableSubject?.name) {
        insights.push({ text: `المادة الأكثر ربحاً: ${stats.mostProfitableSubject.name} (${stats.mostProfitableSubject.revenue.toLocaleString()} ر.س)`, type: 'positive' });
    }

    if (stats.mostActiveTeacher?.name) {
        insights.push({ text: `المعلم الأكثر نشاطاً: ${stats.mostActiveTeacher.name} (${stats.mostActiveTeacher.sessions} جلسة)`, type: 'positive' });
    }

    if (stats.lowSessionStudentsCount > 0) {
        insights.push({ text: `${stats.lowSessionStudentsCount} طالب لديهم جلسات قليلة — قد يحتاجون متابعة.`, type: 'negative' });
    }

    if (stats.overdueInvoicesCount > 5) {
        insights.push({ text: `${stats.overdueInvoicesCount} فاتورة متأخرة — يُنصح بمتابعة التحصيل.`, type: 'negative' });
    } else if (stats.overdueInvoicesCount > 0) {
        insights.push({ text: `${stats.overdueInvoicesCount} فاتورة متأخرة — وضع جيد.`, type: 'neutral' });
    }

    if (stats.newStudentsThisWeek > 0) {
        insights.push({ text: `${stats.newStudentsThisWeek} طالب جديد هذا الأسبوع — نمو إيجابي.`, type: 'positive' });
    }

    if (stats.todayAbsences > 3) {
        insights.push({ text: `${stats.todayAbsences} غياب اليوم — قد يحتاج تنبيه لأولياء الأمور.`, type: 'negative' });
    }

    if (stats.lateStarts > 2) {
        insights.push({ text: `${stats.lateStarts} تأخير اليوم — متابعة الالتزام بالمواعيد.`, type: 'negative' });
    }

    const getStyle = (type: string) => {
        switch (type) {
            case 'positive': return { bg: '#f0fdf4', color: '#22c55e' };
            case 'negative': return { bg: '#fef2f2', color: '#ef4444' };
            default: return { bg: '#f9fafb', color: '#6b7280' };
        }
    };

    return (
        <div className="rounded-3xl p-5 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-purple-500" />
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">تحليلات ذكية</h3>
            </div>

            <div className="space-y-2">
                {insights.map((insight, i) => {
                    const style = getStyle(insight.type);
                    return (
                        <div
                            key={i}
                            className="flex items-start gap-2.5 p-2.5 rounded-xl"
                            style={{ backgroundColor: style.bg }}
                        >
                            <Lightbulb size={16} style={{ color: style.color }} className="mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{insight.text}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

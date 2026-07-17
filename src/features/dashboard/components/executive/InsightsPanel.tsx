import { memo } from 'react';
import type { ExecutiveStats } from '../../services/executiveService';
import { Lightbulb, TrendingUp, TrendingDown, Target } from 'lucide-react';

type InsightType = 'positive' | 'negative' | 'neutral';

interface Insight {
    text: string;
    type: InsightType;
}

function buildInsights(stats: ExecutiveStats): Insight[] {
    const insights: Insight[] = [];

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

    return insights;
}

const TYPE_CONFIG: Record<InsightType, { icon: typeof Lightbulb; textClass: string; bgClass: string; iconBgClass: string }> = {
    positive: { icon: TrendingUp, textClass: 'text-success', bgClass: 'bg-success/8', iconBgClass: 'bg-success/[0.125]' },
    negative: { icon: TrendingDown, textClass: 'text-error', bgClass: 'bg-error/8', iconBgClass: 'bg-error/[0.125]' },
    neutral: { icon: Target, textClass: 'text-info', bgClass: 'bg-info/8', iconBgClass: 'bg-info/[0.125]' },
};

export const InsightsPanel = memo(function InsightsPanel({ stats }: { stats: ExecutiveStats }) {
    if (!stats) return null;
    const insights = buildInsights(stats);

    return (
        <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-border/50 dark:border-border/50 shadow-lg shadow-black/5">
            <div className="absolute inset-0 bg-gradient-to-br from-info/10 via-transparent to-primary-soft/10 dark:from-info/5 dark:to-primary-soft/5 pointer-events-none" />
            <div className="relative p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Lightbulb size={16} className="text-primary" />
                    <h3 className="text-sm font-semibold text-muted dark:text-muted/80">تحليلات ذكية</h3>
                </div>

                <div className="space-y-2">
                    {insights.length === 0 && (
                        <p className="text-xs text-muted/50 dark:text-muted/30 text-center py-4">لا توجد تحليلات متاحة</p>
                    )}
                    {insights.map((insight, i) => {
                        const cfg = TYPE_CONFIG[insight.type];
                        const Icon = cfg.icon;
                        return (
                            <div
                                key={`insight-${i}`}
                                className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border/20 group ${cfg.bgClass}`}
                            >
                                <div
                                    className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBgClass}`}
                                >
                                    <Icon size={14} className={cfg.textClass} />
                                </div>
                                <p className="text-sm text-main dark:text-on-primary/80 leading-relaxed">{insight.text}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

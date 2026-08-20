import { TrendingUp, TrendingDown, DollarSign, FileText, Percent } from 'lucide-react';

interface FinancialReportProps {
    totalRevenue: number;
    monthRevenue: number;
    totalExpenses: number;
    monthExpenses: number;
    completedSessions: number;
    reportCurrency?: string;
}

const FinancialCard = ({
    title,
    value,
    subValue,
    icon: Icon,
    color,
    textClass,
    subTextClass,
    currency,
    isPercentage = false,
}: {
    title: string;
    value: number | string;
    subValue: number | string;
    icon: React.ComponentType<{ size?: number }>;
    color: string;
    textClass: string;
    subTextClass?: string;
    currency?: string;
    isPercentage?: boolean;
}) => (
    <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl" style={{ backgroundColor: `${color}15` }}>
                <Icon size={16} className={textClass} />
            </div>
            <h3 className="text-xs font-bold text-muted">{title}</h3>
        </div>
        <p className="text-xl font-extrabold text-main tabular-nums">
            {typeof value === 'number' ? value.toLocaleString() : value} {isPercentage ? '%' : currency}
        </p>
        <p className={`text-micro font-bold mt-1.5 ${subTextClass || textClass}`}>
            هذا الشهر: {typeof subValue === 'number' ? subValue.toLocaleString() : subValue} {isPercentage ? '%' : currency}
        </p>
    </div>
);

export const FinancialReport = ({
    totalRevenue,
    monthRevenue,
    totalExpenses,
    monthExpenses,
    completedSessions,
    reportCurrency = 'EGP'
}: FinancialReportProps) => {
    const netProfit = totalRevenue - totalExpenses;
    const monthNetProfit = monthRevenue - monthExpenses;

    // Accurate Profit Margin Calculations: (Net Profit / Total Revenue) * 100
    const overallMarginNum = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const monthMarginNum = monthRevenue > 0 ? (monthNetProfit / monthRevenue) * 100 : 0;

    const overallMargin = overallMarginNum.toFixed(1);
    const monthMargin = monthMarginNum.toFixed(1);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FinancialCard
                    title="إجمالي الإيرادات"
                    value={totalRevenue}
                    subValue={monthRevenue}
                    icon={TrendingUp}
                    color="var(--bg-success)"
                    textClass="text-success"
                    subTextClass="text-success"
                    currency={reportCurrency}
                />
                <FinancialCard
                    title="إجمالي المصروفات"
                    value={totalExpenses}
                    subValue={monthExpenses}
                    icon={TrendingDown}
                    color="var(--bg-error)"
                    textClass="text-error"
                    subTextClass="text-error"
                    currency={reportCurrency}
                />
                <FinancialCard
                    title="صافي الربح"
                    value={netProfit}
                    subValue={monthNetProfit}
                    icon={DollarSign}
                    color="var(--bg-primary)"
                    textClass="text-primary"
                    subTextClass="text-primary"
                    currency={reportCurrency}
                />
                <FinancialCard
                    title="هامش الربح النسبة"
                    value={overallMargin}
                    subValue={monthMargin}
                    icon={Percent}
                    color="var(--bg-info)"
                    textClass="text-info"
                    subTextClass="text-info"
                    isPercentage
                />
            </div>

            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-soft shrink-0">
                        <FileText size={18} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-main mb-1">التقرير المالي والتحليل الدقيق</h3>
                        <p className="text-xs font-bold text-muted leading-relaxed">
                            تم تحليل <span className="font-bold text-main">{completedSessions}</span> حصة دراسية مكتملة،
                            بحيث بلغ إجمالي الإيرادات <span className="font-bold text-success">{totalRevenue.toLocaleString()} {reportCurrency}</span> مقابل مصروفات إجمالية بقيمة <span className="font-bold text-error">{totalExpenses.toLocaleString()} {reportCurrency}</span>.
                            نتج عن ذلك صافي ربح قدره <span className="font-bold text-primary">{netProfit.toLocaleString()} {reportCurrency}</span> وهامش ربح إجمالي بنسبة <span className="font-bold text-info">{overallMargin}%</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

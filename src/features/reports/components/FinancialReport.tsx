import { TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';

interface FinancialReportProps {
    totalRevenue: number;
    monthRevenue: number;
    totalExpenses: number;
    monthExpenses: number;
    completedSessions: number;
    reportCurrency?: string;
}

const FinancialCard = ({ title, value, subValue, icon: Icon, color, subColor, currency }: { title: string; value: number; subValue: number; icon: React.ComponentType<{ size?: number }>; color: string; subColor?: string; currency?: string }) => (
    <div className="bg-card border border-border/50 p-4 rounded-card shadow-soft">
        <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}12` }}>
                <Icon size={14} style={{ color }} />
            </div>
            <h3 className="text-xs font-bold text-muted">{title}</h3>
        </div>
        <p className="text-lg font-black text-main tabular-nums">{value.toLocaleString()} {currency}</p>
        <p className="text-micro font-bold mt-1" style={{ color: subColor || color }}>هذا الشهر: {subValue.toLocaleString()} {currency}</p>
    </div>
);

export const FinancialReport = ({
    totalRevenue,
    monthRevenue,
    totalExpenses,
    monthExpenses,
    completedSessions,
    reportCurrency = 'KWD'
}: FinancialReportProps) => {
    const netProfit = totalRevenue - totalExpenses;
    const monthNetProfit = monthRevenue - monthExpenses;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FinancialCard
                    title="إجمالي الإيرادات"
                    value={totalRevenue}
                    subValue={monthRevenue}
                    icon={TrendingUp}
                    color="var(--bg-success)"
                    subColor="var(--bg-success)"
                    currency={reportCurrency}
                />
                <FinancialCard
                    title="إجمالي المصروفات"
                    value={totalExpenses}
                    subValue={monthExpenses}
                    icon={TrendingDown}
                    color="var(--bg-error)"
                    subColor="var(--bg-error)"
                    currency={reportCurrency}
                />
                <FinancialCard
                    title="صافي الربح"
                    value={netProfit}
                    subValue={monthNetProfit}
                    icon={DollarSign}
                    color="var(--bg-primary)"
                    subColor="var(--bg-primary)"
                    currency={reportCurrency}
                />
            </div>

            <div className="bg-card border border-border/50 p-4 rounded-card shadow-soft">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary-soft">
                        <FileText size={16} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-main mb-1">ملخص التقرير المالي</h3>
                        <p className="text-xs font-bold text-muted leading-relaxed">
                            تم تسجيل <span className="font-bold text-main">{completedSessions}</span> حصة مكتملة بإجمالي إيرادات <span className="font-bold text-success">{totalRevenue.toLocaleString()} {reportCurrency}</span>.
                            المصروفات الإجمالية للمعلمات بلغت <span className="font-bold text-error">{totalExpenses.toLocaleString()} {reportCurrency}</span>،
                            مما حقق صافي ربح قدره <span className="font-bold text-primary">{netProfit.toLocaleString()} {reportCurrency}</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

import { TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';

interface FinancialReportProps {
    totalRevenue: number;
    monthRevenue: number;
    totalExpenses: number;
    monthExpenses: number;
    completedSessions: number;
}

const FinancialCard = ({ title, value, subValue, icon: Icon, color, subColor }: { title: string; value: number; subValue: number; icon: React.ComponentType<{ size?: number }>; color: string; subColor?: string }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}12` }}>
                <Icon size={14} style={{ color }} />
            </div>
            <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{title}</h3>
        </div>
        <p className="text-lg font-black text-slate-800 dark:text-white tabular-nums">{value.toLocaleString()} ج.م</p>
        <p className="text-[10px] font-bold mt-1" style={{ color: subColor || color }}>هذا الشهر: {subValue.toLocaleString()} ج.م</p>
    </div>
);

export const FinancialReport = ({
    totalRevenue,
    monthRevenue,
    totalExpenses,
    monthExpenses,
    completedSessions
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
                    color="#10B981"
                    subColor="#059669"
                />
                <FinancialCard
                    title="إجمالي المصروفات"
                    value={totalExpenses}
                    subValue={monthExpenses}
                    icon={TrendingDown}
                    color="#F43F5E"
                    subColor="#E11D48"
                />
                <FinancialCard
                    title="صافي الربح"
                    value={netProfit}
                    subValue={monthNetProfit}
                    icon={DollarSign}
                    color="#2563EB"
                    subColor="#1D4ED8"
                />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 p-4 rounded-2xl shadow-sm">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#2563EB12' }}>
                        <FileText size={16} style={{ color: '#2563EB' }} />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-800 dark:text-white mb-1">ملخص التقرير المالي</h3>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                            تم تسجيل <span className="font-bold text-slate-700 dark:text-slate-200">{completedSessions}</span> حصة مكتملة بإجمالي إيرادات <span className="font-bold" style={{ color: '#059669' }}>{totalRevenue.toLocaleString()} ج.م</span>.
                            المصروفات الإجمالية للمعلمات بلغت <span className="font-bold" style={{ color: '#E11D48' }}>{totalExpenses.toLocaleString()} ج.م</span>،
                            مما حقق صافي ربح قدره <span className="font-bold" style={{ color: '#1D4ED8' }}>{netProfit.toLocaleString()} ج.م</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

import { TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface FinancialReportProps {
    totalRevenue: number;
    monthRevenue: number;
    totalExpenses: number;
    monthExpenses: number;
    completedSessions: number;
}

const FinancialCard = ({ title, value, subValue, icon: Icon, color, bg, subColor }: { title: string; value: number; subValue: number; icon: React.ComponentType<{ size?: number }>; color: string; bg: string; subColor?: string }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-3">
            <div className={cn("p-1.5 rounded-lg", bg)}>
                <Icon size={14} className={color} />
            </div>
            <h3 className="text-[11px] font-normal text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</h3>
        </div>
        <p className="text-lg font-medium text-slate-800 dark:text-white tabular-nums">{value.toLocaleString()} ج.م</p>
        <p className={cn("text-[10px] font-normal mt-1", subColor)}>هذا الشهر: {subValue.toLocaleString()} ج.م</p>
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
                    color="text-emerald-500"
                    bg="bg-emerald-50 dark:bg-emerald-900/20"
                    subColor="text-emerald-600"
                />
                <FinancialCard
                    title="إجمالي المصروفات"
                    value={totalExpenses}
                    subValue={monthExpenses}
                    icon={TrendingDown}
                    color="text-rose-500"
                    bg="bg-rose-50 dark:bg-rose-900/20"
                    subColor="text-rose-600"
                />
                <FinancialCard
                    title="صافي الربح"
                    value={netProfit}
                    subValue={monthNetProfit}
                    icon={DollarSign}
                    color="text-blue-500"
                    bg="bg-blue-50 dark:bg-blue-900/30"
                    subColor="text-blue-600"
                />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                        <FileText size={16} className="text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-xs font-normal text-slate-800 dark:text-white mb-1">ملخص التقرير المالي</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            تم تسجيل <span className="font-normal text-slate-700 dark:text-slate-200">{completedSessions}</span> حصة مكتملة بإجمالي إيرادات <span className="font-normal text-emerald-600">{totalRevenue.toLocaleString()} ج.م</span>.
                            المصروفات الإجمالية للمعلمات بلغت <span className="font-normal text-rose-600">{totalExpenses.toLocaleString()} ج.م</span>،
                            مما حقق صافي ربح قدره <span className="font-normal text-blue-600">{netProfit.toLocaleString()} ج.م</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

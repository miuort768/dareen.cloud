import { TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';

interface FinancialReportProps {
    totalRevenue: number;
    monthRevenue: number;
    totalExpenses: number;
    monthExpenses: number;
    completedSessions: number;
}

export const FinancialReport = ({
    totalRevenue,
    monthRevenue,
    totalExpenses,
    monthExpenses,
    completedSessions
}: FinancialReportProps) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Revenue Card */}
                <div className="bg-white p-3 border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-emerald-100 rounded-none dark:bg-emerald-900/30">
                            <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={16} />
                        </div>
                        <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400">إجمالي الإيرادات</h3>
                    </div>
                    <p className="text-xl font-black text-gray-950 dark:text-white mb-1 tabular-nums">{totalRevenue.toLocaleString()} ج.م</p>
                    <p className="text-[10px] text-emerald-600 font-bold">هذا الشهر: {monthRevenue.toLocaleString()} ج.م</p>
                </div>

                {/* Total Expenses Card */}
                <div className="bg-white p-3 border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-rose-100 rounded-none dark:bg-rose-900/30">
                            <TrendingDown className="text-rose-600 dark:text-rose-400" size={16} />
                        </div>
                        <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400">إجمالي المصروفات</h3>
                    </div>
                    <p className="text-xl font-black text-gray-950 dark:text-white mb-1 tabular-nums">{totalExpenses.toLocaleString()} ج.م</p>
                    <p className="text-[10px] text-rose-600 font-bold">هذا الشهر: {monthExpenses.toLocaleString()} ج.م</p>
                </div>

                {/* Net Profit Card */}
                <div className="bg-white p-3 border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-indigo-100 rounded-none dark:bg-indigo-900/30">
                            <DollarSign className="text-indigo-600 dark:text-indigo-400" size={16} />
                        </div>
                        <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400">صافي الربح</h3>
                    </div>
                    <p className="text-xl font-black text-gray-950 dark:text-white mb-1 tabular-nums">
                        {(totalRevenue - totalExpenses).toLocaleString()} ج.م
                    </p>
                    <p className="text-[10px] text-indigo-600 font-bold">
                        هذا الشهر: {(monthRevenue - monthExpenses).toLocaleString()} ج.م
                    </p>
                </div>
            </div>

            {/* Financial Summary Message */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 p-3 dark:from-purple-900/20 dark:to-indigo-900/20 dark:border-purple-900/30">
                <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-purple-100 rounded-none dark:bg-purple-900/40">
                        <FileText className="text-purple-600 dark:text-purple-400" size={16} />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-purple-900 dark:text-purple-200 mb-1">ملخص التقرير المالي</h3>
                        <p className="text-[11px] text-purple-700 dark:text-purple-300 leading-relaxed">
                            تم تسجيل <strong>{completedSessions}</strong> حصة مكتملة بإجمالي إيرادات <strong>{totalRevenue.toLocaleString()} ج.م</strong>.
                            المصروفات الإجمالية للمعلمات بلغت <strong>{totalExpenses.toLocaleString()} ج.م</strong>،
                            مما حقق صافي ربح قدره <strong>{(totalRevenue - totalExpenses).toLocaleString()} ج.م</strong>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

import { TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface FinancialReportProps {
    totalRevenue: number;
    monthRevenue: number;
    totalExpenses: number;
    monthExpenses: number;
    completedSessions: number;
}

const FinancialCard = ({ title, value, subValue, icon: Icon, color, bg, subColor }: { title: string; value: string; subValue?: string; icon: React.ComponentType<{ size?: number }>; color: string; bg: string; subColor?: string }) => (
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


import { DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface FinanceStatsProps {
    totalIncome: number;
    monthIncome: number;
    totalExpenses: number;
    monthExpenses: number;
    totalFixedExpenses: number;
    netProfit: number;
    monthProfit: number;
}

const StatItem = ({ title, value, icon: Icon, color, subValue, bg }: { title: string, value: string | number, icon: any, color: string, subValue?: string, bg: string }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center">
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", bg)}>
            <Icon size={16} className={color} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{title}</p>
        <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">{value} <span className="text-[10px] font-bold text-slate-400">ج.م</span></p>
        {subValue && <p className="text-[9px] text-slate-400 mt-0.5 font-bold">{subValue}</p>}
    </div>
);

export const FinanceStats = ({
    totalIncome,
    monthIncome,
    totalExpenses,
    monthExpenses,
    totalFixedExpenses,
    netProfit,
}: FinanceStatsProps) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-4 md:px-6 mb-6" dir="rtl">
            <StatItem 
                title="إيرادات الوارد" 
                value={totalIncome.toLocaleString()} 
                icon={TrendingUp} 
                color="text-emerald-500" 
                bg="bg-emerald-50 dark:bg-emerald-900/20"
                subValue={`+${monthIncome.toLocaleString()} هذا الشهر`}
            />
            <StatItem 
                title="مستحقات المعلمات" 
                value={totalExpenses.toLocaleString()} 
                icon={TrendingDown} 
                color="text-rose-500" 
                bg="bg-rose-50 dark:bg-rose-900/20"
                subValue={`-${monthExpenses.toLocaleString()} هذا الشهر`}
            />
            <StatItem 
                title="المصروفات التشغيلية" 
                value={totalFixedExpenses.toLocaleString()} 
                icon={Wallet} 
                color="text-[#5c59f2]" 
                bg="bg-[#eef2ff] dark:bg-indigo-900/30"
                subValue="إدارة المرافق"
            />
            <StatItem 
                title="صافي الربح المتراكم" 
                value={netProfit.toLocaleString()} 
                icon={DollarSign} 
                color="text-amber-500" 
                bg="bg-amber-50 dark:bg-amber-900/20"
                subValue="الأداء المالي الإجمالي"
            />
        </div>
    );
};

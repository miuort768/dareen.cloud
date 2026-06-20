import { TrendingUp, DollarSign, Wallet } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface FinancialSnapshotProps {
    monthNetProfit: number;
    monthRevenue: number;
    expectedCollection: number;
}

export const FinancialSnapshot = ({ monthNetProfit, monthRevenue, expectedCollection }: FinancialSnapshotProps) => {
    const items = [
        { label: 'أرباح هذا الشهر', value: monthNetProfit, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200/50 dark:border-emerald-500/20', valueColor: 'text-emerald-700 dark:text-emerald-300' },
        { label: 'المستحق لك', value: expectedCollection, icon: DollarSign, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-200/50 dark:border-indigo-500/20', valueColor: 'text-indigo-700 dark:text-indigo-300' },
        { label: 'الإيرادات', value: monthRevenue, icon: Wallet, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-200/50 dark:border-purple-500/20', valueColor: 'text-purple-700 dark:text-purple-300' },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                <Wallet size={12} className="text-emerald-500" />
                الملخص المالي
            </h3>
            <div className="space-y-2.5">
                {items.map(item => (
                    <div key={item.label} className={cn("flex items-center gap-3 p-2.5 rounded-xl border", item.bg, item.border)}>
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", item.bg)}>
                            <item.icon size={15} className={item.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400">{item.label}</p>
                        </div>
                        <span className={cn("text-sm font-black tabular-nums", item.valueColor)}>
                            {item.value.toLocaleString('ar-EG')} <span className="text-[9px] font-bold">د.ك</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

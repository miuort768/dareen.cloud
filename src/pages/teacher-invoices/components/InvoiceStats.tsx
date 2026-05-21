import { Users, DollarSign, CheckCircle2, AlertCircle, CreditCard, Percent } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface TeacherStats {
    totalTeachers: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    personalExpenses: number;
    unpaidPercentage: number;
}

interface InvoiceStatsProps {
    stats: TeacherStats;
}

export const InvoiceStats = ({ stats }: InvoiceStatsProps) => (
    <div className="px-0">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            {[
                { label: 'المعلمات', value: stats.totalTeachers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { label: 'الإجمالي', value: `${stats.totalAmount.toLocaleString()} ج.م`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                { label: 'المدفوع', value: `${stats.paidAmount.toLocaleString()} ج.م`, icon: CheckCircle2, color: 'text-[#5c59f2]', bg: 'bg-[#eef2ff] dark:bg-indigo-900/30' },
                { label: 'المعلق', value: `${stats.unpaidAmount.toLocaleString()} ج.م`, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                { label: 'مصاريف', value: `${stats.personalExpenses.toLocaleString()} ج.م`, icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                { label: 'النسبة', value: `${stats.unpaidPercentage}%`, icon: Percent, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl shadow-sm flex flex-col items-center text-center">
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", stat.bg)}>
                        <stat.icon size={16} className={stat.color} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{stat.label}</p>
                    <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{stat.value}</p>
                </div>
            ))}
        </div>
    </div>
);

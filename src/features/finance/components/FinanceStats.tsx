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

const StatCard = ({ title, value, icon: Icon, gradient, sub, badge }: {
    title: string; value: string; icon: React.ComponentType<{ size?: number }>; gradient: string; sub?: string; badge?: { label: string; color: string };
}) => (
    <div className={cn("relative overflow-hidden rounded-none p-5 flex flex-col justify-between shadow-sm text-white", gradient)}>
        {/* BG icon */}
        <div className="absolute -left-3 -bottom-3 opacity-10"><Icon size={72} /></div>
        {/* Top */}
        <div className="flex items-start justify-between mb-4">
            <div className="w-9 h-9 bg-white/15 rounded-none flex items-center justify-center">
                <Icon size={18} className="text-white" />
            </div>
            {badge && (
                <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-none uppercase tracking-widest", badge.color)}>
                    {badge.label}
                </span>
            )}
        </div>
        {/* Value */}
        <div>
            <p className="text-2xl font-black font-mono leading-none">{value}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mt-1">ج.م</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/75 mt-2">{title}</p>
            {sub && <p className="text-[9px] text-white/50 font-bold mt-0.5">{sub}</p>}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20" />
    </div>
);

export const FinanceStats = ({
    totalIncome,
    monthIncome,
    totalExpenses,
    monthExpenses,
    totalFixedExpenses,
    netProfit,
    monthProfit,
}: FinanceStatsProps) => {
    const isProfit = (netProfit || 0) >= 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-0" dir="rtl">
            <StatCard
                title="إجمالي الإيرادات"
                value={(totalIncome || 0).toLocaleString()}
                icon={TrendingUp}
                gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
                sub={`+${(monthIncome || 0).toLocaleString()} هذا الشهر`}
                badge={{ label: 'وارد', color: 'bg-white/20 text-white' }}
            />
            <StatCard
                title="مستحقات المعلمات"
                value={(totalExpenses || 0).toLocaleString()}
                icon={TrendingDown}
                gradient="bg-gradient-to-br from-rose-500 to-rose-700"
                sub={`-${(monthExpenses || 0).toLocaleString()} هذا الشهر`}
                badge={{ label: 'صادر', color: 'bg-white/20 text-white' }}
            />
            <StatCard
                title="المصروفات التشغيلية"
                value={(totalFixedExpenses || 0).toLocaleString()}
                icon={Wallet}
                gradient="bg-gradient-to-br from-indigo-600 to-violet-800"
                sub="مصروفات ثابتة"
                badge={{ label: 'ثابت', color: 'bg-white/20 text-white' }}
            />
            <StatCard
                title="صافي الربح"
                value={(netProfit || 0).toLocaleString()}
                icon={DollarSign}
                gradient={isProfit
                    ? "bg-gradient-to-br from-amber-500 to-orange-700"
                    : "bg-gradient-to-br from-slate-600 to-slate-800"}
                sub={`${(monthProfit || 0) >= 0 ? '+' : ''}${(monthProfit || 0).toLocaleString()} هذا الشهر`}
                badge={{ label: isProfit ? 'ربح' : 'خسارة', color: isProfit ? 'bg-white/20 text-white' : 'bg-rose-500/40 text-white' }}
            />
        </div>
    );
};

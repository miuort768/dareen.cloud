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

interface StatCardProps {
    title: string; value: string; icon: React.ComponentType<{ size?: number }>; color: string; sub?: string; badge?: { label: string; color: string };
}

const StatCard = ({ title, value, icon: Icon, color, sub, badge }: StatCardProps) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: `${color}12` }}>
                <Icon size={20} style={{ color }} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest truncate">{title}</p>
                    {badge && (
                        <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded-lg uppercase tracking-widest shrink-0", badge.color)}>
                            {badge.label}
                        </span>
                    )}
                </div>
                <p className="text-lg font-black font-mono leading-none mt-1" style={{ color }}>{value}</p>
                <p className="text-[9px] font-bold text-[#64748B] mt-0.5">ج.م</p>
                {sub && <p className="text-[8px] font-bold text-[#64748B] mt-0.5">{sub}</p>}
            </div>
        </div>
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
                color="#10B981"
                sub={`+${(monthIncome || 0).toLocaleString()} هذا الشهر`}
                badge={{ label: 'وارد', color: 'bg-[#10B98112] text-[#10B981]' }}
            />
            <StatCard
                title="مستحقات المعلمات"
                value={(totalExpenses || 0).toLocaleString()}
                icon={TrendingDown}
                color="#F43F5E"
                sub={`-${(monthExpenses || 0).toLocaleString()} هذا الشهر`}
                badge={{ label: 'صادر', color: 'bg-[#F43F5E12] text-[#F43F5E]' }}
            />
            <StatCard
                title="المصروفات التشغيلية"
                value={(totalFixedExpenses || 0).toLocaleString()}
                icon={Wallet}
                color="#8B5CF6"
                sub="مصروفات ثابتة"
                badge={{ label: 'ثابت', color: 'bg-[#8B5CF612] text-[#8B5CF6]' }}
            />
            <StatCard
                title="صافي الربح"
                value={(netProfit || 0).toLocaleString()}
                icon={DollarSign}
                color={isProfit ? '#F59E0B' : '#64748B'}
                sub={`${(monthProfit || 0) >= 0 ? '+' : ''}${(monthProfit || 0).toLocaleString()} هذا الشهر`}
                badge={{ label: isProfit ? 'ربح' : 'خسارة', color: isProfit ? 'bg-[#F59E0B12] text-[#F59E0B]' : 'bg-[#64748B12] text-[#64748B]' }}
            />
        </div>
    );
};

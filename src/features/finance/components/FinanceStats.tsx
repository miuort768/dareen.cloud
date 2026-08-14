import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface FinanceStatsProps {
    totalIncome: number;
    monthIncome: number;
    totalExpenses: number;
    monthExpenses: number;
    totalFixedExpenses: number;
    netProfit: number;
    monthProfit: number;
    reportCurrency?: string;
    profitMargin?: string;
}

const Counter = ({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) => (
    <motion.span
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="tabular-nums"
    >
        {prefix}{value.toLocaleString()}{suffix}
    </motion.span>
);

const TrendBadge = ({ value, positive }: { value: number; positive: boolean }) => {
    if (value === 0) return null;
    const isUp = positive ? value > 0 : value < 0;
    return (
        <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${isUp ? 'bg-success/[10%] text-success' : 'bg-error/[10%] text-error'}`}>
            {isUp ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}
            {Math.abs(value).toFixed(1)}%
        </div>
    );
};

const KPICard = ({ title, value, icon: Icon, monthValue, gradient, on, trend, profitMargin: pm }: {
    title: string; value: number; icon: React.ComponentType<{ size?: number }>;
    monthValue: number; gradient: string; on: string; trend?: number; profitMargin?: string;
}) => (
    <motion.div
        whileHover={{ scale: 1.01, y: -1 }}
        className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-all"
    >
        <div className={`absolute inset-0 opacity-[0.03] ${gradient}`} />
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${gradient}`} />
        <div className="relative p-3.5">
            <div className="flex items-start justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${gradient} ${on}`}>
                    <Icon size={14} />
                </div>
                {trend !== undefined && <TrendBadge value={trend} positive={title === 'صافي الربح'} />}
            </div>
            <p className="text-[10px] font-bold text-muted">{title}</p>
            <p className="text-lg font-bold text-main leading-none mt-0.5">
                <Counter value={value} />
            </p>
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/40">
                <span className="text-[8px] font-bold text-muted">الشهر</span>
                <span className="text-[10px] font-bold text-main tabular-nums">
                    <Counter value={monthValue} />
                </span>
                {pm && (
                    <span className="text-[8px] font-bold text-muted me-auto">هامش: {pm}%</span>
                )}
            </div>
        </div>
    </motion.div>
);

export const FinanceStats = ({
    totalIncome, monthIncome, totalExpenses, monthExpenses,
    totalFixedExpenses, netProfit, monthProfit, profitMargin = '0',
}: FinanceStatsProps) => {
    const incomeTrend = monthIncome && totalIncome ? (monthIncome / (totalIncome / 12) - 1) * 100 : 0;
    const expenseTrend = monthExpenses && totalExpenses ? (monthExpenses / (totalExpenses / 12) - 1) * 100 : 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5" dir="rtl">
            <KPICard title="إجمالي الإيرادات" value={totalIncome} icon={TrendingUp}
                monthValue={monthIncome} gradient="bg-gradient-to-r from-success/80 to-success" on="text-on-success"
                trend={Math.round(incomeTrend)} />
            <KPICard title="مستحقات المعلمات" value={totalExpenses} icon={TrendingDown}
                monthValue={monthExpenses} gradient="bg-gradient-to-r from-error/80 to-error" on="text-on-error"
                trend={Math.round(expenseTrend)} />
            <KPICard title="المصروفات التشغيلية" value={totalFixedExpenses} icon={Wallet}
                monthValue={totalFixedExpenses} gradient="bg-gradient-to-r from-warning/80 to-warning" on="text-on-warning" />
            <KPICard title="صافي الربح" value={netProfit} icon={DollarSign}
                monthValue={monthProfit} gradient="bg-gradient-to-r from-primary/80 to-primary" on="text-on-primary"
                trend={totalIncome ? Math.round((netProfit / totalIncome) * 100) : 0}
                profitMargin={profitMargin} />
        </div>
    );
};
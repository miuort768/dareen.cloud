import { motion } from 'framer-motion';
import { Users, BookOpen, DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CURRENCY_SYMBOL } from '@/config/constants';
import type { DashboardStats } from '../types';

interface KPICardsProps {
    stats: DashboardStats;
}

interface KPICardData {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    accent: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    prefix?: string;
    formatter?: (val: number) => string;
    size: 'lg' | 'sm';
}

const colorMap: Record<string, { bg: string; text: string; ring: string; accent: string }> = {
    primary: { bg: 'bg-primary-soft', text: 'text-primary', ring: 'ring-border', accent: 'bg-primary' },
    success: { bg: 'bg-success-soft', text: 'text-success', ring: 'ring-border', accent: 'bg-success' },
    info: { bg: 'bg-info-soft', text: 'text-info', ring: 'ring-border', accent: 'bg-info' },
    warning: { bg: 'bg-warning-soft', text: 'text-warning', ring: 'ring-border', accent: 'bg-warning' },
};

const KPICard = ({ item, index }: { item: KPICardData; index: number }) => {
    const Icon = item.icon;
    const c = colorMap[item.color] || colorMap.primary;
    const isLarge = item.size === 'lg';

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(
                "relative overflow-hidden rounded-2xl bg-card border border-border group hover:shadow-elevation-2 transition-all duration-300",
                isLarge ? "lg:col-span-2" : "lg:col-span-1"
            )}
        >
            {/* Accent bar */}
            <div className={cn("absolute start-0 top-0 bottom-0 w-1", c.accent)} />

            <div className={cn("p-5", isLarge ? "md:p-6" : "md:p-5")}>
                <div className="flex items-start justify-between mb-3">
                    <div className={cn(c.bg, c.ring, "rounded-xl flex items-center justify-center ring-1", isLarge ? "w-12 h-12" : "w-10 h-10")}>
                        <Icon size={isLarge ? 20 : 16} className={c.text} />
                    </div>
                    {item.trend && (
                        <div className={cn(
                            "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold",
                            item.trend === 'up' ? "bg-success-soft text-success" :
                            item.trend === 'down' ? "bg-error-soft text-error" :
                            "bg-surface text-muted"
                        )}>
                            {item.trend === 'up' ? <TrendingUp size={10} /> : item.trend === 'down' ? <TrendingDown size={10} /> : null}
                            {item.trendValue}
                        </div>
                    )}
                </div>

                <div className="space-y-0.5">
                    <p className={cn("font-bold tabular-nums text-main tracking-tight", isLarge ? "text-3xl" : "text-2xl")}>
                        {item.formatter && typeof item.value === 'number'
                            ? item.formatter(item.value)
                            : item.value}
                        {item.prefix && <span className="text-xs font-medium text-muted me-1">{item.prefix}</span>}
                    </p>
                    <p className="text-xs text-muted font-medium">{item.title}</p>
                </div>
            </div>
        </motion.div>
    );
};

export const KPICards = ({ stats }: KPICardsProps) => {
    const netProfit = (stats.totalRevenue || 0) - (stats.totalExpenses || 0);
    const profitTrend = netProfit > 0 ? 'up' as const : netProfit < 0 ? 'down' as const : 'neutral' as const;
    const revenueGrowth = stats.monthRevenue && stats.monthRevenue > 0
        ? `+${Math.round((stats.monthRevenue / (stats.totalRevenue || 1)) * 100)}%`
        : '0%';

    const cards: KPICardData[] = [
        {
            title: 'إجمالي الإيرادات',
            value: stats.totalRevenue || 0,
            icon: DollarSign,
            color: 'success',
            trend: 'up',
            trendValue: revenueGrowth,
            prefix: CURRENCY_SYMBOL,
            formatter: (val: number) => val.toLocaleString(),
            size: 'sm',
        },
        {
            title: 'إجمالي الطلاب',
            value: stats.studentsCount,
            icon: Users,
            color: 'primary',
            trend: stats.studentsCount > 0 ? 'up' : 'neutral',
            trendValue: `${stats.studentsCount}`,
            size: 'sm',
        },
        {
            title: 'الحصص المنجزة',
            value: stats.completedSessions || 0,
            icon: BookOpen,
            color: 'info',
            trend: stats.monthCompletedSessions > 0 ? 'up' : 'neutral',
            trendValue: `${stats.monthCompletedSessions} هذا الشهر`,
            size: 'sm',
        },
        {
            title: 'صافي الربح',
            value: netProfit,
            icon: Wallet,
            color: profitTrend === 'up' ? 'success' : profitTrend === 'down' ? 'warning' : 'info',
            trend: profitTrend,
            trendValue: profitTrend === 'up' ? 'إيجابي' : profitTrend === 'down' ? 'سلبي' : '—',
            prefix: CURRENCY_SYMBOL,
            formatter: (val: number) => val.toLocaleString(),
            size: 'sm',
        },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {cards.map((card, i) => (
                <KPICard key={`kpi-${i}`} item={card} index={i} />
            ))}
        </div>
    );
};

import { Users, BookOpen, CalendarCheck, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '../types';

interface KPICardsProps {
    stats: DashboardStats;
}

interface KPICardData {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    prefix?: string;
    formatter?: (val: number) => string;
}

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
    primary: { bg: 'bg-primary-soft', text: 'text-primary', ring: 'ring-primary/20' },
    success: { bg: 'bg-success-soft', text: 'text-success', ring: 'ring-success/20' },
    info: { bg: 'bg-info-soft', text: 'text-info', ring: 'ring-info/20' },
    warning: { bg: 'bg-warning-soft', text: 'text-warning', ring: 'ring-warning/20' },
};

const KPICard = ({ item, index }: { item: KPICardData; index: number }) => {
    const Icon = item.icon;
    const c = colorMap[item.color] || colorMap.primary;

    return (
        <div
            className={cn(
                "flex-shrink-0 w-[calc(50%-0.375rem)] md:w-auto",
                "p-5 rounded-2xl bg-card border border-border",
                "font-dash"
            )}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center ring-1", c.ring, c.bg)}>
                    <Icon size={18} className={c.text} />
                </div>
            </div>

            <div className="space-y-0.5">
                <p className="text-2xl font-bold tabular-nums text-main tracking-tight">
                    {item.formatter && typeof item.value === 'number'
                        ? item.formatter(item.value)
                        : item.value}
                    {item.prefix && <span className="text-xs font-medium text-muted ms-1">{item.prefix}</span>}
                </p>
                <p className="text-xs text-muted font-medium">{item.title}</p>
            </div>
        </div>
    );
};

export const KPICards = ({ stats }: KPICardsProps) => {
    const cards: KPICardData[] = [
        {
            title: 'إجمالي الطلاب',
            value: stats.studentsCount,
            icon: Users,
            color: 'primary',
        },
        {
            title: 'إجمالي الإيرادات',
            value: stats.totalRevenue || 0,
            icon: TrendingUp,
            color: 'success',
            prefix: 'ج.م',
            formatter: (val: number) => val.toLocaleString(),
        },
        {
            title: 'إجمالي المصروفات',
            value: stats.totalExpenses || 0,
            icon: TrendingDown,
            color: 'warning',
            prefix: 'ج.م',
            formatter: (val: number) => val.toLocaleString(),
        },
        {
            title: 'صافي الربح',
            value: stats.totalNetProfit || 0,
            icon: DollarSign,
            color: 'info',
            prefix: 'ج.م',
            formatter: (val: number) => val.toLocaleString(),
        },
    ];

    return (
        <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {cards.map((card, i) => (
                <KPICard key={`kpi-${i}`} item={card} index={i} />
            ))}
        </div>
    );
};

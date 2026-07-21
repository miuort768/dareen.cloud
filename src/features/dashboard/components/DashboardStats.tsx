import { motion } from 'framer-motion';
import { Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardStats as Stats } from '../types';

interface DashboardStatsProps {
    stats: Stats;
    isTeacher: boolean;
}

interface StatCardData {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    trend?: { value: number; isUp: boolean };
    prefix?: string;
    formatter?: (val: number) => string;
}

const StatCard = ({ item, index }: { item: StatCardData; index: number }) => {
    const Icon = item.icon;
    const colorMap: Record<string, { bg: string; text: string; ring: string; iconBg: string }> = {
        primary: { bg: 'bg-primary/5', text: 'text-primary', ring: 'ring-primary/20', iconBg: 'bg-primary/10' },
        success: { bg: 'bg-success/5', text: 'text-success', ring: 'ring-success/20', iconBg: 'bg-success/10' },
        info: { bg: 'bg-info/5', text: 'text-info', ring: 'ring-info/20', iconBg: 'bg-info/10' },
        warning: { bg: 'bg-warning/5', text: 'text-warning', ring: 'ring-warning/20', iconBg: 'bg-warning/10' },
        error: { bg: 'bg-error/5', text: 'text-error', ring: 'ring-error/20', iconBg: 'bg-error/10' },
    };

    const c = colorMap[item.color] || colorMap.primary;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            className={cn(
                "relative group p-5 rounded-2xl border border-border/50 bg-card hover:border-border/80",
                "transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
                "cursor-default"
            )}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center ring-1", c.iconBg, c.text, c.ring)}>
                    <Icon size={18} />
                </div>
                {item.trend && (
                    <div className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                        item.trend.isUp ? "bg-success/10 text-success" : "bg-error/10 text-error"
                    )}>
                        {item.trend.isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        <span>{item.trend.value}%</span>
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <p className={cn("text-2xl font-bold tabular-nums tracking-tight text-main", item.prefix && "flex items-baseline gap-1")}>
                    {item.formatter && typeof item.value === 'number'
                        ? item.formatter(item.value)
                        : item.value}
                    {item.prefix && <span className="text-xs font-medium text-muted">{item.prefix}</span>}
                </p>
                <p className="text-xs text-muted font-medium">{item.title}</p>
            </div>
        </motion.div>
    );
};

export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => {
    const cards: StatCardData[] = [
        {
            title: 'إجمالي الطلاب',
            value: stats.studentsCount,
            icon: Users,
            color: 'primary',
            trend: { value: 12, isUp: true },
        },
        {
            title: 'الاشتراكات النشطة',
            value: stats.totalEnrollments,
            icon: BookOpen,
            color: 'success',
            trend: { value: 7, isUp: true },
        },
        {
            title: 'حصص اليوم',
            value: stats.todaySessions,
            icon: CalendarCheck,
            color: 'info',
            trend: { value: 22, isUp: true },
        },
        {
            title: 'الحصص المنفذة',
            value: stats.completedSessions,
            icon: CheckCircle2,
            color: 'success',
            trend: { value: stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0, isUp: true },
        },
    ];

    const adminCards: StatCardData[] = [
        {
            title: 'إجمالي المعلمين',
            value: stats.teachersCount,
            icon: GraduationCap,
            color: 'warning',
            trend: { value: 3, isUp: true },
        },
        {
            title: 'إجمالي الإيرادات',
            value: stats.totalRevenue || 0,
            icon: TrendingUp,
            color: 'success',
            prefix: 'ج.م',
            trend: { value: 8, isUp: true },
            formatter: (val: number) => val.toLocaleString(),
        },
        {
            title: 'إجمالي المصروفات',
            value: stats.totalExpenses || 0,
            icon: TrendingDown,
            color: 'error',
            prefix: 'ج.م',
            trend: { value: 5, isUp: false },
            formatter: (val: number) => val.toLocaleString(),
        },
        {
            title: 'صافي الربح',
            value: stats.totalNetProfit || 0,
            icon: DollarSign,
            color: 'info',
            prefix: 'ج.م',
            trend: { value: 15, isUp: true },
            formatter: (val: number) => val.toLocaleString(),
        },
    ];

    const allCards = [...cards, ...(!isTeacher ? adminCards : [])];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            {allCards.map((card, i) => (
                <StatCard key={`stat-${i}`} item={card} index={i} />
            ))}
        </div>
    );
};

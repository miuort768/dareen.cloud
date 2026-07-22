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

const colorMap: Record<string, { bg: string; text: string }> = {
    primary: { bg: 'bg-primary-soft', text: 'text-primary' },
    success: { bg: 'bg-success-soft', text: 'text-success' },
    info: { bg: 'bg-info-soft', text: 'text-info' },
    warning: { bg: 'bg-warning-soft', text: 'text-warning' },
    error: { bg: 'bg-error-soft', text: 'text-error' },
};

const StatCard = ({ item, index }: { item: StatCardData; index: number }) => {
    const Icon = item.icon;
    const c = colorMap[item.color] || colorMap.primary;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={cn(
                "p-5 rounded-2xl bg-card border border-border",
                "font-dash"
            )}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", c.bg)}>
                    <Icon size={18} className={c.text} />
                </div>
                {item.trend && (
                    <div className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                        item.trend.isUp ? "bg-success/10 text-success" : "bg-error/10 text-error"
                    )}>
                        {item.trend.isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        <span>{item.trend.value}%</span>
                    </div>
                )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {allCards.map((card, i) => (
                <StatCard key={`stat-${i}`} item={card} index={i} />
            ))}
        </div>
    );
};

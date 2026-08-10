import { motion } from 'framer-motion';
import { Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../../../config/constants';
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

const colorMap: Record<string, { bg: string; text: string; light: string; ring: string }> = {
    primary: { bg: 'bg-primary/10 dark:bg-primary/10', text: 'text-primary dark:text-primary', light: 'bg-primary/[0.04] dark:bg-primary/[0.04]', ring: 'ring-primary/20 dark:ring-accent/20' },
    success: { bg: 'bg-success/10', text: 'text-success', light: 'bg-success/[0.04]', ring: 'ring-success/20' },
    info: { bg: 'bg-info/10', text: 'text-info', light: 'bg-info/[0.04]', ring: 'ring-info/20' },
    warning: { bg: 'bg-warning/10', text: 'text-warning', light: 'bg-warning/[0.04]', ring: 'ring-warning/20' },
    error: { bg: 'bg-error/10', text: 'text-error', light: 'bg-error/[0.04]', ring: 'ring-error/20' },
};

const StatCard = ({ item, index }: { item: StatCardData; index: number }) => {
    const Icon = item.icon;
    const c = colorMap[item.color] || colorMap.primary;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
            className="group relative overflow-hidden rounded-2xl bg-card dark:bg-card border border-border dark:border-primary/20 p-5 transition-all duration-300 hover:shadow-elevation-2 hover:-translate-y-0.5"
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ring-1 ${c.ring} ${c.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                    <Icon size={18} className={c.text} />
                </div>
                {item.trend && (
                    <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${item.trend.isUp ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        {item.trend.isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                        <span>{item.trend.value}%</span>
                    </div>
                )}
            </div>

            <p className="text-2xl md:text-[28px] font-bold tabular-nums text-main dark:text-main leading-none tracking-tight mb-1">
                {item.formatter && typeof item.value === 'number'
                    ? item.formatter(item.value)
                    : item.value}
                {item.prefix && <span className="text-xs font-medium text-muted me-1">{item.prefix}</span>}
            </p>
            <p className="text-[13px] text-muted dark:text-muted font-medium">{item.title}</p>
        </motion.div>
    );
};

export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => {
    const studentTrend = stats.studentsCount > 0 ? { value: Math.round((stats.studentsCount / Math.max(stats.studentsCount - 3, 1) - 1) * 100), isUp: true } : undefined;
    const enrollmentTrend = stats.totalEnrollments > 0 ? { value: Math.round((stats.totalEnrollments / Math.max(stats.totalEnrollments - 5, 1) - 1) * 100), isUp: true } : undefined;
    const sessionsTrend = stats.weekTotalSessions && stats.weekTotalSessions > 0 ? { value: Math.round((stats.todaySessions / Math.max(stats.weekTotalSessions / 7, 1)) * 100 - 100), isUp: (stats.todaySessions > (stats.weekTotalSessions || 0) / 7) } : undefined;
    const completedTrend = stats.monthCompletedSessions && stats.monthCompletedSessions > 0 ? { value: Math.round(stats.completedSessions / Math.max(stats.monthCompletedSessions / 30, 1) * 100 - 100), isUp: true } : undefined;

    const cards: StatCardData[] = [
        {
            title: 'إجمالي الطلاب',
            value: stats.studentsCount,
            icon: Users,
            color: 'primary',
            trend: studentTrend,
        },
        {
            title: 'الاشتراكات النشطة',
            value: stats.totalEnrollments,
            icon: BookOpen,
            color: 'success',
            trend: enrollmentTrend,
        },
        {
            title: 'حصص اليوم',
            value: stats.todaySessions,
            icon: CalendarCheck,
            color: 'info',
            trend: sessionsTrend,
        },
        {
            title: 'الحصص المنفذة',
            value: stats.completedSessions,
            icon: CheckCircle2,
            color: 'success',
            trend: completedTrend,
        },
    ];

    const adminCards: StatCardData[] = [
        {
            title: 'إجمالي المعلمين',
            value: stats.teachersCount,
            icon: GraduationCap,
            color: 'warning',
        },
        {
            title: 'إجمالي الإيرادات',
            value: stats.totalRevenue || 0,
            icon: TrendingUp,
            color: 'success',
            prefix: CURRENCY_SYMBOL,
            formatter: (val: number) => val.toLocaleString(),
        },
        {
            title: 'إجمالي المصروفات',
            value: stats.totalExpenses || 0,
            icon: TrendingDown,
            color: 'error',
            prefix: CURRENCY_SYMBOL,
            formatter: (val: number) => val.toLocaleString(),
        },
        {
            title: 'صافي الربح',
            value: stats.totalNetProfit || 0,
            icon: DollarSign,
            color: 'info',
            prefix: CURRENCY_SYMBOL,
            formatter: (val: number) => val.toLocaleString(),
        },
    ];

    const allCards = [...cards, ...(!isTeacher ? adminCards : [])];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full">
            {allCards.map((card, i) => (
                <StatCard key={`stat-${i}`} item={card} index={i} />
            ))}
        </div>
    );
};
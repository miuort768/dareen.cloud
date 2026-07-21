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
    gradient: string;
    iconGradient: string;
    trend?: { value: number; isUp: boolean };
    prefix?: string;
    formatter?: (val: number) => string;
}

const gradientMap: Record<string, { gradient: string; iconGradient: string; from: string; via: string; to: string }> = {
    primary: {
        gradient: 'from-primary/5 via-purple-500/5 to-primary/5',
        iconGradient: 'from-primary to-purple-500',
        from: 'rgba(99,102,241,0.1)',
        via: 'rgba(139,92,246,0.08)',
        to: 'rgba(99,102,241,0.05)',
    },
    success: {
        gradient: 'from-success/5 via-emerald-500/5 to-success/5',
        iconGradient: 'from-success to-emerald-500',
        from: 'rgba(16,185,129,0.1)',
        via: 'rgba(5,150,105,0.08)',
        to: 'rgba(16,185,129,0.05)',
    },
    info: {
        gradient: 'from-info/5 via-cyan-500/5 to-info/5',
        iconGradient: 'from-info to-cyan-500',
        from: 'rgba(14,165,233,0.1)',
        via: 'rgba(6,182,212,0.08)',
        to: 'rgba(14,165,233,0.05)',
    },
    warning: {
        gradient: 'from-warning/5 via-amber-500/5 to-warning/5',
        iconGradient: 'from-warning to-amber-500',
        from: 'rgba(245,158,11,0.1)',
        via: 'rgba(217,119,6,0.08)',
        to: 'rgba(245,158,11,0.05)',
    },
    error: {
        gradient: 'from-error/5 via-rose-500/5 to-error/5',
        iconGradient: 'from-error to-rose-500',
        from: 'rgba(225,29,72,0.1)',
        via: 'rgba(244,63,94,0.08)',
        to: 'rgba(225,29,72,0.05)',
    },
};

const StatCard = ({ item, index }: { item: StatCardData; index: number }) => {
    const Icon = item.icon;
    const g = gradientMap[item.gradient] || gradientMap.primary;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(
                "relative group p-6 rounded-3xl",
                "bg-gradient-to-br bg-card/70 backdrop-blur-xl",
                "border border-white/20 dark:border-white/10",
                "shadow-[0_8px_32px_-4px_rgba(0,0,0,0.04)]",
                "hover:shadow-[0_16px_48px_-8px_rgba(99,102,241,0.12)]",
                "hover:-translate-y-1",
                "transition-all duration-300",
                "font-dash"
            )}
            style={{
                backgroundImage: `linear-gradient(135deg, ${g.from}, ${g.via}, ${g.to})`,
            }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    "bg-gradient-to-br shadow-lg",
                    g.iconGradient,
                    "text-white"
                )}>
                    <Icon size={20} />
                </div>
                {item.trend && (
                    <div className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold",
                        item.trend.isUp ? "bg-success/10 text-success" : "bg-error/10 text-error"
                    )}>
                        {item.trend.isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        <span>{item.trend.value}%</span>
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <h3 className={cn(
                    "text-3xl font-black tabular-nums tracking-tight",
                    "bg-gradient-to-r bg-clip-text text-transparent",
                    g.iconGradient
                )}>
                    {item.formatter && typeof item.value === 'number'
                        ? item.formatter(item.value)
                        : item.value}
                    {item.prefix && <span className="text-base font-bold text-muted me-1">{item.prefix}</span>}
                </h3>
                <p className="text-sm text-muted font-medium">{item.title}</p>
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
            gradient: 'primary',
            iconGradient: 'from-primary to-purple-500',
            trend: { value: 12, isUp: true },
        },
        {
            title: 'الاشتراكات النشطة',
            value: stats.totalEnrollments,
            icon: BookOpen,
            gradient: 'success',
            iconGradient: 'from-success to-emerald-500',
            trend: { value: 7, isUp: true },
        },
        {
            title: 'حصص اليوم',
            value: stats.todaySessions,
            icon: CalendarCheck,
            gradient: 'info',
            iconGradient: 'from-info to-cyan-500',
            trend: { value: 22, isUp: true },
        },
        {
            title: 'الحصص المنفذة',
            value: stats.completedSessions,
            icon: CheckCircle2,
            gradient: 'success',
            iconGradient: 'from-success to-emerald-500',
            trend: { value: stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0, isUp: true },
        },
    ];

    const adminCards: StatCardData[] = [
        {
            title: 'إجمالي المعلمين',
            value: stats.teachersCount,
            icon: GraduationCap,
            gradient: 'warning',
            iconGradient: 'from-warning to-amber-500',
            trend: { value: 3, isUp: true },
        },
        {
            title: 'إجمالي الإيرادات',
            value: stats.totalRevenue || 0,
            icon: TrendingUp,
            gradient: 'success',
            iconGradient: 'from-success to-emerald-500',
            prefix: 'ج.م',
            trend: { value: 8, isUp: true },
            formatter: (val: number) => val.toLocaleString(),
        },
        {
            title: 'إجمالي المصروفات',
            value: stats.totalExpenses || 0,
            icon: TrendingDown,
            gradient: 'error',
            iconGradient: 'from-error to-rose-500',
            prefix: 'ج.م',
            trend: { value: 5, isUp: false },
            formatter: (val: number) => val.toLocaleString(),
        },
        {
            title: 'صافي الربح',
            value: stats.totalNetProfit || 0,
            icon: DollarSign,
            gradient: 'info',
            iconGradient: 'from-info to-cyan-500',
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

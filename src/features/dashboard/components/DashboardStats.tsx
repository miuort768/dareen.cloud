import { Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardStats as Stats } from '../types';

interface DashboardStatsProps {
    stats: Stats;
    isTeacher: boolean;
}

const StatCard = ({ title, value, icon: Icon, color, bg }: { title: string, value: string | number, icon: LucideIcon, color: string, bg: string }) => (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 p-4 md:p-6 rounded-none flex flex-col items-center text-center group transition-all duration-300">
        <div className={cn("w-12 h-12 rounded-none flex items-center justify-center mb-3 transition-transform group-hover:scale-110 border border-slate-950/10 shadow-none", bg)}>
            <Icon size={20} className={color} />
        </div>
        <p className="text-[9px] md:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5">{title}</p>
        <p className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{value}</p>
    </div>
);

export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => {
    return (
        <>
            <StatCard title="إجمالي الطلاب" value={stats.studentsCount} icon={Users} color="text-blue-600" bg="bg-blue-500/10 dark:bg-blue-500/20" />
            <StatCard title="الاشتراكات النشطة" value={stats.totalEnrollments} icon={BookOpen} color="text-indigo-600" bg="bg-indigo-500/10 dark:bg-indigo-500/20" />
            <StatCard title="حصص اليوم" value={stats.todaySessions} icon={CalendarCheck} color="text-amber-600" bg="bg-amber-500/10 dark:bg-amber-500/20" />
            <StatCard title="الحصص المنفذة" value={stats.completedSessions} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-500/10 dark:bg-emerald-500/20" />

            {!isTeacher && (
                <>
                    <StatCard title="إجمالي المعلمين" value={stats.teachersCount} icon={GraduationCap} color="text-purple-600" bg="bg-purple-500/10 dark:bg-purple-500/20" />
                    <StatCard title="إجمالي الإيرادات" value={stats.totalRevenue.toLocaleString()} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-500/10 dark:bg-emerald-500/20" />
                    <StatCard title="إجمالي المصروفات" value={stats.totalExpenses.toLocaleString()} icon={TrendingDown} color="text-rose-600" bg="bg-rose-500/10 dark:bg-rose-500/20" />
                    <StatCard title="صافي الربح" value={stats.totalNetProfit.toLocaleString()} icon={DollarSign} color="text-indigo-600" bg="bg-indigo-500/10 dark:bg-indigo-500/20" />
                </>
            )}
        </>
    );
};

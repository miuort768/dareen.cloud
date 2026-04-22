import { Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardStats as Stats } from '../types';

interface DashboardStatsProps {
    stats: Stats;
    isTeacher: boolean;
}

const StatCard = ({ title, value, icon: Icon, color, bg }: { title: string, value: string | number, icon: LucideIcon, color: string, bg: string }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all duration-300">
        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110", bg)}>
            <Icon size={18} className={color} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-lg font-black text-slate-800 dark:text-white tabular-nums">{value}</p>
    </div>
);

export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => {
    return (
        <>
            <StatCard title="إجمالي الطلاب" value={stats.studentsCount} icon={Users} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
            <StatCard title="الاشتراكات النشطة" value={stats.totalEnrollments} icon={BookOpen} color="text-[#5c59f2]" bg="bg-indigo-50 dark:bg-indigo-900/20" />
            <StatCard title="حصص اليوم" value={stats.todaySessions} icon={CalendarCheck} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
            <StatCard title="الحصص المنفذة" value={stats.completedSessions} icon={CheckCircle2} color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-900/20" />

            {!isTeacher && (
                <>
                    <StatCard title="إجمالي المعلمين" value={stats.teachersCount} icon={GraduationCap} color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
                    <StatCard title="إجمالي الإيرادات" value={stats.totalRevenue.toLocaleString()} icon={TrendingUp} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
                    <StatCard title="إجمالي المصروفات" value={stats.totalExpenses.toLocaleString()} icon={TrendingDown} color="text-rose-500" bg="bg-rose-50 dark:bg-rose-900/20" />
                    <StatCard title="صافي الربح" value={stats.totalNetProfit.toLocaleString()} icon={DollarSign} color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-900/20" />
                </>
            )}
        </>
    );
};

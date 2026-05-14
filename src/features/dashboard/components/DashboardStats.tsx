import { Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardStats as Stats } from '../types';

interface DashboardStatsProps {
    stats: Stats;
    isTeacher: boolean;
}

const StatCard = ({ title, value, icon: Icon, color, bg }: { title: string, value: string | number, icon: LucideIcon, color: string, bg: string }) => (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 p-6 flex flex-col items-center text-center group transition-all duration-300 hover:border-indigo-600 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]">
        <div className={cn("w-14 h-14 rounded-none flex items-center justify-center mb-4 transition-all group-hover:rotate-6 border-2 border-slate-900/10 shadow-sm", bg)}>
            <Icon size={24} className={color} />
        </div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">{title}</p>
        <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{value}</p>
    </div>
);

export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <StatCard title="إجمالي الطلاب" value={stats.studentsCount} icon={Users} color="text-indigo-600" bg="bg-indigo-50" />
            <StatCard title="الاشتراكات النشطة" value={stats.totalEnrollments} icon={BookOpen} color="text-emerald-600" bg="bg-emerald-50" />
            <StatCard title="حصص اليوم" value={stats.todaySessions} icon={CalendarCheck} color="text-amber-500" bg="bg-amber-50" />
            <StatCard title="الحصص المنفذة" value={stats.completedSessions} icon={CheckCircle2} color="text-rose-600" bg="bg-rose-50" />

            {!isTeacher && (
                <>
                    <StatCard title="إجمالي المعلمين" value={stats.teachersCount} icon={GraduationCap} color="text-purple-600" bg="bg-purple-50" />
                    <StatCard title="إجمالي الإيرادات" value={stats.totalRevenue.toLocaleString()} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
                    <StatCard title="إجمالي المصروفات" value={stats.totalExpenses.toLocaleString()} icon={TrendingDown} color="text-rose-600" bg="bg-rose-50" />
                    <StatCard title="صافي الربح" value={stats.totalNetProfit.toLocaleString()} icon={DollarSign} color="text-indigo-600" bg="bg-indigo-50" />
                </>
            )}
        </div>
    );
};


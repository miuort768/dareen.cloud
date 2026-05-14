import { Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardStats as Stats } from '../types';

interface DashboardStatsProps {
    stats: Stats;
    isTeacher: boolean;
}

const StatCard = ({ title, value, icon: Icon, color, bg }: { title: string, value: string | number, icon: LucideIcon, color: string, bg: string }) => (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 p-3 flex items-center gap-3 rounded-none transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] h-full group">
        <div className={cn("w-10 h-10 rounded-none flex items-center justify-center shrink-0 border-2 border-slate-900/10 group-hover:border-slate-900/30 transition-colors", bg)}>
            <Icon size={18} className={color} />
        </div>
        <div className="flex flex-col min-w-0">
            <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase leading-none mb-1 truncate tracking-tight">{title}</h4>
            <div className="flex items-baseline gap-1">
                <span className="text-lg md:text-xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                    {value || 0}
                </span>
                {typeof value === 'string' && value.includes(',') && (
                    <span className="text-[9px] font-black text-slate-300 uppercase">EGP</span>
                )}
            </div>
        </div>
    </div>
);

export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            <StatCard title="إجمالي الطلاب" value={stats.studentsCount} icon={Users} color="text-indigo-600" bg="bg-indigo-50" />
            <StatCard title="الاشتراكات النشطة" value={stats.totalEnrollments} icon={BookOpen} color="text-emerald-600" bg="bg-emerald-50" />
            <StatCard title="حصص اليوم" value={stats.todaySessions} icon={CalendarCheck} color="text-amber-500" bg="bg-amber-50" />
            <StatCard title="الحصص المنفذة" value={stats.completedSessions} icon={CheckCircle2} color="text-rose-600" bg="bg-rose-50" />

            {!isTeacher && (
                <>
                    <StatCard title="إجمالي المعلمين" value={stats.teachersCount} icon={GraduationCap} color="text-purple-600" bg="bg-purple-50" />
                    <StatCard title="إجمالي الإيرادات" value={(stats.totalRevenue || 0).toLocaleString()} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
                    <StatCard title="إجمالي المصروفات" value={(stats.totalExpenses || 0).toLocaleString()} icon={TrendingDown} color="text-rose-600" bg="bg-rose-50" />
                    <StatCard title="صافي الربح" value={(stats.totalNetProfit || 0).toLocaleString()} icon={DollarSign} color="text-indigo-600" bg="bg-indigo-50" />
                </>
            )}
        </div>
    );
};



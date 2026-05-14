import { Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardStats as Stats } from '../types';

interface DashboardStatsProps {
    stats: Stats;
    isTeacher: boolean;
}

const StatCard = ({ title, value, icon: Icon, color, bg }: { title: string, value: string | number, icon: LucideIcon, color: string, bg: string }) => (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 p-5 flex flex-col items-center justify-center text-center group transition-all duration-300 hover:border-indigo-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] relative overflow-hidden h-full">
        <div className="absolute top-0 right-0 w-12 h-12 bg-slate-900/5 -translate-y-6 translate-x-6 rotate-45 pointer-events-none" />
        
        <div className={cn("w-12 h-12 rounded-none flex items-center justify-center mb-4 transition-transform group-hover:scale-110 border-2 border-slate-900 shadow-sm relative z-10", bg)}>
            <Icon size={20} className={color} />
        </div>
        
        <h4 className="text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase relative z-10">{title}</h4>
        <div className="flex items-baseline gap-1 relative z-10">
            <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                {value || 0}
            </p>
            {typeof value === 'string' && value.includes(',') && (
                <span className="text-[10px] font-black text-slate-300 uppercase italic">EGP</span>
            )}
        </div>
    </div>
);

export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => {
    return (
        <>
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
        </>
    );
};




import { Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardStats as Stats } from '../types';

interface DashboardStatsProps {
    stats: Stats;
    isTeacher: boolean;
}

const StatCard = ({ title, value, icon: Icon, color, bg, trend }: { title: string, value: string | number, icon: LucideIcon, color: string, bg: string, trend?: string }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] flex items-center justify-between group transition-all duration-300 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="text-right">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{title}</p>
            <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter mb-1">{value}</p>
            {trend && (
                <div className="flex items-center gap-1">
                    <span className={cn("text-[10px] font-black", color)}>{trend}</span>
                    <span className="text-[10px] text-slate-400 font-bold">من الشهر الماضي</span>
                </div>
            )}
        </div>
        <div className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 group-hover:rotate-12 group-hover:scale-110", bg)}>
            <Icon size={24} className={color} />
        </div>
    </div>
);

export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => {
    return (
        <>
            <StatCard 
                title="إجمالي الطلاب" 
                value={stats.studentsCount.toLocaleString()} 
                icon={Users} 
                color="text-blue-600" 
                bg="bg-blue-50" 
                trend="+12%"
            />
            <StatCard 
                title="إجمالي المعلمين" 
                value={stats.teachersCount} 
                icon={GraduationCap} 
                color="text-emerald-600" 
                bg="bg-emerald-50" 
                trend="+8%"
            />
            <StatCard 
                title="الدورات النشطة" 
                value={stats.totalEnrollments} 
                icon={BookOpen} 
                color="text-orange-600" 
                bg="bg-orange-50" 
                trend="+15%"
            />
            <StatCard 
                title="إجمالي الإيرادات" 
                value={stats.totalRevenue.toLocaleString()} 
                icon={DollarSign} 
                color="text-purple-600" 
                bg="bg-purple-50" 
                trend="+18%"
            />
        </>
    );
};

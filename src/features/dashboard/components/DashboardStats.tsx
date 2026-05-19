import { Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardStats as Stats } from '../types';

interface DashboardStatsProps {
    stats: Stats;
    isTeacher: boolean;
}

const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    gradientClasses, 
    unit 
}: { 
    title: string; 
    value: string | number; 
    icon: LucideIcon; 
    gradientClasses: string; 
    unit?: string; 
}) => (
    <div className="p-4 flex items-center gap-4 rounded-none bg-white dark:bg-slate-900 border-2 border-gray-950 dark:border-slate-800 transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(251,113,133,0.15)] hover:-translate-y-0.5 h-full group">
        <div className={cn("w-10 h-10 rounded-none flex items-center justify-center shrink-0 border border-gray-950 dark:border-slate-850 bg-gradient-to-br text-white shadow-sm", gradientClasses)}>
            <Icon size={20} className="stroke-[2.5]" />
        </div>
        <div className="flex flex-col min-w-0">
            <h4 className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase leading-none mb-1.5 truncate tracking-tight group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">
                {title}
            </h4>
            <div className="flex items-baseline gap-1">
                <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                    {value || 0}
                </span>
                {unit && (
                    <span className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                        {unit}
                    </span>
                )}
            </div>
        </div>
    </div>
);

export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <StatCard 
                title="إجمالي الطلاب" 
                value={stats.studentsCount} 
                icon={Users} 
                gradientClasses="from-[#6366F1] to-[#4F46E5]" 
            />
            <StatCard 
                title="الاشتراكات النشطة" 
                value={stats.totalEnrollments} 
                icon={BookOpen} 
                gradientClasses="from-[#10B981] to-[#059669]" 
            />
            <StatCard 
                title="حصص اليوم" 
                value={stats.todaySessions} 
                icon={CalendarCheck} 
                gradientClasses="from-[#8B5CF6] to-[#7C3AED]" 
            />
            <StatCard 
                title="الحصص المنفذة" 
                value={stats.completedSessions} 
                icon={CheckCircle2} 
                gradientClasses="from-[#EC4899] to-[#BE185D]" 
            />
 
            {!isTeacher && (
                <>
                    <StatCard 
                        title="إجمالي المعلمين" 
                        value={stats.teachersCount} 
                        icon={GraduationCap} 
                        gradientClasses="from-[#6366F1] to-[#4F46E5]" 
                    />
                    <StatCard 
                        title="إجمالي الإيرادات" 
                        value={(stats.totalRevenue || 0).toLocaleString()} 
                        icon={TrendingUp} 
                        gradientClasses="from-[#D4AF37] to-[#B8860B]" 
                        unit="ج.م"
                    />
                    <StatCard 
                        title="إجمالي المصروفات" 
                        value={(stats.totalExpenses || 0).toLocaleString()} 
                        icon={TrendingDown} 
                        gradientClasses="from-[#F59E0B] to-[#D97706]" 
                        unit="ج.م"
                    />
                    <StatCard 
                        title="صافي الربح" 
                        value={(stats.totalNetProfit || 0).toLocaleString()} 
                        icon={DollarSign} 
                        gradientClasses="from-[#EC4899] to-[#BE185D]" 
                        unit="ج.م"
                    />
                </>
            )}
        </div>
    );
};



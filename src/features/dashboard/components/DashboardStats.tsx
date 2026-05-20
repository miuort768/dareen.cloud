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
    accentColor,
    unit 
}: { 
    title: string; 
    value: string | number; 
    icon: LucideIcon; 
    gradientClasses: string; 
    accentColor?: string;
    unit?: string; 
}) => (
    <div className={cn(
        "relative p-5 flex items-center gap-4",
        "bg-white dark:bg-slate-900/90",
        "border border-slate-200 dark:border-slate-800",
        "rounded-2xl shadow-sm",
        "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        "group overflow-hidden"
    )}>
        {/* Accent bar */}
        <div className={cn(
            "absolute top-0 right-0 w-full h-0.5 opacity-60",
            accentColor || "bg-indigo-500"
        )} />
        
        {/* Background subtle icon */}
        <div className="absolute -bottom-3 -left-3 opacity-[0.04] dark:opacity-[0.08]">
            <Icon size={60} className="text-slate-900 dark:text-white" />
        </div>

        <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-black/5",
            "bg-gradient-to-br text-white",
            gradientClasses
        )}>
            <Icon size={20} className="stroke-[2.5]" />
        </div>
        <div className="flex flex-col min-w-0 relative z-10">
            <h4 className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase leading-none mb-1.5 truncate tracking-tight group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                {title}
            </h4>
            <div className="flex items-baseline gap-1.5">
                <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                    {value ?? 0}
                </span>
                {unit && (
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
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
                accentColor="bg-[#6366F1]"
            />
            <StatCard 
                title="الاشتراكات النشطة" 
                value={stats.totalEnrollments} 
                icon={BookOpen} 
                gradientClasses="from-[#10B981] to-[#059669]"
                accentColor="bg-[#10B981]"
            />
            <StatCard 
                title="حصص اليوم" 
                value={stats.todaySessions} 
                icon={CalendarCheck} 
                gradientClasses="from-[#8B5CF6] to-[#7C3AED]"
                accentColor="bg-[#8B5CF6]"
            />
            <StatCard 
                title="الحصص المنفذة" 
                value={stats.completedSessions} 
                icon={CheckCircle2} 
                gradientClasses="from-[#EC4899] to-[#BE185D]"
                accentColor="bg-[#EC4899]"
            />
 
            {!isTeacher && (
                <>
                    <StatCard 
                        title="إجمالي المعلمين" 
                        value={stats.teachersCount} 
                        icon={GraduationCap} 
                        gradientClasses="from-[#6366F1] to-[#4F46E5]"
                        accentColor="bg-[#6366F1]"
                    />
                    <StatCard 
                        title="إجمالي الإيرادات" 
                        value={(stats.totalRevenue || 0).toLocaleString()} 
                        icon={TrendingUp} 
                        gradientClasses="from-[#D4AF37] to-[#B8860B]"
                        accentColor="bg-[#D4AF37]"
                        unit="ج.م"
                    />
                    <StatCard 
                        title="إجمالي المصروفات" 
                        value={(stats.totalExpenses || 0).toLocaleString()} 
                        icon={TrendingDown} 
                        gradientClasses="from-[#F59E0B] to-[#D97706]"
                        accentColor="bg-[#F59E0B]"
                        unit="ج.م"
                    />
                    <StatCard 
                        title="صافي الربح" 
                        value={(stats.totalNetProfit || 0).toLocaleString()} 
                        icon={DollarSign} 
                        gradientClasses="from-[#EC4899] to-[#BE185D]"
                        accentColor="bg-[#EC4899]"
                        unit="ج.م"
                    />
                </>
            )}
        </div>
    );
};



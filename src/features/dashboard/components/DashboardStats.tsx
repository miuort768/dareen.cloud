import { Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, TrendingUp, TrendingDown, DollarSign, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from 'lucide-react';
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
    unit,
    trendData
}: { 
    title: string; 
    value: string | number; 
    icon: LucideIcon; 
    unit?: string;
    trendData?: { 
        percentage: number; 
        isPositive: boolean; 
        label: string;
    };
}) => (
    <div className={cn(
        "relative p-5 flex flex-col items-center gap-3",
        "bg-white dark:bg-slate-900",
        "border border-slate-200 dark:border-slate-800",
        "border-0",
        "transition-all duration-200",
        "group"
    )}>
        {/* Solid accent bar on left */}
        <div className={cn(
            "absolute top-0 bottom-0 left-0 w-px bg-gradient-to-t from-[hsl(var(--color-primary))] to-[hsl(var(--color-primary))]",
            // Simpler: solid left border
            "border-l-2 border-[hsl(var(--color-primary))]"
        )} />
        
        {/* Icon container */}
        <div className="relative w-10 h-10 flex items-center justify-center mb-3">
            <div className="w-8 h-8 flex items-center justify-center">
                <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-full h-full flex items-center justify-center">
                        <Icon size={20} className="stroke-[2]" />
                    </div>
                </div>
            </div>
        </div>
        
        <div className="flex flex-col items-center min-w-0 relative z-10 w-full">
            <h4 className="text-[9px] md:text-xs font-medium text-slate-400 dark:text-slate-500 uppercase leading-none mb-1.5 truncate tracking-tight">
                {title}
            </h4>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none font-[700]">
                    {value ?? 0}
                </span>
                {unit && (
                    <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-tighter ml-0.5">
                        {unit}
                    </span>
                )}
            </div>
            
            {/* Trend indicator */}
            {trendData && (
                <div className="flex items-center gap-1 mt-1 text-[8px] font-medium">
                    <Icon 
                        size={10} 
                        className={cn(
                            trendData.isPositive ? "text-emerald-500" : "text-rose-500",
                            trendData.isPositive ? TrendingUpIcon : TrendingDownIcon
                        )}
                    />
                    <span className={`text-${trendData.isPositive ? 'emerald-500' : 'rose-500'} font-medium`}>
                        {trendData.percentage}% {trendData.label}
                    </span>
                </div>
            )}
        </div>
    </div>
);

export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => {
    // Calculate some trend data for demonstration (in real app, this would come from API)
    const studentTrend = { percentage: 12, isPositive: true, label: "نمو الشهر" };
    const revenueTrend = { percentage: 8, isPositive: true, label: "زيادة الإيرادات" };
    const expenseTrend = { percentage: -5, isPositive: false, label: "تقليل التكاليف" };
    const profitTrend = { percentage: 15, isPositive: true, label: "نمو الأرباح" };
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <StatCard 
                title="إجمالي الطلاب" 
                value={stats.studentsCount} 
                icon={Users} 
                trendData={studentTrend}
            />
            <StatCard 
                title="الاشتراكات النشطة" 
                value={stats.totalEnrollments} 
                icon={BookOpen} 
                trendData={{ percentage: 7, isPositive: true, label: "نشطة" }}
            />
            <StatCard 
                title="حصص اليوم" 
                value={stats.todaySessions} 
                icon={CalendarCheck} 
                gradientClasses="from-[#8B5CF6] to-[#7C3AED]"
                accentColor="bg-[#8B5CF6]"
                trendData={{ percentage: 22, isPositive: true, label: "مجدولة" }}
            />
            <StatCard 
                title="الحصص المنفذة" 
                value={stats.completedSessions} 
                icon={CheckCircle2} 
                gradientClasses="from-[#EC4899] to-[#BE185D]"
                accentColor="bg-[#EC4899]"
                trendData={{ percentage: 18, isPositive: true, label: "مكتملة" }}
            />
          
            {!isTeacher && (
                <>
                    <StatCard 
                        title="إجمالي المعلمين" 
                        value={stats.teachersCount} 
                        icon={GraduationCap} 
                        gradientClasses="from-[#6366F1] to-[#4F46E5]"
                        accentColor="bg-[#6366F1]"
                        trendData={{ percentage: 3, isPositive: true, label: "جدد" }}
                    />
                    <StatCard 
                        title="إجمالي الإيرادات" 
                        value={(stats.totalRevenue || 0).toLocaleString()} 
                        icon={TrendingUp} 
                        gradientClasses="from-[#D4AF37] to-[#B8860B]"
                        accentColor="bg-[#D4AF37]"
                        unit="ج.م"
                        trendData={revenueTrend}
                    />
                    <StatCard 
                        title="إجمالي المصروفات" 
                        value={(stats.totalExpenses || 0).toLocaleString()} 
                        icon={TrendingDown} 
                        gradientClasses="from-[#F59E0B] to-[#D97706]"
                        accentColor="bg-[#F59E0B]"
                        unit="ج.م"
                        trendData={expenseTrend}
                    />
                    <StatCard 
                        title="صافي الربح" 
                        value={(stats.totalNetProfit || 0).toLocaleString()} 
                        icon={DollarSign} 
                        gradientClasses="from-[#EC4899] to-[#BE185D]"
                        accentColor="bg-[#EC4899]"
                        unit="ج.م"
                        trendData={profitTrend}
                    />
                </>
            )}
        </div>
    );
};



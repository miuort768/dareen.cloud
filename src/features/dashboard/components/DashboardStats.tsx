import { Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, TrendingUp, TrendingDown, DollarSign, Sparkles, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from 'lucide-react';
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
    unit,
    trendData
}: { 
    title: string; 
    value: string | number; 
    icon: LucideIcon; 
    gradientClasses: string; 
    accentColor?: string;
    unit?: string;
    trendData?: { 
        percentage: number; 
        isPositive: boolean; 
        label: string;
    };
}) => (
    <div className={cn(
        "relative p-6 flex flex-col items-center gap-4",
        "bg-white dark:bg-slate-900/95",
        "border border-slate-200/50 dark:border-slate-800/50",
        "rounded-2xl shadow-inner shadow-[0_0_0px_rgba(99,102,241,0.1)]",
        "transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:-translate-y-1",
        "group overflow-hidden backdrop-blur-lg",
        "bg-clip-padding",
        "border-transparent"
    )}>
        {/* Holographic accent bar */}
        <div className={cn(
            "absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[hsl(var(--color-primary)/0.4)] to-transparent",
            "animate-[holoFlow_3s_ease_in_out_infinite]"
        )} />
        
        {/* Background subtle animated icon */}
        <div className="absolute -bottom-4 -left-4 opacity-[0.02] dark:opacity-[0.04]">
            <Icon size={72} className="text-slate-900/5 dark:text-white/5 animate-[slowPulse_4s_ease_in_out_infinite]" />
        </div>

        {/* Premium icon container */}
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0 mb-2">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-transparent backdrop-blur-lg border-2 border-white/10 dark:border-slate-800/10" />
            <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                    <div className="w-full h-full rounded-xl bg-gradient-to-br text-white shadow-inner">
                        <Icon size={24} className="stroke-[2.5]" />
                    </div>
                </div>
            </div>
        </div>
        
        <div className="flex flex-col items-center min-w-0 relative z-10 w-full">
            <h4 className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase leading-none mb-2 truncate tracking-tight group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                {title}
            </h4>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none font-[800]">
                    {value ?? 0}
                </span>
                {unit && (
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter ml-1">
                        {unit}
                    </span>
                )}
            </div>
            
            {/* Trend indicator */}
            {trendData && (
                <div className="flex items-center gap-1.5 mt-2 text-[9px] font-medium">
                    <Icon 
                        size={12} 
                        className={cn(
                            trendData.isPositive ? "text-emerald-500" : "text-rose-500",
                            trendData.isPositive ? TrendingUpIcon : TrendingDownIcon
                        )}
                    />
                    <span className={`text-${trendData.isPositive ? 'emerald-500' : 'rose-500'} font-black`}>
                        {trendData.percentage}% {trendData.label}
                    </span>
                </div>
            )}
            
            {/* Sparkles on hover */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-white/50 rounded-full animate-[sparklePulse_2s_ease_in_out_infinite]" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-white/50 rounded-full animate-[sparklePulse_2s_ease_in_out_infinite]" />
                <div className="absolute bottom-2 left-2 w-4 h-4 bg-white/50 rounded-full animate-[sparklePulse_2s_ease_in_out_infinite]" />
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-white/50 rounded-full animate-[sparklePulse_2s_ease_in_out_infinite]" />
            </div>
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
                gradientClasses="from-[#6366F1] to-[#4F46E5]"
                accentColor="bg-[#6366F1]"
                trendData={studentTrend}
            />
            <StatCard 
                title="الاشتراكات النشطة" 
                value={stats.totalEnrollments} 
                icon={BookOpen} 
                gradientClasses="from-[#10B981] to-[#059669]"
                accentColor="bg-[#10B981]"
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



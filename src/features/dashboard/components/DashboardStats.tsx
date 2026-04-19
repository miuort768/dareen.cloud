import { Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardStats as Stats } from '../types';

interface DashboardStatsProps {
    stats: Stats;
    isTeacher: boolean;
}

const colorMap = {
    blue: 'bg-blue-600 border-slate-900 shadow-none text-white',
    emerald: 'bg-emerald-600 border-slate-900 shadow-none text-white',
    purple: 'bg-purple-600 border-slate-900 shadow-none text-white',
    amber: 'bg-amber-500 border-slate-900 shadow-none text-white',
    rose: 'bg-rose-600 border-slate-900 shadow-none text-white',
    indigo: 'bg-indigo-600 border-slate-900 shadow-none text-white',
    green: 'bg-green-600 border-slate-900 shadow-none text-white',
};

const PremiumStatsCard = ({ title, value, icon: Icon, color, trendUp, trendText }: { title: string, value: string | number, icon: LucideIcon, color: keyof typeof colorMap, trendUp?: boolean, trendText?: string }) => {
    return (
        <div className="relative group overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 md:p-4 rounded-none shadow-sm transition-all hover:bg-slate-50">
            <div className="flex items-center gap-2 md:gap-4">
                <div className={cn(
                    "w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-none border-2 transition-transform shrink-0",
                    colorMap[color]
                )}>
                    <Icon size={14} className="md:hidden" />
                    <Icon size={18} className="hidden md:block" />
                </div>
                
                <div className="flex-1 min-w-0">
                    <p className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 md:mb-1 truncate">{title}</p>
                    <div className="flex items-baseline gap-1.5">
                        <h3 className="text-base md:text-xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">
                            {value}
                        </h3>
                        {trendText && (
                            <span className={cn(
                                "text-[7px] md:text-[9px] font-bold px-1 py-0.5 rounded-none border hidden sm:inline",
                                trendUp ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                            )}>
                                {trendUp ? '+' : ''}{trendText}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => {
    return (
        <>
            <PremiumStatsCard title="إجمالي الطلاب" value={stats.studentsCount} icon={Users} color="blue" trendUp={true} trendText="12%" />
            <PremiumStatsCard title="الاشتراكات ناشة" value={stats.totalEnrollments} icon={BookOpen} color="indigo" />
            <PremiumStatsCard title="حصص اليوم" value={stats.todaySessions} icon={CalendarCheck} color="amber" />
            <PremiumStatsCard title="الحصص المنفذة" value={stats.completedSessions} icon={CheckCircle2} color="emerald" trendUp={true} trendText="TAM" />

            {!isTeacher && (
                <>
                    <PremiumStatsCard title="إجمالي المعلمين" value={stats.teachersCount} icon={GraduationCap} color="purple" />
                    <PremiumStatsCard title="إجمالي الإيرادات" value={stats.totalRevenue.toLocaleString()} icon={TrendingUp} color="green" />
                    <PremiumStatsCard title="إجمالي المصروفات" value={stats.totalExpenses.toLocaleString()} icon={TrendingDown} color="rose" />
                    <PremiumStatsCard title="إجمالي الأرباح" value={stats.totalNetProfit.toLocaleString()} icon={DollarSign} color="emerald" />
                </>
            )}
        </>
    );
};

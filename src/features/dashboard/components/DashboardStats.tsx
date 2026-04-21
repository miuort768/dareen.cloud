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

const PremiumStatsCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: LucideIcon, color: keyof typeof colorMap, trendUp?: boolean, trendText?: string }) => {
    return (
        <div className="relative group overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-white p-3 md:p-5 rounded-none shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">
            <div className="flex items-center gap-3 md:gap-5">
                <div className={cn(
                    "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-none border-2 border-slate-900 dark:border-white transition-transform shrink-0 shadow-lg",
                    colorMap[color]
                )}>
                    <Icon size={16} className="md:hidden" />
                    <Icon size={20} className="hidden md:block" />
                </div>
                
                <div className="flex-1 min-w-0">
                    <p className="text-[7px] md:text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[2px] mb-1 md:mb-1.5 truncate italic">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-sm md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none italic uppercase">
                            {value}
                        </h3>
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
            <PremiumStatsCard title="الاشتراكات النشطة" value={stats.totalEnrollments} icon={BookOpen} color="indigo" />
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

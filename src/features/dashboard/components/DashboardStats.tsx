import { Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, TrendingUp, TrendingDown, DollarSign, LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardStats as Stats } from '../types';

interface DashboardStatsProps {
    stats: Stats;
    isTeacher: boolean;
}

const colorMap = {
    blue: 'from-blue-500/20 to-indigo-500/20 text-blue-600 border-blue-100 shadow-blue-500/5',
    emerald: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 border-emerald-100 shadow-emerald-500/5',
    purple: 'from-purple-500/20 to-fuchsia-500/20 text-purple-600 border-purple-100 shadow-purple-500/5',
    amber: 'from-amber-500/20 to-orange-500/20 text-amber-600 border-amber-100 shadow-amber-500/5',
    rose: 'from-rose-500/20 to-pink-500/20 text-rose-600 border-rose-100 shadow-rose-500/5',
    indigo: 'from-indigo-500/20 to-blue-500/20 text-indigo-600 border-indigo-100 shadow-indigo-500/5',
    green: 'from-green-500/20 to-emerald-500/20 text-green-600 border-green-100 shadow-green-500/5',
};

const PremiumStatsCard = ({ title, value, icon: Icon, color, trendUp, trendText }: { title: string, value: string | number, icon: LucideIcon, color: keyof typeof colorMap, trendUp?: boolean, trendText?: string }) => {
    return (
        <div className={cn(
            "relative group overflow-hidden bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-white dark:border-slate-800 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1",
            colorMap[color]
        )}>
            {/* Background Decoration */}
            <div className={cn(
                "absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br opacity-50 blur-3xl transition-all duration-700 group-hover:scale-150 group-hover:opacity-70",
                colorMap[color].split(' ')[0],
                colorMap[color].split(' ')[1]
            )}></div>

            <div className="relative flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className={cn(
                        "w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br border shadow-lg transition-transform duration-500 group-hover:rotate-12",
                        colorMap[color]
                    )}>
                        <Icon className="w-6 h-6" />
                    </div>
                    {trendText && (
                        <div className={cn(
                            "flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border",
                            trendUp ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                        )}>
                            {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {trendText}
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                        {value}
                    </h3>
                </div>
            </div>
        </div>
    );
};

export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => {
    return (
        <>
            <PremiumStatsCard title="إجمالي الطلاب" value={stats.studentsCount} icon={Users} color="blue" trendUp={true} trendText="+12%" />
            <PremiumStatsCard title="الاشتراكات النشطة" value={stats.totalEnrollments} icon={BookOpen} color="indigo" trendUp={true} />
            <PremiumStatsCard title="حصص اليوم" value={stats.todaySessions} icon={CalendarCheck} color="amber" trendUp={true} />
            <PremiumStatsCard title="الحصص المنفذة" value={stats.completedSessions} icon={CheckCircle2} color="emerald" trendUp={true} trendText="منجز" />

            {!isTeacher && (
                <>
                    <PremiumStatsCard title="إجمالي المعلمين" value={stats.teachersCount} icon={GraduationCap} color="purple" trendUp={true} />
                    <PremiumStatsCard title="إجمالي الإيرادات" value={stats.totalRevenue.toLocaleString()} icon={TrendingUp} color="green"
                        trendText={stats.monthRevenue.toLocaleString()} trendUp={true} />
                    <PremiumStatsCard title="إجمالي المصروفات" value={stats.totalExpenses.toLocaleString()} icon={TrendingDown} color="rose"
                        trendText={stats.monthExpenses.toLocaleString()} trendUp={false} />
                    <PremiumStatsCard title="إجمالي الأرباح" value={stats.totalNetProfit.toLocaleString()} icon={DollarSign} color="emerald"
                        trendText={stats.monthNetProfit.toLocaleString()} trendUp={true} />
                </>
            )}
        </>
    );
};

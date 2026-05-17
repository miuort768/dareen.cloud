import { Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardStats as Stats } from '../types';

interface DashboardStatsProps {
    stats: Stats;
    isTeacher: boolean;
}

const StatCard = ({ title, value, icon: Icon, color, bg, cardBg, cardBorder }: { title: string, value: string | number, icon: LucideIcon, color: string, bg: string, cardBg: string, cardBorder: string }) => (
    <div className={cn("p-3 flex items-center gap-3 rounded-none md:rounded-2xl transition-all duration-300 hover:shadow-[0_0_12px_rgba(99,102,241,0.15)] dark:hover:shadow-[0_0_12px_rgba(99,102,241,0.1)] h-full group shadow-sm border", cardBg, cardBorder)}>
        <div className={cn("stats-icon-box flex items-center justify-center shrink-0 border border-slate-900/10 group-hover:border-slate-900/30 transition-colors", bg)}>
            <Icon className={color} />
        </div>
        <div className="flex flex-col min-w-0">
            <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase leading-none mb-1 truncate tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</h4>
            <div className="flex items-baseline gap-1">
                <span className="text-lg md:text-xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                    {value || 0}
                </span>
                {typeof value === 'string' && value.includes(',') && (
                    <span className="text-[9px] font-black text-slate-300 uppercase">ج.م</span>
                )}
            </div>
        </div>
    </div>
);

export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            <StatCard 
                title="إجمالي الطلاب" 
                value={stats.studentsCount} 
                icon={Users} 
                color="text-indigo-600" 
                bg="bg-indigo-50" 
                cardBg="bg-indigo-50/60 dark:bg-indigo-950/20"
                cardBorder="border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-400/50"
            />
            <StatCard 
                title="الاشتراكات النشطة" 
                value={stats.totalEnrollments} 
                icon={BookOpen} 
                color="text-emerald-600" 
                bg="bg-emerald-50" 
                cardBg="bg-emerald-50/50 dark:bg-emerald-950/15"
                cardBorder="border-emerald-100 dark:border-emerald-900/35 hover:border-emerald-400/50"
            />
            <StatCard 
                title="حصص اليوم" 
                value={stats.todaySessions} 
                icon={CalendarCheck} 
                color="text-amber-500" 
                bg="bg-amber-50" 
                cardBg="bg-amber-50/40 dark:bg-amber-950/10"
                cardBorder="border-amber-100 dark:border-amber-900/30 hover:border-amber-400/50"
            />
            <StatCard 
                title="الحصص المنفذة" 
                value={stats.completedSessions} 
                icon={CheckCircle2} 
                color="text-rose-600" 
                bg="bg-rose-50" 
                cardBg="bg-rose-50/40 dark:bg-rose-950/10"
                cardBorder="border-rose-100 dark:border-rose-900/30 hover:border-rose-400/50"
            />
 
            {!isTeacher && (
                <>
                    <StatCard 
                        title="إجمالي المعلمين" 
                        value={stats.teachersCount} 
                        icon={GraduationCap} 
                        color="text-purple-600" 
                        bg="bg-purple-50" 
                        cardBg="bg-purple-50/40 dark:bg-purple-950/10"
                        cardBorder="border-purple-100 dark:border-purple-900/30 hover:border-purple-400/50"
                    />
                    <StatCard 
                        title="إجمالي الإيرادات" 
                        value={(stats.totalRevenue || 0).toLocaleString()} 
                        icon={TrendingUp} 
                        color="text-emerald-600" 
                        bg="bg-emerald-50" 
                        cardBg="bg-cyan-50/50 dark:bg-cyan-950/15"
                        cardBorder="border-cyan-100 dark:border-cyan-900/35 hover:border-cyan-400/50"
                    />
                    <StatCard 
                        title="إجمالي المصروفات" 
                        value={(stats.totalExpenses || 0).toLocaleString()} 
                        icon={TrendingDown} 
                        color="text-rose-600" 
                        bg="bg-rose-50" 
                        cardBg="bg-pink-50/40 dark:bg-pink-950/10"
                        cardBorder="border-pink-100 dark:border-pink-900/30 hover:border-pink-400/50"
                    />
                    <StatCard 
                        title="صافي الربح" 
                        value={(stats.totalNetProfit || 0).toLocaleString()} 
                        icon={DollarSign} 
                        color="text-indigo-600" 
                        bg="bg-indigo-50" 
                        cardBg="bg-sky-50/60 dark:bg-sky-950/20"
                        cardBorder="border-sky-100 dark:border-sky-900/40 hover:border-sky-400/50"
                    />
                </>
            )}
        </div>
    );
};



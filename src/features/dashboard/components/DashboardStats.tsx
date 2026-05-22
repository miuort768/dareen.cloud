import { Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardStats as Stats } from '../types';

interface DashboardStatsProps {
    stats: Stats;
    isTeacher: boolean;
}

const gradients: Record<string, string> = {
  'إجمالي الطلاب': 'from-indigo-500 to-violet-600',
  'الاشتراكات النشطة': 'from-blue-500 to-cyan-500',
  'حصص اليوم': 'from-amber-400 to-orange-500',
  'الحصص المنفذة': 'from-emerald-500 to-green-600',
  'إجمالي المعلمين': 'from-violet-500 to-purple-600',
  'إجمالي الإيرادات': 'from-emerald-500 to-teal-600',
  'إجمالي المصروفات': 'from-rose-500 to-pink-600',
  'صافي الربح': 'from-fuchsia-500 to-rose-500',
};

const StatCard = ({ title, value, icon: Icon, unit, trendData }: {
  title: string; value: string | number; icon: LucideIcon; unit?: string;
  trendData?: { percentage: number; isPositive: boolean; label: string };
}) => (
  <div className={cn(
    "relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm",
    "border border-white/20 dark:border-slate-700/30 rounded-2xl p-5",
    "shadow-lg shadow-slate-200/50 dark:shadow-slate-950/30",
    "flex flex-col items-center gap-3 transition-all duration-200 group"
  )}>
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-sm",
      "transition-transform group-hover:scale-110 duration-200",
      gradients[title] || 'from-indigo-500 to-violet-600'
    )}>
      <Icon size={18} className="text-white" />
    </div>

    <div className="flex flex-col items-center min-w-0 relative z-10 w-full">
      <h4 className="text-[9px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase leading-none mb-1 truncate tracking-tight">
        {title}
      </h4>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none">
          {value ?? 0}
        </span>
        {unit && (
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
            {unit}
          </span>
        )}
      </div>

      {trendData && (
        <div className="flex items-center gap-1 mt-1.5 text-[8px] font-bold">
          {trendData.isPositive ? (
            <TrendingUp size={10} className="text-emerald-500" />
          ) : (
            <TrendingDown size={10} className="text-rose-500" />
          )}
          <span className={trendData.isPositive ? 'text-emerald-500' : 'text-rose-500'}>
            {trendData.percentage}% {trendData.label}
          </span>
        </div>
      )}
    </div>
  </div>
);

export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
    <StatCard title="إجمالي الطلاب" value={stats.studentsCount} icon={Users}
      trendData={{ percentage: 12, isPositive: true, label: 'نمو الشهر' }} />
    <StatCard title="الاشتراكات النشطة" value={stats.totalEnrollments} icon={BookOpen}
      trendData={{ percentage: 7, isPositive: true, label: 'نشطة' }} />
    <StatCard title="حصص اليوم" value={stats.todaySessions} icon={CalendarCheck}
      trendData={{ percentage: 22, isPositive: true, label: 'مجدولة' }} />
    <StatCard title="الحصص المنفذة" value={stats.completedSessions} icon={CheckCircle2}
      trendData={{ percentage: 18, isPositive: true, label: 'مكتملة' }} />

    {!isTeacher && (
      <>
        <StatCard title="إجمالي المعلمين" value={stats.teachersCount} icon={GraduationCap}
          trendData={{ percentage: 3, isPositive: true, label: 'جدد' }} />
        <StatCard title="إجمالي الإيرادات" value={(stats.totalRevenue || 0).toLocaleString()} icon={TrendingUp} unit="ج.م"
          trendData={{ percentage: 8, isPositive: true, label: 'زيادة الإيرادات' }} />
        <StatCard title="إجمالي المصروفات" value={(stats.totalExpenses || 0).toLocaleString()} icon={TrendingDown} unit="ج.م"
          trendData={{ percentage: 5, isPositive: false, label: 'تقليل التكاليف' }} />
        <StatCard title="صافي الربح" value={(stats.totalNetProfit || 0).toLocaleString()} icon={DollarSign} unit="ج.م"
          trendData={{ percentage: 15, isPositive: true, label: 'نمو الأرباح' }} />
      </>
    )}
  </div>
);

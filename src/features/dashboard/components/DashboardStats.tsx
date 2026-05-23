import { useEffect, useRef, useState } from 'react';
import { Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, TrendingUp, TrendingDown, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
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

const accentColors: Record<string, string> = {
  'إجمالي الطلاب': 'border-r-indigo-500 dark:border-r-indigo-400',
  'الاشتراكات النشطة': 'border-r-blue-500 dark:border-r-cyan-400',
  'حصص اليوم': 'border-r-amber-400 dark:border-r-orange-400',
  'الحصص المنفذة': 'border-r-emerald-500 dark:border-r-green-400',
  'إجمالي المعلمين': 'border-r-violet-500 dark:border-r-purple-400',
  'إجمالي الإيرادات': 'border-r-emerald-500 dark:border-r-teal-400',
  'إجمالي المصروفات': 'border-r-rose-500 dark:border-r-pink-400',
  'صافي الربح': 'border-r-fuchsia-500 dark:border-r-rose-400',
};

const StatCard = ({ title, value, icon: Icon, unit, trendData, index }: {
  title: string; value: string | number; icon: LucideIcon; unit?: string;
  trendData?: { percentage: number; isPositive: boolean; label: string };
  index: number;
}) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const barWidth = trendData ? Math.min(Math.abs(trendData.percentage), 100) : 0;

  return (
    <div
      ref={ref}
      className={cn(
        "relative bg-white dark:bg-slate-900/90",
        "border border-slate-200 dark:border-slate-700/50 rounded-xl p-4",
        "shadow-sm shadow-slate-100 dark:shadow-slate-950/20",
        "transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
        "flex items-center gap-3",
        "border-r-4",
        accentColors[title] || 'border-r-indigo-500',
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-sm shrink-0",
        gradients[title] || 'from-indigo-500 to-violet-600'
      )}>
        <Icon size={18} className="text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-none mb-0.5 truncate">
          {title}
        </h4>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none">
            {value ?? 0}
          </span>
          {unit && (
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500">
              {unit}
            </span>
          )}
        </div>

        {trendData && (
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  trendData.isPositive ? "bg-emerald-400" : "bg-rose-400"
                )}
                style={{ width: visible ? `${barWidth}%` : '0%' }}
              />
            </div>
            <div className={cn(
              "flex items-center gap-0.5 text-[8px] font-bold shrink-0",
              trendData.isPositive ? "text-emerald-500" : "text-rose-500"
            )}>
              {trendData.isPositive ? <ArrowUp size={8} /> : <ArrowDown size={8} />}
              <span>{trendData.percentage}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => {
  let idx = 0;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      <StatCard title="إجمالي الطلاب" value={stats.studentsCount} icon={Users} index={idx++}
        trendData={{ percentage: 12, isPositive: true, label: 'نمو الشهر' }} />
      <StatCard title="الاشتراكات النشطة" value={stats.totalEnrollments} icon={BookOpen} index={idx++}
        trendData={{ percentage: 7, isPositive: true, label: 'نشطة' }} />
      <StatCard title="حصص اليوم" value={stats.todaySessions} icon={CalendarCheck} index={idx++}
        trendData={{ percentage: 22, isPositive: true, label: 'مجدولة' }} />
      <StatCard title="الحصص المنفذة" value={stats.completedSessions} icon={CheckCircle2} index={idx++}
        trendData={{ percentage: 18, isPositive: true, label: 'مكتملة' }} />

      {!isTeacher && (
        <>
          <StatCard title="إجمالي المعلمين" value={stats.teachersCount} icon={GraduationCap} index={idx++}
            trendData={{ percentage: 3, isPositive: true, label: 'جدد' }} />
          <StatCard title="إجمالي الإيرادات" value={(stats.totalRevenue || 0).toLocaleString()} icon={TrendingUp} unit="ج.م" index={idx++}
            trendData={{ percentage: 8, isPositive: true, label: 'زيادة الإيرادات' }} />
          <StatCard title="إجمالي المصروفات" value={(stats.totalExpenses || 0).toLocaleString()} icon={TrendingDown} unit="ج.م" index={idx++}
            trendData={{ percentage: 5, isPositive: false, label: 'تقليل التكاليف' }} />
          <StatCard title="صافي الربح" value={(stats.totalNetProfit || 0).toLocaleString()} icon={DollarSign} unit="ج.م" index={idx++}
            trendData={{ percentage: 15, isPositive: true, label: 'نمو الأرباح' }} />
        </>
      )}
    </div>
  );
};

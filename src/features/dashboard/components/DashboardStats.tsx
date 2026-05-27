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
  'إجمالي الطلاب': 'from-[#2563EB] to-[#1D4ED8]',
  'الاشتراكات النشطة': 'from-[#22C55E] to-[#16A34A]',
  'حصص اليوم': 'from-[#38BDF8] to-[#0EA5E9]',
  'الحصص المنفذة': 'from-[#8B5CF6] to-[#7C3AED]',
  'إجمالي المعلمين': 'from-[#F97316] to-[#EA580C]',
  'إجمالي الإيرادات': 'from-[#22C55E] to-[#16A34A]',
  'إجمالي المصروفات': 'from-rose-500 to-rose-600',
  'صافي الربح': 'from-[#2563EB] to-[#8B5CF6]',
};

const accentColors: Record<string, string> = {
  'إجمالي الطلاب': 'border-r-[#2563EB] dark:border-r-[#3B82F6]',
  'الاشتراكات النشطة': 'border-r-[#22C55E] dark:border-r-[#4ADE80]',
  'حصص اليوم': 'border-r-[#38BDF8] dark:border-r-[#7DD3FC]',
  'الحصص المنفذة': 'border-r-[#8B5CF6] dark:border-r-[#A78BFA]',
  'إجمالي المعلمين': 'border-r-[#F97316] dark:border-r-[#FB923C]',
  'إجمالي الإيرادات': 'border-r-[#22C55E] dark:border-r-[#4ADE80]',
  'إجمالي المصروفات': 'border-r-rose-500 dark:border-r-rose-400',
  'صافي الربح': 'border-r-[#2563EB] dark:border-r-[#8B5CF6]',
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
        "border border-slate-200 dark:border-slate-700/50 p-4 rounded-2xl",
        "shadow-sm shadow-slate-100 dark:shadow-slate-950/20",
        "transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
        "flex items-center gap-3",
        "border-r-4",
        accentColors[title] || 'border-r-[#2563EB]',
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className={cn(
        "w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-sm shrink-0",
        gradients[title] || 'from-[#2563EB] to-[#1D4ED8]'
      )}>
        <Icon size={18} strokeWidth={1.5} className="text-white" />
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
            <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-700",
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

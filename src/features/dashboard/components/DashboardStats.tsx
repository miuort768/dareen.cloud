import { useEffect, useRef, useState } from 'react';
import { Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, TrendingUp, TrendingDown, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardStats as Stats } from '../types';

interface DashboardStatsProps {
    stats: Stats;
    isTeacher: boolean;
}

const cardColors: Record<string, string> = {
  'إجمالي الطلاب': '#2563EB',
  'الاشتراكات النشطة': '#22C55E',
  'حصص اليوم': '#38BDF8',
  'الحصص المنفذة': '#8B5CF6',
  'إجمالي المعلمين': '#F97316',
  'إجمالي الإيرادات': '#22C55E',
  'إجمالي المصروفات': '#F43F5E',
  'صافي الربح': '#2563EB',
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

  const color = cardColors[title] || '#2563EB';

  return (
    <div
      ref={ref}
      className={cn(
        "relative p-4 rounded-2xl",
        "shadow-sm shadow-slate-100 dark:shadow-slate-950/20",
        "transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
        "flex items-center gap-3",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{
        transitionDelay: `${index * 80}ms`,
        backgroundColor: `${color}0D`,
        border: `2px solid ${color}30`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.backgroundColor = `${color}18`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = `${color}30`;
        e.currentTarget.style.backgroundColor = `${color}0D`;
      }}
    >
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm shrink-0 text-white" style={{ backgroundColor: color }}>
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

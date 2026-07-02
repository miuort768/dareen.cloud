import { useEffect, useRef, useState } from 'react';
import { Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { StatCard } from '../../../shared/components/ui/StatCard';
import type { DashboardStats as Stats } from '../types';

interface DashboardStatsProps {
    stats: Stats;
    isTeacher: boolean;
}

export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => {
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

  const cards = [
    { title: 'إجمالي الطلاب', value: stats.studentsCount, icon: Users, variant: 'info' as const, trend: { value: 12, isUp: true, label: 'نمو الشهر' } },
    { title: 'الاشتراكات النشطة', value: stats.totalEnrollments, icon: BookOpen, variant: 'success' as const, trend: { value: 7, isUp: true, label: 'نشطة' } },
    { title: 'حصص اليوم', value: stats.todaySessions, icon: CalendarCheck, variant: 'primary' as const, trend: { value: 22, isUp: true, label: 'مجدولة' } },
    { title: 'الحصص المنفذة', value: stats.completedSessions, icon: CheckCircle2, variant: 'info' as const, trend: { value: 18, isUp: true, label: 'مكتملة' } },
  ];

  const adminCards = [
    { title: 'إجمالي المعلمين', value: stats.teachersCount, icon: GraduationCap, variant: 'warning' as const, trend: { value: 3, isUp: true, label: 'جدد' } },
    { title: 'إجمالي الإيرادات', value: (stats.totalRevenue || 0).toLocaleString(), icon: TrendingUp, unit: 'ج.م', variant: 'success' as const, trend: { value: 8, isUp: true, label: 'زيادة الإيرادات' } },
    { title: 'إجمالي المصروفات', value: (stats.totalExpenses || 0).toLocaleString(), icon: TrendingDown, unit: 'ج.م', variant: 'error' as const, trend: { value: 5, isUp: false, label: 'تقليل التكاليف' } },
    { title: 'صافي الربح', value: (stats.totalNetProfit || 0).toLocaleString(), icon: DollarSign, unit: 'ج.م', variant: 'warning' as const, trend: { value: 15, isUp: true, label: 'نمو الأرباح' } },
  ];

  return (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full transition-all duration-700",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {cards.map((card, i) => (
        <div key={i} style={{ transitionDelay: `${i * 80}ms` }} className="transition-all duration-500">
          <StatCard {...card} />
        </div>
      ))}

      {!isTeacher && adminCards.map((card, i) => (
        <div key={i + 4} style={{ transitionDelay: `${(i + 4) * 80}ms` }} className="transition-all duration-500">
          <StatCard {...card} />
        </div>
      ))}
    </div>
  );
};

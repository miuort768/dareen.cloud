import { useState, useEffect } from 'react';
import { Clock, ShieldCheck, TrendingUp, Users, CalendarCheck, Sparkles, Headphones, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardStats } from '../types';

interface ExecutiveHeroSectionProps {
  stats: DashboardStats;
}

export const ExecutiveHeroSection = ({ stats }: ExecutiveHeroSectionProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={cn(
      "relative overflow-hidden rounded-3xl",
      "bg-gradient-to-br from-[#1D4ED8] via-[#2563EB] to-[#1E40AF]",
      "dark:from-blue-900/80 dark:via-blue-950/60 dark:to-slate-950/80",
      "border border-blue-200/20 dark:border-blue-800/30",
      "shadow-[0_8px_30px_rgba(0,0,0,0.04)]",
      "px-6 md:px-8 py-6 md:py-7"
    )} dir="rtl">
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-300/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-300/10 rounded-full blur-[60px] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-white/15 backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg shrink-0">
            <ShieldCheck size={22} className="text-white" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-sm text-white text-[9px] font-bold px-2.5 py-1 rounded-xl border border-white/10">
                <Sparkles size={10} strokeWidth={1.5} />
                مركز القيادة
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 backdrop-blur-sm text-emerald-300 text-[8px] font-bold px-2 py-0.5 rounded-xl">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                نشط
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-semibold text-white leading-tight drop-shadow-sm">
              المنصة الذكية لإدارة المعاهد
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl shadow-sm">
            <Clock size={13} className="text-white/60" strokeWidth={1.5} />
            <span className="text-xs font-medium text-white tabular-nums">
              {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
          </div>
          <button
            onClick={() => window.open('https://wa.me/message/DAREEN', '_blank')}
            className="flex items-center gap-2 h-9 px-4 text-[10px] font-bold bg-white/15 backdrop-blur-sm text-white rounded-2xl border border-white/10 hover:bg-white/25 transition-all shadow-sm"
          >
            <Headphones size={13} strokeWidth={1.5} />
            الدعم
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6 relative z-10">
        <div className="md:col-span-6 bg-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold text-blue-200/80">إيرادات الشهر</span>
            <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-lg">
              <ArrowUp size={10} strokeWidth={2} />
              12%
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white tabular-nums tracking-tight">
            {(stats.monthRevenue || 0).toLocaleString()} <span className="text-sm font-semibold text-blue-200/70">ج.م</span>
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
            <MiniSparkline value={65} color="emerald" />
            <span className="text-[10px] font-medium text-blue-200/60">آخر 7 أيام</span>
          </div>
        </div>

        <div className="md:col-span-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-blue-200/80">الطلاب النشطين</span>
          <div className="text-2xl font-bold text-white tabular-nums mt-1">
            {stats.totalEnrollments || 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="flex items-center gap-0.5 text-[9px] font-medium text-emerald-300">
              <ArrowUp size={10} strokeWidth={2} />
              5%
            </span>
            <span className="text-[9px] font-medium text-blue-200/60">مقارنة بالشهر الماضي</span>
          </div>
        </div>

        <div className="md:col-span-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-blue-200/80">حصص اليوم</span>
          <div className="text-2xl font-bold text-white tabular-nums mt-1">
            {stats.todaySessions || 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="flex items-center gap-0.5 text-[9px] font-medium text-emerald-300">
              <ArrowUp size={10} strokeWidth={2} />
              75%
            </span>
            <span className="text-[9px] font-medium text-blue-200/60">معدل الإنجاز</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MiniSparkline = ({ value, color }: { value: number; color: string }) => {
  const points = [30, 45, 25, 55, 40, 65, 50].map((v, i) => `${i * 12},${60 - v}`);
  return (
    <svg width="72" height="60" viewBox="0 0 72 60" className="shrink-0">
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color === 'emerald' ? '#34D399' : '#60A5FA'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-70"
      />
      <circle cx="60" cy="10" r="2.5" fill={color === 'emerald' ? '#34D399' : '#60A5FA'} className="opacity-90" />
    </svg>
  );
};

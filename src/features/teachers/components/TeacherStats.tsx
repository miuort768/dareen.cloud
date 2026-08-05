import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, BookOpen, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { CURRENCY_SYMBOL } from '../../../config/constants';

interface TeacherStatsProps {
  totalTeachers: number;
  totalStudents: number;
  uniqueSubjects: number;
  averagePrice: number;
  previousTeachers?: number;
  previousStudents?: number;
}

const Counter = ({ value, duration = 600 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    if (ref.current) cancelAnimationFrame(ref.current);
    const start = performance.now();
    const from = count;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + (value - from) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value, duration]);
  return <>{count}</>;
};

const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  if (data.length < 2) return null;
  const w = 48; const h = 20;
  const min = Math.min(...data); const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
};

const primaryStat = {
  label: 'المعلمات',
  icon: Users,
  value: (p: TeacherStatsProps) => p.totalTeachers,
  prev: (p: TeacherStatsProps) => p.previousTeachers ?? Math.max(0, p.totalTeachers - 1),
  bg: 'bg-gradient-to-br from-primary via-primary-deep to-primary-hover',
  text: 'text-on-primary',
  iconBg: 'bg-white/15',
};

const secondaryStats = [
  {
    label: 'الطلاب', icon: UserPlus,
    value: (p: TeacherStatsProps) => p.totalStudents,
    prev: (p: TeacherStatsProps) => p.previousStudents ?? Math.max(0, p.totalStudents - 3),
    bg: 'bg-success-soft', text: 'text-success', iconBg: 'bg-success/10', ring: 'ring-success/20',
  },
  {
    label: 'التخصصات', icon: BookOpen,
    value: (p: TeacherStatsProps) => p.uniqueSubjects,
    prev: () => 0,
    bg: 'bg-info-soft', text: 'text-info', iconBg: 'bg-info/10', ring: 'ring-info/20',
  },
  {
    label: 'متوسط السعر', icon: DollarSign,
    value: (p: TeacherStatsProps) => `${p.averagePrice} ${CURRENCY_SYMBOL}`,
    prev: () => 0,
    bg: 'bg-warning-soft', text: 'text-warning', iconBg: 'bg-warning/10', ring: 'ring-warning/20',
  },
];

export const TeacherStats = (props: TeacherStatsProps) => {
  const pVal = primaryStat.value(props);
  const pPrev = primaryStat.prev(props);
  const pTrend = pPrev > 0 ? ((pVal - pPrev) / pPrev) * 100 : 0;
  const isTrendUp = pTrend >= 0;

  const sparkDataPrimary = [pPrev, pVal];

  return (
    <div className="space-y-2">
      {/* Primary stat — prominent */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={cn("relative overflow-hidden rounded-2xl p-4", primaryStat.bg)}
      >
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="ts-stats-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ts-stats-grid)" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center ring-2 ring-white/20", primaryStat.iconBg)}>
              <primaryStat.icon size={22} className={primaryStat.text} />
            </div>
            <div>
              <p className={cn("text-2xl font-bold tabular-nums leading-none", primaryStat.text)}>
                <Counter value={pVal} />
              </p>
              <p className={cn("text-[10px] mt-1 opacity-70", primaryStat.text)}>{primaryStat.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkline data={sparkDataPrimary} color="rgba(255,255,255,0.5)" />
            <span className={cn("inline-flex items-center gap-0.5 text-[10px] font-bold", isTrendUp ? 'text-success' : 'text-error')}>
              {isTrendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {Math.abs(pTrend).toFixed(0)}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Secondary stats — compact */}
      <div className="grid grid-cols-3 gap-2">
        {secondaryStats.map((stat, i) => {
          const val = stat.value(props);
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
              className={cn("p-3 rounded-2xl border border-border bg-card shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-300")}
            >
              <div className="flex items-center gap-2.5">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ring-1", stat.bg, stat.ring || 'ring-border')}>
                  <stat.icon size={15} className={stat.text} />
                </div>
                <div className="min-w-0">
                  <p className={cn("text-base font-bold tabular-nums leading-none", stat.text)}>
                    {typeof val === 'number' ? <Counter value={val} /> : val}
                  </p>
                  <p className="text-[9px] text-muted mt-0.5">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
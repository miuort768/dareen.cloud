import { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Activity, LayoutGrid, LineChart, TrendingDown, Target } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { DashboardMonthData } from '../types';

interface AnalyticsTabsProps {
  monthlyData: DashboardMonthData[];
  students: Record<string, unknown>[];
  sessions: Record<string, unknown>[];
}

type TabKey = 'revenue' | 'attendance' | 'performance' | 'subjects' | 'growth';

export const AnalyticsTabs = ({ monthlyData, students, sessions }: AnalyticsTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>('revenue');

  const subjectStats = useMemo(() => {
    const map: Record<string, { count: number; completed: number }> = {};
    sessions.forEach(s => {
      const sub = (s.subject as string) || 'أخرى';
      if (!map[sub]) map[sub] = { count: 0, completed: 0 };
      map[sub].count++;
      if (s.status === 'completed') map[sub].completed++;
    });
    return Object.entries(map)
      .map(([subject, data]) => ({
        subject: subject,
        sessions: data.count,
        rate: data.count > 0 ? Math.round((data.completed / data.count) * 100) : 0
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 6);
  }, [sessions]);

  const attendanceData = useMemo(() => {
    return monthlyData.map(m => ({
      month: m.month,
      rate: m.sessions > 0 ? Math.round((m.completed / m.sessions) * 100) : 0,
      sessions: m.sessions,
      completed: m.completed
    }));
  }, [monthlyData]);

  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { key: 'revenue', label: 'الإيرادات', icon: TrendingUp },
    { key: 'attendance', label: 'الحضور', icon: Activity },
    { key: 'performance', label: 'الأداء', icon: BarChart3 },
    { key: 'subjects', label: 'المواد', icon: LayoutGrid },
    { key: 'growth', label: 'النمو', icon: LineChart },
  ];

  const currentMonth = monthlyData[monthlyData.length - 1] || { revenue: 0, expenses: 0, profit: 0, sessions: 0, completed: 0 };
  const prevMonth = monthlyData[monthlyData.length - 2] || { revenue: 0, expenses: 0, profit: 0, sessions: 0, completed: 0 };
  const revenueChange = prevMonth.revenue > 0 ? Math.round(((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden" dir="rtl">
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center">
            <BarChart3 size={16} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">تحليلات الأداء</h3>
            <p className="text-[9px] font-medium text-slate-400">نظرة تحليلية متعمقة</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-3 overflow-x-auto">
        <div className="flex gap-1 border-b border-slate-100 dark:border-slate-800 min-w-max">
          {tabs.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "relative flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-semibold transition-all whitespace-nowrap",
                  isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                )}
              >
                <Icon size={13} strokeWidth={1.5} />
                {label}
                {isActive && (
                  <motion.div
                    layoutId="analytics-indicator"
                    className="absolute bottom-0 right-0 left-0 h-0.5 bg-slate-900 dark:bg-white rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'revenue' && (
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div>
                    <div className="text-[9px] font-medium text-slate-400">إيرادات هذا الشهر</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                      {(currentMonth.revenue || 0).toLocaleString()} <span className="text-xs font-medium text-slate-400">ج.م</span>
                    </div>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold",
                    revenueChange >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                  )}>
                    {revenueChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(revenueChange)}%
                  </div>
                </div>
                <div className="h-[220px] w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" opacity={0.15} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl shadow-lg text-right" dir="rtl">
                            <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                              <Target size={12} className="text-[#1D4ED8]" />
                              <span className="text-[10px] font-semibold text-slate-900 dark:text-white">{label}</span>
                            </div>
                            {payload.map((entry, i) => (
                              <div key={i} className="flex items-center justify-between gap-6 text-[10px]">
                                <span className="text-slate-500">{entry.name}</span>
                                <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{Number(entry.value).toLocaleString()} ج.م</span>
                              </div>
                            ))}
                          </div>
                        );
                      }} />
                      <Bar dataKey="revenue" name="الإيرادات" fill="#1D4ED8" radius={[4, 4, 0, 0]} barSize={16} />
                      <Bar dataKey="expenses" name="المصروفات" fill="#E11D48" radius={[4, 4, 0, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div>
                    <div className="text-[9px] font-medium text-slate-400">معدل الحضور التراكمي</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                      {monthlyData.length > 0 ? `${Math.round(monthlyData.reduce((s, m) => s + (m.sessions > 0 ? m.completed / m.sessions : 0), 0) / monthlyData.length * 100)}%` : '0%'}
                    </div>
                  </div>
                </div>
                <div className="h-[220px] w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={attendanceData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" opacity={0.15} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} dy={8} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
                      <Tooltip cursor={{ stroke: '#1D4ED8', strokeWidth: 1.5 }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '10px', padding: '8px 12px' }} />
                      <Area type="monotone" dataKey="rate" stroke="#1D4ED8" fill="url(#attendanceGrad)" strokeWidth={2.5} dot={{ r: 3, fill: '#1D4ED8', strokeWidth: 1.5, stroke: '#fff' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div>
                    <div className="text-[9px] font-medium text-slate-400">الحصص المكتملة vs المجدولة</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                      {monthlyData.reduce((s, m) => s + (m.completed || 0), 0)} <span className="text-xs font-medium text-slate-400">/ {monthlyData.reduce((s, m) => s + (m.sessions || 0), 0)}</span>
                    </div>
                  </div>
                </div>
                <div className="h-[220px] w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={6}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" opacity={0.15} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '10px', padding: '8px 12px' }} />
                      <Bar dataKey="sessions" name="مجدولة" fill="#94A3B8" radius={[4, 4, 0, 0]} barSize={12} />
                      <Bar dataKey="completed" name="مكتملة" fill="#059669" radius={[4, 4, 0, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'subjects' && (
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div>
                    <div className="text-[9px] font-medium text-slate-400">توزيع الحصص حسب المادة</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                      {subjectStats.length} مواد
                    </div>
                  </div>
                </div>
                <div className="h-[220px] w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectStats} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" horizontal={false} opacity={0.15} />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="subject" tick={{ fontSize: 9, fill: '#94a3b8' }} width={70} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '10px', padding: '8px 12px' }} />
                      <Bar dataKey="sessions" fill="#1D4ED8" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right', fill: '#1D4ED8', fontSize: 9, fontWeight: '600', offset: 6 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'growth' && (
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div>
                    <div className="text-[9px] font-medium text-slate-400">صافي الربح الشهري</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                      {(currentMonth.profit || 0).toLocaleString()} <span className="text-xs font-medium text-slate-400">ج.م</span>
                    </div>
                  </div>
                </div>
                <div className="h-[220px] w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" opacity={0.15} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip cursor={{ stroke: '#059669', strokeWidth: 1.5 }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '10px', padding: '8px 12px' }} />
                      <Area type="monotone" dataKey="profit" stroke="#059669" fill="url(#profitGrad)" strokeWidth={2.5} dot={{ r: 3, fill: '#059669', strokeWidth: 1.5, stroke: '#fff' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

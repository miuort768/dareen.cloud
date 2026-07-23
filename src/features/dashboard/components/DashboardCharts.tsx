import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import type { TooltipProps } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import type { DashboardMonthData as MonthData } from '../types';

interface DashboardChartsProps {
    isTeacher: boolean;
    monthlyData: MonthData[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border border-border shadow-lg px-5 py-4 min-w-[180px] rounded-2xl" dir="rtl">
            <p className="text-xs font-bold text-main mb-2">{label}</p>
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-md" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs font-medium text-muted">{entry.name}</span>
                    </div>
                    <span className="text-sm font-bold text-main tabular-nums">
                        {Number(entry.value).toLocaleString()} ج.م
                    </span>
                </div>
            ))}
        </div>
    );
};

export const DashboardCharts = React.memo(({ isTeacher, monthlyData }: DashboardChartsProps) => {
    const totalRevenue = useMemo(() => monthlyData.reduce((s, m) => s + (m.revenue || 0), 0), [monthlyData]);
    const totalExpenses = useMemo(() => monthlyData.reduce((s, m) => s + (m.expenses || 0), 0), [monthlyData]);
    const totalProfit = totalRevenue - totalExpenses;

    const chartColors = {
        revenue: 'var(--chart-1)',
        completed: 'var(--chart-2)',
        expenses: 'var(--chart-3)',
    };

    return (
        <div className="rounded-3xl p-6 bg-card border border-border font-dash">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-soft flex items-center justify-center">
                        <BarChart3 size={20} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-main">مركز تحليل الأداء</h3>
                        <p className="text-xs text-muted">نظرة عامة على أداء المؤسسة</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-chart-1/10 border border-chart-1/20">
                        <DollarSign size={11} className="text-chart-1" />
                        <span className="text-[10px] font-bold tabular-nums text-chart-1">{totalRevenue.toLocaleString()} ج.م</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-chart-3/10 border border-chart-3/20">
                        <TrendingDown size={11} className="text-chart-3" />
                        <span className="text-[10px] font-bold tabular-nums text-chart-3">{totalExpenses.toLocaleString()} ج.م</span>
                    </div>
                    {!isTeacher && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-chart-2/10 border border-chart-2/20">
                            <TrendingUp size={11} className="text-chart-2" />
                            <span className="text-[10px] font-bold tabular-nums text-chart-2">{totalProfit.toLocaleString()} ج.م</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Chart */}
            {monthlyData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary-soft flex items-center justify-center mb-4">
                        <BarChart3 size={28} className="text-primary/40" />
                    </div>
                    <p className="text-base font-bold text-muted">لا توجد بيانات متاحة</p>
                    <p className="text-xs text-muted/60 mt-1">ستظهر بيانات الأداء عند توفر جلسات ومعاملات مالية</p>
                </div>
            ) : (
                <div className="h-[300px] -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={6}>
                            <defs>
                                <linearGradient id="g-chart-rev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={chartColors.revenue} stopOpacity={1} />
                                    <stop offset="100%" stopColor={chartColors.revenue} stopOpacity={0.6} />
                                </linearGradient>
                                <linearGradient id="g-chart-perf" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={chartColors.completed} stopOpacity={1} />
                                    <stop offset="100%" stopColor={chartColors.completed} stopOpacity={0.6} />
                                </linearGradient>
                                <linearGradient id="g-chart-exp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={chartColors.expenses} stopOpacity={1} />
                                    <stop offset="100%" stopColor={chartColors.expenses} stopOpacity={0.6} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.25} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: '600', fill: 'var(--text-muted)' }} dy={8} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: '600', fill: 'var(--text-muted)' }} tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val} />
                            <Tooltip cursor={{ fill: 'var(--bg-hover)', opacity: 0.3 }} content={<CustomTooltip />} />
                            <Bar dataKey="revenue" name="الإيرادات" fill="url(#g-chart-rev)" radius={[8, 8, 0, 0]} barSize={18} animationDuration={800} animationEasing="ease-out" />
                            <Bar dataKey="completed" name="الأداء" fill="url(#g-chart-perf)" radius={[8, 8, 0, 0]} barSize={18} animationDuration={800} animationEasing="ease-out" />
                            {!isTeacher && (
                                <Bar dataKey="expenses" name="المصروفات" fill="url(#g-chart-exp)" radius={[8, 8, 0, 0]} barSize={18} animationDuration={800} animationEasing="ease-out" />
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
});
DashboardCharts.displayName = 'DashboardCharts';

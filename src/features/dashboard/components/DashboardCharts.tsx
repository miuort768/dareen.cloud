import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, TooltipProps } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DashboardMonthData as MonthData } from '../types';

interface DashboardChartsProps {
    isTeacher: boolean;
    monthlyData: MonthData[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border border-border/50 shadow-xl px-4 py-3 min-w-[160px] rounded-xl" dir="rtl">
            <p className="text-xs font-bold text-main mb-2">{label}</p>
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-0.5">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                        <span className="text-[11px] font-medium text-muted">{entry.name}</span>
                    </div>
                    <span className="text-xs font-bold text-main tabular-nums">
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
        <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-0 pt-5 px-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center ring-1 ring-primary/20">
                        <TrendingUp size={18} className="text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold text-main">مركز تحليل الأداء</CardTitle>
                        <CardDescription className="text-[11px] text-muted">نظرة عامة على أداء المؤسسة</CardDescription>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-chart-1/10">
                        <DollarSign size={11} className="text-chart-1" />
                        <span className="text-[10px] font-bold tabular-nums text-chart-1">{totalRevenue.toLocaleString()} ج.م</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-chart-3/10">
                        <TrendingDown size={11} className="text-chart-3" />
                        <span className="text-[10px] font-bold tabular-nums text-chart-3">{totalExpenses.toLocaleString()} ج.م</span>
                    </div>
                    {!isTeacher && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-chart-2/10">
                            <TrendingUp size={11} className="text-chart-2" />
                            <span className="text-[10px] font-bold tabular-nums text-chart-2">{totalProfit.toLocaleString()} ج.م</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {monthlyData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <TrendingUp size={32} className="text-muted/30 mb-3" />
                        <p className="text-sm font-medium text-muted">لا توجد بيانات متاحة</p>
                        <p className="text-xs text-muted/60 mt-1">ستظهر بيانات الأداء عند توفر جلسات ومعاملات مالية</p>
                    </div>
                ) : (
                    <div className="h-[280px] px-2 pb-2 pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                                <defs>
                                    <linearGradient id="chartRevGrad2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={chartColors.revenue} stopOpacity={1} />
                                        <stop offset="100%" stopColor={chartColors.revenue} stopOpacity={0.7} />
                                    </linearGradient>
                                    <linearGradient id="chartPerfGrad2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={chartColors.completed} stopOpacity={1} />
                                        <stop offset="100%" stopColor={chartColors.completed} stopOpacity={0.7} />
                                    </linearGradient>
                                    <linearGradient id="chartExpGrad2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={chartColors.expenses} stopOpacity={1} />
                                        <stop offset="100%" stopColor={chartColors.expenses} stopOpacity={0.7} />
                                    </linearGradient>
                                    <filter id="chartShadow2">
                                        <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.08" />
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.35} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '600', fill: 'var(--text-muted)' }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '600', fill: 'var(--text-muted)' }} tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val} />
                                <Tooltip cursor={{ fill: 'var(--bg-hover)', opacity: 0.5 }} content={<CustomTooltip />} />
                                <Bar dataKey="revenue" name="الإيرادات" fill="url(#chartRevGrad2)" radius={[4, 4, 0, 0]} barSize={16} filter="url(#chartShadow2)" animationDuration={800} animationEasing="ease-out" />
                                <Bar dataKey="completed" name="الأداء" fill="url(#chartPerfGrad2)" radius={[4, 4, 0, 0]} barSize={16} filter="url(#chartShadow2)" animationDuration={800} animationEasing="ease-out" />
                                {!isTeacher && (
                                    <Bar dataKey="expenses" name="المصروفات" fill="url(#chartExpGrad2)" radius={[4, 4, 0, 0]} barSize={16} filter="url(#chartShadow2)" animationDuration={800} animationEasing="ease-out" />
                                )}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});
DashboardCharts.displayName = 'DashboardCharts';

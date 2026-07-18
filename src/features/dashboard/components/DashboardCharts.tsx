import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { BarChart2, DollarSign, TrendingUp } from 'lucide-react';
import { ChartContainer, ChartTooltip } from '../../../shared/components/ui';
import type { TooltipEntry } from '../../../shared/components/ui';
import type { DashboardMonthData as MonthData } from '../types';

interface DashboardChartsProps {
    isTeacher: boolean;
    monthlyData: MonthData[];
}

const chartColors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'];

export const DashboardCharts = React.memo(({ isTeacher, monthlyData }: DashboardChartsProps) => {
    const totalRevenue = useMemo(() => monthlyData.reduce((s, m) => s + (m.revenue || 0), 0), [monthlyData]);
    const totalExpenses = useMemo(() => monthlyData.reduce((s, m) => s + (m.expenses || 0), 0), [monthlyData]);

    return (
        <ChartContainer
            title="مركز تحليل الأداء"
            subtitle="نظرة عامة على أداء المؤسسة"
            height={280}
            headerExtra={
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-chart-2/10">
                        <DollarSign size={11} strokeWidth={2} className="text-chart-2" />
                        <span className="text-micro font-bold tabular-nums text-chart-2">{totalRevenue.toLocaleString()} ج.م</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-chart-3/10">
                        <TrendingUp size={11} strokeWidth={2} className="text-chart-3" />
                        <span className="text-micro font-bold tabular-nums text-chart-3">{totalExpenses.toLocaleString()} ج.م</span>
                    </div>
                </div>
            }
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                    <defs>
                        <linearGradient id="chartRevGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={1} />
                            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.85} />
                        </linearGradient>
                        <linearGradient id="chartPerfGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={1} />
                            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.85} />
                        </linearGradient>
                        <linearGradient id="chartExpGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={1} />
                            <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0.85} />
                        </linearGradient>
                        <filter id="chartBarShadow">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
                        </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '700', fill: 'var(--text-muted)' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '700', fill: 'var(--text-muted)' }} tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val} />
                    <Tooltip cursor={{ fill: 'var(--bg-hover)' }}
                        content={({ active, payload, label }) => (
                            <ChartTooltip active={active} payload={payload as TooltipEntry[]} label={label} />
                        )}
                    />
                    <Bar dataKey="revenue" name="الإيرادات" fill="url(#chartRevGrad)" radius={[6, 6, 0, 0]} barSize={14} filter="url(#chartBarShadow)" animationDuration={800} animationEasing="ease-out" />
                    <Bar dataKey="completed" name="الأداء" fill="url(#chartPerfGrad)" radius={[6, 6, 0, 0]} barSize={14} filter="url(#chartBarShadow)" animationDuration={800} animationEasing="ease-out" />
                    {!isTeacher && (
                        <Bar dataKey="expenses" name="المصروفات" fill="url(#chartExpGrad)" radius={[6, 6, 0, 0]} barSize={14} filter="url(#chartBarShadow)" animationDuration={800} animationEasing="ease-out" />
                    )}
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
});
DashboardCharts.displayName = 'DashboardCharts';

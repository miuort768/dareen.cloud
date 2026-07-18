import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Filter, PieChart as PieChartIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { ChartContainer, ChartTooltip } from '../../../shared/components/ui';

interface MonthlyData {
    month: string;
    income: number;
    expense: number;
}

interface PieData {
    name: string;
    value: number;
}

interface FinanceChartsProps {
    monthlyData: MonthlyData[];
    pieData: PieData[];
    totalExpenses: number;
    reportCurrency?: string;
}

export const FinanceCharts = React.memo(({ monthlyData, pieData, totalExpenses, reportCurrency = 'KWD' }: FinanceChartsProps) => {
    const sortedPieData = React.useMemo(() => [...pieData].sort((a, b) => b.value - a.value), [pieData]);
    const topPieEntries = React.useMemo(() => sortedPieData.slice(0, 4), [sortedPieData]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-0" dir="rtl">
            <div className="lg:col-span-2">
                <ChartContainer
                    title="تحليل التدفق النقدي"
                    subtitle="مقارنة شهرية للإيرادات والمصاريف"
                    height={320}
                    headerExtra={
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-0.5 rounded bg-chart-2" />
                                <span className="text-micro font-medium text-muted">إيرادات</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-0.5 rounded bg-chart-3" />
                                <span className="text-micro font-medium text-muted">مصروفات</span>
                            </div>
                        </div>
                    }
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="finColorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="finColorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.12} />
                                    <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis dataKey="month" tick={{ fill: 'var(--text-dim)', fontSize: 9, fontWeight: 800 }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 9, fontWeight: 800 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} />
                            <Tooltip content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null;
                                return (
                                    <div className="bg-card border border-border shadow-xl px-4 py-3 rounded-xl min-w-[150px]" dir="rtl">
                                        <p className="text-micro font-bold text-main mb-2 pb-1 border-b border-divider">{label}</p>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-1.5">
                                                    <TrendingUp size={10} className="text-chart-2" />
                                                    <span className="text-micro font-bold text-muted">إيرادات</span>
                                                </div>
                                                <span className="text-sm font-bold text-main tabular-nums">+{(payload[0]?.value ?? 0).toLocaleString()} {reportCurrency}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-1.5">
                                                    <TrendingDown size={10} className="text-chart-3" />
                                                    <span className="text-micro font-bold text-muted">مصروفات</span>
                                                </div>
                                                <span className="text-sm font-bold text-main tabular-nums">-{payload[1]?.value.toLocaleString() || 0} {reportCurrency}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }} cursor={{ stroke: 'var(--chart-1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Area type="monotone" dataKey="income" name="إيرادات" stroke="var(--chart-2)" strokeWidth={2.5} fillOpacity={1} fill="url(#finColorIncome)" activeDot={{ r: 5, strokeWidth: 2 }} />
                            <Area type="monotone" dataKey="expense" name="مصروفات" stroke="var(--chart-3)" strokeWidth={2.5} fillOpacity={1} fill="url(#finColorExpense)" activeDot={{ r: 5, strokeWidth: 2 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            <div>
                <ChartContainer height={480}>
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="h-48 w-full relative" dir="ltr">
                            {pieData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                                                {pieData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={`var(--chart-${(index % 6) + 1})`} stroke="transparent" />
                                                ))}
                                            </Pie>
                                            <Tooltip content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-card border border-border shadow-xl px-3 py-2 rounded-xl" dir="rtl">
                                                            <p className="text-micro font-bold text-muted mb-1">{data.name}</p>
                                                            <p className="text-sm font-bold text-main tabular-nums">{(data?.value ?? 0).toLocaleString()} <span className="text-micro text-muted">{reportCurrency}</span></p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <p className="text-micro font-bold text-muted">الإجمالي</p>
                                        <p className="text-lg font-bold text-main tabular-nums leading-none">{(totalExpenses ?? 0).toLocaleString()}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-40">
                                    <Filter size={32} className="text-muted mb-2" />
                                    <p className="text-micro font-bold text-muted">لا توجد بيانات</p>
                                </div>
                            )}
                        </div>

                        <div className="w-full mt-6 space-y-2">
                            {topPieEntries.map((entry, index) => (
                                <div key={entry.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: `var(--chart-${(index % 6) + 1})` }} />
                                        <span className="text-micro font-bold text-muted truncate max-w-[100px]">{entry.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-micro font-bold text-main tabular-nums">{(entry?.value ?? 0).toLocaleString()}</span>
                                        <span className="text-micro font-bold bg-surface px-1.5 py-0.5 rounded-lg text-muted">
                                            {reportCurrency} {totalExpenses > 0 ? ((entry?.value ?? 0) / totalExpenses * 100).toFixed(0) : 0}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ChartContainer>
            </div>
        </div>
    );
});
FinanceCharts.displayName = 'FinanceCharts';

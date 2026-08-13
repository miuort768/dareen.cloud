import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MonthlyData { month: string; income: number; expense: number; }
interface PieData { name: string; value: number; }

interface FinanceChartsProps {
    monthlyData: MonthlyData[];
    pieData: PieData[];
    totalExpenses: number;
    reportCurrency?: string;
}

const TOP_EXPENSE_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)'];
const PERIODS = ['شهري', 'ربعي', 'سنوي'] as const;
type Period = typeof PERIODS[number];

const aggregateByPeriod = (data: MonthlyData[], period: Period): MonthlyData[] => {
    if (period === 'شهري' || data.length <= 3) return data;
    const chunkSize = period === 'ربعي' ? 3 : data.length;
    const result: MonthlyData[] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        result.push({
            month: chunk.length > 1 ? `${chunk[0].month}-${chunk[chunk.length - 1].month}` : chunk[0].month,
            income: chunk.reduce((s, d) => s + d.income, 0),
            expense: chunk.reduce((s, d) => s + d.expense, 0),
        });
    }
    return result;
};

export const FinanceCharts = ({ monthlyData, pieData, totalExpenses, reportCurrency = 'EGP' }: FinanceChartsProps) => {
    const [period, setPeriod] = useState<Period>('شهري');
    const chartData = useMemo(() => aggregateByPeriod(monthlyData, period), [monthlyData, period]);
    const sortedPie = useMemo(() => [...pieData].sort((a, b) => b.value - a.value), [pieData]);

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-5 gap-3" dir="rtl">
            {/* Area chart — spans 3 cols */}
            <div className="lg:col-span-3 rounded-2xl bg-card border border-border/60 shadow-sm p-3.5">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-xs font-bold text-main">تحليل التدفق النقدي</h3>
                        <p className="text-[9px] text-muted mt-0.5">مقارنة الإيرادات والمصاريف</p>
                    </div>
                    <div className="flex bg-surface rounded-lg p-0.5 gap-0.5">
                        {PERIODS.map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`relative px-2 py-1 text-[8px] font-bold rounded-md transition-all ${period === p ? 'text-on-primary' : 'text-muted hover:text-main'}`}>
                                {period === p && <motion.div layoutId="finance-period-pill" className="absolute inset-0 bg-primary rounded-md" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                                <span className="relative z-10">{p}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-0.5 rounded bg-success" />
                        <span className="text-[8px] font-bold text-muted">إيرادات</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-0.5 rounded bg-error/70" />
                        <span className="text-[8px] font-bold text-muted">مصروفات</span>
                    </div>
                </div>
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                            <defs>
                                <linearGradient id="finIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="finExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
                            <XAxis dataKey="month" tick={{ fill: 'var(--text-dim)', fontSize: 8, fontWeight: 800 }} axisLine={false} tickLine={false} dy={8} />
                            <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 8, fontWeight: 800 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} width={36} />
                            <Tooltip content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null;
                                return (
                                    <div className="bg-card border border-border/60 shadow-elevation-2 px-3 py-2.5 rounded-xl min-w-[140px]" dir="rtl">
                                        <p className="text-[9px] font-bold text-main mb-1.5 pb-1 border-b border-border/40">{label}</p>
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-1">
                                                    <TrendingUp size={9} className="text-success" />
                                                    <span className="text-[8px] font-bold text-muted">إيرادات</span>
                                                </div>
                                                <span className="text-xs font-bold text-main tabular-nums">+{(payload[0]?.value ?? 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-1">
                                                    <TrendingDown size={9} className="text-error/70" />
                                                    <span className="text-[8px] font-bold text-muted">مصروفات</span>
                                                </div>
                                                <span className="text-xs font-bold text-main tabular-nums">-{(payload[1]?.value ?? 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }} cursor={{ stroke: 'var(--chart-1)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                            <Area type="monotone" dataKey="income" stroke="var(--chart-2)" strokeWidth={2.5} fillOpacity={1} fill="url(#finIncomeGrad)" activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--chart-2)' }} />
                            <Area type="monotone" dataKey="expense" stroke="var(--chart-3)" strokeWidth={2.5} fillOpacity={1} fill="url(#finExpenseGrad)" activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--chart-3)' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Donut chart — spans 2 cols */}
            <div className="lg:col-span-2 rounded-2xl bg-card border border-border/60 shadow-sm p-3.5">
                <h3 className="text-xs font-bold text-main mb-3">تصنيف المصروفات</h3>
                <div className="flex flex-col items-center justify-center h-[calc(100%-2rem)]">
                    <div className="h-36 w-full relative" dir="ltr">
                        {pieData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                                            {pieData.map((_, i) => (
                                                <Cell key={`cell-${i}`} fill={TOP_EXPENSE_COLORS[i % TOP_EXPENSE_COLORS.length]} stroke="transparent" />
                                            ))}
                                        </Pie>
                                        <Tooltip content={({ active, payload }) => {
                                            if (active && payload?.[0]) {
                                                const d = payload[0].payload;
                                                return (
                                                    <div className="bg-card border border-border/60 shadow-elevation-2 px-2.5 py-1.5 rounded-xl" dir="rtl">
                                                        <p className="text-[8px] font-bold text-muted">{d.name}</p>
                                                        <p className="text-xs font-bold text-main tabular-nums">{(d?.value ?? 0).toLocaleString()} <span className="text-[8px] text-muted">{reportCurrency}</span></p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <p className="text-[8px] font-bold text-muted">الإجمالي</p>
                                    <p className="text-sm font-bold text-main tabular-nums">{(totalExpenses ?? 0).toLocaleString()}</p>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-40">
                                <p className="text-[9px] font-bold text-muted">لا توجد بيانات</p>
                            </div>
                        )}
                    </div>
                    <div className="w-full mt-3 space-y-1.5">
                        {sortedPie.slice(0, 4).map((entry, i) => {
                            const pct = totalExpenses > 0 ? ((entry.value / totalExpenses) * 100).toFixed(0) : 0;
                            return (
                                <div key={entry.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: `var(--chart-${(i % 6) + 1})` }} />
                                        <span className="text-[8px] font-bold text-muted truncate max-w-[90px]">{entry.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-bold text-main tabular-nums">{(entry.value ?? 0).toLocaleString()}</span>
                                        <span className="text-[7px] font-bold bg-surface px-1 py-0.5 rounded text-muted">{pct}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
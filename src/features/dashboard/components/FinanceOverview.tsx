import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import type { TooltipProps } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, BarChart3, Plus } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../../../config/constants';
import type { DashboardMonthData as MonthData } from '../types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FinanceOverviewProps {
    monthlyData: MonthData[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    return (
                    <div className="bg-card dark:bg-[#0d0d0f] border border-border dark:border-[#D4AF37]/20 shadow-lg px-4 py-3 min-w-[160px] rounded-xl" dir="rtl">
                        <p className="text-xs font-bold text-main dark:text-white mb-2">{label}</p>
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-0.5">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-md" style={{ backgroundColor: entry.color }} />
                        <span className="text-[10px] font-medium text-muted dark:text-zinc-400">{entry.name}</span>
                    </div>
                    <span className="text-xs font-bold text-main dark:text-white tabular-nums">
                        {Number(entry.value).toLocaleString()} {CURRENCY_SYMBOL}
                    </span>
                </div>
            ))}
        </div>
    );
};

export const FinanceOverview = React.memo(({ monthlyData }: FinanceOverviewProps) => {
    const navigate = useNavigate();
    const totalRevenue = useMemo(() => monthlyData.reduce((s, m) => s + (m.revenue || 0), 0), [monthlyData]);
    const totalExpenses = useMemo(() => monthlyData.reduce((s, m) => s + (m.expenses || 0), 0), [monthlyData]);
    const totalProfit = totalRevenue - totalExpenses;

    const chartColors = {
        revenue: 'var(--chart-1)',
        completed: 'var(--chart-2)',
        expenses: 'var(--chart-3)',
    };

    return (
        <div className="rounded-2xl bg-card dark:bg-[#0d0d0f] border border-border dark:border-[#D4AF37]/20 shadow-elevation-1 p-5 font-dash" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-soft dark:bg-[#D4AF37]/10 flex items-center justify-center">
                        <BarChart3 size={16} className="text-primary dark:text-[#D4AF37]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-main dark:text-white">نظرة مالية</h3>
                        <p className="text-[10px] text-muted dark:text-zinc-400">الإيرادات والمصروفات</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-success-soft">
                        <TrendingUp size={9} className="text-success" />
                        <span className="text-[9px] font-bold tabular-nums text-success">{totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-warning-soft">
                        <TrendingDown size={9} className="text-warning" />
                        <span className="text-[9px] font-bold tabular-nums text-warning">{totalExpenses.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            {monthlyData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary-soft flex items-center justify-center mb-3">
                        <BarChart3 size={28} className="text-primary-200" />
                    </div>
                    <p className="text-sm font-bold text-muted dark:text-zinc-400">لا توجد بيانات مالية بعد</p>
                    <p className="text-[11px] text-dim dark:text-zinc-500 mt-1">ابدأ بإضافة أول عملية مالية</p>
                    <Button onClick={() => navigate('/finance')} size="sm" className="mt-3 h-9 px-5 rounded-xl text-xs font-bold gap-1.5">
                        <Plus size={14} /> إضافة عملية
                    </Button>
                </div>
            ) : (
                <div className="h-[240px] -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                            <defs>
                                <linearGradient id="g-fin-rev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={chartColors.revenue} stopOpacity={1} />
                                    <stop offset="100%" stopColor={chartColors.revenue} stopOpacity={0.6} />
                                </linearGradient>
                                <linearGradient id="g-fin-exp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={chartColors.expenses} stopOpacity={1} />
                                    <stop offset="100%" stopColor={chartColors.expenses} stopOpacity={0.6} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.25} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '600', fill: 'var(--text-muted)' }} dy={8} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '600', fill: 'var(--text-muted)' }} tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val} />
                            <Tooltip cursor={{ fill: 'var(--bg-hover)', opacity: 0.3 }} content={<CustomTooltip />} />
                            <Bar dataKey="revenue" name="الإيرادات" fill="url(#g-fin-rev)" radius={[6, 6, 0, 0]} barSize={16} animationDuration={800} />
                            <Bar dataKey="expenses" name="المصروفات" fill="url(#g-fin-exp)" radius={[6, 6, 0, 0]} barSize={16} animationDuration={800} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Summary */}
            {monthlyData.length > 0 && (
                <div className="flex items-center justify-center gap-4 pt-3 border-t border-border dark:border-[#D4AF37]/20">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-md" style={{ backgroundColor: chartColors.revenue }} />
                        <span className="text-[10px] font-bold text-muted dark:text-zinc-400">الإيرادات</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-md" style={{ backgroundColor: chartColors.expenses }} />
                        <span className="text-[10px] font-bold text-muted dark:text-zinc-400">المصروفات</span>
                    </div>
                    <div className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-lg",
                        totalProfit >= 0 ? "bg-success-soft" : "bg-error-soft"
                    )}>
                        <DollarSign size={9} className={totalProfit >= 0 ? "text-success" : "text-error"} />
                        <span className={cn(
                            "text-[9px] font-bold tabular-nums",
                            totalProfit >= 0 ? "text-success" : "text-error"
                        )}>
                            صافي: {totalProfit.toLocaleString()} {CURRENCY_SYMBOL}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
});
FinanceOverview.displayName = 'FinanceOverview';

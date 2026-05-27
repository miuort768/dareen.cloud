import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { BarChart2, Target, TrendingUp, DollarSign } from 'lucide-react';
import type { DashboardMonthData as MonthData } from '../types';

interface DashboardChartsProps {
    isTeacher: boolean;
    monthlyData: MonthData[];
}

const barColors = ['#2563EB', '#059669', '#E11D48'];

export const DashboardCharts = ({ isTeacher, monthlyData }: DashboardChartsProps) => {
    const color = '#2563EB';

    const totalRevenue = useMemo(() => monthlyData.reduce((s, m) => s + (m.revenue || 0), 0), [monthlyData]);
    const totalExpenses = useMemo(() => monthlyData.reduce((s, m) => s + (m.expenses || 0), 0), [monthlyData]);

    return (
        <div className="p-5 overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md"
            style={{ backgroundColor: `${color}0D`, border: `2px solid ${color}30` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.backgroundColor = `${color}18`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}30`; e.currentTarget.style.backgroundColor = `${color}0D`; }}
        >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm text-white" style={{ backgroundColor: color }}>
                        <BarChart2 size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#0F172A] dark:text-white leading-tight">مركز تحليل الأداء</h3>
                        <p className="text-[9px] font-medium text-[#64748B] mt-0.5">نظرة عامة على أداء المؤسسة</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: '#2563EB15' }}>
                        <DollarSign size={11} strokeWidth={2} style={{ color: '#2563EB' }} />
                        <span className="text-[10px] font-bold tabular-nums" style={{ color: '#2563EB' }}>{totalRevenue.toLocaleString()} ج.م</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: '#E11D4815' }}>
                        <TrendingUp size={11} strokeWidth={2} style={{ color: '#E11D48' }} />
                        <span className="text-[10px] font-bold tabular-nums" style={{ color: '#E11D48' }}>{totalExpenses.toLocaleString()} ج.م</span>
                    </div>
                </div>
            </div>

            <div className="h-[280px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                        <defs>
                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                                <stop offset="100%" stopColor="#2563EB" stopOpacity={0.85} />
                            </linearGradient>
                            <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#34D399" stopOpacity={1} />
                                <stop offset="100%" stopColor="#059669" stopOpacity={0.85} />
                            </linearGradient>
                            <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#FB7185" stopOpacity={1} />
                                <stop offset="100%" stopColor="#E11D48" stopOpacity={0.85} />
                            </linearGradient>
                            <filter id="barShadow">
                                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
                            </filter>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.4} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '700', fill: '#94A3B8' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '700', fill: '#94A3B8' }} tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val} />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                            content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null;
                                const total = payload.reduce((s: number, p: { value: number }) => s + (p.value || 0), 0);
                                return (
                                    <div className="bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-4 min-w-[170px] rounded-xl" dir="rtl">
                                        <div className="flex items-center gap-2 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">
                                            <Target size={13} style={{ color }} />
                                            <p className="text-[12px] font-bold text-[#0F172A] dark:text-white">{label}</p>
                                        </div>
                                        <div className="space-y-2">
                                            {payload.map((entry: { name?: string; value: number; fill?: string }, i: number) => (
                                                <div key={i} className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.fill }} />
                                                        <span className="text-[10px] font-bold text-[#64748B]">{entry.name}</span>
                                                    </div>
                                                    <span className="text-[12px] font-black text-[#0F172A] dark:text-white tabular-nums">{entry.value.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                            <span className="text-[9px] font-bold text-[#94A3B8]">المجموع</span>
                                            <span className="text-[12px] font-black text-[#0F172A] dark:text-white tabular-nums">{total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                );
                            }}
                        />
                        <Bar dataKey="revenue" name="الإيرادات" fill="url(#revGrad)" radius={[6, 6, 0, 0]} barSize={14} filter="url(#barShadow)" animationDuration={800} animationEasing="ease-out" />
                        <Bar dataKey="completed" name="الأداء" fill="url(#perfGrad)" radius={[6, 6, 0, 0]} barSize={14} filter="url(#barShadow)" animationDuration={800} animationEasing="ease-out" />
                        {!isTeacher && (
                            <Bar dataKey="expenses" name="المصروفات" fill="url(#expGrad)" radius={[6, 6, 0, 0]} barSize={14} filter="url(#barShadow)" animationDuration={800} animationEasing="ease-out" />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};



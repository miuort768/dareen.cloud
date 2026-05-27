import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { BarChart2, Target } from 'lucide-react';
import type { DashboardMonthData as MonthData } from '../types';
import { cn } from '../../../lib/utils';

interface DashboardChartsProps {
    isTeacher: boolean;
    monthlyData: MonthData[];
}

export const DashboardCharts = ({ isTeacher, monthlyData }: DashboardChartsProps) => {
    const color = '#2563EB';

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
                
                <div className="flex flex-wrap gap-2" dir="rtl">
                    <LegendItem color="bg-blue-600" label="الإيرادات" />
                    <LegendItem color="bg-emerald-600" label="الأداء" />
                    {!isTeacher && <LegendItem color="bg-rose-600" label="المصروفات" />}
                </div>
            </div>

            <div className="h-[280px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" opacity={0.2} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: '900', fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: '900', fill: '#64748b' }} tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val} />
                        <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 min-w-[160px]" dir="rtl">
                                        <div className="flex items-center gap-2 mb-2.5 border-b border-slate-100 dark:border-slate-700 pb-2">
                                            <Target size={12} style={{ color }} />
                                            <p className="text-[11px] font-bold text-[#0F172A] dark:text-white">{label}</p>
                                        </div>
                                        <div className="space-y-2">
                                            {payload.map((entry: { name?: string; value: number; color?: string }, index: number) => (
                                                <div key={index} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full border border-slate-950/10" style={{ backgroundColor: entry.color }} />
                                                        <span className="text-[10px] font-medium text-[#64748B]">{entry.name}</span>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-[#0F172A] dark:text-white tabular-nums">{entry.value.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }} />
                        <Bar dataKey="revenue" name="الإيرادات" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={12} />
                        <Bar dataKey="completed" name="الأداء" fill="#059669" radius={[4, 4, 0, 0]} barSize={12} />
                        {!isTeacher && <Bar dataKey="expenses" name="المصروفات" fill="#e11d48" radius={[4, 4, 0, 0]} barSize={12} />}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
    <div className="flex items-center gap-2 px-3 py-1.5 transition-all rounded-lg" style={{ backgroundColor: `${'#2563EB'}0D`, border: `1px solid ${'#2563EB'}20` }}>
        <div className={cn("w-2 h-2 rounded-full", color)} />
        <span className="text-[9px] font-bold text-[#64748B]">{label}</span>
    </div>
);



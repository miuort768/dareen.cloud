import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { BarChart2, Target } from 'lucide-react';
import type { DashboardMonthData as MonthData } from '../types';
import { cn } from '../../../lib/utils';

interface DashboardChartsProps {
    isTeacher: boolean;
    monthlyData: MonthData[];
}

export const DashboardCharts = ({ isTeacher, monthlyData }: DashboardChartsProps) => {

    return (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-none flex items-center justify-center border-2 border-slate-950 shadow-md">
                        <BarChart2 size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">مركز تحليل الأداء</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight mt-0.5">نظرة عامة على أداء المؤسسة</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2" dir="rtl">
                    <LegendItem color="bg-indigo-600" label="الإيرادات" />
                    <LegendItem color="bg-emerald-600" label="الأداء" />
                    {!isTeacher && <LegendItem color="bg-rose-600" label="المصروفات" />}
                </div>
            </div>

            <div className="h-[280px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                        <CartesianGrid strokeDasharray="0" vertical={false} stroke="#000" opacity={0.05} />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 9, fontWeight: '900', fill: '#64748b' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 9, fontWeight: '900', fill: '#64748b' }}
                            tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white dark:bg-slate-800 border-2 border-slate-950 p-4 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] min-w-[160px]" dir="rtl">
                                            <div className="flex items-center gap-2 mb-2.5 border-b-2 border-slate-100 dark:border-slate-700 pb-2">
                                                <Target size={12} className="text-indigo-600" />
                                                <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase">{label}</p>
                                            </div>
                                            <div className="space-y-2">
                                                {payload.map((entry: any, index: number) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-none border border-slate-950/10" style={{ backgroundColor: entry.color }} />
                                                            <span className="text-[10px] font-black text-slate-500 uppercase">{entry.name}</span>
                                                        </div>
                                                        <span className="text-[11px] font-black text-slate-900 dark:text-white tabular-nums">
                                                            {entry.value.toLocaleString()}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="revenue" name="الإيرادات" fill="#4f46e5" radius={0} barSize={12} />
                        <Bar dataKey="completed" name="الأداء" fill="#059669" radius={0} barSize={12} />
                         {!isTeacher && <Bar dataKey="expenses" name="المصروفات" fill="#e11d48" radius={0} barSize={12} />}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-none border-2 border-slate-950/10 transition-all hover:border-slate-950">
        <div className={cn("w-2.5 h-2.5 rounded-none", color)} />
        <span className="text-[9px] font-black text-slate-900 dark:text-slate-400 uppercase">{label}</span>
    </div>
);


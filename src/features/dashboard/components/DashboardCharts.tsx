import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { BarChart2, Target } from 'lucide-react';
import type { DashboardMonthData as MonthData } from '../types';
import { cn } from '../../../lib/utils';

interface DashboardChartsProps {
    isTeacher: boolean;
    monthlyData: MonthData[];
}

export const DashboardCharts = ({ isTeacher, monthlyData }: DashboardChartsProps) => {
    const [fontSize, setFontSize] = useState(11);

    useEffect(() => {
        const handleResize = () => {
            setFontSize(window.innerWidth < 768 ? 9 : 11);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] shadow-sm p-6 overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 dark:bg-black text-white rounded-2xl flex items-center justify-center shadow-lg">
                        <BarChart2 size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">مركز تحليل البيانات</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">نظرة عامة على أداء المؤسسة</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2" dir="rtl">
                    <LegendItem color="bg-[#5c59f2]" label="الإيرادات" />
                    <LegendItem color="bg-emerald-500" label="الأداء" />
                    {!isTeacher && <LegendItem color="bg-rose-500" label="المصروفات" />}
                </div>
            </div>

            <div className="h-[300px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                        <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: fontSize, fontWeight: 'bold', fill: '#94a3b8' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: fontSize, fontWeight: 'bold', fill: '#94a3b8' }}
                            tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-xl min-w-[180px]" dir="rtl">
                                            <div className="flex items-center gap-2 mb-3 border-b border-slate-50 dark:border-slate-700 pb-2">
                                                <Target size={14} className="text-indigo-500" />
                                                <p className="text-xs font-bold text-slate-800 dark:text-white">{label}</p>
                                            </div>
                                            <div className="space-y-2">
                                                {payload.map((entry: any, index: number) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                            <span className="text-[10px] font-bold text-slate-400">{entry.name}</span>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-800 dark:text-white">
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
                        <Bar dataKey="revenue" name="الإيرادات" fill="#5c59f2" radius={[4, 4, 0, 0]} barSize={10} />
                        <Bar dataKey="completed" name="الأداء" fill="#10B981" radius={[4, 4, 0, 0]} barSize={10} />
                         {!isTeacher && <Bar dataKey="expenses" name="المصروفات" fill="#F43F5E" radius={[4, 4, 0, 0]} barSize={10} />}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className={cn("w-2 h-2 rounded-full", color)} />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{label}</span>
    </div>
);

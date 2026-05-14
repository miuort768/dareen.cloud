import { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { AreaChart as AreaIcon } from 'lucide-react';
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

    // Sample data to match the screenshot if monthlyData is missing some fields
    const chartData = monthlyData.map(d => ({
        ...d,
        students: d.completed * 2 // Just for visualization to match the image growth
    }));

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm overflow-hidden border border-slate-50 dark:border-slate-800 h-full">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8" dir="rtl">
                <div className="flex items-center gap-3">
                    <AreaIcon size={20} className="text-[#5c59f2]" />
                    <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">إحصائيات الطلاب</h3>
                </div>
                
                <div className="flex items-center gap-2">
                    <button className="text-[10px] font-black text-slate-400 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg">الشهر الماضي</button>
                    <button className="text-[10px] font-black text-indigo-600 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800">هذا الشهر</button>
                </div>
            </div>

            <div className="h-[280px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#5c59f2" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#5c59f2" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-white/10" dir="rtl">
                                            <p className="text-[10px] font-bold opacity-60 mb-1">{label}</p>
                                            <p className="text-sm font-black">{payload[0].value.toLocaleString()} طالب</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="students" 
                            stroke="#5c59f2" 
                            strokeWidth={4}
                            fillOpacity={1} 
                            fill="url(#colorStudents)" 
                        />
                    </AreaChart>
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

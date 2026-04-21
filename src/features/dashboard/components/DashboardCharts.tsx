import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { BarChart2, Target } from 'lucide-react';
import type { DashboardMonthData as MonthData } from '../types';

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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-[2.5rem] shadow-sm p-4 md:p-6 overflow-hidden">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-[#5c59f2] text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none shrink-0">
                        <BarChart2 size={20} className="md:hidden" />
                        <BarChart2 size={28} className="hidden md:block" />
                    </div>
                    <div className="text-right">
                        <h3 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-white">مركز تحليل البيانات</h3>
                        <p className="text-slate-400 text-[10px] md:text-sm font-medium">نظرة عامة على أداء المؤسسة</p>
                    </div>
                </div>
                
                {/* Modern Legend / Indicators */}
                <div className="flex flex-wrap gap-2 md:gap-3" dir="rtl">
                    <div className="flex items-center gap-2 md:gap-3 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                        <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-[#5c59f2] rounded-full"></div>
                        <div className="flex flex-col">
                           <span className="text-[8px] md:text-[10px] font-bold text-indigo-400 uppercase leading-none mb-0.5 md:mb-1">الإيرادات</span>
                           <span className="text-[10px] md:text-xs font-black text-slate-700 dark:text-indigo-200">المالية</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 md:gap-3 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                        <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full"></div>
                        <div className="flex flex-col">
                           <span className="text-[8px] md:text-[10px] font-bold text-emerald-400 uppercase leading-none mb-0.5 md:mb-1">المنجز</span>
                           <span className="text-[10px] md:text-xs font-black text-slate-700 dark:text-emerald-200">الأداء</span>
                        </div>
                    </div>

                    {!isTeacher && (
                        <div className="flex items-center gap-2 md:gap-3 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-rose-100 dark:border-rose-800/50">
                            <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-rose-500 rounded-full"></div>
                            <div className="flex flex-col">
                               <span className="text-[8px] md:text-[10px] font-bold text-rose-400 uppercase leading-none mb-0.5 md:mb-1">المصروفات</span>
                               <span className="text-[10px] md:text-xs font-black text-slate-700 dark:text-rose-200">النفقات</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Chart Area */}
            <div className="relative h-[280px] md:h-[350px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barGap={6}>
                        <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: fontSize, fontWeight: '600', fill: '#94a3b8' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: fontSize, fontWeight: '600', fill: '#94a3b8' }}
                            tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 md:p-5 rounded-2xl md:rounded-3xl shadow-2xl min-w-[160px] md:min-w-[220px]" dir="rtl">
                                            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4 border-b border-slate-50 dark:border-slate-700 pb-2 md:pb-3">
                                                <Target size={14} className="text-slate-400" />
                                                <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-white">{label}</p>
                                            </div>
                                            <div className="space-y-2 md:space-y-3">
                                                {payload.map((entry: any, index: number) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 md:gap-3">
                                                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                                            <span className="text-[10px] md:text-xs font-bold text-slate-500">{entry.name}</span>
                                                        </div>
                                                        <span className="text-[11px] md:text-sm font-black text-slate-800 dark:text-white">
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
                        <Bar 
                            dataKey="revenue" 
                            name="الإيرادات" 
                            fill="#5c59f2" 
                            radius={[6, 6, 0, 0]} 
                            barSize={12}
                        />
                        <Bar 
                            dataKey="completed" 
                            name="المنجز" 
                            fill="#10B981" 
                            radius={[6, 6, 0, 0]} 
                            barSize={12}
                        />
                         {!isTeacher && (
                            <Bar 
                                dataKey="expenses" 
                                name="المصروفات" 
                                fill="#F43F5E" 
                                radius={[6, 6, 0, 0]} 
                                barSize={12}
                            />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

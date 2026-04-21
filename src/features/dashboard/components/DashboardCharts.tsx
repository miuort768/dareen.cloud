import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { BarChart2, TrendingUp, TrendingDown, Target } from 'lucide-react';
import type { DashboardMonthData as MonthData } from '../types';

interface DashboardChartsProps {
    isTeacher: boolean;
    monthlyData: MonthData[];
}

export const DashboardCharts = ({ isTeacher, monthlyData }: DashboardChartsProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm p-6 overflow-hidden">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#5c59f2] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                        <BarChart2 size={28} />
                    </div>
                    <div className="text-right">
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">مركز تحليل البيانات</h3>
                        <p className="text-slate-400 text-sm font-medium">نظرة عامة على أداء المؤسسة خلال الفترة الحالية</p>
                    </div>
                </div>
                
                {/* Modern Legend / Indicators */}
                <div className="flex flex-wrap gap-3" dir="rtl">
                    <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                        <div className="w-2.5 h-2.5 bg-[#5c59f2] rounded-full ring-4 ring-indigo-100 dark:ring-indigo-900/40"></div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-indigo-400 uppercase leading-none mb-1">الإيرادات</span>
                           <span className="text-xs font-black text-slate-700 dark:text-indigo-200">النمو المالي</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full ring-4 ring-emerald-100 dark:ring-emerald-900/40"></div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-emerald-400 uppercase leading-none mb-1">المنجز</span>
                           <span className="text-xs font-black text-slate-700 dark:text-emerald-200">الأداء التعليمي</span>
                        </div>
                    </div>

                    {!isTeacher && (
                        <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-2xl border border-rose-100 dark:border-rose-800/50">
                            <div className="w-2.5 h-2.5 bg-rose-500 rounded-full ring-4 ring-rose-100 dark:ring-rose-900/40"></div>
                            <div className="flex flex-col">
                               <span className="text-[10px] font-bold text-rose-400 uppercase leading-none mb-1">المصروفات</span>
                               <span className="text-xs font-black text-slate-700 dark:text-rose-200">التدفق النقدي</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Chart Area */}
            <div className="relative h-[350px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#5c59f2" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#5c59f2" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fontWeight: '600', fill: '#94a3b8' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fontWeight: '600', fill: '#94a3b8' }}
                            tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-5 rounded-3xl shadow-2xl min-w-[220px] ring-8 ring-slate-50 dark:ring-slate-900/50" dir="rtl">
                                            <div className="flex items-center gap-3 mb-4 border-b border-slate-50 dark:border-slate-700 pb-3">
                                                <div className="w-8 h-8 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                                                    <Target size={16} className="text-slate-400" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
                                            </div>
                                            <div className="space-y-3">
                                                {payload.map((entry: any, index: number) => (
                                                    <div key={index} className="flex items-center justify-between group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-6 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                                            <span className="text-xs font-bold text-slate-500">{entry.name}</span>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-sm font-black text-slate-800 dark:text-white">
                                                                {entry.value.toLocaleString()}
                                                            </span>
                                                            {index === 0 && <TrendingUp size={10} className="text-emerald-500 mt-0.5" />}
                                                            {index === 2 && <TrendingDown size={10} className="text-rose-500 mt-0.5" />}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            name="الإيرادات" 
                            stroke="#5c59f2" 
                            strokeWidth={4} 
                            fill="url(#colorRev)" 
                            dot={{ r: 6, fill: '#5c59f2', strokeWidth: 3, stroke: '#fff' }}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="completed" 
                            name="المنجز" 
                            stroke="#10B981" 
                            strokeWidth={4} 
                            fill="url(#colorComp)" 
                            dot={{ r: 6, fill: '#10B981', strokeWidth: 3, stroke: '#fff' }}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

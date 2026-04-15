import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { Activity, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import type { DashboardMonthData as MonthData } from '../types';

interface DashboardChartsProps {
    isTeacher: boolean;
    monthlyData: MonthData[];
}

export const DashboardCharts = ({ isTeacher, monthlyData }: DashboardChartsProps) => {
    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-500/20">
                        <Activity size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">مركز تحليل البيانات</h3>
                        <p className="text-sm font-medium text-slate-400 flex items-center gap-2 mt-1">
                            <Sparkles size={14} className="text-amber-500" />
                            مؤشرات الأداء المالي والأكاديمي
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-4" dir="rtl">
                    <div className="flex items-center gap-2 bg-indigo-50/50 dark:bg-indigo-900/10 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">الإيرادات</span>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-50/50 dark:bg-emerald-900/10 px-4 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">المنجز</span>
                    </div>
                    {!isTeacher && (
                        <div className="flex items-center gap-2 bg-rose-50/50 dark:bg-rose-900/10 px-4 py-2 rounded-2xl border border-rose-100 dark:border-rose-800">
                            <div className="w-2.5 h-2.5 bg-rose-500 rounded-full"></div>
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">المصروفات</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative h-[480px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E5E7EB" opacity={0.4} />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: '600', fill: '#94a3b8' }}
                            dy={20}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: '600', fill: '#94a3b8' }}
                            tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                        />
                        <Tooltip
                            cursor={{ stroke: '#6366F1', strokeWidth: 2, strokeDasharray: '6 6' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-2xl min-w-[280px]" dir="rtl">
                                            <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
                                                <div className="flex items-center gap-3">
                                                    <Calendar size={16} className="text-indigo-500" />
                                                    <p className="text-sm font-black text-slate-900 dark:text-white">{label}</p>
                                                </div>
                                                <TrendingUp size={16} className="text-indigo-500" />
                                            </div>
                                            <div className="space-y-4">
                                                {payload.map((entry: any, index: number) => (
                                                    <div key={index} className="flex items-center justify-between group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: entry.color }}></div>
                                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 transition-colors uppercase">{entry.name}</span>
                                                        </div>
                                                        <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                                                            {entry.dataKey === 'revenue' || entry.dataKey === 'expenses'
                                                                ? `${entry.value.toLocaleString()} ج.م`
                                                                : `${entry.value} حصة`}
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
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            name="الإيرادات"
                            stroke="#6366F1"
                            strokeWidth={5}
                            fill="url(#colorRev)"
                            activeDot={{ r: 8, stroke: '#fff', strokeWidth: 4, fill: '#6366F1' }}
                        />
                        {!isTeacher && (
                            <Area
                                type="monotone"
                                dataKey="expenses"
                                name="المصروفات"
                                stroke="#F43F5E"
                                strokeWidth={4}
                                fill="url(#colorExp)"
                                strokeDasharray="10 5"
                                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3, fill: '#F43F5E' }}
                            />
                        )}
                        <Area
                            type="monotone"
                            dataKey="completed"
                            name="الحصص المنجزة"
                            stroke="#10B981"
                            strokeWidth={6}
                            fill="url(#colorComp)"
                            activeDot={{ r: 10, stroke: '#fff', strokeWidth: 4, fill: '#10B981' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

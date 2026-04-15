import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { Activity } from 'lucide-react';
import type { DashboardMonthData as MonthData } from '../types';

interface DashboardChartsProps {
    isTeacher: boolean;
    monthlyData: MonthData[];
}

export const DashboardCharts = ({ isTeacher, monthlyData }: DashboardChartsProps) => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-none flex items-center justify-center">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">مركز تحليل البيانات</h3>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2" dir="rtl">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1 rounded-none">
                        <div className="w-2 h-2 bg-indigo-500"></div>
                        <span className="text-[10px] font-bold text-slate-500">الإيرادات</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1 rounded-none">
                        <div className="w-2 h-2 bg-emerald-500"></div>
                        <span className="text-[10px] font-bold text-slate-500">المنجز</span>
                    </div>
                    {!isTeacher && (
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1 rounded-none">
                            <div className="w-2 h-2 bg-rose-500"></div>
                            <span className="text-[10px] font-bold text-slate-500">المصروفات</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative h-[380px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                        <defs>
                            <linearGradient id="colorRevSharp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorCompSharp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: '700', fill: '#94a3b8' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: '700', fill: '#94a3b8' }}
                            tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white border border-slate-900 p-4 rounded-none shadow-xl min-w-[200px]" dir="rtl">
                                            <p className="text-[11px] font-black text-slate-900 border-b border-slate-100 pb-2 mb-3 uppercase italic">{label}</p>
                                            <div className="space-y-2">
                                                {payload.map((entry: any, index: number) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2" style={{ backgroundColor: entry.color }}></div>
                                                            <span className="text-[9px] font-bold text-slate-500 uppercase">{entry.name}</span>
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-900">
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
                        <Area type="monotone" dataKey="revenue" name="الإيرادات" stroke="#6366F1" strokeWidth={3} fill="url(#colorRevSharp)" />
                        <Area type="monotone" dataKey="completed" name="المنجز" stroke="#10B981" strokeWidth={3} fill="url(#colorCompSharp)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

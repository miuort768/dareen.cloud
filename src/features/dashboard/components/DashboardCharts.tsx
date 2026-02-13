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
            {!isTeacher && (
                <div className="bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-none relative overflow-hidden group">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] translate-y-1/2 -translate-x-1/2 rounded-full"></div>

                    <div className="relative p-8 px-6 md:px-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-none transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <Activity size={24} className="animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 dark:text-white text-lg tracking-tight leading-none mb-1">ملخص الأداء والنمو</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">تحليل متقدم للبيانات المالية والتعليمية</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 bg-gray-50/50 dark:bg-gray-800/50 p-3 px-4 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">الإيرادات</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]"></div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">المجدولة</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">المنجزة</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">المصروفات</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[400px] w-full" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="areaGradRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                                        </linearGradient>
                                        <linearGradient id="areaGradComp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.01} />
                                        </linearGradient>
                                        <linearGradient id="areaGradExp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.4} />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: '900', fill: '#94A3B8' }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: '900', fill: '#94A3B8' }}
                                        tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border border-gray-100 dark:border-gray-800 p-4 shadow-2xl rounded-none min-w-[200px]">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-50 dark:border-gray-800 pb-2">{label}</p>
                                                        <div className="space-y-2.5">
                                                            {payload.map((entry: any, index: number) => (
                                                                <div key={index} className="flex items-center justify-between gap-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                                                        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{entry.name}</span>
                                                                    </div>
                                                                    <span className="text-xs font-black text-gray-900 dark:text-white">
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
                                        stroke="#3B82F6"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#areaGradRev)"
                                        dot={{ fill: '#3B82F6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                        animationDuration={1500}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="expenses"
                                        name="المصروفات"
                                        stroke="#F43F5E"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#areaGradExp)"
                                        strokeDasharray="6 4"
                                        animationDuration={2000}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="sessions"
                                        name="الحصص المجدولة"
                                        stroke="#818CF8"
                                        strokeWidth={1.5}
                                        fill="transparent"
                                        strokeDasharray="4 2"
                                        animationDuration={1800}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="completed"
                                        name="الحصص المنجزة"
                                        stroke="#10B981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#areaGradComp)"
                                        dot={{ fill: '#10B981', r: 3, strokeWidth: 2, stroke: '#fff' }}
                                        animationDuration={1200}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {isTeacher && (
                <div className="bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-none relative overflow-hidden group h-full flex flex-col">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -translate-y-1/2 -translate-x-1/2 rounded-full"></div>

                    <div className="relative p-8 px-6 md:px-8 flex-1 flex flex-col">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-none transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <Activity size={24} className="animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 dark:text-white text-lg tracking-tight leading-none mb-1">نشاط الحصص التعليمية</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">متابعة الأداء الشهري المتقدم</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 bg-gray-50/50 dark:bg-gray-800/50 p-3 px-4 backdrop-blur-sm border border-gray-100 dark:border-gray-800 self-start md:self-auto">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase">منجزة</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase">مجدولة</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 min-h-[350px] w-full" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCompTeacher" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.01} />
                                        </linearGradient>
                                        <linearGradient id="colorSessTeacher" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.05} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.4} />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: '900', fill: '#94A3B8' }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: '900', fill: '#94A3B8' }}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border border-gray-100 dark:border-gray-800 p-4 shadow-2xl rounded-none min-w-[180px]">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-50 dark:border-gray-800 pb-2">{label}</p>
                                                        <div className="space-y-3">
                                                            {payload.map((entry: any, index: number) => (
                                                                <div key={index} className="flex items-center justify-between gap-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                                                        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{entry.name}</span>
                                                                    </div>
                                                                    <span className="text-sm font-black text-gray-900 dark:text-white">{entry.value}</span>
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
                                        dataKey="completed"
                                        name="حصص منجزة"
                                        stroke="#10B981"
                                        fillOpacity={1}
                                        fill="url(#colorCompTeacher)"
                                        strokeWidth={4}
                                        dot={{ fill: '#10B981', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                        animationDuration={1500}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="sessions"
                                        name="حصص مجدولة"
                                        stroke="#3B82F6"
                                        fillOpacity={1}
                                        fill="url(#colorSessTeacher)"
                                        strokeWidth={2}
                                        strokeDasharray="6 4"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

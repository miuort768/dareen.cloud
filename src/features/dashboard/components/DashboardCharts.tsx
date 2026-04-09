import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { Activity, Sparkles } from 'lucide-react';
import type { DashboardMonthData as MonthData } from '../types';

interface DashboardChartsProps {
    isTeacher: boolean;
    monthlyData: MonthData[];
}

export const DashboardCharts = ({ isTeacher, monthlyData }: DashboardChartsProps) => {
    return (
        <div className="space-y-6">
            {!isTeacher && (
                <div className="bg-white border-4 border-gray-950 dark:bg-gray-950 dark:border-gray-800 shadow-[10px_10px_0px_0px_black] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,0.05)] rounded-none relative overflow-hidden group">
                    <div className="relative p-8 px-4 md:px-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b-4 border-gray-950 dark:border-gray-800 pb-8">
                            <div className="flex items-center gap-5">
                                <div className="p-3.5 bg-primary-600 text-white border-2 border-gray-950 transform -rotate-1 shadow-[4px_4px_0px_0px_black]">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-950 dark:text-white text-xl lg:text-3xl tracking-tighter uppercase leading-none mb-1">مركز تحليل البيانات</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles size={10} className="text-amber-500" />
                                        مؤشرات الأداء المالي والأكاديمي
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-3" dir="rtl">
                                <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-950 px-3 py-1 shadow-[2px_2px_0px_0px_black]">
                                    <div className="w-3 h-3 bg-primary-500 border border-gray-950"></div>
                                    <span className="text-[10px] font-black uppercase">الإيرادات</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-950 px-3 py-1 shadow-[2px_2px_0px_0px_black]">
                                    <div className="w-3 h-3 bg-emerald-500 border border-gray-950"></div>
                                    <span className="text-[10px] font-black uppercase">المنجز</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-950 px-3 py-1 shadow-[2px_2px_0px_0px_black]">
                                    <div className="w-3 h-3 bg-rose-500 border border-gray-950"></div>
                                    <span className="text-[10px] font-black uppercase">المصروفات</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[450px] w-full" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
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
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={{ stroke: '#000', strokeWidth: 2 }}
                                        tickLine={{ stroke: '#000', strokeWidth: 2 }}
                                        tick={{ fontSize: 11, fontWeight: '900', fill: '#000', fontFamily: 'monospace' }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={{ stroke: '#000', strokeWidth: 2 }}
                                        tickLine={{ stroke: '#000', strokeWidth: 2 }}
                                        tick={{ fontSize: 11, fontWeight: '900', fill: '#000', fontFamily: 'monospace' }}
                                        tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#000', strokeWidth: 3, strokeDasharray: '5 5' }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white border-4 border-gray-950 p-6 shadow-[8px_8px_0px_0px_black] min-w-[240px]" dir="rtl">
                                                        <div className="flex items-center justify-between mb-4 border-b-2 border-gray-100 pb-2">
                                                            <p className="text-xs font-black text-gray-950 uppercase tracking-widest">{label}</p>
                                                            <Activity size={14} className="text-primary-600" />
                                                        </div>
                                                        <div className="space-y-4">
                                                            {payload.map((entry: any, index: number) => (
                                                                <div key={index} className="flex items-center justify-between gap-8">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-4 h-4 border-2 border-gray-950" style={{ backgroundColor: entry.color }}></div>
                                                                        <span className="text-[11px] font-black text-gray-600 uppercase italic">{entry.name}</span>
                                                                    </div>
                                                                    <span className="text-sm font-black text-gray-950 tabular-nums">
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
                                        fill="url(#colorRev)"
                                        activeDot={{ r: 8, stroke: '#000', strokeWidth: 2, fill: '#3B82F6' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="expenses"
                                        name="المصروفات"
                                        stroke="#F43F5E"
                                        strokeWidth={4}
                                        fill="url(#colorExp)"
                                        strokeDasharray="10 5"
                                        activeDot={{ r: 6, stroke: '#000', strokeWidth: 2, fill: '#F43F5E' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="completed"
                                        name="الحصص المنجزة"
                                        stroke="#10B981"
                                        strokeWidth={5}
                                        fill="url(#colorComp)"
                                        activeDot={{ r: 10, stroke: '#000', strokeWidth: 2, fill: '#10B981' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {isTeacher && (
                <div className="bg-white border-4 border-gray-950 dark:bg-gray-950 dark:border-gray-800 shadow-[10px_10px_0px_0px_black] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,0.05)] rounded-none relative overflow-hidden group h-full flex flex-col">
                    <div className="relative p-8 px-6 md:px-8 flex-1 flex flex-col">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b-4 border-gray-950 dark:border-gray-800 pb-8">
                            <div className="flex items-center gap-5">
                                <div className="p-3.5 bg-emerald-600 text-white border-2 border-gray-950 transform rotate-1 shadow-[4px_4px_0px_0px_black]">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-950 dark:text-white text-xl lg:text-3xl tracking-tighter uppercase leading-none mb-1">النشاط الأكاديمي</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">متابعة الأداء التعليمي الشهري</p>
                                </div>
                            </div>

                            <div className="flex gap-4" dir="rtl">
                                <div className="flex items-center gap-2 bg-emerald-50 border-2 border-gray-950 px-4 py-1.5 shadow-[3px_3px_0px_0px_black]">
                                    <div className="w-3 h-3 bg-emerald-600 border border-gray-950"></div>
                                    <span className="text-[10px] font-black uppercase">الحصص المنجزة</span>
                                </div>
                                <div className="flex items-center gap-2 bg-blue-50 border-2 border-gray-950 px-4 py-1.5 shadow-[3px_3px_0px_0px_black]">
                                    <div className="w-3 h-3 bg-blue-500 border border-gray-950"></div>
                                    <span className="text-[10px] font-black uppercase">الحصص المجدولة</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 min-h-[400px] w-full" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={{ stroke: '#000', strokeWidth: 2 }}
                                        tickLine={{ stroke: '#000', strokeWidth: 2 }}
                                        tick={{ fontSize: 11, fontWeight: '900', fill: '#000', fontFamily: 'monospace' }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={{ stroke: '#000', strokeWidth: 2 }}
                                        tickLine={{ stroke: '#000', strokeWidth: 2 }}
                                        tick={{ fontSize: 11, fontWeight: '900', fill: '#000', fontFamily: 'monospace' }}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#000', strokeWidth: 3, strokeDasharray: '5 5' }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white border-4 border-gray-950 p-6 shadow-[8px_8px_0px_0px_black] min-w-[220px]" dir="rtl">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 border-b-2 border-gray-100 pb-2 italic">{label}</p>
                                                        <div className="space-y-4">
                                                            {payload.map((entry: any, index: number) => (
                                                                <div key={index} className="flex items-center justify-between gap-8">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-4 h-4 border-2 border-gray-950" style={{ backgroundColor: entry.color }}></div>
                                                                        <span className="text-[11px] font-black text-gray-600 uppercase tracking-tighter">{entry.name}</span>
                                                                    </div>
                                                                    <span className="text-base font-black text-gray-950 tabular-nums">{entry.value}</span>
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
                                        strokeWidth={5}
                                        fill="url(#colorCompleted)"
                                        activeDot={{ r: 10, stroke: '#000', strokeWidth: 2, fill: '#10B981' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="sessions"
                                        name="حصص مجدولة"
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        fill="url(#colorSessions)"
                                        strokeDasharray="8 4"
                                        activeDot={{ r: 6, stroke: '#000', strokeWidth: 2, fill: '#3B82F6' }}
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

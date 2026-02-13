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
                <div className="bg-white border border-gray-100 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-xl rounded-none relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-indigo-500 to-emerald-500 opacity-30"></div>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600">
                                <Activity size={20} className="animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight">ملخص الأداء</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">تحليل البيانات الشهرية</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-primary-500"></div>
                                <span className="text-[10px] font-black text-gray-500 uppercase">الإيرادات</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-indigo-400"></div>
                                <span className="text-[10px] font-black text-gray-500 uppercase">المجدولة</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-emerald-500"></div>
                                <span className="text-[10px] font-black text-gray-500 uppercase">المنجزة</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="areaGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="areaGradientEmerald" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="areaGradientRose" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="areaGradientIndigo" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818CF8" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#818CF8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: '900', fill: '#94A3B8' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: '900', fill: '#94A3B8' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '0px',
                                        border: '1px solid #E2E8F0',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ fontSize: '11px', fontWeight: '900', padding: '2px 0' }}
                                    labelStyle={{ color: '#64748B', fontWeight: '900', fontSize: '12px', marginBottom: '8px', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    name="الإيرادات"
                                    stroke="#3B82F6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#areaGradientPrimary)"
                                    dot={{ fill: '#3B82F6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expenses"
                                    name="المصروفات"
                                    stroke="#F43F5E"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#areaGradientRose)"
                                    strokeDasharray="5 5"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sessions"
                                    name="الحصص المجدولة"
                                    stroke="#818CF8"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#areaGradientIndigo)"
                                    strokeDasharray="3 3"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="completed"
                                    name="الحصص المنجزة"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#areaGradientEmerald)"
                                    dot={{ fill: '#10B981', r: 3, strokeWidth: 2, stroke: '#fff' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {isTeacher && (
                <div className="bg-white border border-gray-100 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-xl rounded-none relative overflow-hidden group h-full flex flex-col">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-30"></div>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                                <Activity size={20} className="animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight">نشاط الحصص التعليمية</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">تتبع الإنجاز الشهري</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: '900', fill: '#94A3B8' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: '900', fill: '#94A3B8' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '0px',
                                        border: '1px solid #E2E8F0',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                                        fontSize: '11px',
                                        fontWeight: '900'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="completed"
                                    name="حصص منجزة"
                                    stroke="#10B981"
                                    fillOpacity={1}
                                    fill="url(#colorCompleted)"
                                    strokeWidth={4}
                                    dot={{ fill: '#10B981', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sessions"
                                    name="حصص مجدولة"
                                    stroke="#3B82F6"
                                    fillOpacity={1}
                                    fill="url(#colorSessions)"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

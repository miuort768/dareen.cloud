import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { CalendarCheck } from 'lucide-react';
import type { DashboardMonthData as MonthData, DashboardStats as Stats } from '../types';

interface SessionAnalysisProps {
    stats: Stats;
    monthlyData: MonthData[];
}

export const SessionAnalysis = ({ stats, monthlyData }: SessionAnalysisProps) => {
    return (
        <div className="bg-white border-4 border-gray-950 dark:bg-gray-950 dark:border-gray-800 shadow-[10px_10px_0px_0px_black] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,0.05)] relative overflow-hidden group flex flex-col h-full rounded-none">
            <div className="absolute top-0 right-0 w-2 h-full bg-indigo-600 border-l-2 border-gray-950"></div>

            <div className="p-6 border-b-4 border-gray-950 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600 text-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_#444]">
                        <CalendarCheck size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-950 dark:text-white text-xs lg:text-sm uppercase tracking-tight">تحليل نشاط الحصص</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">إحصائيات الإنجاز الشهري</p>
                    </div>
                </div>
            </div>
            <div className="p-8 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="text-right p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-950 shadow-[4px_4px_0px_0px_black]">
                        <p className="text-[9px] font-black text-gray-500 uppercase mb-2 tracking-widest">إجمالي الحصص</p>
                        <p className="text-3xl font-black text-gray-950 dark:text-white tracking-tighter font-mono">{stats.totalSessions}</p>
                    </div>
                    <div className="text-right p-4 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-gray-950 shadow-[4px_4px_0px_0px_black]">
                        <p className="text-[9px] font-black text-emerald-600 uppercase mb-2 tracking-widest">إجمالي المنجز</p>
                        <p className="text-3xl font-black text-emerald-600 tracking-tighter font-mono">{stats.completedSessions}</p>
                    </div>
                </div>
                <div className="h-48 w-full mt-auto" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="areaGradientMonthly" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis 
                                dataKey="month" 
                                tick={{ fontSize: 10, fontWeight: '900', fill: '#000', fontFamily: 'monospace' }} 
                                axisLine={{ stroke: '#000', strokeWidth: 2 }}
                                tickLine={{ stroke: '#000', strokeWidth: 2 }}
                                dy={10}
                            />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '4px solid #000',
                                    borderRadius: '0px',
                                    fontSize: '11px',
                                    fontWeight: '900',
                                    boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="sessions"
                                name="مجدولة"
                                stroke="#6366F1"
                                fillOpacity={1}
                                fill="url(#areaGradientMonthly)"
                                strokeWidth={4}
                                activeDot={{ r: 6, stroke: '#000', strokeWidth: 2, fill: '#6366F1' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="completed"
                                name="منجزة"
                                stroke="#10B981"
                                fillOpacity={0}
                                strokeWidth={4}
                                strokeDasharray="5 5"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

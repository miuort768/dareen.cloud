import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { CalendarCheck } from 'lucide-react';
import type { DashboardMonthData as MonthData, DashboardStats as Stats } from '../types';

interface SessionAnalysisProps {
    stats: Stats;
    monthlyData: MonthData[];
}

export const SessionAnalysis = ({ stats, monthlyData }: SessionAnalysisProps) => {
    return (
        <div className="bg-white border-2 border-gray-950 dark:bg-gray-950 dark:border-gray-800 shadow-[4px_4px_0px_0px_black] relative overflow-hidden group flex flex-col h-full rounded-none">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-600 border-l-2 border-gray-950"></div>

            <div className="p-2 border-b-2 border-gray-950 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-600 text-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_#444]">
                        <CalendarCheck size={14} />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-950 dark:text-white text-[10px] uppercase tracking-tight leading-none">تحليل نشاط الحصص</h3>
                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">إحصائيات الإنجاز الشهري</p>
                    </div>
                </div>
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-right p-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-950 shadow-[2px_2px_0px_0px_black]">
                        <p className="text-[7px] font-black text-gray-500 uppercase mb-1 tracking-widest">إجمالي الحصص</p>
                        <p className="text-lg font-black text-gray-950 dark:text-white tracking-tighter font-mono">{stats.totalSessions}</p>
                    </div>
                    <div className="text-right p-2 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-gray-950 shadow-[2px_2px_0px_0px_black]">
                        <p className="text-[7px] font-black text-emerald-600 uppercase mb-1 tracking-widest">إجمالي المنجز</p>
                        <p className="text-lg font-black text-emerald-600 tracking-tighter font-mono">{stats.completedSessions}</p>
                    </div>
                </div>
                <div className="h-32 w-full mt-auto" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="areaGradientMonthly" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#E5E7EB" />
                            <XAxis 
                                dataKey="month" 
                                tick={{ fontSize: 8, fontWeight: '900', fill: '#000', fontFamily: 'monospace' }} 
                                axisLine={{ stroke: '#000', strokeWidth: 1.5 }}
                                tickLine={{ stroke: '#000', strokeWidth: 1.5 }}
                                dy={5}
                            />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '2px solid #000',
                                    borderRadius: '0px',
                                    fontSize: '9px',
                                    fontWeight: '900',
                                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="sessions"
                                name="مجدولة"
                                stroke="#6366F1"
                                fillOpacity={1}
                                fill="url(#areaGradientMonthly)"
                                strokeWidth={2}
                                activeDot={{ r: 4, stroke: '#000', strokeWidth: 1, fill: '#6366F1' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="completed"
                                name="منجزة"
                                stroke="#10B981"
                                fillOpacity={0}
                                strokeWidth={2}
                                strokeDasharray="3 3"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

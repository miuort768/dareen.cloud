import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { CalendarCheck } from 'lucide-react';
import type { DashboardMonthData as MonthData, DashboardStats as Stats } from '../types';

interface SessionAnalysisProps {
    stats: Stats;
    monthlyData: MonthData[];
}

export const SessionAnalysis = ({ stats, monthlyData }: SessionAnalysisProps) => {
    return (
        <div className="bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-600"></div>
            <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600">
                        <CalendarCheck size={18} />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-tight">تحليل الحصص</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">النشاط الشهري</p>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">الحصص المتوقعة</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">{stats.totalSessions}</p>
                    </div>
                    <div className="text-right border-r border-gray-100 dark:border-gray-800 pr-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">المكتملة</p>
                        <p className="text-xl font-black text-emerald-600 tracking-tighter">{stats.completedSessions}</p>
                    </div>
                </div>
                <div className="h-40 w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -35, bottom: 0 }}>
                            <defs>
                                <linearGradient id="areaGradientMonthly" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} stroke="#94A3B8" />
                            <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: '900', fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '0px',
                                    border: '1px solid #F1F5F9',
                                    fontSize: '10px',
                                    fontWeight: '900',
                                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="sessions"
                                name=" المجدولة"
                                stroke="#6366F1"
                                fillOpacity={1}
                                fill="url(#areaGradientMonthly)"
                                strokeWidth={3}
                                dot={{ fill: '#6366F1', r: 3, strokeWidth: 0 }}
                                activeDot={{ r: 5, strokeWidth: 0 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="completed"
                                name=" المكتملة"
                                stroke="#10B981"
                                fillOpacity={0}
                                strokeWidth={2}
                                strokeDasharray="4 4"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

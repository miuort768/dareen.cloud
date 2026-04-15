import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { CalendarCheck, PieChart } from 'lucide-react';
import type { DashboardMonthData as MonthData, DashboardStats as Stats } from '../types';

interface SessionAnalysisProps {
    stats: Stats;
    monthlyData: MonthData[];
}

export const SessionAnalysis = ({ stats, monthlyData }: SessionAnalysisProps) => {
    return (
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-slate-800 p-8 shadow-2xl shadow-indigo-500/5 transition-all duration-500 hover:shadow-indigo-500/10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                        <PieChart size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">تحليل النشاط</h3>
                        <p className="text-sm font-medium text-gray-400">إحصائيات الإنجاز الشهري</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-between pt-2">
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all hover:border-indigo-200">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">إجمالي الحصص</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{stats.totalSessions}</p>
                    </div>
                    <div className="p-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 transition-all hover:border-emerald-200">
                        <p className="text-xs font-bold text-emerald-600 uppercase mb-2 tracking-widest">إجمالي المنجز</p>
                        <p className="text-3xl font-black text-emerald-600 tracking-tighter tabular-nums">{stats.completedSessions}</p>
                    </div>
                </div>

                <div className="h-44 w-full mt-auto" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="areaGradientMonthly" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                            <XAxis 
                                dataKey="month" 
                                tick={{ fontSize: 10, fontWeight: '600', fill: '#94a3b8' }} 
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid rgba(255, 255, 255, 0.4)',
                                    borderRadius: '1.5rem',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    padding: '12px 16px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
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
                                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3, fill: '#6366F1' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="completed"
                                name="منجزة"
                                stroke="#10B981"
                                fillOpacity={0}
                                strokeWidth={3}
                                strokeDasharray="6 6"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

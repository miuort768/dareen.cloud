import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { PieChart } from 'lucide-react';
import type { DashboardMonthData as MonthData, DashboardStats as Stats } from '../types';

interface SessionAnalysisProps {
    stats: Stats;
    monthlyData: MonthData[];
}

export const SessionAnalysis = ({ stats, monthlyData }: SessionAnalysisProps) => {
    return (
        <div className="bg-card backdrop-blur-xl rounded-[2.5rem] border border-border p-8 shadow-2xl shadow-primary/5 transition-all duration-500 hover:shadow-primary/10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-soft text-primary rounded-2xl flex items-center justify-center border border-primary-light">
                        <PieChart size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-normal text-main">تحليل النشاط</h3>
                        <p className="text-sm font-medium text-dim">إحصائيات الإنجاز الشهري</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-between pt-2">
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="p-6 bg-surface rounded-[2rem] border border-border transition-all hover:border-primary-light">
                        <p className="text-xs font-normal text-muted uppercase mb-2 tracking-widest">إجمالي الحصص</p>
                        <p className="text-3xl font-medium text-main tracking-tighter tabular-nums">{stats.totalSessions}</p>
                    </div>
                    <div className="p-6 bg-success-soft rounded-[2rem] border border-success/10 transition-all hover:border-success">
                        <p className="text-xs font-normal text-success uppercase mb-2 tracking-widest">إجمالي المنجز</p>
                        <p className="text-3xl font-medium text-success tracking-tighter tabular-nums">{stats.completedSessions}</p>
                    </div>
                </div>

                <div className="h-44 w-full mt-auto" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="saAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.5} />
                            <XAxis 
                                dataKey="month" 
                                tick={{ fontSize: 10, fontWeight: '600', fill: 'var(--text-dim)' }} 
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-card)',
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '1.5rem',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    padding: '12px 16px',
                                    boxShadow: 'var(--shadow-xl)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="sessions"
                                name="مجدولة"
                                stroke="var(--chart-1)"
                                fillOpacity={1}
                                fill="url(#saAreaGradient)"
                                strokeWidth={4}
                                activeDot={{ r: 6, stroke: 'var(--bg-card)', strokeWidth: 3, fill: 'var(--chart-1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="completed"
                                name="منجزة"
                                stroke="var(--chart-2)"
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

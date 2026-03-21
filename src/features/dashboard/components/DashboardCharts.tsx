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
                <div className="bg-white border-4 border-gray-950 dark:bg-gray-950 dark:border-gray-800 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] rounded-none relative overflow-hidden group">
                    {/* Background Sharp Decorations */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 border-r-8 border-primary-500/20 -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 border-l-8 border-emerald-500/20 -ml-16 -mb-16 pointer-events-none"></div>

                    <div className="relative p-8 px-6 md:px-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b-2 border-gray-100 dark:border-gray-800 pb-6">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-gray-900 dark:bg-primary-900/40 text-white rounded-none border-2 border-white/10">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 dark:text-white text-xl lg:text-3xl tracking-tighter uppercase leading-none mb-1">DATA GROWTH ANALYSIS</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">REVENUE, EXPENSES & PERFORMANCE</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-[400px] w-full" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="#eee" opacity={0.5} />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={{ strokeWidth: 2 }}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: '900', fill: '#666' }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={{ strokeWidth: 2 }}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: '900', fill: '#666' }}
                                        tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#000', strokeWidth: 2 }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-gray-950 border-2 border-white/20 p-5 shadow-2xl rounded-none min-w-[220px]">
                                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4 border-b border-white/10 pb-2">{label}</p>
                                                        <div className="space-y-3">
                                                            {payload.map((entry: any, index: number) => (
                                                                <div key={index} className="flex items-center justify-between gap-6">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-3 h-3 border-2 border-white/20" style={{ backgroundColor: entry.color }}></div>
                                                                        <span className="text-[10px] font-black text-white/60 tracking-wider uppercase">{entry.name}</span>
                                                                    </div>
                                                                    <span className="text-xs font-black text-white tabular-nums">
                                                                        {entry.dataKey === 'revenue' || entry.dataKey === 'expenses'
                                                                            ? `${entry.value.toLocaleString()} LE`
                                                                            : `${entry.value}`}
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
                                        type="step"
                                        dataKey="revenue"
                                        name="REVENUE"
                                        stroke="#3B82F6"
                                        strokeWidth={4}
                                        fillOpacity={0.1}
                                        fill="#3B82F6"
                                        isAnimationActive={false}
                                    />
                                    <Area
                                        type="step"
                                        dataKey="expenses"
                                        name="EXPENSES"
                                        stroke="#F43F5E"
                                        strokeWidth={3}
                                        fillOpacity={0.05}
                                        fill="#F43F5E"
                                        strokeDasharray="8 4"
                                        isAnimationActive={false}
                                    />
                                    <Area
                                        type="step"
                                        dataKey="completed"
                                        name="COMPLETED"
                                        stroke="#10B981"
                                        strokeWidth={4}
                                        fillOpacity={0.15}
                                        fill="#10B981"
                                        isAnimationActive={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {isTeacher && (
                <div className="bg-white border-4 border-gray-950 dark:bg-gray-950 dark:border-gray-800 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] rounded-none relative overflow-hidden group h-full flex flex-col">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 border-l-8 border-emerald-500/20 -ml-16 -mt-16 pointer-events-none"></div>

                    <div className="relative p-8 px-6 md:px-8 flex-1 flex flex-col">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b-2 border-gray-100 dark:border-gray-800 pb-6">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-gray-900 border-2 border-white/20 text-emerald-500 rounded-none">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 dark:text-white text-xl lg:text-3xl tracking-tighter uppercase leading-none mb-1">ACADEMIC ACTIVITY</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">MONTHLY SESSIONS TRACKING</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 min-h-[350px] w-full" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="#eee" opacity={0.5} />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={{ strokeWidth: 2 }}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: '900', fill: '#666' }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={{ strokeWidth: 2 }}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: '900', fill: '#666' }}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#000', strokeWidth: 2 }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-gray-950 border-2 border-white/20 p-5 shadow-2xl rounded-none min-w-[200px]">
                                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4 border-b border-white/10 pb-2">{label}</p>
                                                        <div className="space-y-3">
                                                            {payload.map((entry: any, index: number) => (
                                                                <div key={index} className="flex items-center justify-between gap-6">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-3 h-3 border-2 border-white/20" style={{ backgroundColor: entry.color }}></div>
                                                                        <span className="text-[10px] font-black text-white/60 tracking-wider uppercase">{entry.name}</span>
                                                                    </div>
                                                                    <span className="text-sm font-black text-white tabular-nums">{entry.value}</span>
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
                                        type="step"
                                        dataKey="completed"
                                        name="COMPLETED"
                                        stroke="#10B981"
                                        strokeWidth={4}
                                        fillOpacity={0.1}
                                        fill="#10B981"
                                        isAnimationActive={false}
                                    />
                                    <Area
                                        type="step"
                                        dataKey="sessions"
                                        name="SCHEDULED"
                                        stroke="#3B82F6"
                                        strokeWidth={2}
                                        fillOpacity={0.05}
                                        fill="#3B82F6"
                                        strokeDasharray="6 4"
                                        isAnimationActive={false}
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

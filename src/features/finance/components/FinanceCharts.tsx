
import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, RadialBarChart, RadialBar } from 'recharts';
import { Calendar, Filter } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface MonthlyData {
    month: string;
    income: number;
    expense: number;
}

interface PieData {
    name: string;
    value: number;
    fill: string;
}

interface FinanceChartsProps {
    monthlyData: MonthlyData[];
    pieData: PieData[];
    totalExpenses: number;
}

export const FinanceCharts: React.FC<FinanceChartsProps> = ({ monthlyData, pieData, totalExpenses }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-xl relative overflow-hidden group">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center dark:border-gray-800">
                    <h2 className="text-lg font-black text-gray-800 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30">
                            <Calendar size={20} className="text-emerald-500" />
                        </div>
                        تحليل الإيرادات والمصروفات
                    </h2>
                </div>

                <div className="p-6 pt-2 h-80 relative z-10 flex-1" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} opacity={0.3} />
                            <XAxis
                                dataKey="month"
                                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }}
                                axisLine={false}
                                tickLine={false}
                                dy={15}
                            />
                            <YAxis
                                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                                tickFormatter={(value) => `${value / 1000}k`}
                            />
                            <Tooltip
                                cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '5 5' }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length >= 2) {
                                        const income = payload[0].value as number;
                                        const expense = payload[1].value as number;
                                        const net = income - expense;
                                        const profitMargin = income > 0 ? ((net / income) * 100).toFixed(0) : 0;

                                        return (
                                            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-200 dark:border-gray-700 p-0 shadow-2xl min-w-[180px] rounded-none overflow-hidden" dir="rtl">
                                                <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                                    <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">{label}</p>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400">الإيرادات</span>
                                                        </div>
                                                        <span className="font-black font-mono text-gray-900 dark:text-white text-sm">
                                                            {income.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                                            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400">المصروفات</span>
                                                        </div>
                                                        <span className="font-black font-mono text-gray-900 dark:text-white text-sm">
                                                            {expense.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="pt-3 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-transparent -mx-4 px-4 -mb-4 py-3">
                                                        <div>
                                                            <p className="text-[8px] font-black text-gray-400 uppercase leading-none mb-1">صافي الربح</p>
                                                            <p className={cn(
                                                                "text-sm font-black font-mono leading-none",
                                                                net >= 0 ? "text-emerald-600" : "text-rose-600"
                                                            )}>
                                                                {net.toLocaleString()} <span className="text-[9px]">ج.م</span>
                                                            </p>
                                                        </div>
                                                        <div className={cn(
                                                            "px-2 py-1 text-[10px] font-black rounded-none",
                                                            net >= 0 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30" : "bg-rose-50 text-rose-600 dark:bg-rose-900/30"
                                                        )}>
                                                            %{profitMargin}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="income"
                                name="الإيرادات"
                                stroke="#10B981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorIncome)"
                                animationDuration={2000}
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="expense"
                                name="المصروفات"
                                stroke="#EF4444"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorExpense)"
                                animationDuration={2000}
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#EF4444' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Expense Distribution Radial Chart */}
            <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-xl relative overflow-hidden group flex flex-col p-6 h-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-black text-gray-800 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-rose-50 dark:bg-rose-900/30">
                            <Filter size={20} className="text-rose-500" />
                        </div>
                        ميزان توزيع المصروفات
                    </h2>
                </div>

                <div className="flex-1 flex flex-col items-center">
                    <div className="h-52 w-full relative" dir="ltr">
                        {pieData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="15%"
                                        outerRadius="100%"
                                        barSize={12}
                                        data={pieData}
                                        startAngle={90}
                                        endAngle={450}
                                    >
                                        <RadialBar
                                            background
                                            dataKey="value"
                                            cornerRadius={10}
                                            animationDuration={1500}
                                        />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-white/95 backdrop-blur-xl border border-gray-200 p-3 shadow-2xl dark:bg-gray-900/95 dark:border-gray-700 min-w-[150px] border-r-4 border-r-rose-500 rounded-none shadow-rose-500/10" dir="rtl">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">{data.name}</p>
                                                            <p className="text-sm font-black text-gray-900 dark:text-white font-mono">{data.value.toLocaleString()} <span className="text-[10px] opacity-50">ج.م</span></p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center rounded-full bg-white/40 dark:bg-gray-900/40 backdrop-blur-md w-16 h-16 flex flex-col items-center justify-center border border-gray-100/50 dark:border-gray-800/50">
                                        <span className="block text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">الإجمالي</span>
                                        <span className="block text-sm font-black text-gray-900 dark:text-white tracking-tighter">{totalExpenses.toLocaleString()}</span>
                                        <span className="block text-[7px] font-black text-gray-400 mt-0.5">ج.م</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <Filter size={48} className="mb-2 opacity-10" />
                                <p className="text-xs font-black uppercase tracking-widest text-gray-300">لا توجد بيانات للعرض</p>
                            </div>
                        )}
                    </div>

                    {/* Premium Horizontal Legend - UPDATED COMPACT SIZE */}
                    <div className="flex flex-wrap justify-center gap-3 w-full mt-6">
                        {pieData.sort((a, b) => b.value - a.value).map((entry) => (
                            <div
                                key={entry.name}
                                className="flex flex-col items-center gap-1 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 border-b-[3px] transition-all hover:bg-white dark:hover:bg-gray-800 shadow-sm min-w-[100px]"
                                style={{ borderBottomColor: entry.fill }}
                            >
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter text-center">{entry.name}</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-black text-gray-900 dark:text-white font-mono leading-none">
                                        %{totalExpenses > 0 ? ((entry.value / totalExpenses) * 100).toFixed(0) : '0'}
                                    </span>
                                </div>
                                <div className="w-full h-0.5 bg-gray-100 dark:bg-gray-700 mt-1 opacity-20"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

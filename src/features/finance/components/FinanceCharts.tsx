import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Filter, PieChart as PieChartIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface MonthlyData {
    month: string;
    income: number;
    expense: number;
}

interface PieData {
    name: string;
    value: number;
}

interface FinanceChartsProps {
    monthlyData: MonthlyData[];
    pieData: PieData[];
    totalExpenses: number;
}

const PIE_COLORS = [
    '#5c59f2', // Indigo 
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
];

export const FinanceCharts = ({ monthlyData, pieData, totalExpenses }: FinanceChartsProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 md:px-6 mb-8" dir="rtl">
            {/* Area Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#eef2ff] dark:bg-indigo-900/30 text-[#5c59f2] flex items-center justify-center rounded-xl">
                            <Calendar size={16} />
                        </div>
                        <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">تحليل التدفق النقدي</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase">إيرادات</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-rose-500 rounded-full" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase">مصروفات</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 h-[300px]" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} dx={-10} tickFormatter={(value) => `${value / 1000}k`} />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const income = payload[0].value as number;
                                        const expense = payload[1]?.value as number || 0;
                                        return (
                                            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-xl min-w-[140px]" dir="rtl">
                                                <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase">{label}</p>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between gap-4"><span className="text-[10px] font-bold text-emerald-500 uppercase">إيرادات</span><span className="text-xs font-black">+{income.toLocaleString()}</span></div>
                                                    <div className="flex justify-between gap-4"><span className="text-[10px] font-bold text-rose-500 uppercase">مصروفات</span><span className="text-xs font-black">-{expense.toLocaleString()}</span></div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                            <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-50 dark:border-slate-800">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-3 uppercase tracking-tight">
                        <div className="w-8 h-8 bg-rose-50 text-rose-500 flex items-center justify-center rounded-xl">
                            <PieChartIcon size={16} />
                        </div>
                        هيكلية المصاريف
                    </h2>
                </div>

                <div className="flex-1 p-4 flex flex-col items-center justify-center">
                    <div className="h-48 w-full relative" dir="ltr">
                        {pieData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                                            {pieData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="currentColor" className="text-white dark:text-slate-900" strokeWidth={2} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg border border-white/10 shadow-xl" dir="rtl">
                                                        <p className="text-[10px] font-bold uppercase">{data.name}</p>
                                                        <p className="text-xs font-black">{data.value.toLocaleString()} ج.م</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <span className="block text-[8px] font-bold text-slate-400 uppercase">الإجمالي</span>
                                        <span className="block text-sm font-black text-slate-800 dark:text-white">{totalExpenses.toLocaleString()}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-30">
                                <Filter size={32} className="text-slate-400 mb-2" />
                                <p className="text-[10px] font-bold uppercase">لا بيانات</p>
                            </div>
                        )}
                    </div>

                    <div className="w-full mt-4 space-y-1.5">
                        {pieData.sort((a, b) => b.value - a.value).slice(0, 3).map((entry, index) => (
                            <div key={entry.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{entry.name}</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-800 dark:text-white">{((entry.value / totalExpenses) * 100).toFixed(0)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
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
}

interface FinanceChartsProps {
    monthlyData: MonthlyData[];
    pieData: PieData[];
    totalExpenses: number;
}

// Custom Watermelon inspired palette for pie categories
const PIE_COLORS = [
    '#EF4444', // Red (Expenses base)
    '#F43F5E', // Rose
    '#FB7185', // Soft Rose
    '#FDA4AF', // Very Soft Rose
    '#FECDD3', // Pale Rose
];

export const FinanceCharts: React.FC<FinanceChartsProps> = ({ monthlyData, pieData, totalExpenses }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Area Chart - Main Trends */}
            <div className="lg:col-span-2 bg-white border-2 border-gray-900 dark:bg-gray-950 dark:border-gray-800 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] relative overflow-hidden group">
                <div className="p-6 border-b-4 border-gray-900 flex justify-between items-center dark:border-gray-800">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-emerald-600 text-white border-2 border-gray-950 shadow-[4px_4px_0px_0px_black]">
                            <Calendar size={20} />
                        </div>
                        تحليل التدفقات النقدية (إيرادات vs مصروفات)
                    </h2>
                </div>

                <div className="p-8 pt-4 h-[400px] relative z-10" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#000" vertical={false} opacity={0.05} />
                            <XAxis
                                dataKey="month"
                                tick={{ fill: '#000', fontSize: 10, fontWeight: 900 }}
                                axisLine={false}
                                tickLine={false}
                                dy={15}
                            />
                            <YAxis
                                tick={{ fill: '#000', fontSize: 10, fontWeight: 900 }}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                                tickFormatter={(value) => `${value / 1000}k`}
                            />
                            <Tooltip
                                cursor={{ stroke: '#000', strokeWidth: 2, strokeDasharray: '5 5' }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length >= 2) {
                                        const income = payload[0].value as number;
                                        const expense = payload[1].value as number;
                                        const net = income - expense;
                                        const profitMargin = income > 0 ? ((net / income) * 100).toFixed(0) : 0;

                                        return (
                                            <div className="bg-white border-4 border-gray-950 p-0 shadow-[8px_8px_0px_0px_black] min-w-[200px] dark:bg-gray-950" dir="rtl">
                                                <div className="bg-gray-900 px-4 py-2 border-b-4 border-gray-950">
                                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">{label}</p>
                                                </div>
                                                <div className="p-4 space-y-4">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 bg-emerald-500 border-2 border-gray-950"></div>
                                                            <span className="text-xs font-black text-gray-500">الإيرادات</span>
                                                        </div>
                                                        <span className="font-black text-gray-950 dark:text-white text-base">
                                                            {income.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 bg-rose-500 border-2 border-gray-950"></div>
                                                            <span className="text-xs font-black text-gray-500">المصروفات</span>
                                                        </div>
                                                        <span className="font-black text-gray-950 dark:text-white text-base">
                                                            {expense.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="pt-3 border-t-2 border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900 -mx-4 px-4 -mb-4 py-3">
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">صافي الربح</p>
                                                            <p className={cn(
                                                                "text-lg font-black tracking-tighter",
                                                                net >= 0 ? "text-emerald-600" : "text-rose-600"
                                                            )}>
                                                                {net.toLocaleString()} <span className="text-[10px]">ج.م</span>
                                                            </p>
                                                        </div>
                                                        <div className={cn(
                                                            "px-2 py-1 text-[11px] font-black border-2",
                                                            net >= 0 ? "bg-emerald-50 text-emerald-600 border-emerald-500" : "bg-rose-50 text-rose-600 border-rose-500"
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
                                stroke="#10B981"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorIncome)"
                                activeDot={{ r: 8, strokeWidth: 4, stroke: '#FFF', fill: '#10B981' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="expense"
                                stroke="#EF4444"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorExpense)"
                                activeDot={{ r: 8, strokeWidth: 4, stroke: '#FFF', fill: '#EF4444' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Infographic Pie Chart - Expense Distribution */}
            <div className="bg-white border-2 border-gray-900 dark:bg-gray-950 dark:border-gray-800 shadow-[10px_10px_0px_0px_black] dark:shadow-[10px_10px_0px_0px_white] relative overflow-hidden group flex flex-col p-8">
                <div className="flex justify-between items-center mb-8 border-b-4 border-gray-900 pb-4 dark:border-gray-800">
                    <h2 className="text-xl font-black text-gray-950 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-rose-600 text-white border-2 border-gray-950 shadow-[4px_4px_0px_0px_black]">
                            <DonutIcon size={20} />
                        </div>
                        توزيع المصروفات
                    </h2>
                </div>

                <div className="flex-1 flex flex-col items-center">
                    <div className="h-64 w-full relative" dir="ltr">
                        {pieData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={95}
                                            paddingAngle={8}
                                            dataKey="value"
                                            animationDuration={1500}
                                        >
                                            {pieData.map((_, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={PIE_COLORS[index % PIE_COLORS.length]} 
                                                    stroke="#000" 
                                                    strokeWidth={2}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-white border-4 border-gray-950 p-3 shadow-[6px_6px_0px_0px_black] dark:bg-gray-950 min-w-[160px]" dir="rtl">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{data.name}</p>
                                                            <p className="text-lg font-black text-gray-950 dark:text-white">{data.value.toLocaleString()} <span className="text-xs opacity-50 font-normal">ج.م</span></p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">إجمالي التكاليف</span>
                                        <span className="block text-2xl font-black text-gray-950 dark:text-white tracking-tighter leading-none">{totalExpenses.toLocaleString()}</span>
                                        <span className="block text-[9px] font-black text-gray-950 dark:text-white mt-1 uppercase">ج.م</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <Filter size={48} className="mb-2 opacity-10" />
                                <p className="text-xs font-black uppercase tracking-widest text-gray-300">لا توجد سجلات مالية</p>
                            </div>
                        )}
                    </div>

                    {/* Premium Legend List */}
                    <div className="w-full mt-10 space-y-3" dir="rtl">
                        {pieData.sort((a, b) => b.value - a.value).slice(0, 5).map((entry, index) => (
                            <div key={entry.name} className="flex items-center justify-between p-3 bg-gray-50 border-2 border-gray-100 dark:bg-gray-900 dark:border-gray-800 transition-all hover:border-gray-950">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-4 h-4 border-2 border-gray-950"
                                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                                    ></div>
                                    <span className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tighter">{entry.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black text-gray-500">%{((entry.value / totalExpenses) * 100).toFixed(0)}</span>
                                    <span className="text-sm font-black text-gray-950 dark:text-white tabular-nums">{entry.value.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DonutIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

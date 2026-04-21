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

// Premium color palette
const PIE_COLORS = [
    '#5c59f2', // Indigo 
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
];

export const FinanceCharts = ({ monthlyData, pieData, totalExpenses }: FinanceChartsProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" dir="rtl">
            {/* Area Chart - Cash Flow */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm relative overflow-hidden group">
                <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-3 italic uppercase tracking-tighter">
                        <div className="w-10 h-10 bg-[#5c59f2] text-white flex items-center justify-center shadow-lg">
                            <Calendar size={20} />
                        </div>
                        تحليل التدفق النقدي
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                            <span className="text-[10px] font-black text-slate-400 uppercase">إيرادات</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-rose-500 rounded-full" />
                            <span className="text-[10px] font-black text-slate-400 uppercase">مصروفات</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 h-[400px]" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="month"
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                                tickFormatter={(value) => `${value / 1000}k`}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length >= 2) {
                                        const income = payload[0].value as number;
                                        const expense = payload[1].value as number;
                                        const net = income - expense;

                                        return (
                                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0 shadow-2xl min-w-[220px]" dir="rtl">
                                                <div className="bg-slate-900 px-4 py-2 border-b border-white/5">
                                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">{label}</p>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase">الإيرادات</span>
                                                        <span className="text-sm font-black text-emerald-500 tabular-nums">+{income.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase">المصروفات</span>
                                                        <span className="text-sm font-black text-rose-500 tabular-nums">-{expense.toLocaleString()}</span>
                                                    </div>
                                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] font-black text-slate-800 dark:text-white uppercase italic">صافي التدفق</span>
                                                            <span className={cn(
                                                                "text-base font-black tabular-nums",
                                                                net >= 0 ? "text-emerald-500" : "text-rose-500"
                                                            )}>
                                                                {net.toLocaleString()} ج.م
                                                            </span>
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
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="expense"
                                stroke="#EF4444"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorExpense)"
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#EF4444' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pie Chart - Expense Structure */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-3 italic uppercase tracking-tighter">
                        <div className="w-10 h-10 bg-rose-500 text-white flex items-center justify-center shadow-lg">
                            <PieChartIcon size={20} />
                        </div>
                        هيكلية المصاريف
                    </h2>
                </div>

                <div className="flex-1 p-6 flex flex-col items-center">
                    <div className="h-64 w-full relative" dir="ltr">
                        {pieData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={95}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {pieData.map((_, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={PIE_COLORS[index % PIE_COLORS.length]} 
                                                    stroke="currentColor" 
                                                    className="text-white dark:text-slate-900"
                                                    strokeWidth={2}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-slate-900 text-white px-4 py-2 border border-white/10 shadow-2xl min-w-[140px]" dir="rtl">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{data.name}</p>
                                                            <p className="text-sm font-black italic">{data.value.toLocaleString()} ج.م</p>
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
                                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">الإجمالي</span>
                                        <span className="block text-2xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">{totalExpenses.toLocaleString()}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center">
                                <Filter size={40} className="text-slate-200 mb-2" />
                                <p className="text-[10px] font-black uppercase text-slate-300">لا توجد سجلات</p>
                            </div>
                        )}
                    </div>

                    {/* Modernized Legend */}
                    <div className="w-full mt-6 space-y-2 border-t border-slate-50 dark:border-slate-800 pt-6">
                        {pieData.sort((a, b) => b.value - a.value).slice(0, 4).map((entry, index) => (
                            <div key={entry.name} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                                    ></div>
                                    <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                        {entry.name}
                                    </span>
                                </div>
                                <span className="text-[11px] font-black text-slate-800 dark:text-white tabular-nums">
                                    {((entry.value / totalExpenses) * 100).toFixed(0)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

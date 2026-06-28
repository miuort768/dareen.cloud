import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Filter, PieChart as PieChartIcon, TrendingUp, TrendingDown } from 'lucide-react';

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
    reportCurrency?: string;
}

const PIE_COLORS = [
    '#6366f1', // Indigo 
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
];

// Custom Tooltip for Area Chart
const AreaTooltip = ({ active, payload, label, reportCurrency = 'KWD' }: { active?: boolean; payload?: { name?: string; value: number; color?: string }[]; label?: string; reportCurrency?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-sm border border-white/10 text-right min-w-[150px]" dir="rtl">
                <p className="text-[10px] font-medium text-slate-400 uppercase mb-2 pb-1 border-b border-white/10">{label}</p>
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <TrendingUp size={10} className="text-emerald-400" />
                            <span className="text-[10px] font-medium text-slate-400 uppercase">إيرادات</span>
                        </div>
                            <span className="text-sm font-medium font-mono">+{payload[0].value.toLocaleString()} {reportCurrency}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <TrendingDown size={10} className="text-rose-400" />
                                <span className="text-[10px] font-medium text-slate-400 uppercase">مصروفات</span>
                            </div>
                            <span className="text-sm font-medium font-mono">-{payload[1]?.value.toLocaleString() || 0} {reportCurrency}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export const FinanceCharts = ({ monthlyData, pieData, totalExpenses, reportCurrency = 'KWD' }: FinanceChartsProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-0" dir="rtl">
            
            {/* ── Area Chart ── */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/40">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#6C4BFF12', color: '#6C4BFF' }}>
                            <Calendar size={15} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-800 dark:text-white uppercase tracking-widest">تحليل التدفق النقدي</p>
                            <p className="text-[9px] text-slate-400 font-normal mt-0.5">مقارنة شهرية للإيرادات والمصاريف</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-0.5 bg-emerald-500 rounded-full" />
                            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">إيرادات</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-0.5 bg-rose-500 rounded-full" />
                            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">مصروفات</span>
                        </div>
                    </div>
                </div>

                <div className="p-5 h-[320px] flex-1" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.12} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} />
                            <Tooltip content={<AreaTooltip reportCurrency={reportCurrency} />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Area type="monotone" dataKey="income" name="إيرادات" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" activeDot={{ r: 5, strokeWidth: 2 }} />
                            <Area type="monotone" dataKey="expense" name="مصروفات" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpense)" activeDot={{ r: 5, strokeWidth: 2 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Pie Chart ── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/40">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#6C4BFF12', color: '#6C4BFF' }}>
                        <PieChartIcon size={15} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-800 dark:text-white uppercase tracking-widest">هيكلية المصاريف</p>
                        <p className="text-[9px] text-slate-400 font-normal mt-0.5">توزيع النفقات حسب الفئة</p>
                    </div>
                </div>

                <div className="flex-1 p-5 flex flex-col items-center justify-center">
                    <div className="h-48 w-full relative" dir="ltr">
                        {pieData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                                            {pieData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="transparent" />
                                            ))}
                                        </Pie>
                                        <Tooltip content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl border border-white/10 shadow-sm text-right" dir="rtl">
                                                        <p className="text-[9px] font-medium uppercase text-slate-400 mb-1">{data.name}</p>
                                                        <p className="text-sm font-medium font-mono">{data.value.toLocaleString()} <span className="text-[9px] text-slate-400">{reportCurrency}</span></p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">الإجمالي</p>
                                    <p className="text-lg font-medium text-slate-800 dark:text-white font-mono leading-none">{totalExpenses.toLocaleString()}</p>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-20">
                                <Filter size={32} className="text-slate-400 mb-2" />
                                <p className="text-[10px] font-medium uppercase">لا توجد بيانات</p>
                            </div>
                        )}
                    </div>

                    {/* Legend */}
                    <div className="w-full mt-6 space-y-2">
                        {pieData.sort((a, b) => b.value - a.value).slice(0, 4).map((entry, index) => (
                            <div key={entry.name} className="flex items-center justify-between group">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                                    <span className="text-[10px] font-normal text-slate-600 dark:text-slate-400 truncate max-w-[100px]">{entry.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-medium text-slate-800 dark:text-white font-mono">{entry.value.toLocaleString()}</span>
                                    <span className="text-[9px] font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-lg text-slate-500">{reportCurrency} 
                                        {((entry.value / totalExpenses) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

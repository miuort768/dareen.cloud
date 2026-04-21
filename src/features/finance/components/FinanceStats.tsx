import { DollarSign, TrendingDown, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';

interface FinanceStatsProps {
    totalIncome: number;
    monthIncome: number;
    totalExpenses: number;
    monthExpenses: number;
    totalFixedExpenses: number;
    netProfit: number;
    monthProfit: number;
}

export const FinanceStats = ({
    totalIncome,
    monthIncome,
    totalExpenses,
    monthExpenses,
    totalFixedExpenses,
    netProfit,
    // monthProfit is available if needed
}: FinanceStatsProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" dir="rtl">
            {/* Total Income Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-none relative overflow-hidden group shadow-sm transition-all hover:shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-full bg-emerald-500/5 -skew-x-12 transform translate-x-12 pointer-events-none transition-transform group-hover:translate-x-8"></div>
                <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shadow-sm">
                        <TrendingUp size={20} />
                    </div>
                    <div className="text-emerald-500 flex items-center gap-1">
                        <ArrowUpRight size={14} />
                        <span className="text-[10px] font-black uppercase">نشط</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">إيرادات الوارد</p>
                    <div className="flex items-baseline gap-2">
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter">{totalIncome.toLocaleString()}</h3>
                         <span className="text-[10px] font-black text-slate-400 uppercase">ج.م</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">إجمالي التحصيل المالي</span>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 text-[9px] font-black text-emerald-600 tabular-nums">
                        +{monthIncome.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Teacher Expenses Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-none relative overflow-hidden group shadow-sm transition-all hover:shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-full bg-rose-500/5 -skew-x-12 transform translate-x-12 pointer-events-none transition-transform group-hover:translate-x-8"></div>
                <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center shadow-sm">
                        <TrendingDown size={20} />
                    </div>
                    <div className="text-rose-500 flex items-center gap-1">
                        <ArrowDownRight size={14} />
                        <span className="text-[10px] font-black uppercase">جارية</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">مستحقات المعلمات</p>
                    <div className="flex items-baseline gap-2">
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter">{totalExpenses.toLocaleString()}</h3>
                         <span className="text-[10px] font-black text-slate-400 uppercase">ج.م</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">إجمالي المدفوع للطاقم</span>
                    <div className="bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 text-[9px] font-black text-rose-600 tabular-nums">
                        -{monthExpenses.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Fixed Expenses Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-none relative overflow-hidden group shadow-sm transition-all hover:shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-full bg-[#5c59f2]/5 -skew-x-12 transform translate-x-12 pointer-events-none transition-transform group-hover:translate-x-8"></div>
                <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-[#5c59f2] flex items-center justify-center shadow-sm">
                        <Wallet size={20} />
                    </div>
                    <div className="text-[#5c59f2] flex items-center gap-1">
                        <Zap size={14} />
                        <span className="text-[10px] font-black uppercase">ثابتة</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">المصروفات التشغيلية</p>
                    <div className="flex items-baseline gap-2">
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter">{totalFixedExpenses.toLocaleString()}</h3>
                         <span className="text-[10px] font-black text-slate-400 uppercase">ج.م</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">إدارة المرافق والخدمات</span>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 text-[9px] font-black text-[#5c59f2]">
                        شهري
                    </div>
                </div>
            </div>

            {/* Net Profit Card */}
            <div className="bg-slate-900 text-white p-6 rounded-none relative overflow-hidden group shadow-2xl transition-all hover:-translate-y-1 border-r-4 border-emerald-500">
                <div className="absolute top-0 left-0 w-32 h-full bg-emerald-500/5 rotate-12 -translate-x-16 pointer-events-none"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="w-10 h-10 bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 rotate-3">
                        <DollarSign size={20} />
                    </div>
                    <div className="bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-[2px] animate-pulse">
                         رؤية الأرباح
                    </div>
                </div>
                <div className="space-y-1 relative z-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">صافي الربح المتراكم</p>
                    <div className="flex items-baseline gap-2">
                         <h3 className="text-3xl font-black text-white tabular-nums tracking-tighter leading-none italic">{netProfit.toLocaleString()}</h3>
                         <span className="text-[10px] font-black text-emerald-500 uppercase">ج.م</span>
                    </div>
                </div>
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight italic">الأداء المالي الإجمالي</span>
                    <div className="flex items-center gap-1 text-emerald-400">
                        <TrendingUp size={12} />
                        <span className="text-[10px] font-black tabular-nums">P/L</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

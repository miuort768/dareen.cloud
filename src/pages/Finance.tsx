import { DollarSign, TrendingUp, Search, Filter, Calendar, CalendarCheck, Download, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Skeleton } from '../shared/components/Skeleton';
import { TransactionsLog } from '../features/finance/components/TransactionsLog';
import { FinanceCharts } from '../features/finance/components/FinanceCharts';
import { AddTransactionModal } from '../features/finance/components/AddTransactionModal';
import { FixedExpensesManager } from '../features/finance/components/FixedExpensesManager';
import { useFinance } from '../features/finance/hooks/useFinance';
import { useNavigate } from 'react-router-dom';

export const Finance = () => {
    const { state, actions } = useFinance();
    const navigate = useNavigate();

    if (state.loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-48 rounded-none" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-none" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-96 rounded-none" />
                    <Skeleton className="h-96 rounded-none" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-40">
            {/* Premium Brutalist Header */}
            <div className="relative bg-white border-4 border-gray-950 p-8 shadow-[12px_12px_0px_0px_black] overflow-hidden mb-8 rounded-none">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 2px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                <div className="absolute top-0 right-0 w-48 h-full bg-primary-600/5 -skew-x-12 transform translate-x-24 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-2 border-b-4 border-gray-950 pb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-primary-600 text-white border-4 border-gray-950 flex items-center justify-center transform -rotate-3 shadow-[6px_6px_0px_0px_black] relative">
                             <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 border-2 border-gray-950"></div>
                            <DollarSign size={40} strokeWidth={3} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={14} className="text-amber-500" />
                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] italic">نظام الرقابة المالية المتكامل</span>
                            </div>
                            <h1 className="text-2xl md:text-5xl font-black text-gray-950 tracking-tighter uppercase leading-none">الإدارة المالية والحسابات</h1>
                            <div className="mt-4 flex flex-wrap gap-3">
                                <div className="bg-gray-950 text-white px-4 py-1.5 text-[11px] font-black uppercase tracking-widest border-2 border-gray-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
                                    هامش الربح: {state.profitMargin}%
                                </div>
                                <div className="bg-emerald-50 text-emerald-700 border-2 border-emerald-600 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest">
                                    مركز التقارير النشط
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 no-print">
                        <button
                            onClick={() => navigate('/monthly-closing')}
                            className="group flex items-center justify-center gap-3 px-6 py-4 bg-gray-950 text-white font-black text-sm border-4 border-gray-950 shadow-[6px_6px_0px_0px_#444] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all h-14 uppercase tracking-widest"
                        >
                            <CalendarCheck size={20} /> تقفيل وتسويات الشهر
                        </button>
                        
                        <button
                            onClick={() => actions.setShowAddModal(true)}
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-primary-600 text-white font-black text-sm border-4 border-gray-950 shadow-[6px_6px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all h-14 uppercase tracking-widest"
                        >
                            <TrendingUp size={20} /> تسجيل معاملة مالية
                        </button>

                        <button
                            onClick={() => alert('ميزة التصدير ستكون متاحة قريباً')}
                            className="p-4 bg-white text-gray-950 border-4 border-gray-950 shadow-[4px_4px_0px_0px_black] hover:bg-gray-50 transition-all h-14 flex items-center justify-center"
                        >
                            <Download size={22} />
                        </button>
                    </div>
                </div>

                {/* Heavy Brutalist Stats inside Header */}
                <div className="relative z-10 mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Income */}
                    <div className="bg-emerald-50 border-4 border-gray-950 p-6 flex flex-col justify-between group hover:bg-emerald-100 transition-colors shadow-[6px_6px_0px_0px_black] relative overflow-hidden">
                        <div className="absolute top-2 left-2 text-emerald-200">
                             <ArrowUpRight size={40} strokeWidth={4} />
                        </div>
                        <p className="text-emerald-700 text-xs font-black uppercase mb-4 tracking-widest border-b-2 border-emerald-200 pb-2 italic">إجمالي التدفقات الواردة</p>
                        <div className="flex items-end gap-2">
                             <p className="text-gray-950 text-3xl md:text-4xl font-black tabular-nums tracking-tighter leading-none">{state.totalIncome.toLocaleString()}</p>
                             <span className="text-xs font-black text-gray-500 mb-1 italic">ج.م</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 bg-white/50 border-t-2 border-emerald-200 pt-2">
                            <span className="text-[10px] font-black text-emerald-800 uppercase italic">هذا الشهر: {state.monthIncome.toLocaleString()} ج.م</span>
                        </div>
                    </div>

                    {/* Teacher Expenses */}
                    <div className="bg-rose-50 border-4 border-gray-950 p-6 flex flex-col justify-between group hover:bg-rose-100 transition-colors shadow-[6px_6px_0px_0px_black] relative overflow-hidden">
                        <div className="absolute top-2 left-2 text-rose-200">
                             <ArrowDownRight size={40} strokeWidth={4} />
                        </div>
                        <p className="text-rose-700 text-xs font-black uppercase mb-4 tracking-widest border-b-2 border-rose-200 pb-2 italic">مستحقات المعلمات</p>
                        <div className="flex items-end gap-2">
                             <p className="text-gray-950 text-3xl md:text-4xl font-black tabular-nums tracking-tighter leading-none">{state.totalExpenses.toLocaleString()}</p>
                             <span className="text-xs font-black text-gray-500 mb-1 italic">ج.م</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 bg-white/50 border-t-2 border-rose-200 pt-2">
                            <span className="text-[10px] font-black text-rose-800 uppercase italic">هذا الشهر: {state.monthExpenses.toLocaleString()} ج.م</span>
                        </div>
                    </div>

                    {/* Fixed Expenses */}
                    <div className="bg-amber-50 border-4 border-gray-950 p-6 flex flex-col justify-between group hover:bg-amber-100 transition-colors shadow-[6px_6px_0px_0px_black] relative overflow-hidden">
                        <div className="absolute top-2 left-2 text-amber-200">
                             <DollarSign size={40} strokeWidth={4} />
                        </div>
                        <p className="text-amber-700 text-xs font-black uppercase mb-4 tracking-widest border-b-2 border-amber-200 pb-2 italic">مصروفات الإدارة والتشغيل</p>
                        <div className="flex items-end gap-2">
                             <p className="text-gray-950 text-3xl md:text-4xl font-black tabular-nums tracking-tighter leading-none">{state.totalFixedExpenses.toLocaleString()}</p>
                             <span className="text-xs font-black text-gray-500 mb-1 italic">ج.م</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 bg-white/50 border-t-2 border-amber-200 pt-2">
                            <span className="text-[10px] font-black text-amber-800 uppercase italic">إجمالي المصاريف الثابتة</span>
                        </div>
                    </div>

                    {/* Net Profit */}
                    <div className="bg-gray-950 border-4 border-gray-950 p-6 flex flex-col justify-between group shadow-[6px_6px_0px_0px_black] relative overflow-hidden">
                        <div className="absolute top-2 left-2 text-white/10">
                             <TrendingUp size={40} strokeWidth={4} />
                        </div>
                        <p className="text-emerald-400 text-xs font-black uppercase mb-4 tracking-widest border-b-2 border-white/10 pb-2 italic">صافي الأرباح الصافية</p>
                        <div className="flex items-end gap-2">
                             <p className="text-white text-3xl md:text-5xl font-black tabular-nums tracking-tighter leading-none italic">{state.netProfit.toLocaleString()}</p>
                             <span className="text-xs font-black text-emerald-400/60 mb-1 uppercase">LE</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 border-t-2 border-white/10 pt-2">
                            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest leading-none">أداء ممتاز للشهر الحالي</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Expenses Panel */}
            <FixedExpensesManager
                expenses={state.fixedExpenses}
                onUpdateExpense={actions.handleUpdateFixedExpense}
                onConvertAll={actions.handleConvertAllFixedExpenses}
                onClearAll={actions.handleClearAllFixedExpenses}
            />

            {/* Charts Section */}
            <FinanceCharts
                monthlyData={state.monthlyData}
                pieData={state.pieData}
                totalExpenses={state.totalExpenses}
            />

            {/* Premium Brutalist Filters */}
            <div className="bg-white border-4 border-gray-950 p-8 shadow-[8px_8px_0px_0px_black] mb-8">
                 <div className="flex items-center gap-3 mb-6 border-b-4 border-gray-950 pb-4">
                    <div className="w-10 h-10 bg-gray-950 text-white flex items-center justify-center border-2 border-gray-950 shadow-[2px_2px_0px_0px_black]">
                        <Search size={20} />
                    </div>
                    <h3 className="text-xl font-black text-gray-950 uppercase tracking-tighter italic">فلترة وتعقب المعاملات</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Search */}
                    <div className="relative group">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1 italic">كلمة البحث</label>
                        <Search className="absolute right-4 top-[46px] text-gray-950 w-5 h-5 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="ابحث في المعاملات..."
                            value={state.searchTerm}
                            onChange={(e) => actions.setSearchTerm(e.target.value)}
                            className="w-full pl-6 pr-14 py-4 border-4 border-gray-950 focus:outline-none focus:bg-white text-base font-black rounded-none bg-gray-50 transition-all shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] uppercase tracking-tight"
                        />
                    </div>

                    {/* Type Filter */}
                    <div className="relative">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1 italic">نوع العملية</label>
                        <Filter className="absolute right-4 top-[46px] text-gray-950 w-5 h-5 pointer-events-none" />
                        <select
                            value={state.filterType}
                            onChange={(e) => actions.setFilterType(e.target.value as 'all' | 'income' | 'expense')}
                            className="w-full pl-6 pr-14 py-4 border-4 border-gray-950 focus:outline-none bg-gray-50 font-black text-base appearance-none cursor-pointer rounded-none"
                        >
                            <option value="all">جميع المعاملات المالية</option>
                            <option value="income">إيرادات التدفق 🟢</option>
                            <option value="expense">مصروفات وتدفق خارج 🔴</option>
                        </select>
                    </div>

                    {/* Month Filter */}
                    <div className="relative">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1 italic">الفترة الزمنية</label>
                        <Calendar className="absolute right-4 top-[46px] text-gray-950 w-5 h-5 pointer-events-none" />
                        <select
                            value={state.filterMonth}
                            onChange={(e) => actions.setFilterMonth(e.target.value)}
                            className="w-full pl-6 pr-14 py-4 border-4 border-gray-950 focus:outline-none bg-gray-50 font-black text-base appearance-none cursor-pointer rounded-none font-mono"
                        >
                            <option value="all">كافة شهور السنة</option>
                            {state.uniqueMonths.map(month => (
                                <option key={month} value={month}>
                                    {new Date(month + '-01').toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <TransactionsLog
                transactions={state.filteredTransactions}
                totalCount={state.filteredTransactions.length}
                onDeleteAll={actions.handleDeleteAllTransactions}
            />

            {/* Add Transaction Modal */}
            <AddTransactionModal
                isOpen={state.showAddModal}
                onClose={() => actions.setShowAddModal(false)}
                onAdd={actions.handleAddTransaction}
            />
        </div>
    );
};

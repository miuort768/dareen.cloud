import { Search, Filter, Calendar, CalendarCheck, Download, Plus, TrendingUp } from 'lucide-react';
import { TransactionsLog } from '../features/finance/components/TransactionsLog';
import { FinanceCharts } from '../features/finance/components/FinanceCharts';
import { FinanceStats } from '../features/finance/components/FinanceStats';
import { AddTransactionModal } from '../features/finance/components/AddTransactionModal';
import { FixedExpensesManager } from '../features/finance/components/FixedExpensesManager';
import { useFinance } from '../features/finance/hooks/useFinance';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export const Finance = () => {
    const { state, actions } = useFinance();
    const navigate = useNavigate();

    if (state.loading) {
        return (
            <div className="space-y-4 p-4">
                <div className="h-24 bg-white dark:bg-slate-900 rounded-none animate-pulse" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-none animate-pulse" />)}
                </div>
                <div className="h-96 bg-white dark:bg-slate-900 rounded-none animate-pulse" />
            </div>
        );
    }

    const isProfit = state.netProfit >= 0;

    return (
        <div className="min-h-full bg-[#f1f5f9] dark:bg-[#020617] pb-20 font-sans" dir="rtl">

            {/* ── Header ── */}
            <div className="relative overflow-hidden bg-slate-950 px-4 md:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5">
                {/* Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rotate-45 translate-y-[-50%] translate-x-[30%] blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-10 w-48 h-48 bg-emerald-500/10 rotate-12 translate-y-[40%] blur-3xl pointer-events-none" />

                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-none">
                        <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                        <h1 className="text-base md:text-xl font-black text-white uppercase tracking-tighter">الإدارة المالية والحسابات</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <TrendingUp size={10} className={isProfit ? "text-emerald-400" : "text-rose-400"} />
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                isProfit ? "text-emerald-400" : "text-rose-400"
                            )}>
                                هامش الربح: {state.profitMargin}%
                            </span>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="text-[10px] text-slate-500 font-bold">مركز التقارير الموحد</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-2 no-print">
                    <button
                        onClick={() => navigate('/monthly-closing')}
                        className="flex items-center gap-2 h-9 px-4 bg-white/10 hover:bg-white/15 text-white text-[10px] font-black rounded-none border border-white/10 transition-all uppercase tracking-widest"
                    >
                        <CalendarCheck size={13} />
                        <span className="hidden sm:inline">تسوية الشهر</span>
                    </button>
                    <button
                        onClick={() => actions.setShowAddModal(true)}
                        className="flex items-center gap-2 h-9 px-4 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black rounded-none border border-amber-400/50 transition-all uppercase tracking-widest shadow-lg shadow-amber-500/20"
                    >
                        <Plus size={13} />
                        تسجيل معاملة
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/15 text-slate-300 rounded-none border border-white/10 transition-all">
                        <Download size={14} />
                    </button>
                </div>
            </div>

            <div className="py-5 space-y-4">

                {/* Stats */}
                <FinanceStats
                    totalIncome={state.totalIncome}
                    monthIncome={state.monthIncome}
                    totalExpenses={state.totalExpenses}
                    monthExpenses={state.monthExpenses}
                    totalFixedExpenses={state.totalFixedExpenses}
                    netProfit={state.netProfit}
                    monthProfit={state.monthIncome - state.monthExpenses}
                />

                {/* Fixed Expenses */}
                <FixedExpensesManager
                    expenses={state.fixedExpenses}
                    onUpdateExpense={actions.handleUpdateFixedExpense}
                    onConvertAll={actions.handleConvertAllFixedExpenses}
                    onClearAll={actions.handleClearAllFixedExpenses}
                />

                {/* Charts */}
                <FinanceCharts
                    monthlyData={state.monthlyData}
                    pieData={state.pieData}
                    totalExpenses={state.totalExpenses}
                />

                {/* Filter Bar */}
                <div className="px-0">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm overflow-hidden">
                        {/* Filter Header */}
                        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                            <div className="w-7 h-7 bg-indigo-600 rounded-none flex items-center justify-center">
                                <Search size={13} className="text-white" />
                            </div>
                            <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">محرك البحث وتعقب المعاملات</p>
                        </div>
                        {/* Filters */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Search */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">البحث</label>
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 w-3.5 h-3.5" />
                                    <input
                                        type="text"
                                        placeholder="رقم المعاملة، وصف..."
                                        value={state.searchTerm}
                                        onChange={(e) => actions.setSearchTerm(e.target.value)}
                                        className="w-full pr-9 pl-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Type Filter */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">نوع العملية</label>
                                <div className="relative">
                                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 w-3.5 h-3.5 pointer-events-none" />
                                    <select
                                        value={state.filterType}
                                        onChange={(e) => actions.setFilterType(e.target.value as 'all' | 'income' | 'expense')}
                                        className="w-full pr-9 pl-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-xs font-bold focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer transition-all"
                                    >
                                        <option value="all">كافة المعاملات</option>
                                        <option value="income">الإيرادات (+)</option>
                                        <option value="expense">المصروفات (-)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Month Filter */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">الفترة الزمنية</label>
                                <div className="relative">
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 w-3.5 h-3.5 pointer-events-none" />
                                    <select
                                        value={state.filterMonth}
                                        onChange={(e) => actions.setFilterMonth(e.target.value)}
                                        className="w-full pr-9 pl-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-xs font-bold focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer transition-all"
                                    >
                                        <option value="all">السجل الكامل</option>
                                        {state.uniqueMonths.map((month: string) => (
                                            <option key={month} value={month}>
                                                {new Date(month + '-01').toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Active filters badge */}
                        {(state.searchTerm || state.filterType !== 'all' || state.filterMonth !== 'all') && (
                            <div className="px-4 pb-3 flex items-center gap-2">
                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">نتائج الفلترة:</span>
                                <span className="text-[9px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-none">
                                    {state.filteredTransactions.length} معاملة
                                </span>
                                <button
                                    onClick={() => { actions.setSearchTerm(''); actions.setFilterType('all'); actions.setFilterMonth('all'); }}
                                    className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline mr-auto"
                                >
                                    مسح الكل ✕
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Transactions Log */}
                <div className="px-0">
                    <TransactionsLog
                        transactions={state.filteredTransactions}
                        totalCount={state.filteredTransactions.length}
                        onDeleteAll={actions.handleDeleteAllTransactions}
                    />
                </div>
            </div>

            {/* Add Transaction Modal */}
            <AddTransactionModal
                isOpen={state.showAddModal}
                onClose={() => actions.setShowAddModal(false)}
                onAdd={actions.handleAddTransaction}
            />
        </div>
    );
};

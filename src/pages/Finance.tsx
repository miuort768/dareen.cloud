import { DollarSign, TrendingUp, Search, Filter, Calendar, CalendarCheck, Download, Sparkles } from 'lucide-react';
import { TransactionsLog } from '../features/finance/components/TransactionsLog';
import { FinanceCharts } from '../features/finance/components/FinanceCharts';
import { FinanceStats } from '../features/finance/components/FinanceStats';
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
                <div className="h-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-96 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-pulse" />
                    <div className="h-96 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-40 min-h-full">
            {/* Premium Header */}
            <div className="relative group mb-8" dir="rtl">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5c59f2] to-emerald-500 rounded-none blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                
                <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10 px-4 py-6 md:px-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-tr from-[#5c59f2] to-[#7c79ff] flex items-center justify-center text-white shadow-lg rotate-2 group-hover:rotate-0 transition-transform">
                                    <DollarSign size={20} className="md:size-32" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-5 md:h-5 bg-amber-400 rounded-none border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                    <Sparkles size={6} className="md:size-[10px] text-white" />
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-indigo-50 dark:bg-indigo-900/40 text-[#5c59f2] text-[8px] md:text-[10px] font-black px-2 py-0.5 uppercase tracking-widest leading-none italic">النظام المحاسبي المتكامل</span>
                                    <TrendingUp className="text-[#5c59f2] md:size-[14px]" size={10} />
                                </div>
                                <h1 className="text-sm md:text-3xl font-black text-slate-800 dark:text-white leading-none tracking-tighter uppercase italic">الإدارة المالية والحسابات</h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="bg-slate-900 text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">
                                        هامش الربح: {state.profitMargin}%
                                    </div>
                                    <span className="text-slate-400 font-bold text-[9px] uppercase italic">مركز التقارير • تحديث حي</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto justify-end no-print">
                             <button
                                onClick={() => navigate('/monthly-closing')}
                                className="px-4 py-2.5 md:px-6 md:py-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 font-black text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm hover:bg-white"
                            >
                                <CalendarCheck size={16} />
                                <span>تسوية الشهر</span>
                            </button>
                            
                            <button
                                onClick={() => actions.setShowAddModal(true)}
                                className="px-4 py-2.5 md:px-6 md:py-3 bg-[#5c59f2] text-white font-black text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-indigo-100 dark:shadow-none hover:-translate-y-0.5"
                            >
                                <TrendingUp size={16} />
                                <span>تسجيل معاملة</span>
                            </button>

                            <button
                                onClick={() => alert('ميزة التصدير ستكون متاحة قريباً')}
                                className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-[#5c59f2] transition-colors shadow-sm"
                            >
                                <Download size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-0 space-y-8">
                {/* Modern Stats Components */}
                <FinanceStats 
                    totalIncome={state.totalIncome}
                    monthIncome={state.monthIncome}
                    totalExpenses={state.totalExpenses}
                    monthExpenses={state.monthExpenses}
                    totalFixedExpenses={state.totalFixedExpenses}
                    netProfit={state.netProfit}
                    monthProfit={state.monthIncome - state.monthExpenses} // Calculated
                />

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

            {/* Filter Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-none shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-4">
                    <div className="w-8 h-8 bg-[#5c59f2] text-white flex items-center justify-center shadow-lg">
                        <Search size={16} />
                    </div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">محرك البحث وتعقب المعاملات</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Search Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block italic">البحث في السجلات</label>
                        <div className="relative group">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-[#5c59f2]" />
                            <input
                                type="text"
                                placeholder="رقم المعاملة، وصف، أو تصنيف..."
                                value={state.searchTerm}
                                onChange={(e) => actions.setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-[#5c59f2] outline-none text-xs font-black rounded-none transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Type Filter */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block italic">نوع العملية</label>
                        <div className="relative">
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                            <select
                                value={state.filterType}
                                onChange={(e) => actions.setFilterType(e.target.value as 'all' | 'income' | 'expense')}
                                className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-[#5c59f2] outline-none text-xs font-black rounded-none transition-all dark:text-white appearance-none cursor-pointer"
                            >
                                <option value="all">كافة المعاملات المالية</option>
                                <option value="income">الإيرادات المحصلة (+)</option>
                                <option value="expense">المصروفات والمدفوعات (-)</option>
                            </select>
                        </div>
                    </div>

                    {/* Period Filter */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block italic">نطاق الفترة الزمنية</label>
                        <div className="relative">
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                            <select
                                value={state.filterMonth}
                                onChange={(e) => actions.setFilterMonth(e.target.value)}
                                className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-[#5c59f2] outline-none text-xs font-black rounded-none transition-all dark:text-white appearance-none cursor-pointer"
                            >
                                <option value="all">السجل الكامل</option>
                                {state.uniqueMonths.map(month => (
                                    <option key={month} value={month}>
                                        {new Date(month + '-01').toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Display */}
            <div className="p-4 md:p-0">
                <TransactionsLog
                    transactions={state.filteredTransactions}
                    totalCount={state.filteredTransactions.length}
                    onDeleteAll={actions.handleDeleteAllTransactions}
                />
            </div>

            {/* Add Transaction Modal */}
            <AddTransactionModal
                isOpen={state.showAddModal}
                onClose={() => actions.setShowAddModal(false)}
                onAdd={actions.handleAddTransaction}
            />
        </div>
    </div>
);
};

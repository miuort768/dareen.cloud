import { DollarSign, TrendingUp, Search, Filter, Calendar, CalendarCheck, Download } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
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
                        <Skeleton key={i} className="h-32 rounded-2xl" />
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
        <div className="space-y-6 pb-32">
            {/* Header */}
            <div className="relative bg-primary-600 p-8 shadow-xl overflow-hidden border-b-4 border-primary-500 rounded-none">
                {/* Background Geometric Enhancement - Richer & Larger Shapes */}
                {/* Major Glows & Blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-20 -mt-40 blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full -ml-40 -mb-60 blur-[150px] pointer-events-none"></div>

                {/* Central Geometric elements */}
                <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border-[1px] border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-1/2 -translate-y-1/2 rotate-45 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none"></div>

                {/* Large Structural Shapes */}
                <div className="absolute top-[-20%] left-[-5%] w-[35%] h-[140%] bg-gradient-to-br from-white/5 to-transparent rotate-12 pointer-events-none hidden lg:block"></div>
                <div className="absolute top-[-30%] right-[15%] w-[120px] h-[160%] bg-white/5 -rotate-12 pointer-events-none hidden lg:block"></div>

                {/* Large Geometric Outlines */}
                <div className="absolute top-1/2 right-10 w-80 h-80 border-[30px] border-white/5 rounded-full -translate-y-1/2 pointer-events-none"></div>

                {/* Pattern Layer */}
                <div className="absolute inset-0 opacity-[0.1] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '28px 28px' }}></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group">
                            <DollarSign size={36} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-black text-white mb-1 tracking-tight uppercase">المالية والحسابات</h1>
                            <p className="text-white/80 text-[10px] md:text-sm font-bold flex items-center gap-2">
                                <TrendingUp size={14} className="text-white" />
                                نظرة شاملة على الأداء المالي والتدفقات النقدية
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 no-print">
                        <button
                            onClick={() => navigate('/monthly-closing')}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white font-black text-xs border-2 border-gray-950 shadow-[4px_4px_0px_0px_black] hover:translate-y-[-2px] transition-all dark:bg-black dark:border-white/20 h-10"
                        >
                            <CalendarCheck size={16} /> تقفيل وتسويات
                        </button>
                        <button
                            onClick={() => alert('ميزة التصدير ستكون متاحة قريباً')}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-950 font-black text-xs border-2 border-gray-950 shadow-[4px_4px_0px_0px_black] hover:translate-y-[-2px] transition-all dark:bg-gray-800 dark:text-white dark:border-white/20 h-10"
                        >
                            <Download size={16} /> تصدير
                        </button>
                        <button
                            onClick={() => actions.setShowAddModal(true)}
                            className="bg-white text-primary-600 px-4 py-2 font-black text-xs border-2 border-gray-950 shadow-[4px_4px_0px_0px_black] flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-all h-10"
                        >
                            <TrendingUp size={16} /> تسجيل المعاملة
                        </button>
                        <div className="bg-primary-900/40 backdrop-blur-md border-2 border-white/20 px-4 py-2 h-10 flex items-center justify-center gap-2 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
                            <span className="text-[10px] font-black uppercase text-white/80">هامش الربح</span>
                            <span className="text-base font-black text-emerald-400" dir="ltr">{state.profitMargin}%</span>
                        </div>
                    </div>
                </div>

                {/* Compact Stats inside Header */}
                <div className="relative z-10 mt-6 pt-6 border-t border-white/20 grid grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 flex justify-between items-center group hover:bg-white/15 transition-colors">
                        <div>
                            <p className="text-white/60 text-[10px] font-black uppercase mb-1 tracking-widest">الإيرادات الشاملة</p>
                            <p className="text-white text-xl md:text-2xl font-black tabular-nums truncate tracking-tighter">{state.totalIncome.toLocaleString()} <span className="text-xs">ج.م</span></p>
                            <p className="text-emerald-400 text-[10px] font-bold mt-1">هذا الشهر: {state.monthIncome.toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <TrendingUp size={20} />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 flex justify-between items-center group hover:bg-white/15 transition-colors">
                        <div>
                            <p className="text-white/60 text-[10px] font-black uppercase mb-1 tracking-widest">مصاريف المعلمات</p>
                            <p className="text-white text-xl md:text-2xl font-black tabular-nums truncate tracking-tighter">{state.totalExpenses.toLocaleString()} <span className="text-xs">ج.م</span></p>
                            <p className="text-rose-400 text-[10px] font-bold mt-1">هذا الشهر: {state.monthExpenses.toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 border border-rose-500/30 bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                            <TrendingUp size={20} className="rotate-180" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 flex justify-between items-center group hover:bg-white/15 transition-colors">
                        <div>
                            <p className="text-white/60 text-[10px] font-black uppercase mb-1 tracking-widest">مصروفات الإدارة</p>
                            <p className="text-white text-xl md:text-2xl font-black tabular-nums truncate tracking-tighter">{state.totalFixedExpenses.toLocaleString()} <span className="text-xs">ج.م</span></p>
                            <p className="text-rose-400 text-[10px] font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">اجمالي ثابت</p>
                        </div>
                        <div className="w-10 h-10 border border-rose-500/30 bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                            <DollarSign size={20} />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 flex justify-between items-center group hover:bg-white/15 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <div>
                            <p className="text-emerald-300 text-[10px] font-black uppercase mb-1 tracking-widest">صافي الأرباح</p>
                            <p className="text-white text-xl md:text-2xl font-black tabular-nums truncate tracking-tighter">{state.netProfit.toLocaleString()} <span className="text-xs">ج.م</span></p>
                            <p className="text-emerald-400 text-[10px] font-bold mt-1">هذا الشهر: {state.monthProfit.toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 border border-emerald-400 bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                            <DollarSign size={20} />
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

            {/* Add Transaction Modal */}
            <AddTransactionModal
                isOpen={state.showAddModal}
                onClose={() => actions.setShowAddModal(false)}
                onAdd={actions.handleAddTransaction}
            />

            {/* Charts Section */}
            <FinanceCharts
                monthlyData={state.monthlyData}
                pieData={state.pieData}
                totalExpenses={state.totalExpenses}
            />

            {/* Filters */}
            <div className="bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="ابحث في المعاملات..."
                            value={state.searchTerm}
                            onChange={(e) => actions.setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 border border-gray-200 focus:outline-none focus:border-primary-500 text-sm rounded-none bg-gray-50 focus:bg-white transition-colors dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>

                    {/* Type Filter */}
                    <div className="relative">
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={state.filterType}
                            onChange={(e) => actions.setFilterType(e.target.value as 'all' | 'income' | 'expense')}
                            className="w-full pl-4 pr-10 py-2.5 border border-gray-200 focus:outline-none focus:border-primary-500 text-sm rounded-none bg-gray-50 dark:bg-gray-800 dark:border-gray-700 appearance-none cursor-pointer"
                        >
                            <option value="all">جميع الأنواع</option>
                            <option value="income">إيرادات فقط 🟢</option>
                            <option value="expense">مصروفات فقط 🔴</option>
                        </select>
                    </div>

                    {/* Month Filter */}
                    <div className="relative">
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={state.filterMonth}
                            onChange={(e) => actions.setFilterMonth(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 border border-gray-200 focus:outline-none focus:border-primary-500 text-sm rounded-none bg-gray-50 dark:bg-gray-800 dark:border-gray-700 appearance-none cursor-pointer"
                        >
                            <option value="all">جميع الشهور</option>
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
        </div>
    );
};

import { DollarSign, TrendingUp, Search, Filter, Calendar } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { FinanceStats } from '../features/finance/components/FinanceStats';
import { TransactionsLog } from '../features/finance/components/TransactionsLog';
import { FinanceCharts } from '../features/finance/components/FinanceCharts';
import { AddTransactionModal } from '../features/finance/components/AddTransactionModal';
import { FixedExpensesManager } from '../features/finance/components/FixedExpensesManager';
import { useFinance } from '../features/finance/hooks/useFinance';

export const Finance = () => {
    const { state, actions } = useFinance();

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
        <div className="space-y-6">
            {/* Header */}
            <div className="relative bg-primary-600 p-8 shadow-xl overflow-hidden border-b-4 border-primary-500">
                <div className="relative flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-none">
                                <DollarSign size={24} />
                            </div>
                            المالية والحسابات
                        </h1>
                        <p className="text-white text-sm">نظرة شاملة على الأداء المالي والتدفقات النقدية</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => actions.setShowAddModal(true)}
                            className="bg-white text-primary-600 px-4 py-2 rounded-none flex items-center gap-2 hover:bg-white/90 active:bg-white/80 transition-all font-bold shadow-lg"
                        >
                            <TrendingUp size={18} />
                            <span>تسجيل معاملة</span>
                        </button>
                        <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-none min-w-[120px]">
                            <p className="text-white text-xs text-center">هامش الربح</p>
                            <p className="text-white text-2xl font-bold text-center" dir="ltr">{state.profitMargin}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <FinanceStats
                totalIncome={state.totalIncome}
                monthIncome={state.monthIncome}
                totalExpenses={state.totalExpenses}
                monthExpenses={state.monthExpenses}
                totalFixedExpenses={state.totalFixedExpenses}
                netProfit={state.netProfit}
                monthProfit={state.monthProfit}
            />

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

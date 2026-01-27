import { useState } from 'react';
import { DollarSign, TrendingUp, Search, Filter, Calendar } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { FinanceStats } from '../features/finance/components/FinanceStats';
import { TransactionsLog } from '../features/finance/components/TransactionsLog';
import { FinanceCharts } from '../features/finance/components/FinanceCharts';
import { AddTransactionModal } from '../features/finance/components/AddTransactionModal';
import { FixedExpensesManager } from '../features/finance/components/FixedExpensesManager';
import { useFinance } from '../features/finance/hooks/useFinance';

export const Finance = () => {
    const { state, actions } = useFinance();
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const triggerDeleteAll = () => {
        setConfirmState({
            isOpen: true,
            title: 'تأكيد مسح السجل',
            message: 'هل أنت متأكد من حذف جميع المعاملات اليدوية؟ لا يمكن التراجع عن هذا الإجراء وسيتم تصفير السجل المالي.',
            onConfirm: actions.handleDeleteAllTransactions
        });
    };

    const triggerDeleteOne = async (id: string) => {
        // Find if it's a session or manual to customize message
        const isSession = id.startsWith('session-');
        const isInvoice = id.startsWith('invoice-');

        let msg = 'هل أنت متأكد من حذف هذه المعاملة؟';
        if (isSession) msg = 'هذه معاملة ناتجة عن "حصة دراسية". حذفها سيؤدي لحذف تسجيل الحصة من النظام بالكامل. هل أنت متأكد؟';
        if (isInvoice) msg = 'هذه معاملة ناتجة عن "فاتورة معلمة". حذف المعاملة سيحذف الفاتورة. هل أنت متأكد؟';

        setConfirmState({
            isOpen: true,
            title: 'تأكيد الحذف',
            message: msg,
            onConfirm: () => actions.handleDeleteTransaction(id)
        });
    };

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
                    <div className="flex items-center gap-4 flex-wrap no-print">
                        <button
                            onClick={() => actions.setShowAddModal(true)}
                            className="bg-white text-primary-600 px-6 py-3 rounded-none flex items-center gap-3 hover:bg-white/95 active:bg-primary-50 transition-all font-black shadow-lg transform hover:-translate-y-1 active:translate-y-0 h-14"
                        >
                            <TrendingUp size={20} />
                            <span>تسجيل معاملة</span>
                        </button>
                        <div className="bg-primary-900/40 backdrop-blur-md border border-white/20 px-6 py-2 rounded-none min-w-[140px] text-white">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">هامش الربح</p>
                            <p className="text-2xl font-black" dir="ltr">{state.profitMargin}%</p>
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
                onDeleteAll={triggerDeleteAll}
                onDelete={triggerDeleteOne}
            />

            {/* Premium Confirm Modal */}
            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                confirmText="نعم، حذف الكل"
                cancelText="إلغاء"
                isDestructive={true}
            />
        </div>
    );
};

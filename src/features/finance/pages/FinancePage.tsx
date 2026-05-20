import { Search, Filter, Calendar, CalendarCheck, Download, Plus, TrendingUp } from 'lucide-react';
import { TransactionsLog } from '../components/TransactionsLog';
import { FinanceCharts } from '../components/FinanceCharts';
import { FinanceStats } from '../components/FinanceStats';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { FixedExpensesManager } from '../components/FixedExpensesManager';
import { useFinance } from '../hooks/useFinance';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';

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
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-indigo-950/20 font-sans" dir="rtl">
            <div className="absolute inset-0 opacity-\[0\.03\] dark:opacity-\[0\.05\] opacity-50 pointer-events-none" />
            <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6">

                {/* ── Header ── */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 rounded-2xl shadow-2xl shadow-slate-900/15 border border-white/5 px-6 md:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-400/30 shadow-[0_0_20px_rgba(52,211,153,0.3)] shrink-0 bg-white/10 backdrop-blur-md flex items-center justify-center">
                            <span className="text-xl font-black text-white">د</span>
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tighter">الإدارة المالية والحسابات</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <TrendingUp size={10} className={isProfit ? "text-emerald-400" : "text-rose-400"} />
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", isProfit ? "text-emerald-400" : "text-rose-400")}>
                                    هامش الربح: {state.profitMargin}%
                                </span>
                                <span className="w-1 h-1 bg-white/20 rounded-full" />
                                <span className="text-[10px] text-slate-400 font-bold">مركز التقارير الموحد</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-2 no-print">
                        <button
                            onClick={() => navigate('/monthly-closing')}
                            className="flex items-center gap-2 h-9 px-4 bg-white/10 hover:bg-white/15 text-white text-[10px] font-black rounded-xl border border-white/10 transition-all uppercase tracking-widest"
                        >
                            <CalendarCheck size={13} />
                            <span className="hidden sm:inline">تسوية الشهر</span>
                        </button>
                        <button
                            onClick={() => actions.setShowAddModal(true)}
                            className="flex items-center gap-2 h-9 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-[10px] font-black rounded-xl border border-amber-400/30 transition-all uppercase tracking-widest shadow-lg shadow-amber-500/20"
                        >
                            <Plus size={13} />
                            تسجيل معاملة
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/15 text-slate-300 rounded-xl border border-white/10 transition-all">
                            <Download size={14} />
                        </button>
                    </div>
                </div>

                <div className="py-5 space-y-6">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 p-5 md:p-6">
                        <FinanceStats
                            totalIncome={state.totalIncome}
                            monthIncome={state.monthIncome}
                            totalExpenses={state.totalExpenses}
                            monthExpenses={state.monthExpenses}
                            totalFixedExpenses={state.totalFixedExpenses}
                            netProfit={state.netProfit}
                            monthProfit={state.monthIncome - state.monthExpenses}
                        />
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 p-5 md:p-6">
                        <FixedExpensesManager
                            expenses={state.fixedExpenses}
                            onUpdateExpense={actions.handleUpdateFixedExpense}
                            onConvertAll={actions.handleConvertAllFixedExpenses}
                            onClearAll={actions.handleClearAllFixedExpenses}
                        />
                    </div>

                    <FinanceCharts
                        monthlyData={state.monthlyData}
                        isTeacher={false}
                    />

                    <TransactionsLog
                        searchTerm={state.searchTerm}
                        onSearchChange={actions.setSearchTerm}
                        filter={state.filter}
                        onFilterChange={actions.setFilter}
                        transactions={state.filteredTransactions}
                        onDelete={actions.handleDeleteTransaction}
                        monthIncome={state.monthIncome}
                        monthExpenses={state.monthExpenses}
                    />
                </div>

                <AddTransactionModal
                    isOpen={state.showAddModal}
                    onClose={() => actions.setShowAddModal(false)}
                    onAdd={actions.handleAddTransaction}
                />
            </div>
        </div>
    );
};
export default Finance;

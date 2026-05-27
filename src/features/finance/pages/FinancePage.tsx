import { CalendarCheck, Download, Plus, TrendingUp } from 'lucide-react';
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
                <div className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl animate-pulse" />)}
                </div>
                <div className="h-96 bg-white dark:bg-slate-900 rounded-2xl animate-pulse" />
            </div>
        );
    }

    const isProfit = state.netProfit >= 0;

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-emerald-950/20 font-sans" dir="rtl">
            <div className="absolute inset-0 opacity-\[0\.03\] dark:opacity-\[0\.05\] opacity-50 pointer-events-none" />
            <div className="relative z-10 max-w-[1600px] mx-auto px-2">

                {/* ── Header ── */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm px-5 md:px-7 py-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: '#10B98112', color: '#10B981' }}>
                            <span className="text-xl font-bold">د</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-[#0F172A] dark:text-white leading-tight">الإدارة المالية والحسابات</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <TrendingUp size={10} style={{ color: isProfit ? '#10B981' : '#F43F5E' }} />
                                <span style={{ color: isProfit ? '#10B981' : '#F43F5E' }} className="text-[10px] font-bold uppercase tracking-widest">
                                    هامش الربح: {state.profitMargin}%
                                </span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                <span className="text-[10px] font-medium text-[#64748B]">مركز التقارير الموحد</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 no-print">
                        <button onClick={() => navigate('/monthly-closing')} className="flex items-center gap-2 h-9 px-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all rounded-xl shadow-sm">
                            <CalendarCheck size={13} />
                            <span className="hidden sm:inline whitespace-nowrap">تسوية الشهر</span>
                        </button>
                        <button onClick={() => actions.setShowAddModal(true)} className="flex items-center gap-2 h-9 px-4 bg-[#10B981] hover:bg-emerald-700 text-white text-[10px] font-bold transition-all shadow-sm active:scale-95 rounded-xl">
                            <Plus size={13} />
                            تسجيل معاملة
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all rounded-xl shadow-sm">
                            <Download size={14} />
                        </button>
                    </div>
                </div>

                <div className="py-5 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 p-5 md:p-6 rounded-2xl">
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

                    <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 p-5 md:p-6 rounded-2xl">
                        <FixedExpensesManager
                            expenses={state.fixedExpenses}
                            onUpdateExpense={actions.handleUpdateFixedExpense}
                            onConvertAll={actions.handleConvertAllFixedExpenses}
                            onClearAll={actions.handleClearAllFixedExpenses}
                        />
                    </div>

                    <FinanceCharts
                        monthlyData={state.monthlyData || []}
                        pieData={state.pieData || []}
                        totalExpenses={state.totalExpenses || 0}
                    />

                    <TransactionsLog
                        transactions={state.filteredTransactions || []}
                        totalCount={state.filteredTransactions?.length || 0}
                        onDeleteAll={actions.handleDeleteAllTransactions}
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

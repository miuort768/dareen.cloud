import { useEffect } from 'react';
import { CalendarCheck, Plus, TrendingUp } from 'lucide-react';
import { TransactionsLog } from '../components/TransactionsLog';
import { FinanceCharts } from '../components/FinanceCharts';
import { FinanceStats } from '../components/FinanceStats';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { FixedExpensesManager } from '../components/FixedExpensesManager';
import { useFinance } from '../hooks/useFinance';
import { useNavigate } from 'react-router-dom';

export const Finance = () => {
    useEffect(() => { document.title = 'المالية | دارين السابعة للتعليم والتدريب'; }, []);
    const { state, actions } = useFinance();
    const navigate = useNavigate();

    if (state.loading) {
        return (
            <div className="space-y-4 p-4 bg-surface min-h-full">
                <div className="h-24 bg-card rounded-2xl animate-pulse" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => <div key={`finance-${i}`} className="h-28 bg-card rounded-2xl animate-pulse" />)}
                </div>
                <div className="h-96 bg-card rounded-2xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative font-sans bg-surface" dir="rtl">
            <div className="relative z-10 max-w-page mx-auto px-2">

                {/* ── Header ── */}
                <div className="bg-surface border border-border rounded-2xl p-3 md:p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
                                <TrendingUp size={17} className="text-primary" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-main leading-tight">الإدارة المالية</h1>
                                <p className="text-[10px] text-muted">هامش الربح: {state.profitMargin}%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => navigate('/monthly-closing')} className="flex items-center gap-1 h-8 px-2.5 bg-surface border border-border text-muted text-[10px] font-bold rounded-lg active:scale-95 transition-transform">
                                <CalendarCheck size={11} /> <span className="hidden sm:inline">تسوية</span>
                            </button>
                            <button onClick={() => actions.setShowAddModal(true)} className="flex items-center gap-1 h-8 px-2.5 bg-primary text-on-primary text-[10px] font-bold rounded-lg active:scale-95 transition-transform">
                                <Plus size={11} /> تسجيل
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mt-3">
                    <div className="bg-card border-border p-4 shadow-sm rounded-2xl">
                        <FinanceStats
                            totalIncome={state.totalIncome}
                            monthIncome={state.monthIncome}
                            totalExpenses={state.totalExpenses}
                            monthExpenses={state.monthExpenses}
                            totalFixedExpenses={state.totalFixedExpenses}
                            netProfit={state.netProfit}
                            monthProfit={state.monthIncome - state.monthExpenses}
                            reportCurrency={state.reportCurrency as string}
                        />
                    </div>

                    <div className="bg-card border-border p-4 shadow-sm rounded-2xl">
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
                        reportCurrency={state.reportCurrency as string}
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

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
            <div className="space-y-4 p-4 bg-surface min-h-full">
                <div className="h-24 bg-card rounded-2xl animate-pulse" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-card rounded-2xl animate-pulse" />)}
                </div>
                <div className="h-96 bg-card rounded-2xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative font-sans bg-surface" dir="rtl">
            <div className="relative z-10 max-w-[1600px] mx-auto px-2">

                {/* ── Header ── */}
                <div className="bg-primary shadow-lg px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 rounded-2xl mt-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-white/15 backdrop-blur-sm rounded-xl">
                            <span className="text-xl font-bold text-on-primary">د</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-on-primary leading-tight">الإدارة المالية والحسابات</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <TrendingUp size={10} className="text-on-primary opacity-80" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-on-primary opacity-80">
                                    هامش الربح: {state.profitMargin}%
                                </span>
                                <span className="w-1 h-1 bg-white/30 rounded-full" />
                                <span className="text-[10px] font-bold text-on-primary opacity-60">مركز التقارير الموحد</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 no-print">
                        <button onClick={() => navigate('/monthly-closing')} className="flex items-center gap-2 h-9 px-4 bg-white/15 backdrop-blur-sm hover:bg-white/30 text-on-primary text-[10px] font-bold transition-all rounded-xl shadow-sm border border-white/10">
                            <CalendarCheck size={13} />
                            <span className="hidden sm:inline whitespace-nowrap">تسوية الشهر</span>
                        </button>
                        <button onClick={() => actions.setShowAddModal(true)} className="flex items-center gap-2 h-9 px-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-on-primary text-[10px] font-bold transition-all shadow-sm active:scale-95 rounded-xl">
                            <Plus size={13} />
                            تسجيل معاملة
                        </button>
                        <button onClick={() => {
                            const csv = [['التاريخ','الوصف','النوع','المبلغ','الرصيد'].join(','), ...state.filteredTransactions.map(t => [t.date, t.description, t.type, t.amount, t.balance].join(','))].join('\n');
                            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a'); a.href = url; a.download = 'finance-report.csv'; a.click(); URL.revokeObjectURL(url);
                        }} className="w-9 h-9 flex items-center justify-center bg-white/15 backdrop-blur-sm hover:bg-white/30 text-on-primary transition-all rounded-xl shadow-sm border border-white/10">
                            <Download size={14} />
                        </button>
                    </div>
                </div>

                <div className="py-5 space-y-6">
                    <div className="bg-card border-border p-5 md:p-6 shadow-sm rounded-2xl">
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

                    <div className="bg-card border-border p-5 md:p-6 shadow-sm rounded-2xl">
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

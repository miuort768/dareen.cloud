import React from 'react';
import { DollarSign, Search, Filter, Calendar, CalendarCheck, Download, Plus } from 'lucide-react';
import { TransactionsLog } from '../features/finance/components/TransactionsLog';
import { FinanceCharts } from '../features/finance/components/FinanceCharts';
import { FinanceStats } from '../features/finance/components/FinanceStats';
import { AddTransactionModal } from '../features/finance/components/AddTransactionModal';
import { FixedExpensesManager } from '../features/finance/components/FixedExpensesManager';
import { useFinance } from '../features/finance/hooks/useFinance';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

// ── Reusable Styled Components ──────────────────────────────────────────────

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden',
        className
    )}>
        {children}
    </div>
);

const SectionTitle = ({ icon: Icon, label, sub }: { icon: any; label: string; sub?: string }) => (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-50 dark:border-slate-800">
        <div className="w-8 h-8 flex items-center justify-center bg-[#eef2ff] dark:bg-indigo-900/30 rounded-xl">
            <Icon size={16} className="text-[#5c59f2]" />
        </div>
        <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
            {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const PrimaryBtn = ({ onClick, children, className = '', disabled }: {
    onClick?: () => void; children: React.ReactNode; className?: string; disabled?: boolean;
}) => (
    <button
        disabled={disabled}
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 bg-[#5c59f2] hover:bg-indigo-700',
            'text-white text-[11px] font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
        )}
    >
        {children}
    </button>
);

const SecondaryBtn = ({ onClick, children, className = '' }: {
    onClick?: () => void; children: React.ReactNode; className?: string;
}) => (
    <button
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700',
            'text-slate-600 dark:text-slate-300 text-[11px] font-bold px-4 py-2 rounded-xl transition-all',
            className
        )}
    >
        {children}
    </button>
);

export const Finance = () => {
    const { state, actions } = useFinance();
    const navigate = useNavigate();

    if (state.loading) {
        return (
            <div className="space-y-6 p-4">
                <div className="h-20 bg-white dark:bg-slate-900 rounded-2xl animate-pulse" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse" />)}
                </div>
                <div className="h-96 bg-white dark:bg-slate-900 rounded-2xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="min-h-full bg-[#f1f5f9] dark:bg-[#020617] pb-20 font-sans" dir="rtl">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center bg-[#5c59f2] text-white rounded-xl shadow-lg shadow-indigo-500/20">
                        <DollarSign size={18} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-slate-800 dark:text-white">الإدارة المالية والحسابات</h1>
                        <div className="flex items-center gap-2">
                             <p className="text-[10px] text-slate-400 italic">مركز التقارير الموحد</p>
                             <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                             <span className="text-[10px] font-bold text-[#5c59f2] bg-indigo-50 px-1.5 py-0.5 rounded-md">هامش الربح: {state.profitMargin}%</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 no-print">
                    <SecondaryBtn onClick={() => navigate('/monthly-closing')} className="h-9 px-3">
                        <CalendarCheck size={14} />
                        تسوية الشهر
                    </SecondaryBtn>
                    
                    <PrimaryBtn onClick={() => actions.setShowAddModal(true)} className="h-9 px-4">
                        <Plus size={14} />
                        تسجيل معاملة
                    </PrimaryBtn>

                    <button className="w-9 h-9 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-[#5c59f2] rounded-xl transition-all border border-slate-100 dark:border-slate-700">
                        <Download size={14} />
                    </button>
                </div>
            </div>

            <div className="py-6 space-y-6">
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
                <div className="px-4 md:px-6">
                    <SectionCard className="p-4">
                        <SectionTitle icon={Search} label="محرك البحث وتعقب المعاملات" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase mr-1">البحث</label>
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 w-3.5 h-3.5" />
                                    <input
                                        type="text"
                                        placeholder="رقم المعاملة، وصف..."
                                        value={state.searchTerm}
                                        onChange={(e) => actions.setSearchTerm(e.target.value)}
                                        className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none text-xs font-bold focus:border-[#5c59f2]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase mr-1">نوع العملية</label>
                                <div className="relative">
                                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 w-3.5 h-3.5 pointer-events-none" />
                                    <select
                                        value={state.filterType}
                                        onChange={(e) => actions.setFilterType(e.target.value as 'all' | 'income' | 'expense')}
                                        className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none text-xs font-bold focus:border-[#5c59f2] appearance-none cursor-pointer"
                                    >
                                        <option value="all">كافة المعاملات</option>
                                        <option value="income">الإيرادات (+)</option>
                                        <option value="expense">المصروفات (-)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase mr-1">الفترة الزمنية</label>
                                <div className="relative">
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 w-3.5 h-3.5 pointer-events-none" />
                                    <select
                                        value={state.filterMonth}
                                        onChange={(e) => actions.setFilterMonth(e.target.value)}
                                        className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none text-xs font-bold focus:border-[#5c59f2] appearance-none cursor-pointer"
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
                    </SectionCard>
                </div>

                {/* Transactions Log */}
                <div className="px-4 md:px-6">
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

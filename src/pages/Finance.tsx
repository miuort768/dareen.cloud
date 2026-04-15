import { DollarSign, TrendingUp, Search, Filter, Calendar, CalendarCheck, Download, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Skeleton } from '../shared/components/Skeleton';
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
                        <Skeleton key={i} className="h-32 rounded-none" />
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
        <div className="space-y-8 pb-40">
            {/* Premium Brutalist Header */}
            <div className="relative bg-white border-2 border-gray-950 p-6 shadow-[2px_2px_0px_0px_black] overflow-hidden mb-6 rounded-none">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 2px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                <div className="absolute top-0 right-0 w-48 h-full bg-primary-600/5 -skew-x-12 transform translate-x-24 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-2 border-b border-gray-950 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600 text-white border-2 border-gray-950 flex items-center justify-center transform -rotate-3 shadow-[1px_1px_0px_0px_black] relative">
                             <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-gray-950"></div>
                            <DollarSign size={18} strokeWidth={3} />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <Sparkles size={10} className="text-amber-500" />
                                <span className="text-[8px] font-black text-primary-600 uppercase tracking-[0.2em] italic">نظام الرقابة المالية المتكامل</span>
                            </div>
                            <h1 className="text-lg md:text-xl font-black text-gray-950 tracking-tighter uppercase leading-none">الإدارة المالية والحسابات</h1>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <div className="bg-gray-950 text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border border-gray-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                                    هامش الربح: {state.profitMargin}%
                                </div>
                                <div className="bg-emerald-50 text-emerald-700 border border-emerald-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">
                                    مركز التقارير النشط
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 no-print">
                        <button
                            onClick={() => navigate('/monthly-closing')}
                            className="group flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-950 text-white font-black text-[10px] border-2 border-gray-950 shadow-[1px_1px_0px_0px_#444] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all h-8 uppercase tracking-widest"
                        >
                            <CalendarCheck size={14} /> تسوية الشهر
                        </button>
                        
                        <button
                            onClick={() => actions.setShowAddModal(true)}
                            className="flex items-center justify-center gap-2 px-3 py-1.5 bg-primary-600 text-white font-black text-[10px] border-2 border-gray-950 shadow-[1px_1px_0px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all h-8 uppercase tracking-widest"
                        >
                            <TrendingUp size={14} /> تسجيل معاملة
                        </button>

                        <button
                            onClick={() => alert('ميزة التصدير ستكون متاحة قريباً')}
                            className="px-2 py-1 bg-white text-gray-950 border-2 border-gray-950 shadow-[1px_1px_0px_0px_black] hover:bg-gray-50 transition-all h-8 flex items-center justify-center"
                        >
                            <Download size={14} />
                        </button>
                    </div>
                </div>

                {/* Heavy Brutalist Stats inside Header */}
                <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Income */}
                    <div className="bg-emerald-50 border-2 border-gray-950 p-3 flex flex-col justify-between group hover:bg-emerald-100 transition-colors shadow-[2px_2px_0px_0px_black] relative overflow-hidden">
                        <div className="absolute top-1 left-1 text-emerald-200">
                             <ArrowUpRight size={24} strokeWidth={4} />
                        </div>
                        <p className="text-emerald-700 text-[9px] font-black uppercase mb-2 tracking-widest border-b border-emerald-200 pb-1 italic">إجمالي الوارد</p>
                        <div className="flex items-end gap-1.5">
                             <p className="text-gray-950 text-xl font-black tabular-nums tracking-tighter leading-none">{state.totalIncome.toLocaleString()}</p>
                             <span className="text-[8px] font-black text-gray-500 mb-0.5 italic">ج.م</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2 bg-white/50 border-t border-emerald-200 pt-1">
                            <span className="text-[9px] font-black text-emerald-800 uppercase italic">الشهر: {state.monthIncome.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Teacher Expenses */}
                    <div className="bg-rose-50 border-2 border-gray-950 p-3 flex flex-col justify-between group hover:bg-rose-100 transition-colors shadow-[2px_2px_0px_0px_black] relative overflow-hidden">
                        <div className="absolute top-1 left-1 text-rose-200">
                             <ArrowDownRight size={24} strokeWidth={4} />
                        </div>
                        <p className="text-rose-700 text-[9px] font-black uppercase mb-2 tracking-widest border-b border-rose-200 pb-1 italic">مستحقات المعلمات</p>
                        <div className="flex items-end gap-1.5">
                             <p className="text-gray-950 text-xl font-black tabular-nums tracking-tighter leading-none">{state.totalExpenses.toLocaleString()}</p>
                             <span className="text-[8px] font-black text-gray-500 mb-0.5 italic">ج.م</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2 bg-white/50 border-t border-rose-200 pt-1">
                            <span className="text-[9px] font-black text-rose-800 uppercase italic">الشهر: {state.monthExpenses.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Fixed Expenses */}
                    <div className="bg-amber-50 border-2 border-gray-950 p-3 flex flex-col justify-between group hover:bg-amber-100 transition-colors shadow-[2px_2px_0px_0px_black] relative overflow-hidden">
                        <div className="absolute top-1 left-1 text-amber-200">
                             <DollarSign size={24} strokeWidth={4} />
                        </div>
                        <p className="text-amber-700 text-[9px] font-black uppercase mb-2 tracking-widest border-b border-amber-200 pb-1 italic">المصروفات الثابتة</p>
                        <div className="flex items-end gap-1.5">
                             <p className="text-gray-950 text-xl font-black tabular-nums tracking-tighter leading-none">{state.totalFixedExpenses.toLocaleString()}</p>
                             <span className="text-[8px] font-black text-gray-500 mb-0.5 italic">ج.م</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2 bg-white/50 border-t border-amber-200 pt-1">
                            <span className="text-[9px] font-black text-amber-800 uppercase italic">مصاريف الإدارة</span>
                        </div>
                    </div>

                    {/* Net Profit */}
                    <div className="bg-gray-950 border-2 border-gray-950 p-3 flex flex-col justify-between group shadow-[2px_2px_0px_0px_black] relative overflow-hidden">
                        <div className="absolute top-1 left-1 text-white/10">
                             <TrendingUp size={24} strokeWidth={4} />
                        </div>
                        <p className="text-emerald-400 text-[9px] font-black uppercase mb-2 tracking-widest border-b border-white/10 pb-1 italic">صافي الأرباح</p>
                        <div className="flex items-end gap-1.5">
                             <p className="text-white text-2xl font-black tabular-nums tracking-tighter leading-none italic">{state.netProfit.toLocaleString()}</p>
                             <span className="text-[8px] font-black text-emerald-400/60 mb-0.5 uppercase">LE</span>
                        </div>
                        <div className="mt-3 flex items-center gap-1 border-t border-white/10 pt-1">
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">أداء ممتاز</span>
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

            {/* Charts Section */}
            <FinanceCharts
                monthlyData={state.monthlyData}
                pieData={state.pieData}
                totalExpenses={state.totalExpenses}
            />

            {/* Premium Brutalist Filters */}
            <div className="bg-white border-2 border-gray-950 p-4 shadow-[2px_2px_0px_0px_black] mb-6">
                 <div className="flex items-center gap-2 mb-3 border-b border-gray-950 pb-2">
                    <div className="w-6 h-6 bg-gray-950 text-white flex items-center justify-center border-2 border-gray-950 shadow-[1px_1px_0px_0px_black]">
                        <Search size={12} />
                    </div>
                    <h3 className="text-sm font-black text-gray-950 uppercase tracking-tighter italic">فلترة وتعقب المعاملات</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Search */}
                    <div className="relative group">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1 px-1 italic">كلمة البحث</label>
                        <Search className="absolute right-2 top-[24px] text-gray-950 w-3 h-3 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="ابحث..."
                            value={state.searchTerm}
                            onChange={(e) => actions.setSearchTerm(e.target.value)}
                            className="w-full pl-3 pr-8 py-1.5 border-2 border-gray-950 focus:outline-none focus:bg-white text-[11px] font-black rounded-none bg-gray-50 transition-all uppercase tracking-tight"
                        />
                    </div>

                    {/* Type Filter */}
                    <div className="relative">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1 px-1 italic">نوع العملية</label>
                        <Filter className="absolute right-2 top-[24px] text-gray-950 w-3 h-3 pointer-events-none" />
                        <select
                            value={state.filterType}
                            onChange={(e) => actions.setFilterType(e.target.value as 'all' | 'income' | 'expense')}
                            className="w-full pl-3 pr-8 py-1.5 border-2 border-gray-950 focus:outline-none bg-gray-50 font-black text-[11px] appearance-none cursor-pointer rounded-none"
                        >
                            <option value="all">جميع المعاملات</option>
                            <option value="income">إيرادات 🟢</option>
                            <option value="expense">مصروفات 🔴</option>
                        </select>
                    </div>

                    {/* Month Filter */}
                    <div className="relative">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1 px-1 italic">الفترة</label>
                        <Calendar className="absolute right-2 top-[24px] text-gray-950 w-3 h-3 pointer-events-none" />
                        <select
                            value={state.filterMonth}
                            onChange={(e) => actions.setFilterMonth(e.target.value)}
                            className="w-full pl-3 pr-8 py-1.5 border-2 border-gray-950 focus:outline-none bg-gray-50 font-black text-[11px] appearance-none cursor-pointer rounded-none font-mono"
                        >
                            <option value="all">كافة الشهور</option>
                            {state.uniqueMonths.map(month => (
                                <option key={month} value={month}>
                                    {new Date(month + '-01').toLocaleDateString('ar-EG', { year: '2-digit', month: 'short' })}
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

            {/* Add Transaction Modal */}
            <AddTransactionModal
                isOpen={state.showAddModal}
                onClose={() => actions.setShowAddModal(false)}
                onAdd={actions.handleAddTransaction}
            />
        </div>
    );
};

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Plus, CalendarCheck, ArrowUpRight, ArrowDownRight, FileText, RefreshCcw, X, Zap, Wallet, PieChart, Receipt } from 'lucide-react';
import { TransactionsLog } from '../components/TransactionsLog';
import { FinanceCharts } from '../components/FinanceCharts';
import { FinanceStats } from '../components/FinanceStats';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { InvoicePreviewModal } from '../components/InvoicePreviewModal';
import { FixedExpensesManager } from '../components/FixedExpensesManager';
import { useFinance } from '../hooks/useFinance';
import { useNavigate } from 'react-router-dom';
import { CURRENCY_SYMBOL } from '../../../config/constants';

interface PendingInvoice {
    id: string;
    studentName: string;
    amount: number;
    date: string;
    dueDate: string;
    description: string;
    status: 'paid' | 'pending' | 'overdue';
    items?: { description: string; date?: string; amount: number }[];
}

// Floating particles for hero background
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: 8 + Math.random() * 20, delay: Math.random() * 4,
    duration: 6 + Math.random() * 6,
}));

const FAB_ACTIONS = [
    { icon: Plus, label: 'إضافة معاملة', action: 'add' as const, gradient: 'from-primary to-purple-400' },
    { icon: Receipt, label: 'فاتورة جديدة', action: 'invoice' as const, gradient: 'from-info to-blue-400' },
    { icon: RefreshCcw, label: 'ترحيل المصروفات', action: 'convert' as const, gradient: 'from-warning to-amber-400' },
];

export const Finance = () => {
    const { state, actions } = useFinance();
    const navigate = useNavigate();
    const [fabOpen, setFabOpen] = useState(false);
    const [previewInvoice, setPreviewInvoice] = useState<PendingInvoice | null>(null);

    useEffect(() => { document.title = 'المالية | دارين'; }, []);

    const handleFabAction = (action: string) => {
        setFabOpen(false);
        switch (action) {
            case 'add': actions.setShowAddModal(true); break;
            case 'invoice': navigate('/invoices'); break;
            case 'convert': actions.handleConvertAllFixedExpenses(); break;
        }
    };

    // Preview invoice handler — create a PendingInvoice from transaction data
    const handlePreviewInvoice = useMemo(() => (invNumber: string) => {
        const t = state.filteredTransactions?.find((tr: any) => tr.invoiceNumber === invNumber || String(tr.id).includes(invNumber));
        if (t) {
            setPreviewInvoice({
                id: invNumber,
                studentName: t.studentName || 'طالب',
                amount: t.amount || 0,
                date: t.date || new Date().toISOString(),
                dueDate: t.date || new Date().toISOString(),
                description: t.description || '',
                status: t.status === 'completed' ? 'paid' : t.status === 'pending' ? 'pending' : 'overdue',
            });
        }
    }, [state.filteredTransactions]);

    const loading = state.loading;

    if (loading) {
        return (
            <div className="space-y-4 p-4 bg-surface min-h-full">
                <div className="h-28 bg-card rounded-2xl animate-pulse" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => <div key={`finance-${i}`} className="h-28 bg-card rounded-2xl animate-pulse" />)}
                </div>
                <div className="h-96 bg-card rounded-2xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="min-h-full pb-28 overflow-x-hidden relative font-sans bg-surface" dir="rtl">
            {/* ── Hero Section ── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/[6%] to-background border-b border-border/60">
                {/* Particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                    {PARTICLES.map(p => (
                        <motion.div key={p.id}
                            className="absolute rounded-full bg-primary/30"
                            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                            animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
                            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
                        />
                    ))}
                </div>
                <div className="relative z-10 max-w-page mx-auto px-2 pt-4 pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
                                <TrendingUp size={16} />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-main">الإدارة المالية</h1>
                                <p className="text-[8px] text-muted">نظرة شاملة على التدفقات المالية</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => actions.refresh?.()}
                                className="flex items-center gap-1 h-8 px-2.5 rounded-xl border border-border/60 bg-card text-muted text-[9px] font-bold hover:bg-surface hover:text-main transition-all active:scale-95">
                                <RefreshCcw size={11} /> تحديث
                            </button>
                            <button onClick={() => navigate('/monthly-closing')}
                                className="flex items-center gap-1 h-8 px-2.5 rounded-xl border border-border/60 bg-card text-muted text-[9px] font-bold hover:bg-surface hover:text-main transition-all active:scale-95">
                                <CalendarCheck size={11} /> تسوية
                            </button>
                        </div>
                    </div>
                    {/* Hero total */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-center py-4">
                        <p className="text-[9px] font-bold text-muted mb-1">إجمالي الإيرادات</p>
                        <motion.p
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                            className="text-3xl font-bold text-main tabular-nums tracking-tight"
                        >
                            {state.totalIncome?.toLocaleString() || 0}
                            <span className="text-sm text-muted font-bold me-1">{CURRENCY_SYMBOL}</span>
                        </motion.p>
                        <div className="flex items-center justify-center gap-3 mt-2">
                            <div className="flex items-center gap-1">
                                <ArrowUpRight size={10} className="text-success" />
                                <span className="text-[8px] font-bold text-muted">الشهر: <span className="text-main">{(state.monthIncome || 0).toLocaleString()}</span></span>
                            </div>
                            <div className="w-px h-3 bg-border/60" />
                            <div className="flex items-center gap-1">
                                <ArrowDownRight size={10} className="text-error/70" />
                                <span className="text-[8px] font-bold text-muted">مصاريف: <span className="text-main">{(state.monthExpenses || 0).toLocaleString()}</span></span>
                            </div>
                        </div>
                    </motion.div>
                    {/* Quick insight chips */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                        <div className="flex items-center gap-1 px-2 py-1 bg-card rounded-lg border border-border/40 text-[7px] font-bold">
                            <Wallet size={9} className="text-primary" /> صافي الربح: <span className="text-main">{(state.netProfit || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-card rounded-lg border border-border/40 text-[7px] font-bold">
                            <PieChart size={9} className="text-primary" /> هامش الربح: <span className="text-main">{state.profitMargin || 0}%</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-card rounded-lg border border-border/40 text-[7px] font-bold">
                            <FileText size={9} className="text-primary" /> المعاملات: <span className="text-main">{state.filteredTransactions?.length || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="relative z-10 max-w-page mx-auto px-2 -mt-2 space-y-3 pb-16">
                {/* KPI Cards */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <FinanceStats
                        totalIncome={state.totalIncome || 0}
                        monthIncome={state.monthIncome || 0}
                        totalExpenses={state.totalExpenses || 0}
                        monthExpenses={state.monthExpenses || 0}
                        totalFixedExpenses={state.totalFixedExpenses || 0}
                        netProfit={state.netProfit || 0}
                        monthProfit={(state.monthIncome || 0) - (state.monthExpenses || 0)}
                        reportCurrency={state.reportCurrency as string}
                    />
                </motion.div>

                {/* Fixed Expenses */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <FixedExpensesManager
                        expenses={state.fixedExpenses || []}
                        onUpdateExpense={actions.handleUpdateFixedExpense}
                        onConvertAll={actions.handleConvertAllFixedExpenses}
                        onClearAll={actions.handleClearAllFixedExpenses}
                    />
                </motion.div>

                {/* Charts */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <FinanceCharts
                        monthlyData={state.monthlyData || []}
                        pieData={state.pieData || []}
                        totalExpenses={state.totalExpenses || 0}
                        reportCurrency={state.reportCurrency as string}
                    />
                </motion.div>

                {/* Transactions Log */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <TransactionsLog
                        transactions={state.filteredTransactions || []}
                        onPreviewInvoice={handlePreviewInvoice}
                        onAddTransaction={() => actions.setShowAddModal(true)}
                    />
                </motion.div>
            </div>

            {/* ── FAB ── */}
            <div className="fixed bottom-6 start-6 z-50 flex flex-col items-center gap-2">
                <AnimatePresence>
                    {fabOpen && FAB_ACTIONS.map((item, i) => (
                        <motion.button key={item.label}
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.8 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => handleFabAction(item.action)}
                            className="flex items-center gap-2 px-3 py-2 bg-card border border-border/60 shadow-elevation-2 rounded-xl hover:shadow-elevation-3 transition-all active:scale-95 group"
                        >
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white text-[10px]`}>
                                <item.icon size={12} />
                            </div>
                            <span className="text-[8px] font-bold text-main whitespace-nowrap">{item.label}</span>
                        </motion.button>
                    ))}
                </AnimatePresence>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setFabOpen(!fabOpen)}
                    className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-purple-400 text-white shadow-elevation-2 hover:shadow-elevation-3 flex items-center justify-center transition-all"
                >
                    <motion.div animate={{ rotate: fabOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                        <Plus size={18} />
                    </motion.div>
                </motion.button>
            </div>

            {/* ── Modals ── */}
            <AddTransactionModal
                isOpen={state.showAddModal}
                onClose={() => actions.setShowAddModal(false)}
                onAdd={actions.handleAddTransaction}
            />
            <InvoicePreviewModal
                isOpen={!!previewInvoice}
                onClose={() => setPreviewInvoice(null)}
                invoice={previewInvoice || { id: '', studentName: '', amount: 0, date: '', dueDate: '', description: '', status: 'pending' }}
            />
        </div>
    );
};

export default Finance;
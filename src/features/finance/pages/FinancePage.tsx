import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Plus, CalendarCheck, ArrowUpRight, ArrowDownRight, FileText, RefreshCcw, X, Zap, Wallet, PieChart, Receipt } from 'lucide-react';
import { cn } from '../../../lib/utils';
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

const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 5 + 2, duration: Math.random() * 6 + 4, delay: Math.random() * 3,
}));

export const Finance = () => {
    const { state, actions } = useFinance();
    const navigate = useNavigate();
    const [fabOpen, setFabOpen] = useState(false);
    const [previewInvoice, setPreviewInvoice] = useState<PendingInvoice | null>(null);

    useEffect(() => { document.title = 'المالية | دارين السابعة للتعليم والتدريب'; }, []);

    const handleFabAction = (action: string) => {
        setFabOpen(false);
        switch (action) {
            case 'add': actions.setShowAddModal(true); break;
            case 'invoice': navigate('/invoices'); break;
            case 'convert': actions.handleConvertAllFixedExpenses(); break;
        }
    };

    const handlePreviewInvoice = useMemo(() => (invNumber: string) => {
        const t = state.filteredTransactions?.find((tr: any) => tr.invoiceNumber === invNumber || String(tr.id).includes(invNumber));
        if (t) {
            setPreviewInvoice({
                id: invNumber, studentName: t.studentName || 'طالب', amount: t.amount || 0,
                date: t.date || new Date().toISOString(), dueDate: t.date || new Date().toISOString(),
                description: t.description || '', status: t.status === 'completed' ? 'paid' : t.status === 'pending' ? 'pending' : 'overdue',
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
        <div className="min-h-full pb-28 overflow-x-hidden relative" dir="rtl">
            <div className="max-w-page mx-auto px-2">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-6 md:p-8 mb-4">
                    {particles.map(p => (
                        <motion.div key={p.id} className="absolute rounded-full bg-white/10 pointer-events-none"
                            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
                    ))}
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm"><TrendingUp className="text-white" size={20} /></div>
                                <span className="text-white/70 text-xs font-medium">المالية</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">الإدارة المالية</h1>
                            <p className="text-white/70 text-sm">نظرة شاملة على التدفقات المالية</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => actions.refresh?.()}
                                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-3.5 py-2 text-white/80 hover:text-white text-xs font-bold transition-all border border-white/10">
                                <RefreshCcw size={13} /> تحديث
                            </button>
                            <button onClick={() => navigate('/monthly-closing')}
                                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-3.5 py-2 text-white/80 hover:text-white text-xs font-bold transition-all border border-white/10">
                                <CalendarCheck size={13} /> تسوية
                            </button>
                        </div>
                    </div>
                    <div className="relative z-10 flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-success/20"><ArrowUpRight className="text-success" size={14} /></div>
                            <div><p className="text-white/50 text-xs">إيرادات الشهر</p><p className="text-white font-bold text-sm tabular-nums">{(state.monthIncome || 0).toLocaleString()} {CURRENCY_SYMBOL}</p></div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-error/20"><ArrowDownRight className="text-error" size={14} /></div>
                            <div><p className="text-white/50 text-xs">مصاريف الشهر</p><p className="text-white font-bold text-sm tabular-nums">{(state.monthExpenses || 0).toLocaleString()} {CURRENCY_SYMBOL}</p></div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-info/20"><Wallet className="text-info" size={14} /></div>
                            <div><p className="text-white/50 text-xs">صافي الربح</p><p className="text-white font-bold text-sm tabular-nums">{(state.netProfit || 0).toLocaleString()} {CURRENCY_SYMBOL}</p></div>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <FinanceStats totalIncome={state.totalIncome || 0} monthIncome={state.monthIncome || 0}
                        totalExpenses={state.totalExpenses || 0} monthExpenses={state.monthExpenses || 0}
                        totalFixedExpenses={state.totalFixedExpenses || 0} netProfit={state.netProfit || 0}
                        monthProfit={(state.monthIncome || 0) - (state.monthExpenses || 0)} reportCurrency={state.reportCurrency as string} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <FixedExpensesManager expenses={state.fixedExpenses || []}
                        onUpdateExpense={actions.handleUpdateFixedExpense}
                        onConvertAll={actions.handleConvertAllFixedExpenses}
                        onClearAll={actions.handleClearAllFixedExpenses} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <FinanceCharts monthlyData={state.monthlyData || []} pieData={state.pieData || []}
                        totalExpenses={state.totalExpenses || 0} reportCurrency={state.reportCurrency as string} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <TransactionsLog transactions={state.filteredTransactions || []}
                        onPreviewInvoice={handlePreviewInvoice}
                        onAddTransaction={() => actions.setShowAddModal(true)} />
                </motion.div>
            </div>

            <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {fabOpen && ([
                        { icon: Plus, label: 'إضافة معاملة', action: 'add' as const },
                        { icon: Receipt, label: 'فاتورة جديدة', action: 'invoice' as const },
                        { icon: RefreshCcw, label: 'ترحيل المصروفات', action: 'convert' as const },
                    ]).map((item, i) => (
                        <motion.div key={item.label} initial={{ opacity: 0, scale: 0.3, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.3, y: 20 }} transition={{ delay: 0.05 * i }} className="flex items-center gap-2">
                            <span className="bg-card border border-border text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">{item.label}</span>
                            <button onClick={() => handleFabAction(item.action)}
                                className="w-10 h-10 rounded-full bg-primary text-on-primary shadow-lg hover:shadow-xl hover:bg-primary-hover transition-all flex items-center justify-center">
                                <item.icon size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <motion.button onClick={() => setFabOpen(!fabOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={cn("w-12 h-12 rounded-full shadow-xl text-on-primary flex items-center justify-center transition-all", fabOpen ? "bg-error rotate-45" : "bg-primary")}>
                    <TrendingUp size={22} />
                </motion.button>
            </div>

            <AddTransactionModal isOpen={state.showAddModal} onClose={() => actions.setShowAddModal(false)} onAdd={actions.handleAddTransaction} />
            <InvoicePreviewModal isOpen={!!previewInvoice} onClose={() => setPreviewInvoice(null)}
                invoice={previewInvoice || { id: '', studentName: '', amount: 0, date: '', dueDate: '', description: '', status: 'pending' }} />
        </div>
    );
};

export default Finance;

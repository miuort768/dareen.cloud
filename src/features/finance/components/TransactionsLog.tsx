import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, Eye, MoreHorizontal, FileText } from 'lucide-react';

interface Transaction {
    id: number;
    type: 'income' | 'expense';
    description: string;
    amount: number;
    date: string;
    studentName?: string;
    status?: 'pending' | 'completed' | 'cancelled';
    invoiceNumber?: string;
    paymentMethod?: string;
}

interface TransactionsLogProps {
    transactions: Transaction[];
    onPreviewInvoice?: (inv: string) => void;
    onAddTransaction: () => void;
    reportCurrency?: string;
}

const PER_PAGE = 5;

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    completed: { label: 'مكتمل', cls: 'bg-success/[10%] text-success' },
    pending: { label: 'معلق', cls: 'bg-warning/[10%] text-warning' },
    cancelled: { label: 'ملغي', cls: 'bg-error/[10%] text-error' },
};

const TransactionRow = ({ t, onPreviewInvoice }: { t: Transaction; onPreviewInvoice?: (inv: string) => void }) => {
    const [expanded, setExpanded] = useState(false);
    const isIncome = t.type === 'income';
    const badge = t.status ? STATUS_BADGE[t.status] : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-xl bg-card border border-border/40 hover:border-border/80 transition-all"
        >
            {/* Main row */}
            <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpanded(!expanded)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}>
                {/* Avatar circle */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isIncome ? 'bg-success/[12%]' : 'bg-error/[10%]'}`}>
                    {isIncome ? <ArrowUpRight size={13} className="text-success" /> : <ArrowDownRight size={13} className="text-error/70" />}
                </div>
                {/* Description & meta */}
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-main truncate">{t.description}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[8px] text-muted">{t.date}</span>
                        {t.studentName && (
                            <>
                                <span className="text-[6px] text-muted">•</span>
                                <span className="text-[8px] text-muted truncate">{t.studentName}</span>
                            </>
                        )}
                    </div>
                </div>
                {/* Amount */}
                <div className="text-left shrink-0">
                    <p className={`text-[11px] font-bold tabular-nums ${isIncome ? 'text-success' : 'text-error'}`}>
                        {isIncome ? '+' : '-'}{(t.amount ?? 0).toLocaleString()}
                    </p>
                    {badge && (
                        <span className={`inline-block mt-0.5 px-1.5 py-0.5 text-[7px] font-bold rounded-md ${badge.cls}`}>
                            {badge.label}
                        </span>
                    )}
                </div>
                {/* Actions */}
                <div className="flex items-center gap-0.5">
                    {t.invoiceNumber && onPreviewInvoice && (
                        <button onClick={(e) => { e.stopPropagation(); onPreviewInvoice(t.invoiceNumber!); }}
                            className="p-1 rounded-lg text-muted hover:text-main hover:bg-surface transition-all" title="عرض الفاتورة">
                            <Eye size={12} />
                        </button>
                    )}
                    <div className="text-muted group-hover:text-main transition-all">
                        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </div>
                </div>
            </div>
            {/* Expanded details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-3 pb-3 pt-0 border-t border-border/30 mx-3 space-y-1.5">
                            {t.invoiceNumber && (
                                <div className="flex items-center gap-1.5 text-[8px] font-bold text-muted">
                                    <FileText size={10} /> فاتورة: <span className="text-main">{t.invoiceNumber}</span>
                                </div>
                            )}
                            {t.paymentMethod && (
                                <div className="flex items-center gap-1.5 text-[8px] font-bold text-muted">
                                    <MoreHorizontal size={10} /> وسيلة الدفع: <span className="text-main">{t.paymentMethod}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export const TransactionsLog = ({ transactions, onPreviewInvoice, onAddTransaction }: TransactionsLogProps) => {
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(transactions.length / PER_PAGE));
    const paged = transactions.slice(0, page * PER_PAGE);

    return (
        <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-3.5 border-b border-border/40">
                <div>
                    <h2 className="text-xs font-bold text-main">سجل المعاملات</h2>
                    <p className="text-[8px] text-muted mt-0.5">{transactions.length} معاملة</p>
                </div>
                <button onClick={onAddTransaction}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-primary text-on-primary text-[8px] font-bold rounded-xl hover:bg-primary-hover transition-all active:scale-95">
                    + إضافة
                </button>
            </div>
            <div className="p-2.5 space-y-1.5">
                {paged.length === 0 ? (
                    <div className="text-center py-6 opacity-50">
                        <p className="text-[9px] font-bold text-muted">لا توجد معاملات بعد</p>
                    </div>
                ) : (
                    paged.map(t => <TransactionRow key={t.id} t={t} onPreviewInvoice={onPreviewInvoice} />)
                )}
            </div>
            {totalPages > 1 && page < totalPages && (
                <div className="px-3 pb-3 pt-0">
                    <button onClick={() => setPage(p => p + 1)}
                        className="w-full py-2 text-[8px] font-bold text-primary bg-primary/[6%] rounded-xl hover:bg-primary/[12%] transition-all active:scale-[0.99]">
                        عرض المزيد ({transactions.length - page * PER_PAGE} متبقي)
                    </button>
                </div>
            )}
        </div>
    );
};
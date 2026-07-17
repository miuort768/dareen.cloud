import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Clock, DollarSign, X, History, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Transaction } from '../../../types';
import { CURRENCY_SYMBOL } from '../../../config/constants';
import { cn } from '../../../lib/utils';

interface TransactionsLogProps {
    transactions: Transaction[];
    totalCount: number;
    onDeleteAll: () => void;
}

const PAGE_SIZE = 15;

const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'completed') return <span className="inline-flex items-center gap-1 text-micro font-bold text-success bg-success-soft px-2 py-0.5 uppercase tracking-wide rounded-lg"><CheckCircle2 size={9} /> معتمدة</span>;
    if (status === 'pending') return <span className="inline-flex items-center gap-1 text-micro font-bold text-warning bg-warning-soft px-2 py-0.5 uppercase tracking-wide rounded-lg"><Clock size={9} /> مراجعة</span>;
    return <span className="inline-flex items-center gap-1 text-micro font-bold text-dim bg-surface px-2 py-0.5 uppercase tracking-wide rounded-lg"><X size={9} /> ملغاة</span>;
};

export const TransactionsLog = ({ transactions, totalCount, onDeleteAll }: TransactionsLogProps) => {
    const [page, setPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
    const pageTx = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Reset to page 1 when transactions change (filter applied)
    if (page > totalPages && page !== 1) setPage(1);

    return (
        <div className="bg-card border border-border shadow-sm overflow-hidden rounded-2xl" dir="rtl">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-border bg-surface">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-primary-soft text-primary rounded-xl">
                        <History size={15} />
                    </div>
                    <div>
                        <h2 className="text-xs font-medium text-main uppercase tracking-widest">سجل العمليات المالية</h2>
                        <p className="text-micro text-dim font-normal mt-0.5 uppercase tracking-wide">
                            {totalCount} معاملة • صفحة {page} من {totalPages}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onDeleteAll}
                    className="flex items-center gap-2 px-4 py-2 text-micro font-bold transition-all uppercase tracking-widest shadow-sm rounded-xl bg-error-soft text-error border border-error hover:bg-error hover:text-on-error hover:border-error"
                >
                    <Trash2 size={12} />
                    تصفير الأرشيف
                </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-start">
                    <thead>
                        <tr className="bg-primary">
                            <th className="px-5 py-3 text-micro font-bold uppercase tracking-widest text-on-primary opacity-70 text-center">#</th>
                            <th className="px-5 py-3 text-micro font-bold uppercase tracking-widest text-on-primary opacity-70 text-center">النوع</th>
                            <th className="px-5 py-3 text-micro font-bold uppercase tracking-widest text-on-primary opacity-70">البيان</th>
                            <th className="px-5 py-3 text-micro font-bold uppercase tracking-widest text-on-primary opacity-70 text-center">التصنيف</th>
                            <th className="px-5 py-3 text-micro font-bold uppercase tracking-widest text-on-primary opacity-70 text-center">التاريخ</th>
                            <th className="px-5 py-3 text-micro font-bold uppercase tracking-widest text-on-primary opacity-70 text-center">القيمة</th>
                            <th className="px-5 py-3 text-micro font-bold uppercase tracking-widest text-on-primary opacity-70 text-center">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {pageTx.length > 0 ? pageTx.map((tx, idx) => {
                            const globalIdx = (page - 1) * PAGE_SIZE + idx + 1;
                            return (
                                <tr key={tx.id} className="hover:bg-hover transition-colors">
                                    <td className="px-5 py-3 text-center">
                                        <span className="text-micro font-medium text-dim font-mono">{String(globalIdx).padStart(2, '0')}</span>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <div className={cn("w-8 h-8 flex items-center justify-center mx-auto rounded-xl", tx.type === 'income' ? 'bg-success-soft text-success' : 'bg-error-soft text-error')}>
                                            {tx.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <p className="text-xs font-normal text-main">{tx.description || 'بدون وصف'}</p>
                                        <p className="text-micro text-dim font-normal mt-0.5 font-mono">#{tx.id.substring(0, 8)}</p>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <span className={cn("inline-block px-2 py-0.5 text-micro font-bold uppercase tracking-wide rounded-lg", tx.type === 'income' ? 'bg-success-soft text-success' : 'bg-primary-soft text-primary')}>
                                            {tx.category}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <span className="text-micro font-normal text-muted font-mono">
                                            {new Date(tx.date).toLocaleDateString('ar-EG')}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <span className={cn(
                                            "text-sm font-medium font-mono",
                                            tx.type === 'income' ? 'text-success' : 'text-error'
                                        )}>
                                            {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                                            <span className="text-micro font-normal ms-0.5">{CURRENCY_SYMBOL}</span>
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <StatusBadge status={tx.status} />
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-16 text-center">
                                    <DollarSign size={32} className="mx-auto text-dim mb-2" />
                                    <p className="text-micro font-medium text-dim uppercase tracking-widest">لا توجد عمليات مسجلة</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
                {pageTx.length > 0 ? pageTx.map((tx, idx) => {
                    const globalIdx = (page - 1) * PAGE_SIZE + idx + 1;
                    return (
                        <div key={tx.id} className="p-4 flex items-center gap-3">
                            <div className={cn("w-10 h-10 flex items-center justify-center shrink-0 relative rounded-xl", tx.type === 'income' ? 'bg-success-soft text-success' : 'bg-error-soft text-error')}>
                                {tx.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                <span className="absolute -top-1 -start-1 text-micro font-bold w-4 h-4 flex items-center justify-center bg-primary text-on-primary rounded-md">{globalIdx}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <h3 className="font-normal text-xs text-main truncate">{tx.description || 'معاملة'}</h3>
                                    <span className={cn("text-sm font-medium font-mono ms-2 shrink-0", tx.type === 'income' ? 'text-success' : 'text-error')}>
                                        {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-micro font-normal text-dim">{tx.category}</span>
                                    <span className="w-1 h-1 bg-border rounded-full" />
                                    <span className="text-micro text-dim font-mono">{new Date(tx.date).toLocaleDateString('ar-EG')}</span>
                                    <span className="w-1 h-1 bg-border rounded-full" />
                                    <StatusBadge status={tx.status} />
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="py-16 text-center">
                        <DollarSign size={32} className="mx-auto text-dim mb-2" />
                        <p className="text-micro font-medium text-dim uppercase tracking-widest">خالٍ من البيانات</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface">
                    <p className="text-micro font-bold text-dim">
                        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, transactions.length)} من {transactions.length}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="w-8 h-8 flex items-center justify-center bg-card border border-border text-muted hover:bg-primary hover:text-on-primary hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-xl"
                        >
                            <ChevronRight size={14} />
                        </button>
                        {[...Array(Math.min(totalPages, 7))].map((_, i) => (
                            <button
                                key={`tx-${i}`}
                                onClick={() => setPage(i + 1)}
                                className={cn(
                                    "w-8 h-8 text-xs font-medium border transition-all rounded-xl",
                                    page === i + 1
                                        ? "bg-primary text-on-primary border-primary"
                                        : "bg-card border-border text-muted hover:border-primary"
                                )}
                            >
                                {i + 1}
                            </button>
                        ))}
                        {totalPages > 7 && <span className="text-dim text-xs font-normal px-1">...</span>}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="w-8 h-8 flex items-center justify-center bg-card border border-border text-muted hover:bg-primary hover:text-on-primary hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-xl"
                        >
                            <ChevronLeft size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

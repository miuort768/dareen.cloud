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
    if (status === 'completed') return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 uppercase tracking-wide rounded-none"><CheckCircle2 size={9} /> معتمدة</span>;
    if (status === 'pending') return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 uppercase tracking-wide rounded-none"><Clock size={9} /> مراجعة</span>;
    return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 uppercase tracking-wide rounded-none"><X size={9} /> ملغاة</span>;
};

export const TransactionsLog = ({ transactions, totalCount, onDeleteAll }: TransactionsLogProps) => {
    const [page, setPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
    const pageTx = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Reset to page 1 when transactions change (filter applied)
    if (page > totalPages && page !== 1) setPage(1);

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm overflow-hidden rounded-none" dir="rtl">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-none" style={{ backgroundColor: '#64748B12', color: '#64748B' }}>
                        <History size={15} />
                    </div>
                    <div>
                        <h2 className="text-xs font-medium text-slate-800 dark:text-white uppercase tracking-widest">سجل العمليات المالية</h2>
                        <p className="text-[9px] text-slate-400 font-normal mt-0.5 uppercase tracking-wide">
                            {totalCount} معاملة • صفحة {page} من {totalPages}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onDeleteAll}
                    className="flex items-center gap-2 px-4 py-2 text-[9px] font-bold transition-all uppercase tracking-widest shadow-sm rounded-none" style={{ backgroundColor: '#F43F5E12', color: '#F43F5E', border: '1px solid #F43F5E30' }} 
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F43F5E'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#F43F5E'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F43F5E12'; e.currentTarget.style.color = '#F43F5E'; e.currentTarget.style.borderColor = '#F43F5E30'; }}
                >
                    <Trash2 size={12} />
                    تصفير الأرشيف
                </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-right">
                    <thead>
                        <tr className="bg-[#0F172A]">
                            <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-white/70 text-center">#</th>
                            <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-white/70 text-center">النوع</th>
                            <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-white/70">البيان</th>
                            <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-white/70 text-center">التصنيف</th>
                            <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-white/70 text-center">التاريخ</th>
                            <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-white/70 text-center">القيمة</th>
                            <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-white/70 text-center">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {pageTx.length > 0 ? pageTx.map((tx, idx) => {
                            const globalIdx = (page - 1) * PAGE_SIZE + idx + 1;
                            return (
                                <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-5 py-3 text-center">
                                        <span className="text-[10px] font-medium text-slate-300 font-mono">{String(globalIdx).padStart(2, '0')}</span>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <div className="w-8 h-8 flex items-center justify-center mx-auto rounded-none" style={{ backgroundColor: tx.type === 'income' ? '#10B98112' : '#F43F5E12', color: tx.type === 'income' ? '#10B981' : '#F43F5E' }}>
                                            {tx.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <p className="text-xs font-normal text-slate-800 dark:text-white">{tx.description || 'بدون وصف'}</p>
                                        <p className="text-[9px] text-slate-400 font-normal mt-0.5 font-mono">#{tx.id.substring(0, 8)}</p>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded-none" style={{ backgroundColor: tx.type === 'income' ? '#10B98112' : '#2563EB12', color: tx.type === 'income' ? '#059669' : '#2563EB' }}>
                                            {tx.category}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <span className="text-[10px] font-normal text-slate-500 font-mono">
                                            {new Date(tx.date).toLocaleDateString('ar-EG')}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <span className={cn(
                                            "text-sm font-medium font-mono",
                                            tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                                        )}>
                                            {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                                            <span className="text-[9px] font-normal mr-0.5">{CURRENCY_SYMBOL}</span>
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
                                    <DollarSign size={32} className="mx-auto text-slate-200 dark:text-slate-700 mb-2" />
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">لا توجد عمليات مسجلة</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-50 dark:divide-slate-800">
                {pageTx.length > 0 ? pageTx.map((tx, idx) => {
                    const globalIdx = (page - 1) * PAGE_SIZE + idx + 1;
                    return (
                        <div key={tx.id} className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center shrink-0 relative rounded-none" style={{ backgroundColor: tx.type === 'income' ? '#10B98112' : '#F43F5E12', color: tx.type === 'income' ? '#10B981' : '#F43F5E' }}>
                                {tx.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                <span className="absolute -top-1 -right-1 text-[8px] font-bold w-4 h-4 flex items-center justify-center" style={{ backgroundColor: '#0F172A', color: 'white' }}>{globalIdx}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <h3 className="font-normal text-xs text-slate-800 dark:text-white truncate">{tx.description || 'معاملة'}</h3>
                                    <span className={cn("text-sm font-medium font-mono mr-2 shrink-0", tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500')}>
                                        {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-normal text-slate-400">{tx.category}</span>
                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                    <span className="text-[9px] text-slate-400 font-mono">{new Date(tx.date).toLocaleDateString('ar-EG')}</span>
                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                    <StatusBadge status={tx.status} />
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="py-16 text-center">
                        <DollarSign size={32} className="mx-auto text-slate-200 mb-2" />
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">خالٍ من البيانات</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/40">
                    <p className="text-[10px] font-bold text-slate-400">
                        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, transactions.length)} من {transactions.length}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-none"
                        >
                            <ChevronRight size={14} />
                        </button>
                        {[...Array(Math.min(totalPages, 7))].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={cn(
                                    "w-8 h-8 text-[11px] font-medium border transition-all rounded-none",
                                    page === i + 1
                                        ? "bg-slate-900 text-white border-slate-900"
                                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
                                )}
                            >
                                {i + 1}
                            </button>
                        ))}
                        {totalPages > 7 && <span className="text-slate-400 text-xs font-normal px-1">...</span>}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-none"
                        >
                            <ChevronLeft size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

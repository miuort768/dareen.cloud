import { ArrowDownRight, ArrowUpRight, CheckCircle2, Clock, DollarSign, X, History, Trash2, Search } from 'lucide-react';
import type { Transaction } from '../../../types';
import { CURRENCY_SYMBOL } from '../../../config/constants';
import { cn } from '../../../lib/utils';

interface TransactionsLogProps {
    transactions: Transaction[];
    totalCount: number;
    onDeleteAll: () => void;
}

export const TransactionsLog = ({ transactions, totalCount, onDeleteAll }: TransactionsLogProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm overflow-hidden" dir="rtl">
            {/* Header Section */}
            <div className="p-4 md:p-6 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shadow-lg">
                         <History size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">
                            سجل العمليات المالية
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">نظام آمن ومحمي</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex-1 md:flex-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2 flex flex-col items-center justify-center min-w-[80px]">
                         <span className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">إجمالي العمليات</span>
                         <span className="text-sm font-black text-slate-800 dark:text-white tabular-nums">{totalCount}</span>
                    </div>
                    
                    <button
                        onClick={onDeleteAll}
                        className="px-5 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-rose-500 hover:text-white flex items-center gap-2"
                    >
                        <Trash2 size={14} />
                        <span>تصفير الأرشيف</span>
                    </button>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-right">
                    <thead>
                        <tr className="bg-slate-900 text-white border-b border-slate-800">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">التوجيه</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">البيان المالي</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">التصنيف</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">التاريخ</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">القيمة</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {transactions.length > 0 ? (
                            transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="w-10 h-10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                            {tx.type === 'income' ? (
                                                <div className="w-full h-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center">
                                                    <ArrowUpRight size={18} strokeWidth={3} />
                                                </div>
                                            ) : (
                                                <div className="w-full h-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center">
                                                    <ArrowDownRight size={18} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                            {tx.description || 'بدون وصف إضافي'}
                                        </p>
                                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">المعرف: {tx.id.substring(0, 8)}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={cn(
                                            "inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest italic",
                                            tx.type === 'income' 
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' 
                                            : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                                        )}>
                                            {tx.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                         <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 font-mono tracking-tighter">
                                            {new Date(tx.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className={cn(
                                            "inline-flex items-baseline gap-1 font-black font-mono",
                                            tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                                        )}>
                                            <span className="text-sm">
                                                {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                                            </span>
                                            <span className="text-[9px]">{CURRENCY_SYMBOL}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {tx.status === 'completed' && <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase italic tracking-widest"><CheckCircle2 size={12} /> معتمدة</span>}
                                        {tx.status === 'pending' && <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-amber-600 uppercase italic tracking-widest"><Clock size={12} /> قيد المراجعة</span>}
                                        {tx.status === 'cancelled' && <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase italic tracking-widest"><X size={12} /> ملغاة</span>}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4 opacity-30">
                                        <DollarSign size={48} className="text-slate-400" />
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">لا توجد عمليات مسجلة حالياً</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View (Modernized Cards) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.length > 0 ? (
                    transactions.map((tx) => (
                        <div key={tx.id} className="p-5 bg-white dark:bg-slate-900 active:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 flex items-center justify-center shadow-sm",
                                        tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                                    )}>
                                        {tx.type === 'income' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn(
                                                "text-[8px] font-black px-1.5 py-0.5 uppercase tracking-widest italic",
                                                tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                                            )}>
                                                {tx.category}
                                            </span>
                                            <span className="text-[9px] text-slate-400 font-mono" dir="ltr">
                                                {new Date(tx.date).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                        <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase leading-tight">
                                            {tx.description || 'معاملة مالية'}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4">
                                <div className={cn(
                                    "px-4 py-2 min-w-[120px] text-center border",
                                    tx.type === 'income' 
                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' 
                                    : 'bg-rose-500/5 border-rose-500/20 text-rose-500'
                                )}>
                                    <span className="text-lg font-black font-mono tabular-nums" dir="ltr">
                                        {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-left">
                                    {tx.status === 'completed' && <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest italic">معتمدة</span>}
                                    {tx.status === 'pending' && <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest italic">مراجعة</span>}
                                    {tx.status === 'cancelled' && <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">ملغاة</span>}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center opacity-30">
                        <DollarSign size={40} className="mx-auto text-slate-400 mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">خالٍ من البيانات</p>
                    </div>
                )}
            </div>
        </div>
    );
};

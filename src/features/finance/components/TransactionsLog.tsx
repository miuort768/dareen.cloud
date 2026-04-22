import { ArrowDownRight, ArrowUpRight, CheckCircle2, Clock, DollarSign, X, History, Trash2 } from 'lucide-react';
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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden" dir="rtl">
            {/* Header Section */}
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center rounded-xl">
                         <History size={16} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">سجل العمليات المالية</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">الأرشيف الكامل • {totalCount} معاملة</p>
                    </div>
                </div>
                
                <button
                    onClick={onDeleteAll}
                    className="px-4 py-1.5 bg-rose-50 text-rose-600 font-bold text-[10px] rounded-lg transition-all hover:bg-rose-500 hover:text-white flex items-center gap-2"
                >
                    <Trash2 size={12} />
                    <span>تصفير الأرشيف</span>
                </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-right">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">التوجيه</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">البيان المالي</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase text-center">التصنيف</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase text-center">التاريخ</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase text-center">القيمة</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase text-center">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {transactions.length > 0 ? (
                            transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-lg">
                                            {tx.type === 'income' ? (
                                                <div className="w-full h-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center rounded-lg">
                                                    <ArrowUpRight size={14} />
                                                </div>
                                            ) : (
                                                <div className="w-full h-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center rounded-lg">
                                                    <ArrowDownRight size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-slate-800 dark:text-white">{tx.description || 'بدون وصف'}</p>
                                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">ID: {tx.id.substring(0, 8)}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={cn(
                                            "inline-block px-2 py-0.5 text-[9px] font-bold rounded-md",
                                            tx.type === 'income' 
                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' 
                                            : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20'
                                        )}>
                                            {tx.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                         <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                                            {new Date(tx.date).toLocaleDateString('ar-EG')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className={cn(
                                            "inline-flex items-baseline gap-0.5 font-bold font-mono",
                                            tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                                        )}>
                                            <span className="text-xs">
                                                {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                                            </span>
                                            <span className="text-[9px]">{CURRENCY_SYMBOL}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {tx.status === 'completed' && <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase tracking-wide"><CheckCircle2 size={10} /> معتمدة</span>}
                                        {tx.status === 'pending' && <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 uppercase tracking-wide"><Clock size={10} /> مراجعة</span>}
                                        {tx.status === 'cancelled' && <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wide"><X size={10} /> ملغاة</span>}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center">
                                    <DollarSign size={32} className="mx-auto text-slate-200 mb-2" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">لا توجد عمليات مسجلة</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-slate-50 dark:divide-slate-800">
                {transactions.length > 0 ? (
                    transactions.map((tx) => (
                        <div key={tx.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 flex items-center justify-center rounded-xl",
                                    tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                )}>
                                    {tx.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-xs text-slate-800 dark:text-white leading-tight">{tx.description || 'معاملة'}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] font-bold text-slate-400">{tx.category}</span>
                                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                        <span className="text-[9px] text-slate-400 font-mono">{new Date(tx.date).toLocaleDateString('ar-EG')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={cn(
                                "text-sm font-black font-mono",
                                tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                            )}>
                                {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-16 text-center opacity-30">
                        <DollarSign size={32} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">خالٍ من البيانات</p>
                    </div>
                )}
            </div>
        </div>
    );
};

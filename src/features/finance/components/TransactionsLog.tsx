import React from 'react';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Clock, DollarSign, X, History } from 'lucide-react';
import type { Transaction } from '../../../types';
import { CURRENCY_SYMBOL } from '../../../config/constants';
import { cn } from '../../../lib/utils';

interface TransactionsLogProps {
    transactions: Transaction[];
    totalCount: number;
    onDeleteAll: () => void;
}

export const TransactionsLog: React.FC<TransactionsLogProps> = ({ transactions, totalCount, onDeleteAll }) => {
    return (
        <div className="bg-white border-4 border-gray-950 overflow-hidden shadow-[10px_10px_0px_0px_black] rounded-none">
            <div className="p-4 bg-gray-50 border-b-2 border-gray-950 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-950 text-white flex items-center justify-center border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] transform -rotate-3">
                         <History size={18} />
                    </div>
                    <div>
                        <h2 className="text-base md:text-lg font-black text-gray-950 flex items-center gap-2 uppercase tracking-tighter italic">
                            سجل العمليات المالية المؤرشفة
                        </h2>
                        <div className="flex items-center gap-1 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-emerald-500 border border-gray-950"></div>
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest italic">مزامنة تامة</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none bg-white border-2 border-gray-950 px-3 py-1 shadow-[1px_1px_0px_0px_black] flex flex-col items-center">
                         <span className="text-[8px] font-black text-gray-400 uppercase leading-none mb-0.5">العدد</span>
                         <span className="text-sm font-black text-gray-950 leading-none">{totalCount}</span>
                    </div>
                    <button
                        onClick={onDeleteAll}
                        className="px-4 py-2 bg-white border-2 border-gray-950 text-rose-600 font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_black] hover:bg-rose-600 hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none min-w-[100px]"
                    >
                        تصفير السجل
                    </button>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-gray-950 text-white">
                            <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-center border-l border-white/10 italic">توجيه</th>
                            <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-center border-l border-white/10 italic">القسم</th>
                            <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest border-l border-white/10 italic">البيان</th>
                            <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-center border-l border-white/10 italic">تاريخ</th>
                            <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-center border-l border-white/10 italic">القيمة</th>
                            <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-center italic">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-4 divide-gray-100">
                        {transactions.length > 0 ? (
                            transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-primary-50/30 transition-all cursor-default group border-b-2 border-gray-100">
                                    <td className="px-3 py-3 text-center border-l border-gray-100">
                                        <div className="flex justify-center">
                                            {tx.type === 'income' ? (
                                                <div className="w-8 h-8 bg-emerald-500 text-white border-2 border-gray-950 flex items-center justify-center shadow-[1px_1px_0px_0px_black] transform group-hover:rotate-6 transition-transform">
                                                    <ArrowUpRight size={16} strokeWidth={3} />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 bg-rose-500 text-white border-2 border-gray-950 flex items-center justify-center shadow-[1px_1px_0px_0px_black] transform group-hover:-rotate-6 transition-transform">
                                                    <ArrowDownRight size={16} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-center border-l border-gray-100">
                                        <span className={cn(
                                            "inline-block px-2 py-0.5 border border-gray-950 font-black text-[9px] uppercase shadow-[1px_1px_0px_0px_black] tracking-widest italic",
                                            tx.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                        )}>
                                            {tx.category}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 border-l border-gray-100">
                                        <p className="text-xs font-black text-gray-950 uppercase tracking-tight leading-tight">
                                            {tx.description || 'لا يوجد وصف'}
                                        </p>
                                        <p className="text-[8px] text-gray-400 font-bold mt-0.5 uppercase tracking-widest">REF: {tx.id.substring(0, 6)}</p>
                                    </td>
                                    <td className="px-3 py-3 text-center border-l border-gray-100">
                                        <div className="bg-gray-100 border border-gray-950 px-2 py-0.5 inline-block shadow-[1px_1px_0px_0px_black]">
                                             <span className="text-[10px] font-black text-gray-950 font-mono" dir="ltr">
                                                {new Date(tx.date).toLocaleDateString('ar-EG', { year: '2-digit', month: '2-digit', day: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-center border-l border-gray-100">
                                        <div className={cn(
                                            "px-2 py-1 border border-gray-950 shadow-[2px_2px_0px_0px_black] inline-block min-w-[90px]",
                                            tx.type === 'income' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
                                        )}>
                                            <span className="text-sm font-black font-mono leading-none flex items-baseline justify-center gap-1" dir="ltr">
                                                {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                                                <span className="text-[8px] uppercase">{CURRENCY_SYMBOL}</span>
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        {tx.status === 'completed' && <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase italic tracking-widest"><CheckCircle2 size={10} /> معتمدة</span>}
                                        {tx.status === 'pending' && <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-600 uppercase italic tracking-widest"><Clock size={10} /> مراجعة</span>}
                                        {tx.status === 'cancelled' && <span className="inline-flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase italic tracking-widest"><X size={10} /> موقوفة</span>}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-6">
                                        <div className="w-24 h-24 bg-gray-100 text-gray-400 border-4 border-dashed border-gray-300 flex items-center justify-center transform rotate-6">
                                            <DollarSign size={48} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-2xl text-gray-950 uppercase tracking-tighter">أرشيف المعاملات فارغ</h3>
                                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2 italic">لم يتم العثور على أية سجلات تطابق عوامل التصفية الحالية</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden divide-y-8 divide-gray-100">
                {transactions.length > 0 ? (
                    transactions.map((tx) => (
                        <div key={tx.id} className="p-6 bg-white active:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    {tx.type === 'income' ? (
                                        <div className="w-14 h-14 bg-emerald-500 text-white border-2 border-gray-950 flex items-center justify-center shadow-[4px_4px_0px_0px_black] transform -rotate-3">
                                            <ArrowUpRight size={28} strokeWidth={3} />
                                        </div>
                                    ) : (
                                        <div className="w-14 h-14 bg-rose-500 text-white border-2 border-gray-950 flex items-center justify-center shadow-[4px_4px_0px_0px_black] transform rotate-3">
                                            <ArrowDownRight size={28} strokeWidth={3} />
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={cn(
                                                "text-[9px] font-black px-3 py-0.5 border-2 border-gray-950 shadow-[1px_1px_0px_0px_black] uppercase tracking-widest italic",
                                                tx.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                            )}>
                                                {tx.category}
                                            </span>
                                            <span className="text-[9px] text-gray-400 font-mono font-black" dir="ltr">
                                                {new Date(tx.date).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                        <h3 className="font-black text-lg text-gray-950 leading-tight uppercase tracking-tighter">
                                            {tx.description || 'بدون وصف'}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between border-t-2 border-gray-100 pt-6">
                                <div className={cn(
                                    "px-6 py-3 border-2 border-gray-950 shadow-[4px_4px_0px_0px_black] min-w-[140px] text-center",
                                    tx.type === 'income' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
                                )}>
                                    <span className="text-xl font-black font-mono leading-none" dir="ltr">
                                        {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-left">
                                    {tx.status === 'completed' && <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase italic tracking-[0.2em]"><CheckCircle2 size={12} /> معتمدة</span>}
                                    {tx.status === 'pending' && <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-amber-600 uppercase italic tracking-[0.2em]"><Clock size={12} /> مراجعة</span>}
                                    {tx.status === 'cancelled' && <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase italic tracking-[0.2em]"><X size={12} /> ملغاة</span>}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center bg-gray-50">
                        <DollarSign size={40} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 font-black text-sm uppercase italic tracking-widest">لا يوجد عمليات مالية حالياً</p>
                    </div>
                )}
            </div>
        </div>
    );
};


import React from 'react';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Clock, CreditCard, DollarSign, Trash2, X } from 'lucide-react';
import type { Transaction } from '../../../types';
import { CURRENCY_SYMBOL } from '../../../config/constants';

interface TransactionsLogProps {
    transactions: Transaction[];
    totalCount: number;
    onDeleteAll: () => void;
    onDelete: (id: string) => void;
}

export const TransactionsLog: React.FC<TransactionsLogProps> = ({ transactions, totalCount, onDeleteAll, onDelete }) => {
    const handleDelete = (id: string) => {
        onDelete(id);
    };

    return (
        <div className="bg-white border border-gray-200 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between dark:border-gray-800">
                <div>
                    <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CreditCard size={18} className="text-gray-400 md:w-5 md:h-5" />
                        سجل المعاملات
                    </h2>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-[10px] md:text-xs font-bold bg-gray-100 px-2 md:px-3 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-none">
                        {totalCount} معاملة
                    </span>
                    <button
                        onClick={onDeleteAll}
                        className="text-[10px] font-black bg-red-50 text-red-600 px-2 md:px-3 py-1 hover:bg-red-100 transition-all flex items-center gap-1.5 rounded-none"
                    >
                        <Trash2 size={12} />
                        <span className="hidden md:inline">حذف الكل</span>
                        <span className="md:hidden">حذف</span>
                    </button>
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-primary-600 text-white dark:bg-primary-900">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-center">النوع</th>
                            <th className="px-6 py-4 text-xs font-bold text-center">التصنيف</th>
                            <th className="px-6 py-4 text-xs font-bold text-center">التفاصيل / الوصف</th>
                            <th className="px-6 py-4 text-xs font-bold text-center">التاريخ</th>
                            <th className="px-6 py-4 text-xs font-bold text-center">المبلغ</th>
                            <th className="px-6 py-4 text-xs font-bold text-center">الحالة</th>
                            <th className="px-6 py-4 text-xs font-bold text-center">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {transactions.length > 0 ? (
                            transactions.map((tx) => {
                                return (
                                    <tr key={tx.id} className="hover:bg-primary-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center">
                                                {tx.type === 'income' ? (
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center dark:bg-emerald-900/30">
                                                        <ArrowUpRight size={18} />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center dark:bg-red-900/30">
                                                        <ArrowDownRight size={18} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${tx.type === 'income'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                                                }`}>
                                                {tx.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-xs mx-auto">
                                                {tx.description || '-'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400 font-mono" dir="ltr">
                                                {(() => {
                                                    try {
                                                        return tx.date ? new Date(tx.date).toLocaleDateString('ar-EG') : '-';
                                                    } catch (e) { return '-'; }
                                                })()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-base font-bold font-mono ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                                                }`} dir="ltr">
                                                {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} <span className="text-xs">{CURRENCY_SYMBOL}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {tx.status === 'completed' && <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 size={12} /> مكتمل</span>}
                                            {tx.status === 'pending' && <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600"><Clock size={12} /> معلق</span>}
                                            {tx.status === 'cancelled' && <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-400"><X size={12} /> ملغي</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleDelete(tx.id)}
                                                className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all mx-auto shadow-sm"
                                                title="حذف المعاملة"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                            <DollarSign size={32} />
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">لا توجد معاملات</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">لم يتم العثور على أي بيانات تطابق بحثك</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden">
                {transactions.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {transactions.map((tx) => {
                            return (
                                <div key={tx.id} className="p-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            {tx.type === 'income' ? (
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center dark:bg-emerald-900/30">
                                                    <ArrowUpRight size={20} />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center dark:bg-red-900/30">
                                                    <ArrowDownRight size={20} />
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${tx.type === 'income'
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                                                        }`}>
                                                        {tx.category}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-mono" dir="ltr">
                                                        {(() => {
                                                            try {
                                                                return tx.date ? new Date(tx.date).toLocaleDateString('ar-EG') : '-';
                                                            } catch (e) { return '-'; }
                                                        })()}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-[180px]">
                                                    {tx.description || '-'}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="text-left flex flex-col items-end gap-2">
                                            <span className={`text-base font-black font-mono block ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                                                }`} dir="ltr">
                                                {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {tx.status === 'completed' && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600"><CheckCircle2 size={10} /> مكتمل</span>}
                                                <button
                                                    onClick={() => handleDelete(tx.id)}
                                                    className="p-2.5 rounded bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-3">
                            <DollarSign size={24} />
                        </div>
                        <p className="text-gray-500 font-bold text-sm">لا توجد معاملات</p>
                    </div>
                )}
            </div>
        </div>
    );
};


import React from 'react';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Clock, CreditCard, DollarSign, Trash2, X } from 'lucide-react';
import type { Transaction } from '../../../types';
import { CURRENCY_SYMBOL } from '../../../config/constants';

interface TransactionsLogProps {
    transactions: Transaction[];
    totalCount: number;
    onDeleteAll: () => void;
}

export const TransactionsLog: React.FC<TransactionsLogProps> = ({ transactions, totalCount, onDeleteAll }) => {
    return (
        <div className="bg-white border border-gray-200 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between dark:border-gray-800">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CreditCard size={20} className="text-gray-400" />
                        سجل المعاملات المالية
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-none">
                        عدد المعاملات: {totalCount}
                    </span>
                    <button
                        onClick={onDeleteAll}
                        className="text-[10px] font-black bg-red-50 text-red-600 px-3 py-1 hover:bg-red-100 transition-all flex items-center gap-1.5 rounded-none"
                    >
                        <Trash2 size={12} />
                        حذف الكل
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-primary-600 text-white dark:bg-primary-900">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-center">النوع</th>
                            <th className="px-6 py-4 text-xs font-bold text-center">التصنيف</th>
                            <th className="px-6 py-4 text-xs font-bold text-center">التفاصيل / الوصف</th>
                            <th className="px-6 py-4 text-xs font-bold text-center">التاريخ</th>
                            <th className="px-6 py-4 text-xs font-bold text-center">المبلغ</th>
                            <th className="px-6 py-4 text-xs font-bold text-center">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {transactions.length > 0 ? (
                            transactions.slice(0, 5).map((tx) => (
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
                                            {new Date(tx.date).toLocaleDateString('ar-EG')}
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
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
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
        </div>
    );
};

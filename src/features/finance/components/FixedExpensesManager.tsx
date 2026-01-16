
import React from 'react';
import { Wallet, RefreshCcw, Trash2 } from 'lucide-react';
import type { FixedExpense } from '../../../types';
import { CURRENCY_SYMBOL } from '../../../config/constants';

interface FixedExpensesManagerProps {
    expenses: FixedExpense[];
    onUpdateExpense: (id: number, amount: string) => void;
    onConvertAll: () => void;
    onClearAll: () => void;
}

export const FixedExpensesManager: React.FC<FixedExpensesManagerProps> = ({
    expenses,
    onUpdateExpense,
    onConvertAll,
    onClearAll
}) => {
    return (
        <div className="bg-white border-t-4 border-amber-500 p-6 dark:bg-gray-900 shadow-xl overflow-hidden relative mb-6">
            <div className="relative flex items-center justify-between mb-4">
                <h2 className="text-lg font-black flex items-center gap-2 text-gray-800 dark:text-white">
                    <Wallet size={20} className="text-amber-500" /> المصروفات الثابتة (شهرية)
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={onConvertAll}
                        className="bg-amber-100 text-amber-700 px-4 py-1.5 text-xs font-black flex items-center gap-2 hover:bg-amber-200 transition-colors dark:bg-amber-900/40 dark:text-amber-300 rounded-none shadow-sm"
                    >
                        <RefreshCcw size={14} />
                        تسجيل الكل
                    </button>
                    <button
                        onClick={onClearAll}
                        className="bg-red-50 text-red-600 px-4 py-1.5 text-xs font-black flex items-center gap-2 hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400 rounded-none shadow-sm"
                    >
                        <Trash2 size={14} />
                        تصفير الكل
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {expenses.map(item => (
                    <div key={item.id} className="space-y-1.5 p-4 bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 group hover:border-amber-400 transition-colors">
                        <label className="text-[10px] font-black text-amber-600 block uppercase tracking-widest">{item.name}</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={item.amount || ''}
                                onChange={(e) => onUpdateExpense(item.id, e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-2 py-1.5 text-sm font-black focus:ring-1 ring-amber-500 outline-none transition-all"
                                placeholder="0"
                            />
                            <span className="text-[10px] font-bold text-gray-400">{CURRENCY_SYMBOL}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

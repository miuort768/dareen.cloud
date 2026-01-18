
import React, { useState, useEffect } from 'react';
import { Wallet, RefreshCcw, Trash2 } from 'lucide-react';
import type { FixedExpense } from '../../../types';
import { CURRENCY_SYMBOL } from '../../../config/constants';

interface FixedExpensesManagerProps {
    expenses: FixedExpense[];
    onUpdateExpense: (id: number, amount: string) => void;
    onConvertAll: () => void;
    onClearAll: () => void;
}

const ExpenseInput = ({
    amount,
    onUpdate,
    id
}: {
    amount: number,
    onUpdate: (id: number, val: string) => void,
    id: number
}) => {
    const [val, setVal] = useState(amount?.toString() || '');

    useEffect(() => {
        setVal(amount?.toString() || '');
    }, [amount]);

    return (
        <input
            type="number"
            step="any"
            className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-2 py-1.5 text-sm font-black focus:ring-1 ring-amber-500 outline-none transition-all"
            placeholder="0"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => onUpdate(id, val)}
        />
    );
};

export const FixedExpensesManager: React.FC<FixedExpensesManagerProps> = ({
    expenses,
    onUpdateExpense,
    onConvertAll,
    onClearAll
}) => {
    return (
        <div className="bg-white border-t-4 border-amber-500 p-4 md:p-6 dark:bg-gray-900 shadow-xl overflow-hidden relative mb-6">
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <h2 className="text-base md:text-lg font-black flex items-center gap-2 text-gray-800 dark:text-white">
                    <Wallet size={18} className="text-amber-500 md:w-5 md:h-5" /> المصروفات الثابتة (شهرية)
                </h2>
                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={onConvertAll}
                        className="flex-1 md:flex-none justify-center bg-amber-100 text-amber-700 px-3 py-2 md:px-4 md:py-1.5 text-xs font-black flex items-center gap-2 hover:bg-amber-200 transition-colors dark:bg-amber-900/40 dark:text-amber-300 rounded-none shadow-sm"
                    >
                        <RefreshCcw size={14} />
                        تسجيل الكل
                    </button>
                    <button
                        onClick={onClearAll}
                        className="flex-1 md:flex-none justify-center bg-red-50 text-red-600 px-3 py-2 md:px-4 md:py-1.5 text-xs font-black flex items-center gap-2 hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400 rounded-none shadow-sm"
                    >
                        <Trash2 size={14} />
                        تصفير الكل
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                {expenses.map(item => (
                    <div key={item.id} className="space-y-1.5 p-3 md:p-4 bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 group hover:border-amber-400 transition-colors">
                        <label className="text-[9px] md:text-[10px] font-black text-amber-600 block uppercase tracking-widest truncate">{item.name}</label>
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <ExpenseInput
                                id={item.id}
                                amount={item.amount}
                                onUpdate={onUpdateExpense}
                            />
                            <span className="text-[10px] font-bold text-gray-400 shrink-0">{CURRENCY_SYMBOL}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

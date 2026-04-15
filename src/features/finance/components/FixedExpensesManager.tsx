
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
            className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-1.5 py-1 text-[11px] font-black focus:ring-1 ring-amber-500 outline-none transition-all"
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
        <div className="bg-white border-t-2 border-amber-500 p-3 md:p-4 dark:bg-gray-900 shadow-md overflow-hidden relative mb-4">
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                <h2 className="text-sm md:text-base font-black flex items-center gap-1.5 text-gray-800 dark:text-white">
                    <Wallet size={16} className="text-amber-500" /> المصروفات الثابتة
                </h2>
                <div className="flex gap-1.5 w-full md:w-auto">
                    <button
                        onClick={onConvertAll}
                        className="flex-1 md:flex-none justify-center bg-amber-100 text-amber-700 px-2 py-1 md:px-3 text-[10px] font-black flex items-center gap-1.5 hover:bg-amber-200 transition-colors dark:bg-amber-900/40 dark:text-amber-300 rounded-none shadow-sm"
                    >
                        <RefreshCcw size={12} />
                        تسجيل الكل
                    </button>
                    <button
                        onClick={onClearAll}
                        className="flex-1 md:flex-none justify-center bg-red-50 text-red-600 px-2 py-1 md:px-3 text-[10px] font-black flex items-center gap-1.5 hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400 rounded-none shadow-sm"
                    >
                        <Trash2 size={12} />
                        تصفير
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3">
                {expenses.map(item => (
                    <div key={item.id} className="space-y-1 p-2 md:p-3 bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 group hover:border-amber-400 transition-colors">
                        <label className="text-[8px] md:text-[9px] font-black text-amber-600 block uppercase tracking-widest truncate">{item.name}</label>
                        <div className="flex items-center gap-1 md:gap-1.5">
                            <ExpenseInput
                                id={item.id}
                                amount={item.amount}
                                onUpdate={onUpdateExpense}
                            />
                            <span className="text-[9px] font-bold text-gray-400 shrink-0">{CURRENCY_SYMBOL}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

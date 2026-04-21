import { useState, useEffect } from 'react';
import { Wallet, RefreshCcw, Trash2, Zap } from 'lucide-react';
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
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1.5 text-xs font-black focus:border-[#5c59f2] focus:ring-0 outline-none transition-all rounded-none"
            placeholder="0"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => onUpdate(id, val)}
        />
    );
};

export const FixedExpensesManager = ({
    expenses,
    onUpdateExpense,
    onConvertAll,
    onClearAll
}: FixedExpensesManagerProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm overflow-hidden mb-8" dir="rtl">
            <div className="p-4 md:p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/30 dark:bg-slate-800/30">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-500 text-white flex items-center justify-center shadow-lg">
                        <Wallet size={20} />
                    </div>
                    <div>
                        <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                            المصروفات التشغيلية الثابتة
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Zap size={10} className="text-amber-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">تحديث شهري تلقائي</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={onConvertAll}
                        className="flex-1 md:flex-none justify-center bg-[#5c59f2] text-white px-4 py-2 text-[10px] font-black flex items-center gap-2 hover:bg-opacity-90 transition-all uppercase tracking-widest"
                    >
                        <RefreshCcw size={14} />
                        ترحيل الكل للحسابات
                    </button>
                    <button
                        onClick={onClearAll}
                        className="flex-1 md:flex-none justify-center bg-white dark:bg-slate-800 text-rose-500 border border-rose-100 dark:border-rose-900/30 px-4 py-2 text-[10px] font-black flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all uppercase tracking-widest"
                    >
                        <Trash2 size={14} />
                        تصفير القيم
                    </button>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {expenses.map(item => (
                    <div key={item.id} className="group p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate italic">
                                {item.name}
                            </label>
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <ExpenseInput
                                    id={item.id}
                                    amount={item.amount}
                                    onUpdate={onUpdateExpense}
                                />
                            </div>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{CURRENCY_SYMBOL}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

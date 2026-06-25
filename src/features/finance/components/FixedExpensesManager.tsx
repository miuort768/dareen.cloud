import { useState, useEffect } from 'react';
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
            className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2 py-1 text-xs font-normal focus:border-[#6C4BFF] focus:ring-0 outline-none transition-all rounded-xl"
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
        <div className="px-0 mb-8" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm overflow-hidden rounded-2xl">
                <div className="p-4 border-b border-slate-100/50 dark:border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: '#6C4BFF12', color: '#6C4BFF' }}>
                            <Wallet size={18} />
                        </div>
                        <div>
                            <h2 className="text-sm font-normal text-slate-800 dark:text-white uppercase tracking-tight">المصروفات التشغيلية الثابتة</h2>
                            <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">تحديث شهري تلقائي</p>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={onConvertAll} className="flex-1 md:flex-none justify-center bg-gradient-to-l from-[#6C4BFF] to-[#8B5CF6] hover:from-[#5A3FE0] hover:to-[#7C4DE6] text-white px-4 py-1.5 text-[10px] font-bold flex items-center gap-2 shadow-sm transition-all uppercase rounded-xl">
                            <RefreshCcw size={14} />
                            ترحيل الكل
                        </button>
                        <button onClick={onClearAll} className="flex-1 md:flex-none justify-center text-rose-500 px-4 py-1.5 text-[10px] font-bold flex items-center gap-2 transition-all uppercase shadow-sm rounded-xl" style={{ backgroundColor: '#F43F5E12', border: '1px solid #F43F5E30' }}>
                            <Trash2 size={14} />
                            تصفير
                        </button>
                    </div>
                </div>

                <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                    {expenses.map(item => (
                        <div key={item.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 hover:border-[#6C4BFF]/30 transition-all group rounded-2xl">
                            <label className="text-[9px] font-normal text-slate-400 uppercase mb-2 block truncate">
                                {item.name}
                            </label>
                            <div className="flex items-center gap-1.5">
                                <ExpenseInput
                                    id={item.id}
                                    amount={item.amount}
                                    onUpdate={onUpdateExpense}
                                />
                                <span className="text-[9px] font-normal text-slate-400 uppercase">{CURRENCY_SYMBOL}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

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
            className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2 py-1 text-xs font-normal focus:border-[#2563EB] focus:ring-0 outline-none transition-all rounded-none"
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
            <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm overflow-hidden rounded-none">
                <div className="p-4 border-b border-slate-100/50 dark:border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex items-center justify-center rounded-none" style={{ backgroundColor: '#F59E0B12', color: '#F59E0B' }}>
                            <Wallet size={18} />
                        </div>
                        <div>
                            <h2 className="text-sm font-normal text-slate-800 dark:text-white uppercase tracking-tight">المصروفات التشغيلية الثابتة</h2>
                            <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">تحديث شهري تلقائي</p>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={onConvertAll} className="flex-1 md:flex-none justify-center bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-1.5 text-[10px] font-bold flex items-center gap-2 shadow-sm transition-all uppercase rounded-none">
                            <RefreshCcw size={14} />
                            ترحيل الكل
                        </button>
                        <button onClick={onClearAll} className="flex-1 md:flex-none justify-center text-rose-500 px-4 py-1.5 text-[10px] font-bold flex items-center gap-2 transition-all uppercase shadow-sm rounded-none" style={{ backgroundColor: '#F43F5E12', border: '1px solid #F43F5E30' }}>
                            <Trash2 size={14} />
                            تصفير
                        </button>
                    </div>
                </div>

                <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                    {expenses.map(item => (
                        <div key={item.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 hover:border-amber-400 transition-all group rounded-none">
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

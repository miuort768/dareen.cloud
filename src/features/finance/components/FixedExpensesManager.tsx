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
            className="w-full bg-card border-border px-2 py-1 text-xs font-normal focus:border-primary focus:ring-2 focus:ring-focus outline-none transition-all rounded-xl"
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
            <div className="bg-card border-border shadow-sm overflow-hidden rounded-2xl">
                <div className="p-4 border-b border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex items-center justify-center bg-primary-soft text-primary rounded-xl">
                            <Wallet size={18} />
                        </div>
                        <div>
                            <h2 className="text-sm font-normal text-main uppercase tracking-tight">المصروفات التشغيلية الثابتة</h2>
                            <p className="text-micro text-dim font-normal uppercase tracking-wider">تحديث شهري تلقائي</p>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={onConvertAll} className="flex-1 md:flex-none justify-center bg-primary hover:bg-primary-hover text-on-primary px-4 py-1.5 text-micro font-bold flex items-center gap-2 shadow-sm transition-all uppercase rounded-xl">
                            <RefreshCcw size={14} />
                            ترحيل الكل
                        </button>
                        <button onClick={onClearAll} className="flex-1 md:flex-none justify-center text-error px-4 py-1.5 text-micro font-bold flex items-center gap-2 transition-all uppercase shadow-sm rounded-xl bg-error-soft border border-error">
                            <Trash2 size={14} />
                            تصفير
                        </button>
                    </div>
                </div>

                <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                    {expenses.map(item => (
                        <div key={item.id} className="p-3 bg-card border-border hover:border-primary transition-all group rounded-2xl">
                            <label className="text-micro font-normal text-dim uppercase mb-2 block truncate">
                                {item.name}
                            </label>
                            <div className="flex items-center gap-1.5">
                                <ExpenseInput
                                    id={item.id}
                                    amount={item.amount}
                                    onUpdate={onUpdateExpense}
                                />
                                <span className="text-micro font-normal text-dim uppercase">{CURRENCY_SYMBOL}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

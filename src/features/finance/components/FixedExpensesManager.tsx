import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Wifi, Megaphone, Building2, Home, Wrench, MoreHorizontal, RotateCcw, Trash2 } from 'lucide-react';
import type { FixedExpense } from '../../../types';
import { CURRENCY_SYMBOL } from '../../../config/constants';

interface FixedExpensesManagerProps {
    expenses: FixedExpense[];
    onUpdateExpense: (id: number, amount: string) => void;
    onConvertAll: () => void;
    onClearAll: () => void;
}

const CATEGORY_CONFIG: Record<string, { icon: React.ComponentType<{ size?: number }>; gradient: string }> = {
    'كهرباء': { icon: Zap, gradient: 'from-warning to-amber-400' },
    'انترنت': { icon: Wifi, gradient: 'from-info to-blue-400' },
    'تسويق': { icon: Megaphone, gradient: 'from-error to-rose-400' },
    'ايجار': { icon: Building2, gradient: 'from-primary to-purple-400' },
    'مكتب': { icon: Home, gradient: 'from-success to-emerald-400' },
    'صيانة': { icon: Wrench, gradient: 'from-accent to-teal-400' },
};

const DEFAULT_ICON = MoreHorizontal;
const DEFAULT_GRADIENT = 'from-primary to-purple-400';

const ExpenseCard = ({ expense, onUpdate }: { expense: FixedExpense; onUpdate: (id: number, val: string) => void }) => {
    const [val, setVal] = useState(expense.amount?.toString() || '');
    const cfg = CATEGORY_CONFIG[expense.name] || { icon: DEFAULT_ICON, gradient: DEFAULT_GRADIENT };
    const Icon = cfg.icon;

    useEffect(() => { setVal(expense.amount?.toString() || ''); }, [expense.amount]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01, y: -1 }}
            className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-all p-3"
        >
            <div className="flex items-center gap-2.5 mb-2.5">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white shadow-sm`}>
                    <Icon size={13} />
                </div>
                <span className="text-[10px] font-bold text-main">{expense.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <input type="number" aria-label={`مبلغ ${expense.name}`} step="any"
                    className="flex-1 bg-surface border border-border/60 px-2.5 py-1.5 text-xs font-bold text-main rounded-xl outline-none focus:border-primary transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0" value={val}
                    onChange={(e) => setVal(e.target.value)}
                    onBlur={() => onUpdate(expense.id, val)} />
                <span className="text-[9px] font-bold text-muted">{CURRENCY_SYMBOL}</span>
            </div>
            {Number(val) > 0 && (
                <div className="mt-2 h-1 bg-surface rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(Number(val) / 1000 * 100, 100)}%` }}
                        transition={{ duration: 0.6 }}
                        className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient}`}
                    />
                </div>
            )}
        </motion.div>
    );
};

export const FixedExpensesManager = ({ expenses, onUpdateExpense, onConvertAll, onClearAll }: FixedExpensesManagerProps) => {
    const total = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

    return (
        <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center text-white shadow-sm">
                        <Building2 size={13} />
                    </div>
                    <div>
                        <h2 className="text-xs font-bold text-main">المصروفات التشغيلية</h2>
                        <p className="text-[8px] text-muted mt-0.5"><span className="font-bold text-main tabular-nums">{total.toLocaleString()}</span> {CURRENCY_SYMBOL} إجمالي المصروفات</p>
                    </div>
                </div>
                <div className="flex gap-1.5">
                    <button onClick={onConvertAll}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-primary text-on-primary text-[8px] font-bold rounded-xl hover:bg-primary-hover transition-all active:scale-95">
                        <RotateCcw size={10} /> ترحيل
                    </button>
                    <button onClick={onClearAll}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-error text-[8px] font-bold rounded-xl border border-error/30 bg-error/[6%] hover:bg-error/[10%] transition-all active:scale-95">
                        <Trash2 size={10} /> تصفير
                    </button>
                </div>
            </div>
            <div className="p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {expenses.map(item => (
                    <ExpenseCard key={item.id} expense={item} onUpdate={onUpdateExpense} />
                ))}
            </div>
        </div>
    );
};
import React, { useState } from 'react';
import { DollarSign, Save, X, Info, Calendar, Tag } from 'lucide-react';
import type { Transaction } from '../../../types';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (transaction: Omit<Transaction, 'id' | 'status'>) => void;
}

export const AddTransactionModal = ({ isOpen, onClose, onAdd }: AddTransactionModalProps) => {
    const [newTransaction, setNewTransaction] = useState({
        type: 'expense',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            type: newTransaction.type as 'income' | 'expense',
            category: newTransaction.category,
            amount: Number(newTransaction.amount),
            date: newTransaction.date,
            description: newTransaction.description
        });

        // Reset form
        setNewTransaction({
            type: 'expense',
            category: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            description: ''
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60  animate-in fade-in duration-300" dir="rtl">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg shadow-sm overflow-hidden border border-slate-100/50 dark:border-slate-800/50 animate-in zoom-in-95 duration-300 rounded-none">
                {/* Header */}
                <div className="p-5 bg-[#172554] text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-none" style={{ backgroundColor: '#ffffff15' }}>
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold">تسجيل معاملة مالية</h3>
                            <p className="text-[10px] font-medium text-white/70 tracking-widest mt-0.5">إدخال مباشر إلى سجل الحسابات</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded-none"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5">
                                <Tag size={11} style={{ color: '#2563EB' }} /> نوع المعاملة
                            </label>
                            <select
                                value={newTransaction.type}
                                onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 text-sm font-medium focus:border-[#2563EB] outline-none transition-all dark:text-white appearance-none rounded-none"
                            >
                                <option value="income">إيراد مالي (+)</option>
                                <option value="expense">مصروفات (-)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5">
                                <DollarSign size={11} style={{ color: '#2563EB' }} /> المبلغ المستحق
                            </label>
                            <input
                                type="number"
                                required
                                step="any"
                                value={newTransaction.amount}
                                onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 text-sm font-medium focus:border-[#2563EB] outline-none transition-all dark:text-white rounded-none"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5">
                                <Info size={11} style={{ color: '#2563EB' }} /> التصنيف الحسابي
                            </label>
                            <input
                                type="text"
                                required
                                value={newTransaction.category}
                                onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 text-sm font-medium focus:border-[#2563EB] outline-none transition-all dark:text-white rounded-none"
                                placeholder="مثال: إيجار، مكافأة..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar size={11} style={{ color: '#2563EB' }} /> تاريخ المعاملة
                            </label>
                            <input
                                type="date"
                                required
                                value={newTransaction.date}
                                onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 text-sm font-medium focus:border-[#2563EB] outline-none transition-all dark:text-white rounded-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest">بيان المعاملة / التفاصيل</label>
                        <textarea
                            value={newTransaction.description}
                            onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 text-sm font-medium focus:border-[#2563EB] outline-none transition-all dark:text-white h-24 resize-none rounded-none"
                            placeholder="وصف تفصيلي للعملية المالية..."
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-[2px] transition-all hover:bg-slate-200 rounded-none">
                            إلغاء
                        </button>
                        <button type="submit" className="flex-[2] bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-3 uppercase tracking-[2px] shadow-sm transition-all active:scale-95 flex items-center justify-center gap-3 rounded-none">
                            <Save size={18} />
                            تأكيد وحفظ العملية
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

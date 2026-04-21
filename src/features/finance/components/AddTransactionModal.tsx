import React, { useState } from 'react';
import { DollarSign, Save, X, Info, Calendar, Tag } from 'lucide-react';
import type { Transaction } from '../../../types';
import { cn } from '../../../lib/utils';

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" dir="rtl">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg shadow-2xl rounded-none overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-full bg-white/5 skew-x-[30deg] -translate-x-16"></div>
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#5c59f2] flex items-center justify-center shadow-lg">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tighter uppercase italic">تسجيل معاملة مالية</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">إدخال مباشر إلى سجل الحسابات</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="relative z-10 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Tag size={12} className="text-[#5c59f2]" /> نوع المعاملة
                            </label>
                            <select
                                value={newTransaction.type}
                                onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700 px-4 py-3 text-sm font-black focus:border-[#5c59f2] outline-none transition-all dark:text-white rounded-none appearance-none"
                            >
                                <option value="income">إيراد مالي (+)</option>
                                <option value="expense">مصروفات (-)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <DollarSign size={12} className="text-[#5c59f2]" /> المبلغ المستحق
                            </label>
                            <input
                                type="number"
                                required
                                step="any"
                                value={newTransaction.amount}
                                onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700 px-4 py-3 text-sm font-black focus:border-[#5c59f2] outline-none transition-all dark:text-white rounded-none"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Info size={12} className="text-[#5c59f2]" /> التصنيف الحسابي
                            </label>
                            <input
                                type="text"
                                required
                                value={newTransaction.category}
                                onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700 px-4 py-3 text-sm font-black focus:border-[#5c59f2] outline-none transition-all dark:text-white rounded-none"
                                placeholder="مثال: إيجار، مكافأة..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={12} className="text-[#5c59f2]" /> تاريخ المعاملة
                            </label>
                            <input
                                type="date"
                                required
                                value={newTransaction.date}
                                onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700 px-4 py-3 text-sm font-black focus:border-[#5c59f2] outline-none transition-all dark:text-white rounded-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">بيان المعاملة / التفاصيل</label>
                        <textarea
                            value={newTransaction.description}
                            onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700 px-4 py-3 text-sm font-black focus:border-[#5c59f2] outline-none transition-all dark:text-white rounded-none h-24 resize-none"
                            placeholder="وصف تفصيلي للعملية المالية..."
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-[2px] transition-all hover:bg-slate-200"
                        >
                            إلغاء
                        </button>
                        <button 
                            type="submit" 
                            className="flex-[2] bg-[#5c59f2] text-white font-black py-4 uppercase tracking-[2px] shadow-xl shadow-indigo-100 dark:shadow-none transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
                        >
                            <Save size={18} />
                            تأكيد وحفظ العملية
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


import React, { useState } from 'react';
import { DollarSign, Save, X } from 'lucide-react';
import type { Transaction } from '../../../types';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (transaction: Omit<Transaction, 'id' | 'status'>) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAdd }) => {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800 animate-in zoom-in-95">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <DollarSign size={20} className="text-primary-600" />
                        تسجيل معاملة مالية يدوية
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500">نوع المعاملة</label>
                            <select
                                value={newTransaction.type}
                                onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value })}
                                className="w-full px-3 py-2 border rounded-none text-sm dark:bg-gray-800 dark:border-gray-700"
                            >
                                <option value="income">إيراد (+)</option>
                                <option value="expense">مصروف (-)</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500">المبلغ</label>
                            <input
                                type="number"
                                required
                                step="any"
                                value={newTransaction.amount}
                                onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                className="w-full px-3 py-2 border rounded-none text-sm focus:border-primary-500 outline-none dark:bg-gray-800 dark:border-gray-700"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500">التصنيف</label>
                            <input
                                type="text"
                                required
                                value={newTransaction.category}
                                onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                                className="w-full px-3 py-2 border rounded-none text-sm focus:border-primary-500 outline-none dark:bg-gray-800 dark:border-gray-700"
                                placeholder="مثال: إيجار، نثرية..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500">التاريخ</label>
                            <input
                                type="date"
                                required
                                value={newTransaction.date}
                                onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                className="w-full px-3 py-2 border rounded-none text-sm focus:border-primary-500 outline-none dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">الوصف / التفاصيل</label>
                        <textarea
                            value={newTransaction.description}
                            onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                            className="w-full px-3 py-2 border rounded-none text-sm h-20 resize-none focus:border-primary-500 outline-none dark:bg-gray-800 dark:border-gray-700"
                            placeholder="ملاحظات إضافية..."
                        />
                    </div>

                    <button type="submit" className="w-full bg-primary-600 text-white font-bold py-2.5 rounded-none hover:bg-primary-700 transition-colors shadow-lg flex items-center justify-center gap-2">
                        <Save size={18} />
                        حفظ المعاملة
                    </button>
                </form>
            </div>
        </div>
    );
};

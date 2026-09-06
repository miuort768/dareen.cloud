import React, { useState } from 'react'
import { DollarSign, Save, X, Info, Calendar, Tag } from 'lucide-react'
import type { Transaction } from '../../../types'
import { parseNumberSafe, formatLocalDate } from '../../../lib/utils'

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (transaction: Omit<Transaction, 'id' | 'status'>) => void
}

export const AddTransactionModal = ({ isOpen, onClose, onAdd }: AddTransactionModalProps) => {
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    category: '',
    amount: '',
    currency: 'EGP',
    date: formatLocalDate(new Date()),
    description: '',
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      type: newTransaction.type as 'income' | 'expense',
      category: newTransaction.category,
      amount: parseNumberSafe(newTransaction.amount),
      currency: newTransaction.currency,
      date: newTransaction.date ?? '',
      description: newTransaction.description,
    })

    // Reset form
    setNewTransaction({
      type: 'expense',
      category: '',
      amount: '',
      currency: 'EGP',
      date: formatLocalDate(new Date()),
      description: '',
    })
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center md:p-4"
      dir="rtl"
    >
      <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border-x-0 border-t border-border bg-card shadow-xl md:max-h-none md:max-w-lg md:overflow-hidden md:rounded-2xl md:border-x md:border-b">
        {/* Header */}
        <div className="flex items-center justify-between bg-primary p-5 text-on-primary">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <DollarSign size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold">تسجيل معاملة مالية</h3>
              <p className="mt-0.5 text-micro font-medium text-on-primary opacity-70">
                إدخال مباشر إلى سجل الحسابات
              </p>
            </div>
          </div>
          <button
            aria-label="إغلاق"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-on-primary opacity-60 transition-colors hover:bg-white/15 hover:opacity-100 md:h-8 md:w-8"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-4 md:p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-micro font-bold text-muted">
                <Tag size={11} className="text-primary" /> نوع المعاملة
              </label>
              <select
                value={newTransaction.type}
                onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                aria-label="نوع المعاملة"
                className="w-full appearance-none rounded-xl border-border bg-card px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus-visible:ring-2 focus-visible:ring-focus"
              >
                <option value="income">إيراد مالي (+)</option>
                <option value="expense">مصروفات (-)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-micro font-bold text-muted">
                <DollarSign size={11} className="text-primary" /> المبلغ المستحق
              </label>
              <input
                type="number"
                required
                step="any"
                aria-label="المبلغ المستحق"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                className="w-full rounded-xl border-border bg-card px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus-visible:ring-2 focus-visible:ring-focus"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-micro font-bold text-muted">
                عملة المعاملة
              </label>
              <select
                value={newTransaction.currency}
                onChange={(e) => setNewTransaction({ ...newTransaction, currency: e.target.value })}
                aria-label="عملة المعاملة"
                className="w-full appearance-none rounded-xl border-border bg-card px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus-visible:ring-2 focus-visible:ring-focus"
              >
                <option value="EGP">جنيه مصري (ج.م)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-micro font-bold text-muted">
                <Info size={11} className="text-primary" /> التصنيف الحسابي
              </label>
              <input
                type="text"
                required
                aria-label="التصنيف الحسابي"
                value={newTransaction.category}
                onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                className="w-full rounded-xl border-border bg-card px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus-visible:ring-2 focus-visible:ring-focus"
                placeholder="مثال: إيجار، مكافأة..."
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-micro font-bold text-muted">
                <Calendar size={11} className="text-primary" /> تاريخ المعاملة
              </label>
              <input
                type="date"
                required
                aria-label="تاريخ المعاملة"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                className="w-full rounded-xl border-border bg-card px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus-visible:ring-2 focus-visible:ring-focus"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-micro font-bold uppercase tracking-widest text-muted">
              بيان المعاملة / التفاصيل
            </label>
            <textarea
              value={newTransaction.description}
              onChange={(e) =>
                setNewTransaction({ ...newTransaction, description: e.target.value })
              }
              className="h-24 w-full resize-none rounded-xl border-border bg-card px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus-visible:ring-2 focus-visible:ring-focus"
              placeholder="وصف تفصيلي للعملية المالية..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-hover px-6 py-3 text-xs font-bold text-muted transition-all hover:bg-primary-light"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex flex-[2] items-center justify-center gap-3 rounded-xl bg-primary py-3 font-bold text-on-primary shadow-sm outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
            >
              <Save size={18} />
              تأكيد وحفظ العملية
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

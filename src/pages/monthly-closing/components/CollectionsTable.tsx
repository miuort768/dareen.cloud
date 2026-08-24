import React, { useState } from 'react'
import { Wallet } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { CURRENCY_SYMBOL } from '../../../config/constants'
import { SectionCard, SectionTitle } from './ClosingUI'
import { cn } from '../../../lib/utils'
import { api } from '../../../lib/api'

interface StudentInvoice {
  id: string
  studentName: string
  description?: string
  amount: number
  currency?: string
  date: string
  status: string
}

interface CollectionsTableProps {
  studentInvoices: StudentInvoice[]
  startDate: string
  endDate: string
}

export const CollectionsTable: React.FC<CollectionsTableProps> = ({
  studentInvoices,
  startDate,
  endDate,
}) => {
  const queryClient = useQueryClient()
  const [savingId, setSavingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState('')

  const handleToggle = async (item: StudentInvoice) => {
    if (savingId) return
    setSavingId(item.id)
    setSaveError('')
    try {
      const newStatus = item.status === 'paid' ? 'pending' : 'paid'
      await api.patch(`/studentInvoices/${item.id}`, { status: newStatus })
      await queryClient.invalidateQueries({ queryKey: ['student-invoices-closing'] })
    } catch {
      setSaveError('تعذر تحديث الحالة، حاول مجددًا')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <SectionCard>
      <div className="border-b border-border p-4">
        <SectionTitle icon={Wallet} label="سجل التحصيلات النقدية" sub="مدفوعات الطلاب المسجلة" />
      </div>
      {saveError && (
        <div className="bg-error/10 border-b border-border px-4 py-2 text-micro font-bold text-error">
          {saveError}
        </div>
      )}
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-start">
          <thead className="bg-gradient-to-l from-primary to-primary">
            <tr>
              <th className="px-4 py-3 text-micro font-bold uppercase tracking-wider text-on-primary">
                الطالب
              </th>
              <th className="px-4 py-3 text-center text-micro font-bold text-on-primary">المبلغ</th>
              <th className="px-4 py-3 text-center text-micro font-bold text-on-primary">
                التاريخ
              </th>
              <th className="px-4 py-3 text-center text-micro font-bold text-on-primary">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(studentInvoices || [])
              .filter((inv) => inv.date >= startDate && inv.date <= endDate)
              .map((item) => (
                <tr key={item.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-4">
                    <span className="mb-0.5 block text-xs font-bold text-main">
                      {item.studentName}
                    </span>
                    <span className="line-clamp-1 text-micro font-medium text-muted">
                      {item.description}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-xs font-bold text-success">
                    {item.amount.toLocaleString()} {item.currency || CURRENCY_SYMBOL}
                  </td>
                  <td className="px-4 py-4 text-center font-mono text-micro text-muted">
                    {item.date}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => handleToggle(item)}
                      disabled={savingId === item.id}
                      className={cn(
                        'rounded-xl px-3 py-1 text-micro font-bold uppercase transition-all active:scale-95 disabled:opacity-60',
                        item.status === 'paid'
                          ? 'bg-success text-on-success'
                          : 'border border-error bg-error-light text-error',
                      )}
                    >
                      {item.status === 'paid' ? 'تم التحصيل' : 'انتظار'}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {/* Mobile cards */}
      <div className="space-y-3 p-4 md:hidden">
        {(studentInvoices || [])
          .filter((inv) => inv.date >= startDate && inv.date <= endDate)
          .map((item) => (
            <div key={item.id} className="space-y-2 rounded-xl bg-surface p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold leading-tight text-main">
                    {item.studentName}
                  </span>
                  <span className="line-clamp-1 text-micro font-medium text-muted">
                    {item.description}
                  </span>
                </div>
                <span className="me-2 text-xs font-bold text-success">
                  {item.amount.toLocaleString()} {item.currency || CURRENCY_SYMBOL}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-micro text-muted">{item.date}</span>
                <button
                  onClick={() => handleToggle(item)}
                  disabled={savingId === item.id}
                  className={cn(
                    'rounded-xl px-3 py-1 text-micro font-bold uppercase transition-all active:scale-95 disabled:opacity-60',
                    item.status === 'paid'
                      ? 'bg-success text-on-success'
                      : 'border border-error bg-error-light text-error',
                  )}
                >
                  {item.status === 'paid' ? 'تم التحصيل' : 'انتظار'}
                </button>
              </div>
            </div>
          ))}
      </div>
    </SectionCard>
  )
}

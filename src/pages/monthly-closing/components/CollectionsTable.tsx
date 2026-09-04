import React, { useMemo, useState } from 'react'
import { Wallet } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { CURRENCY_SYMBOL } from '../../../config/constants'
import { SectionCard, SectionTitle } from './ClosingUI'
import { cn } from '../../../lib/utils'
import { api } from '../../../lib/api'
import { Table } from '../../../shared/components/ui'
import type { Column } from '../../../shared/components/ui'
import { INVOICE_STATUS, normalizeInvoiceStatus } from '../../../types/invoice'

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
      const wasPaid = normalizeInvoiceStatus(item.status) === INVOICE_STATUS.PAID
      const newStatus = wasPaid ? 'pending' : 'paid'
      await api.patch(`/studentInvoices/${item.id}`, { status: newStatus })
      await queryClient.invalidateQueries({ queryKey: ['student-invoices-closing'] })
    } catch {
      setSaveError('تعذر تحديث الحالة، حاول مجددًا')
    } finally {
      setSavingId(null)
    }
  }

  const scoped = useMemo(
    () => (studentInvoices || []).filter((inv) => inv.date >= startDate && inv.date <= endDate),
    [studentInvoices, startDate, endDate],
  )

  const statusToggle = (item: StudentInvoice) => {
    const isPaid = normalizeInvoiceStatus(item.status) === INVOICE_STATUS.PAID
    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleToggle(item)
        }}
        disabled={savingId === item.id}
        className={cn(
          'rounded-xl px-3 py-1 text-micro font-bold uppercase transition-all active:scale-95 disabled:opacity-60',
          isPaid ? 'bg-success text-on-success' : 'border border-error bg-error-light text-error',
        )}
      >
        {isPaid ? 'تم التحصيل' : 'انتظار'}
      </button>
    )
  }

  const columns = useMemo<Column<StudentInvoice>[]>(
    () => [
      {
        key: 'studentName',
        header: 'الطالب',
        mobileLabel: 'الطالب',
        render: (item) => (
          <div className="min-w-0">
            <span className="block text-xs font-bold text-main">{item.studentName}</span>
            <span className="line-clamp-1 text-micro font-medium text-muted">
              {item.description}
            </span>
          </div>
        ),
      },
      {
        key: 'amount',
        header: 'المبلغ',
        align: 'center',
        mobileLabel: 'المبلغ',
        render: (item) => (
          <span className="text-xs font-bold text-success-strong">
            {item.amount.toLocaleString()} {CURRENCY_SYMBOL}
          </span>
        ),
      },
      {
        key: 'date',
        header: 'التاريخ',
        align: 'center',
        mobileLabel: 'التاريخ',
        render: (item) => <span className="font-mono text-micro text-muted">{item.date}</span>,
      },
      {
        key: 'status',
        header: 'الحالة',
        align: 'center',
        mobileLabel: 'الحالة',
        render: (item) => statusToggle(item),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- statusToggle closes over savingId intentionally
    [savingId],
  )

  return (
    <SectionCard>
      <div className="border-b border-border p-4">
        <SectionTitle icon={Wallet} label="سجل التحصيلات النقدية" sub="مدفوعات الطلاب المسجلة" />
      </div>
      {saveError && (
        <div className="border-b border-border bg-error-soft px-4 py-2 text-micro font-bold text-error">
          {saveError}
        </div>
      )}
      <div className="p-4">
        <Table<StudentInvoice>
          data={scoped}
          columns={columns}
          headerVariant="surface"
          getId={(item) => item.id}
          emptyMessage="لا توجد تحصيلات في هذه الفترة"
        />
      </div>
    </SectionCard>
  )
}

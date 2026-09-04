import React, { useMemo } from 'react'
import { Receipt, Download } from 'lucide-react'
import { CURRENCY_SYMBOL } from '../../../config/constants'
import { SectionCard, SectionTitle, SecondaryBtn } from './ClosingUI'
import { Table } from '../../../shared/components/ui'
import type { Column } from '../../../shared/components/ui'

interface PayrollItem {
  id: string
  name: string
  subject: string
  sessionsCount: number
  baseAmount: number
  totalAmount: number
  currency?: string
  sessionsList?: { date: string; studentName: string; teacherPrice?: number }[]
  price?: number
}

interface PayrollTableProps {
  payrollData: PayrollItem[]
  teacherAdjustments: Record<string, number>
  handleTeacherAdjustment: (teacherId: string, amount: number) => void
  setSelectedTeacherForSlip: (item: PayrollItem) => void
  startDate: string
  endDate: string
}

export const PayrollTable: React.FC<PayrollTableProps> = ({
  payrollData,
  teacherAdjustments,
  handleTeacherAdjustment,
  setSelectedTeacherForSlip,
  startDate,
  endDate,
}) => {
  const columns = useMemo<Column<PayrollItem>[]>(
    () => [
      {
        key: 'name',
        header: 'المعلمة',
        mobileLabel: 'المعلمة',
        render: (item) => (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-micro font-bold text-primary">
              {item.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold leading-tight text-main">{item.name}</span>
              <span className="text-micro font-medium text-muted">{item.subject}</span>
            </div>
          </div>
        ),
      },
      {
        key: 'sessionsCount',
        header: 'الحصص',
        align: 'center',
        mobileLabel: 'الحصص',
        render: (item) => (
          <span className="text-xs font-bold text-muted">{item.sessionsCount}</span>
        ),
      },
      {
        key: 'baseAmount',
        header: 'الأساسي',
        align: 'center',
        hideOnMobile: true,
        render: (item) => (
          <span className="text-xs font-bold text-muted">{item.baseAmount.toLocaleString()}</span>
        ),
      },
      {
        key: 'adjustment',
        header: 'تعديلات',
        align: 'center',
        mobileLabel: 'تعديلات',
        render: (item) => (
          <input
            type="number"
            aria-label="قيمة التعديل"
            value={teacherAdjustments[item.id] || ''}
            onChange={(e) => handleTeacherAdjustment(item.id, parseFloat(e.target.value) || 0)}
            className="w-16 rounded-xl border border-border bg-surface p-1 text-center text-micro font-bold outline-none focus:border-primary"
            placeholder="0"
          />
        ),
      },
      {
        key: 'totalAmount',
        header: 'الصافي',
        align: 'center',
        mobileLabel: 'الصافي',
        render: (item) => (
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-success-strong">
              {item.totalAmount.toLocaleString()} {CURRENCY_SYMBOL}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedTeacherForSlip(item)
              }}
              className="flex items-center gap-1 text-micro font-bold text-primary hover:underline"
            >
              <Receipt size={10} /> القسيمة
            </button>
          </div>
        ),
      },
    ],
    [teacherAdjustments, handleTeacherAdjustment, setSelectedTeacherForSlip],
  )

  return (
    <SectionCard>
      <div className="flex items-center justify-between border-b border-border p-4">
        <SectionTitle
          icon={Receipt}
          label="مسير رواتب المعلمات"
          sub={`الفترة من ${startDate} إلى ${endDate}`}
        />
        <SecondaryBtn className="h-8 text-micro">
          <Download size={14} /> تصدير PDF
        </SecondaryBtn>
      </div>
      <div className="p-4">
        <Table<PayrollItem>
          data={payrollData}
          columns={columns}
          headerVariant="surface"
          getId={(item) => item.id}
          emptyMessage="لا توجد رواتب في هذه الفترة"
        />
      </div>
    </SectionCard>
  )
}

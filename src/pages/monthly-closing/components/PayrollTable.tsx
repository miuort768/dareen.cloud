import React from 'react'
import { Receipt, Download } from 'lucide-react'
import { CURRENCY_SYMBOL } from '../../../config/constants'
import { SectionCard, SectionTitle, SecondaryBtn } from './ClosingUI'

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
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-start">
          <thead className="bg-primary">
            <tr>
              <th className="px-4 py-3 text-micro font-bold uppercase tracking-wider text-on-primary">
                المعلمة
              </th>
              <th className="px-4 py-3 text-center text-micro font-bold text-on-primary">الحصص</th>
              <th className="px-4 py-3 text-center text-micro font-bold text-on-primary">
                الأساسي
              </th>
              <th className="px-4 py-3 text-center text-micro font-bold text-on-primary">
                تعديلات
              </th>
              <th className="px-4 py-3 text-center text-micro font-bold text-on-primary">الصافي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payrollData.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-surface">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-soft text-micro font-bold text-primary">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <span className="block text-xs font-bold leading-tight text-main">
                        {item.name}
                      </span>
                      <span className="text-micro font-medium text-muted">{item.subject}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-center text-xs font-bold text-muted">
                  {item.sessionsCount}
                </td>
                <td className="px-4 py-4 text-center text-xs font-bold text-muted">
                  {item.baseAmount.toLocaleString()}
                </td>
                <td className="px-4 py-4 text-center">
                  <input
                    type="number"
                    aria-label="قيمة التعديل"
                    value={teacherAdjustments[item.id] || ''}
                    onChange={(e) =>
                      handleTeacherAdjustment(item.id, parseFloat(e.target.value) || 0)
                    }
                    className="w-16 rounded-xl border border-border bg-surface p-1 text-center text-micro font-bold outline-none focus:border-primary"
                    placeholder="0"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-xs font-bold text-success">
                      {item.totalAmount.toLocaleString()} {item.currency || CURRENCY_SYMBOL}
                    </span>
                    <button
                      onClick={() => setSelectedTeacherForSlip(item)}
                      className="flex items-center gap-1 text-micro font-bold text-primary hover:underline"
                    >
                      <Receipt size={10} /> القسيمة
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile cards */}
      <div className="space-y-3 p-4 md:hidden">
        {payrollData.map((item) => (
          <div key={item.id} className="space-y-3 rounded-xl bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-sm font-bold text-primary">
                {item.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold leading-tight text-main">
                  {item.name}
                </span>
                <span className="text-micro font-medium text-muted">{item.subject}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-card p-2 text-center">
                <span className="mb-0.5 block text-micro text-muted">الحصص</span>
                <span className="text-xs font-bold text-main">{item.sessionsCount}</span>
              </div>
              <div className="rounded-lg bg-card p-2 text-center">
                <span className="mb-0.5 block text-micro text-muted">الأساسي</span>
                <span className="text-xs font-bold text-muted">
                  {item.baseAmount.toLocaleString()}
                </span>
              </div>
              <div className="rounded-lg bg-card p-2 text-center">
                <span className="mb-0.5 block text-micro text-muted">الصافي</span>
                <span className="text-xs font-bold text-success">
                  {item.totalAmount.toLocaleString()} {item.currency || CURRENCY_SYMBOL}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                aria-label="قيمة التعديل"
                value={teacherAdjustments[item.id] || ''}
                onChange={(e) => handleTeacherAdjustment(item.id, parseFloat(e.target.value) || 0)}
                className="flex-1 rounded-xl border border-border bg-background p-2 text-center text-xs font-bold outline-none focus:border-primary"
                placeholder="تعديل"
              />
              <button
                onClick={() => setSelectedTeacherForSlip(item)}
                className="flex items-center gap-1 rounded-xl bg-primary-soft px-3 py-2 text-micro font-bold text-primary"
              >
                <Receipt size={10} /> القسيمة
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

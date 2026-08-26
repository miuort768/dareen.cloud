import { useState } from 'react'
import { X, Printer, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { useSettingsStore } from '../../../store/settingsStore'
import { CURRENCY_SYMBOL } from '../../../config/constants'

interface InvoicePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: {
    id: string
    studentName: string
    amount: number
    date: string
    dueDate: string
    description: string
    status: 'paid' | 'pending' | 'overdue'
    currency?: string
    notes?: string
    items?: { description: string; date?: string; amount: number }[]
  }
}

export const InvoicePreviewModal = ({ isOpen, onClose, invoice }: InvoicePreviewModalProps) => {
  const academyName = useSettingsStore((s) => s.academyName)
  const adminPhone = useSettingsStore((s) => s.adminPhone)
  const [hidePricing, setHidePricing] = useState(false)

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-elevation-2 duration-300 animate-in fade-in zoom-in">
        <div className="pointer-events-none absolute start-0 top-0 h-32 w-32 -translate-y-16 translate-x-16 -rotate-45 bg-primary opacity-10"></div>

        <div className="no-print flex items-center justify-between border-b border-border p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary-soft p-2">
              <Printer size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-main">معاينة الفاتورة</h3>
              <p className="mt-1 text-xs font-normal uppercase leading-none tracking-widest text-muted">
                معاينة الفاتورة
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="no-print flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={hidePricing}
                onChange={(e) => setHidePricing(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-focus"
              />
              <span className="text-xs font-normal text-muted">إخفاء المبالغ</span>
            </label>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-error transition-colors hover:bg-error-soft"
              aria-label="إغلاق"
            >
              <X size={24} className="text-muted" />
            </button>
          </div>
        </div>

        <div id="printable-invoice" className="min-h-[500px] bg-card p-8">
          <div className="mb-8 flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-primary text-xl font-medium text-on-primary">
                  {(academyName || 'A').charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-medium tracking-tighter text-main">
                    {academyName || 'دارين السابعة'}
                  </h2>
                  <p className="text-micro font-normal uppercase tracking-widest text-muted">
                    فاتورة الأكاديمية
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-xs font-normal text-muted">
                <p>هاتف: {adminPhone || '0123456789'}</p>
              </div>
            </div>
            <div className="text-end">
              <h1 className="mb-2 text-3xl font-medium uppercase text-main">فاتورة</h1>
              <p className="font-mono text-xs font-medium text-primary">
                #{invoice.id.slice(0, 8).toUpperCase()}
              </p>
              <div
                className={cn(
                  'mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-1 text-micro font-medium uppercase tracking-widest',
                  invoice.status === 'paid'
                    ? 'border border-success bg-success-soft text-success'
                    : invoice.status === 'pending'
                      ? 'border border-warning bg-warning-soft text-warning'
                      : 'border border-error bg-error-soft text-error',
                )}
              >
                {invoice.status === 'paid' ? (
                  <CheckCircle2 size={12} />
                ) : invoice.status === 'pending' ? (
                  <Clock size={12} />
                ) : (
                  <AlertCircle size={12} />
                )}
                {invoice.status === 'paid'
                  ? 'مدفوعة'
                  : invoice.status === 'pending'
                    ? 'معلقة'
                    : 'متأخرة'}
              </div>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4 border-y border-border py-6">
            <div>
              <p className="mb-2 text-micro font-medium uppercase tracking-widest text-muted">
                إلى الطالب:
              </p>
              <p className="mb-1 text-base font-medium text-main">{invoice.studentName}</p>
              <p className="text-xs font-normal italic text-muted">{invoice.description}</p>
            </div>
            <div className="text-end">
              <div className="space-y-2">
                <div>
                  <p className="text-micro font-medium uppercase tracking-widest text-muted">
                    تاريخ الإصدار
                  </p>
                  <p className="font-mono text-xs font-normal text-main">
                    {new Date(invoice.date).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div>
                  <p className="text-micro font-medium uppercase tracking-widest text-muted">
                    تاريخ الاستحقاق
                  </p>
                  <p className="font-mono text-xs font-normal text-main">
                    {new Date(invoice.dueDate).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="w-1/4 py-2 text-start text-micro font-medium uppercase">
                    التاريخ
                  </th>
                  <th className="w-1/4 py-2 text-start text-micro font-medium uppercase">
                    المعلمة
                  </th>
                  <th className="w-1/4 py-2 text-start text-micro font-medium uppercase">المادة</th>
                  {!hidePricing && (
                    <th className="w-1/4 py-2 text-end text-micro font-medium uppercase">الحساب</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, idx) => {
                    const parts = item.description.split(' - ')
                    const subject = parts[0] || '-'
                    const teacherWithStatus = parts[1] || ''
                    const teacherName = teacherWithStatus.split(' (')[0] || '-'
                    const status = teacherWithStatus.includes('حضور')
                      ? 'حضور'
                      : teacherWithStatus.includes('غياب')
                        ? 'غياب'
                        : '-'

                    return (
                      <tr key={idx}>
                        <td className="py-3 font-mono text-xs font-normal text-muted" dir="ltr">
                          {item.date ? new Date(item.date).toLocaleDateString('ar-EG') : '-'}
                        </td>
                        <td className="py-3 text-xs font-normal text-muted">{teacherName}</td>
                        <td className="py-3 text-xs font-normal text-muted">
                          {subject}
                          {status !== '-' && (
                            <span
                              className={cn(
                                'ms-2 rounded-sm px-1.5 py-0.5 text-micro',
                                status === 'حضور'
                                  ? 'bg-success-soft text-success'
                                  : 'bg-error-soft text-error',
                              )}
                            >
                              {status}
                            </span>
                          )}
                        </td>
                        {!hidePricing && (
                          <td className="py-3 text-end font-mono text-xs font-medium text-main">
                            {item.amount.toLocaleString()}{' '}
                            <span className="text-micro">
                              {invoice.currency || CURRENCY_SYMBOL}
                            </span>
                          </td>
                        )}
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-sm font-normal text-muted">
                      لا توجد تفاصيل للحصص
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t-2 border-border pt-4">
            <div className="text-xs font-normal text-muted">
              إجمالي الحصص: {invoice.items?.length || 0}
            </div>
            {!hidePricing && (
              <div className="flex w-full max-w-[200px] items-center justify-between bg-surface px-2 py-3">
                <span className="text-xs font-medium uppercase tracking-widest">الإجمالي</span>
                <span className="font-mono text-lg font-medium text-main">
                  {invoice.amount.toLocaleString()} {invoice.currency || CURRENCY_SYMBOL}
                </span>
              </div>
            )}
          </div>

          {invoice.notes && (
            <div className="mt-8">
              <p className="mb-2 text-micro font-medium uppercase tracking-widest text-muted">
                ملاحظات:
              </p>
              <p className="text-xs font-normal italic leading-relaxed text-muted">
                {invoice.notes}
              </p>
            </div>
          )}

          <div className="no-print mt-12 text-center">
            <p className="mb-4 text-micro font-medium uppercase tracking-label text-muted opacity-50">
              شكراً لثقتكم بأكاديميتنا
            </p>
            <div className="mx-auto h-1 w-24 bg-primary opacity-20"></div>
          </div>
        </div>

        <div className="no-print flex justify-end gap-3 border-t border-border bg-surface p-6">
          <button
            onClick={onClose}
            className="rounded-xl px-6 py-2 text-sm font-medium text-muted transition-colors hover:text-main"
          >
            إغلاق
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-medium uppercase tracking-widest text-on-primary transition-all hover:bg-primary-hover"
          >
            <Printer size={16} />
            طباعة
          </button>
        </div>
      </div>

      <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-invoice, #printable-invoice * {
                        visibility: visible;
                    }
                    #printable-invoice {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 20px !important;
                        background: white !important;
                        color: black !important;
                        z-index: 9999;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
    </div>
  )
}

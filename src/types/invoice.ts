// Invoice Types and Constants

export type InvoiceStatus =
  'paid' | 'pending' | 'overdue' | 'unpaid' | 'reviewed' | 'partially_paid'

export const INVOICE_STATUS = {
  PAID: 'paid',
  PROCESSING: 'pending',
  PENDING: 'pending',
  OVERDUE: 'overdue',
  PARTIALLY_PAID: 'partially_paid',
  REVIEWED: 'reviewed',
  UNPAID: 'unpaid',
} as const

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  paid: 'مدفوعة',
  pending: 'قيد المعالجة',
  reviewed: 'تمت المراجعة',
  unpaid: 'غير مدفوعة',
  overdue: 'متأخرة',
  partially_paid: 'مدفوعة جزئيًا',
}

/** أولوية عرض الحالات في أقراص/قوائم التصفية (الكل أولًا ثم هذه القائمة) */
export const INVOICE_STATUS_ORDER: InvoiceStatus[] = [
  'paid',
  'pending',
  'reviewed',
  'overdue',
  'partially_paid',
  'unpaid',
]

/** وصف موحد لكل حالة: التسمية + ألوان الشرائح (بنية واحدة لكل الصفحات) */
export interface InvoiceStatusChip {
  label: string
  bgCls: string
  textCls: string
}

export const INVOICE_STATUS_META: Record<InvoiceStatus, InvoiceStatusChip> = {
  paid: { label: INVOICE_STATUS_LABEL.paid, bgCls: 'bg-success-soft', textCls: 'text-success' },
  pending: {
    label: INVOICE_STATUS_LABEL.pending,
    bgCls: 'bg-warning-soft',
    textCls: 'text-warning',
  },
  reviewed: { label: INVOICE_STATUS_LABEL.reviewed, bgCls: 'bg-info-soft', textCls: 'text-info' },
  overdue: { label: INVOICE_STATUS_LABEL.overdue, bgCls: 'bg-error-soft', textCls: 'text-error' },
  partially_paid: {
    label: INVOICE_STATUS_LABEL.partially_paid,
    bgCls: 'bg-primary-soft',
    textCls: 'text-primary',
  },
  unpaid: { label: INVOICE_STATUS_LABEL.unpaid, bgCls: 'bg-error-soft', textCls: 'text-error' },
}

export const normalizeInvoiceStatus = (raw?: string | null): InvoiceStatus => {
  const v = (raw || '').trim().toLowerCase()
  if (v === 'paid' || v === 'مدفوعة' || v === 'تم الدفع') return 'paid'
  if (v === 'pending' || v === 'processing' || v === 'قيد المعالجة' || v === 'معلقة')
    return 'pending'
  if (v === 'reviewed' || v === 'تمت المراجعة' || v === 'تم المراجعة') return 'reviewed'
  if (v === 'overdue' || v === 'متأخرة') return 'overdue'
  if (
    v === 'partially_paid' ||
    v === 'partially paid' ||
    v === 'مدفوعة جزئيا' ||
    v === 'مدفوعة جزئياً'
  )
    return 'partially_paid'
  return 'unpaid'
}

export interface TeacherInvoice {
  id: string
  teacherId?: string
  teacher: string
  specialization: string
  amount: number
  paymentMethod: string
  status: InvoiceStatus
  date: string
  personalExpenses?: number
  currency?: string
}

export interface TeacherInvoiceFormData {
  teacherId: string
  teacher: string
  specialization: string
  amount: string
  paymentMethod: string
  status: InvoiceStatus
  personalExpenses: string
  currency: string
}

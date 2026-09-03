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

export interface Teacher {
  id: string
  name: string
  subject?: string
  phone?: string
  phone1?: string
  phone2?: string
  price?: number
  email?: string
  username?: string
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

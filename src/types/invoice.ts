// Invoice Types and Constants

export const INVOICE_STATUS = {
    PAID: 'مدفوعة',
    PROCESSING: 'قيد المعالجة',
    OVERDUE: 'متأخرة',
    UNPAID: 'غير مدفوعة'
} as const;

export type InvoiceStatus = typeof INVOICE_STATUS[keyof typeof INVOICE_STATUS];

export interface Teacher {
    id: string;
    name: string;
    subject?: string;
    phone?: string;
    phone1?: string;
    phone2?: string;
    price?: number;
    email?: string;
    username?: string;
}

export interface TeacherInvoice {
    id: string;
    teacherId?: string;
    teacher: string;
    specialization: string;
    amount: number;
    paymentMethod: string;
    status: InvoiceStatus;
    date: string;
    personalExpenses?: number;
    currency?: string;
}

export interface TeacherInvoiceFormData {
    teacherId: string;
    teacher: string;
    specialization: string;
    amount: string;
    paymentMethod: string;
    status: InvoiceStatus;
    personalExpenses: string;
    currency: string;
}

export interface InvoiceStats {
    totalTeachers: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    personalExpenses: number;
    unpaidPercentage: number;
}

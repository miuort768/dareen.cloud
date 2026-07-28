import { useState } from 'react';
import { X, Printer, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useSettingsStore } from '../../../store/settingsStore';

interface InvoicePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: {
        id: string;
        studentName: string;
        amount: number;
        date: string;
        dueDate: string;
        description: string;
        status: 'paid' | 'pending' | 'overdue';
        notes?: string;
        items?: { description: string; date?: string; amount: number }[];
    };
}

export const InvoicePreviewModal = ({ isOpen, onClose, invoice }: InvoicePreviewModalProps) => {
    const academyName = useSettingsStore(s => s.academyName);
    const adminPhone = useSettingsStore(s => s.adminPhone);
    const [hidePricing, setHidePricing] = useState(false);

    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
            <div className="bg-card w-full max-w-lg shadow-elevation-2 relative overflow-hidden animate-in fade-in zoom-in duration-300 rounded-2xl">
                <div className="absolute top-0 start-0 w-32 h-32 bg-primary opacity-10 -rotate-45 translate-x-16 -translate-y-16 pointer-events-none"></div>

                <div className="flex items-center justify-between p-6 border-b border-border no-print">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-soft rounded-xl">
                            <Printer size={24} className="text-primary" />
                        </div>
                        <div>
                            <h3 className="font-medium text-xl text-main">معاينة الفاتورة</h3>
                            <p className="text-xs text-muted font-normal uppercase tracking-widest leading-none mt-1">معاينة الفاتورة</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer no-print">
                            <input
                                type="checkbox"
                                checked={hidePricing}
                                onChange={(e) => setHidePricing(e.target.checked)}
                                className="w-4 h-4 text-primary rounded border-border focus:ring-focus"
                            />
                            <span className="text-xs font-normal text-muted">إخفاء المبالغ</span>
                        </label>
                        <button onClick={onClose} className="p-2 hover:bg-hover transition-colors rounded-xl" aria-label="إغلاق">
                            <X size={24} className="text-muted" />
                        </button>
                    </div>
                </div>

                <div id="printable-invoice" className="p-8 bg-card min-h-[500px]">
                    <div className="flex justify-between items-start mb-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary text-on-primary flex items-center justify-center text-xl font-medium">
                                    {(academyName || 'A').charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-medium text-main tracking-tighter">{academyName || 'أكاديمية الشيخ خوارزمي'}</h2>
                                    <p className="text-micro text-muted font-normal uppercase tracking-widest">فاتورة الأكاديمية</p>
                                </div>
                            </div>
                            <div className="text-xs font-normal text-muted space-y-1">
                                <p>هاتف: {adminPhone || '0123456789'}</p>
                            </div>
                        </div>
                        <div className="text-end">
                            <h1 className="text-3xl font-medium text-main uppercase mb-2">فاتورة</h1>
                            <p className="text-xs font-medium text-primary font-mono">#{invoice.id.slice(0, 8).toUpperCase()}</p>
                            <div className={cn(
                                "mt-2 inline-flex items-center gap-2 px-3 py-1 text-micro font-medium uppercase tracking-widest rounded-lg",
                                invoice.status === 'paid' ? "bg-success-soft text-success border border-success" :
                                    invoice.status === 'pending' ? "bg-warning-soft text-warning border border-warning" :
                                        "bg-error-soft text-error border border-error"
                            )}>
                                {invoice.status === 'paid' ? <CheckCircle2 size={12} /> : invoice.status === 'pending' ? <Clock size={12} /> : <AlertCircle size={12} />}
                                {invoice.status === 'paid' ? 'مدفوعة' : invoice.status === 'pending' ? 'معلقة' : 'متأخرة'}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8 border-y border-border py-6">
                        <div>
                            <p className="text-micro text-muted font-medium uppercase mb-2 tracking-widest">إلى الطالب:</p>
                            <p className="text-base font-medium text-main mb-1">{invoice.studentName}</p>
                            <p className="text-xs text-muted font-normal italic">{invoice.description}</p>
                        </div>
                        <div className="text-end">
                            <div className="space-y-2">
                                <div>
                                    <p className="text-micro text-muted font-medium uppercase tracking-widest">تاريخ الإصدار</p>
                                    <p className="text-xs font-normal text-main font-mono">{new Date(invoice.date).toLocaleDateString('ar-EG')}</p>
                                </div>
                                <div>
                                    <p className="text-micro text-muted font-medium uppercase tracking-widest">تاريخ الاستحقاق</p>
                                    <p className="text-xs font-normal text-main font-mono">{new Date(invoice.dueDate).toLocaleDateString('ar-EG')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <table className="w-full table-fixed border-collapse">
                            <thead>
                                <tr className="border-b-2 border-border">
                                    <th className="py-2 text-start text-micro font-medium uppercase w-1/4">التاريخ</th>
                                    <th className="py-2 text-start text-micro font-medium uppercase w-1/4">المعلمة</th>
                                    <th className="py-2 text-start text-micro font-medium uppercase w-1/4">المادة</th>
                                    {!hidePricing && <th className="py-2 text-end text-micro font-medium uppercase w-1/4">الحساب</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {invoice.items && invoice.items.length > 0 ? (
                                    invoice.items.map((item, idx) => {
                                        const parts = item.description.split(' - ');
                                        const subject = parts[0] || '-';
                                        const teacherWithStatus = parts[1] || '';
                                        const teacherName = teacherWithStatus.split(' (')[0] || '-';
                                        const status = teacherWithStatus.includes('حضور') ? 'حضور' : teacherWithStatus.includes('غياب') ? 'غياب' : '-';

                                        return (
                                            <tr key={idx}>
                                                <td className="py-3 text-xs font-mono font-normal text-muted" dir="ltr">
                                                    {item.date ? new Date(item.date).toLocaleDateString('ar-EG') : '-'}
                                                </td>
                                                <td className="py-3 text-xs font-normal text-muted">
                                                    {teacherName}
                                                </td>
                                                <td className="py-3 text-xs font-normal text-muted">
                                                    {subject}
                                                    {status !== '-' && (
                                                        <span className={cn(
                                                            "ms-2 px-1.5 py-0.5 text-micro rounded-sm",
                                                            status === 'حضور' ? "bg-success-soft text-success" : "bg-error-soft text-error"
                                                        )}>
                                                            {status}
                                                        </span>
                                                    )}
                                                </td>
                                                {!hidePricing && (
                                                    <td className="py-3 text-end text-xs font-medium font-mono text-main">
                                                        {item.amount.toLocaleString()} <span className="text-micro">ج.م</span>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-4 text-center text-sm font-normal text-muted">لا توجد تفاصيل للحصص</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t-2 border-border">
                        <div className="text-xs font-normal text-muted">
                            إجمالي الحصص: {invoice.items?.length || 0}
                        </div>
                        {!hidePricing && (
                            <div className="w-full max-w-[200px] flex justify-between items-center px-2 py-3 bg-surface">
                                <span className="text-xs font-medium uppercase tracking-widest">الإجمالي</span>
                                <span className="text-lg font-medium font-mono text-main">{invoice.amount.toLocaleString()} ج.م</span>
                            </div>
                        )}
                    </div>

                    {invoice.notes && (
                        <div className="mt-8">
                            <p className="text-micro text-muted font-medium uppercase mb-2 tracking-widest">ملاحظات:</p>
                            <p className="text-xs text-muted leading-relaxed font-normal italic">{invoice.notes}</p>
                        </div>
                    )}

                    <div className="mt-12 text-center no-print">
                        <p className="text-micro text-muted font-medium uppercase tracking-label mb-4 opacity-50">شكراً لثقتكم بأكاديميتنا</p>
                        <div className="w-24 h-1 bg-primary mx-auto opacity-20"></div>
                    </div>
                </div>

                <div className="p-6 border-t border-border bg-surface flex justify-end gap-3 no-print">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-medium text-muted hover:text-main transition-colors rounded-xl"
                    >
                        إغلاق
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-6 py-2.5 bg-primary text-on-primary font-medium text-xs uppercase tracking-widest hover:bg-primary-hover transition-all flex items-center gap-2 rounded-xl"
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
    );
};

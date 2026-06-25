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
    const { academyName, adminPhone } = useSettingsStore();
    const [hidePricing, setHidePricing] = useState(false);

    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60  transition-all duration-300">
            {/* Reduced max-width to max-w-lg (roughly 25% smaller than 2xl/xl) */}
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg shadow-sm relative overflow-hidden animate-in fade-in zoom-in duration-300 rounded-2xl">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 -rotate-45 translate-x-16 -translate-y-16 pointer-events-none"></div>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 no-print">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
                            <Printer size={24} className="text-primary-600" />
                        </div>
                        <div>
                            <h3 className="font-medium text-xl text-gray-900 dark:text-white">معاينة الفاتورة</h3>
                            <p className="text-xs text-gray-400 font-normal uppercase tracking-widest leading-none mt-1">معاينة الفاتورة</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer no-print">
                            <input
                                type="checkbox"
                                checked={hidePricing}
                                onChange={(e) => setHidePricing(e.target.checked)}
                                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                            />
                            <span className="text-xs font-normal text-gray-600 dark:text-gray-400">إخفاء المبالغ</span>
                        </label>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-xl">
                            <X size={24} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Invoice Content */}
                <div id="printable-invoice" className="p-8 bg-white dark:bg-gray-900 min-h-[500px]">
                    <div className="flex justify-between items-start mb-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-600 text-white flex items-center justify-center text-xl font-medium">
                                    {(academyName || 'A').charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-medium text-gray-900 dark:text-white tracking-tighter">{academyName || 'أكاديمية الشيخ خوارزمي'}</h2>
                                    <p className="text-[10px] text-gray-400 font-normal uppercase tracking-widest">فاتورة الأكاديمية</p>
                                </div>
                            </div>
                            <div className="text-xs font-normal text-gray-500 space-y-1">
                                <p>هاتف: {adminPhone || '0123456789'}</p>
                            </div>
                        </div>
                        <div className="text-left">
                            <h1 className="text-3xl font-medium text-gray-900 dark:text-white uppercase mb-2">فاتورة</h1>
                            <p className="text-xs font-medium text-primary-600 font-mono">#{invoice.id.slice(0, 8).toUpperCase()}</p>
                            <div className={cn(
                                "mt-2 inline-flex items-center gap-2 px-3 py-1 text-[10px] font-medium uppercase tracking-widest rounded-lg",
                                invoice.status === 'paid' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                    invoice.status === 'pending' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                        "bg-rose-50 text-rose-600 border border-rose-100"
                            )}>
                                {invoice.status === 'paid' ? <CheckCircle2 size={12} /> : invoice.status === 'pending' ? <Clock size={12} /> : <AlertCircle size={12} />}
                                {invoice.status === 'paid' ? 'مدفوعة' : invoice.status === 'pending' ? 'معلقة' : 'متأخرة'}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8 border-y border-gray-100 dark:border-gray-800 py-6">
                        <div>
                            <p className="text-[10px] text-gray-400 font-medium uppercase mb-2 tracking-widest">إلى الطالب:</p>
                            <p className="text-base font-medium text-gray-900 dark:text-white mb-1">{invoice.studentName}</p>
                            <p className="text-xs text-gray-500 font-normal italic">{invoice.description}</p>
                        </div>
                        <div className="text-left">
                            <div className="space-y-2">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">تاريخ الإصدار</p>
                                    <p className="text-xs font-normal text-gray-900 dark:text-white font-mono">{new Date(invoice.date).toLocaleDateString('ar-EG')}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">تاريخ الاستحقاق</p>
                                    <p className="text-xs font-normal text-gray-900 dark:text-white font-mono">{new Date(invoice.dueDate).toLocaleDateString('ar-EG')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <table className="w-full table-fixed border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-900 dark:border-white">
                                    <th className="py-2 text-right text-[10px] font-medium uppercase w-1/4">التاريخ</th>
                                    <th className="py-2 text-right text-[10px] font-medium uppercase w-1/4">المعلمة</th>
                                    <th className="py-2 text-right text-[10px] font-medium uppercase w-1/4">المادة</th>
                                    {!hidePricing && <th className="py-2 text-left text-[10px] font-medium uppercase w-1/4">الحساب</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {invoice.items && invoice.items.length > 0 ? (
                                    invoice.items.map((item, idx) => {
                                        // item.description format: "Math - TeacherName (Status)"
                                        const parts = item.description.split(' - ');
                                        const subject = parts[0] || '-';
                                        const teacherWithStatus = parts[1] || '';
                                        const teacherName = teacherWithStatus.split(' (')[0] || '-';
                                        const status = teacherWithStatus.includes('حضور') ? 'حضور' : teacherWithStatus.includes('غياب') ? 'غياب' : '-';

                                        return (
                                            <tr key={idx}>
                                                <td className="py-3 text-xs font-mono font-normal text-gray-700 dark:text-gray-300" dir="ltr">
                                                    {item.date ? new Date(item.date).toLocaleDateString('ar-EG') : '-'}
                                                </td>
                                                <td className="py-3 text-xs font-normal text-gray-700 dark:text-gray-300">
                                                    {teacherName}
                                                </td>
                                                <td className="py-3 text-xs font-normal text-gray-700 dark:text-gray-300">
                                                    {subject}
                                                    {status !== '-' && (
                                                        <span className={cn(
                                                            "mr-2 px-1.5 py-0.5 text-[9px] rounded-sm",
                                                            status === 'حضور' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                        )}>
                                                            {status}
                                                        </span>
                                                    )}
                                                </td>
                                                {!hidePricing && (
                                                    <td className="py-3 text-left text-xs font-medium font-mono text-gray-900 dark:text-white">
                                                        {item.amount.toLocaleString()} <span className="text-[9px]">ج.م</span>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-4 text-center text-sm font-normal text-gray-500">لا توجد تفاصيل للحصص</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t-2 border-gray-900 dark:border-white">
                        <div className="text-xs font-normal text-gray-500">
                            إجمالي الحصص: {invoice.items?.length || 0}
                        </div>
                        {!hidePricing && (
                            <div className="w-full max-w-[200px] flex justify-between items-center px-2 py-3 bg-gray-50 dark:bg-gray-800/50">
                                <span className="text-xs font-medium uppercase tracking-widest">الإجمالي</span>
                                <span className="text-lg font-medium font-mono text-gray-900 dark:text-white">{invoice.amount.toLocaleString()} ج.م</span>
                            </div>
                        )}
                    </div>

                    {invoice.notes && (
                        <div className="mt-8">
                            <p className="text-[10px] text-gray-400 font-medium uppercase mb-2 tracking-widest">ملاحظات:</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-normal italic">{invoice.notes}</p>
                        </div>
                    )}

                    <div className="mt-12 text-center no-print">
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] mb-4 opacity-50">شكراً لثقتكم بأكاديميتنا</p>
                        <div className="w-24 h-1 bg-primary-600 mx-auto opacity-20"></div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 no-print">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-xl"
                    >
                        إغلاق
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-6 py-2.5 bg-primary-600 text-white font-medium text-xs uppercase tracking-widest hover:bg-primary-700 transition-all shadow-sm shadow-primary-600/20 flex items-center gap-2 rounded-xl"
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

import { useState } from 'react';
import { X, Printer } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useSettings } from '../../../context/AppContext';

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
    const { academyName, adminPhone } = useSettings();
    const [hidePricing, setHidePricing] = useState(true); // Default to hiding prices as requested

    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 -rotate-45 translate-x-16 -translate-y-16 pointer-events-none"></div>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 no-print">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-50 dark:bg-primary-900/30">
                            <Printer size={24} className="text-primary-600" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-gray-900 dark:text-white">معاينة التقرير</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Session Report Preview</p>
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
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">إخفاء المبالغ</span>
                        </label>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <X size={24} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Invoice Content */}
                <div id="printable-invoice" className="p-8 bg-white dark:bg-gray-900 min-h-[500px]">
                    <div className="flex justify-between items-start mb-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-600 text-white flex items-center justify-center text-xl font-black">
                                    {(academyName || 'A').charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">{academyName || 'أكاديمية الشيخ خوارزمي'}</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Session Tracking Record</p>
                                </div>
                            </div>
                            <div className="text-xs font-bold text-gray-500 space-y-1">
                                <p>هاتف: {adminPhone || '0123456789'}</p>
                            </div>
                        </div>
                        <div className="text-left">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase mb-2">تقرير حصص</h1>
                            <p className="text-xs font-black text-primary-600 font-mono">#{invoice.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 border-y border-gray-100 dark:border-gray-800 py-6">
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase mb-1 tracking-widest">اسم الطالب:</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white mb-1">{invoice.studentName}</p>
                            <p className="text-xs text-gray-500 font-bold italic">{invoice.description}</p>
                        </div>
                        <div className="text-left">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">تاريخ التقرير</p>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white font-mono">{new Date(invoice.date).toLocaleDateString('ar-EG')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <table className="w-full table-fixed border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-900 dark:border-white">
                                    <th className="py-2 text-right text-[10px] font-black uppercase w-[30%]">التاريخ</th>
                                    <th className="py-2 text-right text-[10px] font-black uppercase w-[35%]">المعلمة</th>
                                    <th className="py-2 text-right text-[10px] font-black uppercase w-[35%]">المادة</th>
                                    {!hidePricing && <th className="py-2 text-left text-[10px] font-black uppercase w-20">الحساب</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {invoice.items && invoice.items.length > 0 ? (
                                    invoice.items.map((item, idx) => {
                                        const parts = item.description.split(' - ');
                                        const subject = parts[0] || '-';
                                        const teacherWithStatus = parts[1] || '';
                                        const teacherName = teacherWithStatus.split(' (')[0] || '-';
                                        const status = teacherWithStatus.includes('حضور') ? 'حضور' : teacherWithStatus.includes('غياب') ? 'غياب' : '-';

                                        return (
                                            <tr key={idx}>
                                                <td className="py-3 text-xs font-mono font-bold text-gray-700 dark:text-gray-300" dir="ltr">
                                                    {item.date ? new Date(item.date).toLocaleDateString('ar-EG') : '-'}
                                                </td>
                                                <td className="py-3 text-sm font-black text-gray-900 dark:text-white">
                                                    {teacherName}
                                                </td>
                                                <td className="py-3 text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    <div className="flex items-center gap-2">
                                                        <span>{subject}</span>
                                                        {status !== '-' && (
                                                            <span className={cn(
                                                                "px-1.5 py-0.5 text-[8px] font-black rounded-sm",
                                                                status === 'حضور' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                                                            )}>
                                                                {status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                {!hidePricing && (
                                                    <td className="py-3 text-left text-xs font-black font-mono text-gray-900 dark:text-white">
                                                        {item.amount.toLocaleString()} <span className="text-[9px]">ج.م</span>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={hidePricing ? 3 : 4} className="py-8 text-center text-sm font-bold text-gray-500">لا توجد تفاصيل للحصص في هذا التقرير</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t-2 border-gray-900 dark:border-white">
                        <div className="text-xs font-black text-gray-900 dark:text-white">
                            إجمالي الحصص المسجلة: <span className="bg-primary-50 dark:bg-primary-900/40 px-2 py-0.5 border border-primary-100 dark:border-primary-800">{invoice.items?.length || 0}</span>
                        </div>
                        {!hidePricing && (
                            <div className="w-full max-w-[180px] flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                <span className="text-[10px] font-black uppercase tracking-widest">الإجمالي</span>
                                <span className="text-xl font-black font-mono text-gray-900 dark:text-white">{invoice.amount.toLocaleString()} <span className="text-xs">ج.م</span></span>
                            </div>
                        )}
                    </div>

                    {invoice.notes && (
                        <div className="mt-8">
                            <p className="text-[10px] text-gray-400 font-black uppercase mb-2 tracking-widest">ملاحظات إضافية:</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-bold italic bg-slate-50 dark:bg-slate-800/50 p-3 border-r-4 border-primary-500">{invoice.notes}</p>
                        </div>
                    )}

                    <div className="mt-12 text-center no-print">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-4 opacity-50">نتمنى لكم دوام التوفيق والنجاح</p>
                        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-primary-600 to-transparent mx-auto opacity-30"></div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 no-print">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-black text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        إغلاق
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-8 py-3 bg-primary-600 text-white font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 flex items-center gap-2 transform active:scale-95"
                    >
                        <Printer size={16} />
                        طباعة كشف الحصص
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

import { X, Printer, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
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

    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            {/* Reduced max-width to max-w-lg (roughly 25% smaller than 2xl/xl) */}
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
                            <h3 className="font-black text-xl text-gray-900 dark:text-white">معاينة الفاتورة</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Invoice Preview</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <X size={24} className="text-gray-400" />
                    </button>
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
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Academy Invoice</p>
                                </div>
                            </div>
                            <div className="text-xs font-bold text-gray-500 space-y-1">
                                <p>هاتف: {adminPhone || '0123456789'}</p>
                            </div>
                        </div>
                        <div className="text-left">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase mb-2">فاتورة</h1>
                            <p className="text-xs font-black text-primary-600 font-mono">#{invoice.id.slice(0, 8).toUpperCase()}</p>
                            <div className={cn(
                                "mt-2 inline-flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest",
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
                            <p className="text-[10px] text-gray-400 font-black uppercase mb-2 tracking-widest">إلى الطالب:</p>
                            <p className="text-base font-black text-gray-900 dark:text-white mb-1">{invoice.studentName}</p>
                            <p className="text-xs text-gray-500 font-bold italic">{invoice.description}</p>
                        </div>
                        <div className="text-left">
                            <div className="space-y-2">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">تاريخ الإصدار</p>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white font-mono">{new Date(invoice.date).toLocaleDateString('ar-EG')}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">تاريخ الاستحقاق</p>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white font-mono">{new Date(invoice.dueDate).toLocaleDateString('ar-EG')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-900 dark:border-white">
                                    <th className="py-2 text-right text-[10px] font-black uppercase">التفاصيل</th>
                                    <th className="py-2 text-left text-[10px] font-black uppercase">المبلغ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {invoice.items && invoice.items.length > 0 ? (
                                    invoice.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="py-3 text-xs font-bold text-gray-700 dark:text-gray-300">
                                                {item.description}
                                                {item.date && (
                                                    <span className="block text-[10px] text-gray-400 font-mono mt-0.5" dir="ltr">
                                                        {new Date(item.date).toLocaleDateString('ar-EG')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 text-left text-xs font-black font-mono text-gray-900 dark:text-white">
                                                {item.amount.toLocaleString()} <span className="text-[9px]">ج.م</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="py-4 text-sm font-bold text-gray-700 dark:text-gray-300">{invoice.description}</td>
                                        <td className="py-4 text-left text-sm font-black font-mono text-gray-900 dark:text-white">{invoice.amount.toLocaleString()} ج.م</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end pt-4 border-t-2 border-gray-900 dark:border-white">
                        <div className="w-full max-w-[200px] flex justify-between items-center px-2 py-3 bg-gray-50 dark:bg-gray-800/50">
                            <span className="text-xs font-black uppercase tracking-widest">الإجمالي</span>
                            <span className="text-lg font-black font-mono text-gray-900 dark:text-white">{invoice.amount.toLocaleString()} ج.م</span>
                        </div>
                    </div>

                    {invoice.notes && (
                        <div className="mt-8">
                            <p className="text-[10px] text-gray-400 font-black uppercase mb-2 tracking-widest">ملاحظات:</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-bold italic">{invoice.notes}</p>
                        </div>
                    )}

                    <div className="mt-12 text-center no-print">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-4 opacity-50">شكراً لثقتكم بأكاديميتنا</p>
                        <div className="w-24 h-1 bg-primary-600 mx-auto opacity-20"></div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 no-print">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-black text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        إغلاق
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-6 py-2.5 bg-primary-600 text-white font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2"
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

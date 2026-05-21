import { FileText, Printer, Edit, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { SectionCard } from './InvoiceUI';

interface StudentInvoice {
    id: string;
    studentId: string;
    studentName: string;
    amount: number;
    description: string;
    date: string;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
    paymentMethod?: string;
    notes?: string;
    items?: { description: string; date?: string; amount: number }[];
}

interface InvoiceTableProps {
    filteredInvoices: StudentInvoice[];
    toggleStatus: (invoice: StudentInvoice) => Promise<void>;
    handleEdit: (invoice: StudentInvoice) => void;
    setPreviewInvoice: (invoice: StudentInvoice | null) => void;
    setDeletingId: (id: string | null) => void;
}

export const InvoiceTable = ({ filteredInvoices, toggleStatus, handleEdit, setPreviewInvoice, setDeletingId }: InvoiceTableProps) => (
    <SectionCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto rounded-2xl">
            <table className="w-full text-right text-sm">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">اسم الطالب</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">البيان</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">المبلغ</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">الاستحقاق</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">الحالة</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">إجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-[#eef2ff] dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-[10px] font-bold text-[#5c59f2]">
                                        {(inv.studentName || '?')[0].toUpperCase()}
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{inv.studentName}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-[10px] font-medium text-slate-400 truncate max-w-[150px] inline-block">{inv.description}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <span className="font-mono text-[11px] font-black text-slate-700 dark:text-slate-200">{inv.amount.toLocaleString()} ج.م</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <span className="text-[10px] font-medium text-slate-400 italic">{inv.dueDate}</span>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => toggleStatus(inv)}
                                        className={cn(
                                            "inline-flex items-center gap-1.5 px-2 py-1 font-bold text-[9px] rounded-lg transition-all",
                                            inv.status === 'paid'
                                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                : inv.status === 'pending'
                                                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                                                    : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                                        )}
                                    >
                                        <div className={cn(
                                            "w-1 h-1 rounded-full",
                                            inv.status === 'paid' ? "bg-emerald-500" :
                                                inv.status === 'pending' ? "bg-amber-500" : "bg-rose-500"
                                        )}></div>
                                        {inv.status === 'paid' ? 'مدفوعة' : inv.status === 'pending' ? 'معلقة' : 'متأخرة'}
                                    </button>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-1">
                                    <button
                                        onClick={() => setPreviewInvoice(inv)}
                                        className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                                        title="معاينة وطباعة"
                                    >
                                        <Printer size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(inv)}
                                        className="p-1.5 text-slate-400 hover:text-[#5c59f2] hover:bg-[#eef2ff] dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                        title="تعديل"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button
                                        onClick={() => setDeletingId(inv.id)}
                                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                                        title="حذف"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={6} className="py-16 text-center">
                                <FileText className="mx-auto mb-2 text-slate-200" size={32} />
                                <p className="text-xs font-bold text-slate-400">لا توجد فواتير</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </SectionCard>
);

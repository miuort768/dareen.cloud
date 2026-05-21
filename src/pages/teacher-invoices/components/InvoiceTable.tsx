import { Edit, Trash2, GraduationCap } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { SectionCard } from './InvoiceUI';

interface TeacherInvoice {
    id: string;
    teacher: string;
    specialization: string;
    amount: number;
    paymentMethod: string;
    status: string;
    personalExpenses?: number;
    date?: string;
}

interface InvoiceTableProps {
    filteredInvoices: TeacherInvoice[];
    handleEdit: (invoice: TeacherInvoice) => void;
    handleDelete: (id: string) => void;
    isTeacher: boolean;
}

export const InvoiceTable = ({ filteredInvoices, handleEdit, handleDelete, isTeacher }: InvoiceTableProps) => (
    <SectionCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto rounded-2xl">
            <table className="w-full text-right text-sm">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">المعلمة</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">التخصص</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">المبلغ</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">الصافي</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">الحالة</th>
                        {!isTeacher && <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">الإجراءات</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredInvoices.length > 0 ? filteredInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-[#eef2ff] dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-[10px] font-bold text-[#5c59f2]">
                                        {invoice.teacher[0].toUpperCase()}
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{invoice.teacher}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-[10px] font-medium text-slate-400">{invoice.specialization}</span>
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                                {invoice.amount.toLocaleString()} ج.م
                            </td>
                            <td className="px-4 py-3 text-center">
                                <span className="inline-flex px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-md border border-emerald-100 dark:border-emerald-800/50">
                                    {(invoice.amount - (invoice.personalExpenses || 0)).toLocaleString()} ج.م
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex justify-center">
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-2 py-1 font-bold text-[9px] rounded-lg transition-all",
                                        invoice.status === 'مدفوعة'
                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                            : invoice.status === 'قيد المعالجة'
                                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                                                : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                                    )}>
                                        <div className={cn(
                                            "w-1 h-1 rounded-full",
                                            invoice.status === 'مدفوعة' ? "bg-emerald-500" :
                                                invoice.status === 'قيد المعالجة' ? "bg-amber-500" : "bg-rose-500"
                                        )}></div>
                                        {invoice.status}
                                    </span>
                                </div>
                            </td>
                            {!isTeacher && (
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => handleEdit(invoice)}
                                            className="p-1.5 text-slate-400 hover:text-[#5c59f2] hover:bg-[#eef2ff] dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(invoice.id)}
                                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={6} className="py-16 text-center">
                                <GraduationCap className="mx-auto mb-2 text-slate-200" size={32} />
                                <p className="text-xs font-bold text-slate-400">لا توجد فواتير</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </SectionCard>
);

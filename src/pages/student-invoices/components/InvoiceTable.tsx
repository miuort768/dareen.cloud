import { FileText, Printer, Edit, Trash2, ChevronLeft } from 'lucide-react';
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

const statusConfig = {
  paid: { label: 'مدفوعة', dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  pending: { label: 'معلقة', dot: 'bg-amber-500', bg: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  overdue: { label: 'متأخرة', dot: 'bg-rose-500', bg: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
};

const AvatarLetter = ({ name, className = '' }: { name: string; className?: string }) => (
  <div className={cn(
    'w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-950',
    className
  )}>
    {(name || '?')[0].toUpperCase()}
  </div>
);

const ActionButton = ({ icon: Icon, onClick, title, hoverClass }: { icon: React.ComponentType<{ size?: number }>; onClick: () => void; title: string; hoverClass: string }) => (
  <button
    onClick={onClick}
    className={cn(
      "p-1.5 text-slate-400 rounded-lg transition-all active:scale-90",
      hoverClass
    )}
    title={title}
  >
    <Icon size={14} />
  </button>
);

export const InvoiceTable = ({ filteredInvoices, toggleStatus, handleEdit, setPreviewInvoice, setDeletingId }: InvoiceTableProps) => (
  <>
    {/* ── Desktop: standard table ── */}
    <SectionCard className="hidden md:block p-0 overflow-hidden">
      <div className="overflow-x-auto rounded-2xl">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
              {['اسم الطالب', 'البيان', 'المبلغ', 'الاستحقاق', 'الحالة', 'إجراءات'].map(h => (
                <th key={h} className={cn(
                  "px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide",
                  h === 'المبلغ' || h === 'الاستحقاق' || h === 'الحالة' || h === 'إجراءات' ? 'text-center' : ''
                )}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <AvatarLetter name={inv.studentName} />
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
                  <span className="text-[10px] font-medium text-slate-400">{inv.dueDate}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <button onClick={() => toggleStatus(inv)} className={cn("inline-flex items-center gap-1.5 px-2 py-1 font-bold text-[9px] rounded-lg border transition-all", statusConfig[inv.status].bg, statusConfig[inv.status].border)}>
                      <div className={cn("w-1 h-1 rounded-full", statusConfig[inv.status].dot)} />
                      {statusConfig[inv.status].label}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <ActionButton icon={Printer} onClick={() => setPreviewInvoice(inv)} title="معاينة وطباعة" hoverClass="hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" />
                    <ActionButton icon={Edit} onClick={() => handleEdit(inv)} title="تعديل" hoverClass="hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20" />
                    <ActionButton icon={Trash2} onClick={() => setDeletingId(inv.id)} title="حذف" hoverClass="hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" />
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <FileText className="mx-auto mb-2 text-slate-200 dark:text-slate-700" size={32} />
                  <p className="text-xs font-bold text-slate-400">لا توجد فواتير</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>

    {/* ── Mobile: card list ── */}
    <div className="md:hidden space-y-3">
      {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => {
        const sc = statusConfig[inv.status];
        return (
          <div
            key={inv.id}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-950/30 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AvatarLetter name={inv.studentName} />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{inv.studentName}</p>
                  <p className="text-[10px] text-slate-400">{inv.description}</p>
                </div>
              </div>
              <ChevronLeft size={16} className="text-slate-300" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">المبلغ</p>
                  <span className="font-mono text-sm font-black text-slate-800 dark:text-white">{inv.amount.toLocaleString()} ج.م</span>
                </div>
                <div className="w-px h-8 bg-slate-100 dark:bg-slate-800" />
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">الاستحقاق</p>
                  <span className="text-[11px] font-medium text-slate-500">{inv.dueDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleStatus(inv)} className={cn("inline-flex items-center gap-1.5 px-2 py-1 font-bold text-[9px] rounded-lg border transition-all", sc.bg, sc.border)}>
                  <div className={cn("w-1 h-1 rounded-full", sc.dot)} />
                  {sc.label}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <ActionButton icon={Printer} onClick={() => setPreviewInvoice(inv)} title="معاينة وطباعة" hoverClass="hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" />
              <ActionButton icon={Edit} onClick={() => handleEdit(inv)} title="تعديل" hoverClass="hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20" />
              <ActionButton icon={Trash2} onClick={() => setDeletingId(inv.id)} title="حذف" hoverClass="hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" />
            </div>
          </div>
        );
      }) : (
        <SectionCard className="py-16 text-center">
          <FileText className="mx-auto mb-2 text-slate-200 dark:text-slate-700" size={32} />
          <p className="text-xs font-bold text-slate-400">لا توجد فواتير</p>
        </SectionCard>
      )}
    </div>
  </>
);

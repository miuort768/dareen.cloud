import { memo } from 'react';
import { FileText, Printer, Edit, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { CURRENCY_SYMBOL } from '../../../config/constants';
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

const statusClasses: Record<string, string> = {
  paid: 'bg-success-soft text-success-dark border-success',
  pending: 'bg-warning-soft text-warning-dark border-warning',
  overdue: 'bg-error-soft text-error-dark border-error',
};

const statusLabel: Record<string, string> = {
  paid: 'مدفوعة',
  pending: 'معلقة',
  overdue: 'متأخرة',
};

const AvatarLetter = ({ name }: { name: string }) => (
  <div className="w-7 h-7 rounded-xl bg-primary-soft text-primary flex items-center justify-center text-micro font-bold">
    {(name || '?')[0].toUpperCase()}
  </div>
);

const ActionButton = ({ icon: Icon, onClick, title, hoverClass }: { icon: React.ComponentType<{ size?: number }>; onClick: () => void; title: string; hoverClass: string }) => (
  <button
    onClick={onClick}
    className={cn("p-1.5 text-muted transition-all active:scale-90", hoverClass)}
    title={title}
  >
    <Icon size={13} />
  </button>
);

export const InvoiceTable = memo(({ filteredInvoices, toggleStatus, handleEdit, setPreviewInvoice, setDeletingId }: InvoiceTableProps) => (
  <>
    <SectionCard className="hidden md:block overflow-x-auto">
      <table className="w-full text-start text-sm border-collapse">
        <thead>
          <tr className="bg-gradient-to-l from-primary to-primary-hover">
            {['اسم الطالب', 'البيان', 'المبلغ', 'الاستحقاق', 'الحالة', 'إجراءات'].map(h => (
              <th key={h} className={cn(
                "px-4 py-3 text-micro font-bold text-on-primary opacity-70 tracking-wider border-b border-transparent",
                h === 'المبلغ' || h === 'الاستحقاق' || h === 'الحالة' || h === 'إجراءات' ? 'text-center' : ''
              )}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-hover transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <AvatarLetter name={inv.studentName} />
                  <span className="text-xs font-bold text-main">{inv.studentName}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-micro font-medium text-muted truncate max-w-[150px] inline-block">{inv.description}</span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="font-mono text-xs font-semibold text-main">{inv.amount.toLocaleString()} {CURRENCY_SYMBOL}</span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-micro font-medium text-muted">{inv.dueDate}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center">
                    <button onClick={() => toggleStatus(inv)} className={cn("inline-flex items-center gap-1.5 px-2 py-1 font-bold text-micro border transition-all rounded-lg", statusClasses[inv.status])}>
                    {statusLabel[inv.status]}
                  </button>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-1">
                  <ActionButton icon={Printer} onClick={() => setPreviewInvoice(inv)} title="معاينة وطباعة" hoverClass="hover:text-success hover:bg-success-soft" />
                  <ActionButton icon={Edit} onClick={() => handleEdit(inv)} title="تعديل" hoverClass="hover:text-info hover:bg-info-soft" />
                  <ActionButton icon={Trash2} onClick={() => setDeletingId(inv.id)} title="حذف" hoverClass="hover:text-error hover:bg-error-soft" />
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={6} className="py-16 text-center">
                <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-2">
                  <FileText size={18} />
                </div>
                <p className="text-xs font-bold text-muted">لا توجد فواتير</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </SectionCard>

    <div className="md:hidden space-y-3">
      {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
          <div key={inv.id} className="bg-card border border-border rounded-2xl">
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AvatarLetter name={inv.studentName} />
                  <div>
                    <p className="text-xs font-bold text-main">{inv.studentName}</p>
                    <p className="text-micro text-muted">{inv.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-micro font-bold text-muted uppercase mb-0.5">المبلغ</p>
                    <span className="font-mono text-sm font-black text-main">{inv.amount.toLocaleString()} {CURRENCY_SYMBOL}</span>
                  </div>
                  <div className="w-px h-6 bg-border" />
                  <div>
                    <p className="text-micro font-bold text-muted uppercase mb-0.5">الاستحقاق</p>
                    <span className="text-micro font-medium text-muted">{inv.dueDate}</span>
                  </div>
                </div>
                <button onClick={() => toggleStatus(inv)} className={cn("inline-flex items-center gap-1.5 px-2 py-1 font-bold text-micro border rounded-lg transition-all", statusClasses[inv.status])}>
                  {statusLabel[inv.status]}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-1 px-4 py-2.5 border-t border-border">
              <ActionButton icon={Printer} onClick={() => setPreviewInvoice(inv)} title="معاينة وطباعة" hoverClass="hover:text-success hover:bg-success-soft" />
              <ActionButton icon={Edit} onClick={() => handleEdit(inv)} title="تعديل" hoverClass="hover:text-info hover:bg-info-soft" />
              <ActionButton icon={Trash2} onClick={() => setDeletingId(inv.id)} title="حذف" hoverClass="hover:text-error hover:bg-error-soft" />
            </div>
          </div>
      )) : (
        <SectionCard className="py-16 text-center border-dashed border-border">
          <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-2">
            <FileText size={18} />
          </div>
          <p className="text-xs font-bold text-muted">لا توجد فواتير</p>
        </SectionCard>
      )}
    </div>
  </>
));

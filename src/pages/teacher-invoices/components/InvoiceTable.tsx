import { memo } from 'react';
import { Edit, Trash2, GraduationCap } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { SectionCard } from './InvoiceUI';
import { Badge } from '../../../shared/components/ui';

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

const statusVariant: Record<string, 'success' | 'warning' | 'error'> = {
  'مدفوعة': 'success',
  'قيد المعالجة': 'warning',
};

const AvatarLetter = ({ name }: { name: string }) => (
  <div className="w-7 h-7 rounded-xl bg-primary-soft text-primary flex items-center justify-center text-micro font-bold">
    {(name || '?')[0].toUpperCase()}
  </div>
);

const ActionButton = ({ icon: Icon, onClick, title, hoverClass }: { icon: React.ComponentType<{ size?: number }>; onClick: () => void; title: string; hoverClass: string }) => (
  <button
    onClick={onClick}
    className={cn("p-1.5 text-dim transition-all active:scale-90", hoverClass)}
    title={title}
  >
    <Icon size={13} />
  </button>
);

export const InvoiceTable = memo(({ filteredInvoices, handleEdit, handleDelete, isTeacher }: InvoiceTableProps) => (
  <>
    <SectionCard className="hidden md:block overflow-hidden">
      <table className="w-full text-start text-sm border-collapse">
        <thead>
          <tr className="bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary-hover)]">
            <th className="px-4 py-3 text-micro font-bold text-on-primary opacity-70 tracking-wider border-b border-transparent">المعلمة</th>
            <th className="px-4 py-3 text-micro font-bold text-on-primary opacity-70 tracking-wider border-b border-transparent">التخصص</th>
            <th className="px-4 py-3 text-micro font-bold text-on-primary opacity-70 tracking-wider border-b border-transparent text-center">المبلغ</th>
            <th className="px-4 py-3 text-micro font-bold text-on-primary opacity-70 tracking-wider border-b border-transparent text-center">الصافي</th>
            <th className="px-4 py-3 text-micro font-bold text-on-primary opacity-70 tracking-wider border-b border-transparent text-center">الحالة</th>
            {!isTeacher && <th className="px-4 py-3 text-micro font-bold text-on-primary opacity-70 tracking-wider border-b border-transparent text-center">الإجراءات</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
            {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-hover transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AvatarLetter name={inv.teacher} />
                      <span className="text-xs font-bold text-main">{inv.teacher}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-micro font-medium text-dim">{inv.specialization}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-muted">
                    {inv.amount.toLocaleString()} ج.م
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="success" size="sm">
                      {(inv.amount - (inv.personalExpenses || 0)).toLocaleString()} ج.م
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <Badge variant={statusVariant[inv.status] || 'error'} size="sm">
                        {inv.status}
                      </Badge>
                    </div>
                  </td>
                  {!isTeacher && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <ActionButton icon={Edit} onClick={() => handleEdit(inv)} title="تعديل" hoverClass="hover:text-success hover:bg-success-soft" />
                        <ActionButton icon={Trash2} onClick={() => handleDelete(inv.id)} title="حذف" hoverClass="hover:text-error hover:bg-error-soft" />
                      </div>
                    </td>
                  )}
                </tr>
            )) : (
              <tr>
                <td colSpan={!isTeacher ? 6 : 5} className="py-16 text-center">
                  <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-2">
                    <GraduationCap size={18} />
                  </div>
                  <p className="text-xs font-bold text-dim">لا توجد فواتير</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
    </SectionCard>

    <div className="md:hidden space-y-3">
      {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
          <div key={inv.id} className="bg-card border border-border shadow-sm rounded-2xl">
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AvatarLetter name={inv.teacher} />
                  <div>
                    <p className="text-xs font-bold text-main">{inv.teacher}</p>
                    <p className="text-micro text-dim">{inv.specialization}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-micro font-bold text-dim uppercase mb-0.5">المبلغ</p>
                    <span className="font-mono text-sm font-black text-main">{inv.amount.toLocaleString()} ج.م</span>
                  </div>
                  <div className="w-px h-6 bg-border" />
                  <div>
                    <p className="text-micro font-bold text-dim uppercase mb-0.5">الصافي</p>
                    <span className="text-xs font-bold text-success-dark">{(inv.amount - (inv.personalExpenses || 0)).toLocaleString()} ج.م</span>
                  </div>
                </div>
                <Badge variant={statusVariant[inv.status] || 'error'} size="sm">
                  {inv.status}
                </Badge>
              </div>
            </div>
            {!isTeacher && (
              <div className="flex items-center justify-end gap-1 px-4 py-2.5 border-t border-border">
                <ActionButton icon={Edit} onClick={() => handleEdit(inv)} title="تعديل" hoverClass="hover:text-success hover:bg-success-soft" />
                <ActionButton icon={Trash2} onClick={() => handleDelete(inv.id)} title="حذف" hoverClass="hover:text-error hover:bg-error-soft" />
              </div>
            )}
          </div>
      )) : (
        <SectionCard className="py-16 text-center border-dashed border-border">
          <div className="w-10 h-10 rounded-none bg-primary-soft text-primary flex items-center justify-center mx-auto mb-2">
            <GraduationCap size={18} />
          </div>
          <p className="text-xs font-bold text-dim">لا توجد فواتير</p>
        </SectionCard>
      )}
    </div>
  </>
));

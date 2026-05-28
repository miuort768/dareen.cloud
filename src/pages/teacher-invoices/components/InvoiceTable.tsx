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

const statusColors: Record<string, string> = { 'مدفوعة': '#10B981', 'قيد المعالجة': '#F59E0B' };

const statusStyle = (status: string) => {
  const color = statusColors[status] || '#F43F5E';
  return { color, dot: color };
};

const AvatarLetter = ({ name }: { name: string }) => (
  <div className="w-7 h-7 rounded-none flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: '#8B5CF612', color: '#8B5CF6' }}>
    {(name || '?')[0].toUpperCase()}
  </div>
);

const ActionButton = ({ icon: Icon, onClick, title, hoverClass }: { icon: React.ComponentType<{ size?: number }>; onClick: () => void; title: string; hoverClass: string }) => (
  <button
    onClick={onClick}
    className={cn("p-1.5 text-slate-400 transition-all active:scale-90", hoverClass)}
    title={title}
  >
    <Icon size={13} />
  </button>
);

export const InvoiceTable = ({ filteredInvoices, handleEdit, handleDelete, isTeacher }: InvoiceTableProps) => (
  <>
    {/* ── Desktop table ── */}
    <SectionCard className="hidden md:block overflow-hidden">
      <table className="w-full text-right text-sm border-collapse">
        <thead>
          <tr className="bg-[#0F172A]">
            <th className="px-4 py-3 text-[9px] font-bold text-white/70 tracking-wider border-b border-transparent">المعلمة</th>
            <th className="px-4 py-3 text-[9px] font-bold text-white/70 tracking-wider border-b border-transparent">التخصص</th>
            <th className="px-4 py-3 text-[9px] font-bold text-white/70 tracking-wider border-b border-transparent text-center">المبلغ</th>
            <th className="px-4 py-3 text-[9px] font-bold text-white/70 tracking-wider border-b border-transparent text-center">الصافي</th>
            <th className="px-4 py-3 text-[9px] font-bold text-white/70 tracking-wider border-b border-transparent text-center">الحالة</th>
            {!isTeacher && <th className="px-4 py-3 text-[9px] font-bold text-white/70 tracking-wider border-b border-transparent text-center">الإجراءات</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => {
              const sc = statusStyle(inv.status);
              return (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AvatarLetter name={inv.teacher} />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{inv.teacher}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-medium text-slate-400">{inv.specialization}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {inv.amount.toLocaleString()} ج.م
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex px-2 py-0.5 font-bold text-[10px] rounded-none" style={{ backgroundColor: '#10B98112', color: '#059669', border: '1px solid #10B98120' }}>
                      {(inv.amount - (inv.personalExpenses || 0)).toLocaleString()} ج.م
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 font-bold text-[9px] border transition-all rounded-none" style={{ backgroundColor: `${sc.color}12`, color: sc.color, borderColor: `${sc.color}30` }}>
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: sc.color }} />
                        {inv.status}
                      </span>
                    </div>
                  </td>
                  {!isTeacher && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <ActionButton icon={Edit} onClick={() => handleEdit(inv)} title="تعديل" hoverClass="hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" />
                        <ActionButton icon={Trash2} onClick={() => handleDelete(inv.id)} title="حذف" hoverClass="hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" />
                      </div>
                    </td>
                  )}
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={!isTeacher ? 6 : 5} className="py-16 text-center">
                  <div className="w-10 h-10 rounded-none flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#8B5CF612' }}>
                    <GraduationCap size={18} style={{ color: '#8B5CF6' }} />
                  </div>
                  <p className="text-xs font-bold text-slate-400">لا توجد فواتير</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
    </SectionCard>

    {/* ── Mobile cards ── */}
    <div className="md:hidden space-y-3">
      {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => {
        const sc = statusStyle(inv.status);
        return (
          <div
            key={inv.id}
            className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm rounded-none"
          >
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AvatarLetter name={inv.teacher} />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{inv.teacher}</p>
                    <p className="text-[10px] text-slate-400">{inv.specialization}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">المبلغ</p>
                    <span className="font-mono text-sm font-black text-slate-800 dark:text-white">{inv.amount.toLocaleString()} ج.م</span>
                  </div>
                  <div className="w-px h-6 bg-slate-100/50 dark:bg-slate-800" />
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">الصافي</p>
                    <span className="text-[11px] font-bold" style={{ color: '#059669' }}>{(inv.amount - (inv.personalExpenses || 0)).toLocaleString()} ج.م</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 font-bold text-[9px] border rounded-none" style={{ backgroundColor: `${sc.color}12`, color: sc.color, borderColor: `${sc.color}30` }}>
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: sc.color }} />
                  {inv.status}
                </span>
              </div>
            </div>
            {!isTeacher && (
              <div className="flex items-center justify-end gap-1 px-4 py-2.5 border-t border-slate-100/50 dark:border-slate-800">
                <ActionButton icon={Edit} onClick={() => handleEdit(inv)} title="تعديل" hoverClass="hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" />
                <ActionButton icon={Trash2} onClick={() => handleDelete(inv.id)} title="حذف" hoverClass="hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" />
              </div>
            )}
          </div>
        );
      }) : (
        <SectionCard className="py-16 text-center border-dashed border-slate-200 dark:border-slate-700">
          <div className="w-10 h-10 rounded-none flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#8B5CF612' }}>
            <GraduationCap size={18} style={{ color: '#8B5CF6' }} />
          </div>
          <p className="text-xs font-bold text-slate-400">لا توجد فواتير</p>
        </SectionCard>
      )}
    </div>
  </>
);

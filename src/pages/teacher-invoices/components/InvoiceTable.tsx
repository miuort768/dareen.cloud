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

const statusStyle = (status: string) => {
  if (status === 'مدفوعة') return { bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400', dot: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-800' };
  if (status === 'قيد المعالجة') return { bg: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400', dot: 'bg-amber-500', border: 'border-amber-200 dark:border-amber-800' };
  return { bg: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400', dot: 'bg-rose-500', border: 'border-rose-200 dark:border-rose-800' };
};

const AvatarLetter = ({ name }: { name: string }) => (
  <div className="w-7 h-7 bg-[#172554] flex items-center justify-center text-[10px] font-bold text-white">
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
          <tr className="bg-[#172554]">
            <th className="px-4 py-3 text-[9px] font-bold text-white/90 tracking-wider border-b border-[#1e3a5f]">المعلمة</th>
            <th className="px-4 py-3 text-[9px] font-bold text-white/90 tracking-wider border-b border-[#1e3a5f]">التخصص</th>
            <th className="px-4 py-3 text-[9px] font-bold text-white/90 tracking-wider border-b border-[#1e3a5f] text-center">المبلغ</th>
            <th className="px-4 py-3 text-[9px] font-bold text-white/90 tracking-wider border-b border-[#1e3a5f] text-center">الصافي</th>
            <th className="px-4 py-3 text-[9px] font-bold text-white/90 tracking-wider border-b border-[#1e3a5f] text-center">الحالة</th>
            {!isTeacher && <th className="px-4 py-3 text-[9px] font-bold text-white/90 tracking-wider border-b border-[#1e3a5f] text-center">الإجراءات</th>}
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
                    <span className="inline-flex px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-100 dark:border-emerald-800/50">
                      {(inv.amount - (inv.personalExpenses || 0)).toLocaleString()} ج.م
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 font-bold text-[9px] border transition-all", sc.bg, sc.border)}>
                        <div className={cn("w-1 h-1", sc.dot)} />
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
                  <GraduationCap className="mx-auto mb-2 text-slate-200 dark:text-slate-700" size={28} />
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
            className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/50 shadow-sm"
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
                  <div className="w-px h-6 bg-slate-100 dark:bg-slate-800" />
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">الصافي</p>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{(inv.amount - (inv.personalExpenses || 0)).toLocaleString()} ج.م</span>
                  </div>
                </div>
                <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 font-bold text-[9px] border", sc.bg, sc.border)}>
                  <div className={cn("w-1 h-1", sc.dot)} />
                  {inv.status}
                </span>
              </div>
            </div>
            {!isTeacher && (
              <div className="flex items-center justify-end gap-1 px-4 py-2.5 border-t border-slate-100 dark:border-slate-800">
                <ActionButton icon={Edit} onClick={() => handleEdit(inv)} title="تعديل" hoverClass="hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" />
                <ActionButton icon={Trash2} onClick={() => handleDelete(inv.id)} title="حذف" hoverClass="hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" />
              </div>
            )}
          </div>
        );
      }) : (
        <SectionCard className="py-16 text-center">
          <GraduationCap className="mx-auto mb-2 text-slate-200 dark:text-slate-700" size={28} />
          <p className="text-xs font-bold text-slate-400">لا توجد فواتير</p>
        </SectionCard>
      )}
    </div>
  </>
);

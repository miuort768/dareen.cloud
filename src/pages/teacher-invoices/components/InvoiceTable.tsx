import { Edit, Trash2, GraduationCap, ChevronLeft } from 'lucide-react';
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

const AvatarLetter = ({ name, className = '' }: { name: string; className?: string }) => (
  <div className={cn(
    'w-7 h-7 bg-gradient-to-br from-violet-500 to-emerald-500 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-sm shadow-violet-200 dark:shadow-violet-950',
    className
  )}>
    {(name || '?')[0].toUpperCase()}
  </div>
);

const ActionButton = ({ icon: Icon, onClick, title, hoverClass }: { icon: React.ComponentType<{ size?: number }>; onClick: () => void; title: string; hoverClass: string }) => (
  <button
    onClick={onClick}
    className={cn("p-1.5 text-slate-400 rounded-lg transition-all active:scale-90", hoverClass)}
    title={title}
  >
    <Icon size={14} />
  </button>
);

export const InvoiceTable = ({ filteredInvoices, handleEdit, handleDelete, isTeacher }: InvoiceTableProps) => (
  <>
    {/* ── Desktop table ── */}
    <SectionCard className="hidden md:block p-0 overflow-hidden">
      <div className="overflow-x-auto rounded-2xl">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
              <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">المعلمة</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">التخصص</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">المبلغ</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">الصافي</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">الحالة</th>
              {!isTeacher && <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">الإجراءات</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
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
                    <span className="inline-flex px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-md border border-emerald-100 dark:border-emerald-800/50">
                      {(inv.amount - (inv.personalExpenses || 0)).toLocaleString()} ج.م
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 font-bold text-[9px] rounded-lg border transition-all", sc.bg, sc.border)}>
                        <div className={cn("w-1 h-1 rounded-full", sc.dot)} />
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
                  <GraduationCap className="mx-auto mb-2 text-slate-200 dark:text-slate-700" size={32} />
                  <p className="text-xs font-bold text-slate-400">لا توجد فواتير</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>

    {/* ── Mobile cards ── */}
    <div className="md:hidden space-y-3">
      {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => {
        const sc = statusStyle(inv.status);
        return (
          <div
            key={inv.id}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-950/30 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AvatarLetter name={inv.teacher} />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{inv.teacher}</p>
                  <p className="text-[10px] text-slate-400">{inv.specialization}</p>
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
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">الصافي</p>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{(inv.amount - (inv.personalExpenses || 0)).toLocaleString()} ج.م</span>
                </div>
              </div>
              <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 font-bold text-[9px] rounded-lg border", sc.bg, sc.border)}>
                <div className={cn("w-1 h-1 rounded-full", sc.dot)} />
                {inv.status}
              </span>
            </div>
            {!isTeacher && (
              <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <ActionButton icon={Edit} onClick={() => handleEdit(inv)} title="تعديل" hoverClass="hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" />
                <ActionButton icon={Trash2} onClick={() => handleDelete(inv.id)} title="حذف" hoverClass="hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" />
              </div>
            )}
          </div>
        );
      }) : (
        <SectionCard className="py-16 text-center">
          <GraduationCap className="mx-auto mb-2 text-slate-200 dark:text-slate-700" size={32} />
          <p className="text-xs font-bold text-slate-400">لا توجد فواتير</p>
        </SectionCard>
      )}
    </div>
  </>
);

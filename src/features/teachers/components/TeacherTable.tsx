import { memo, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, GraduationCap, MessageCircle, Bell, Star, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import type { Teacher } from '../types';
import { cn } from '../../../lib/utils';
import { CURRENCY_SYMBOL } from '../../../config/constants';

interface TeacherTableProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (id: string) => void;
  onSelect: (teacher: Teacher) => void;
  onChat: (id: string) => void;
  onNotify: (teacher: Teacher) => void;
  selectedId?: string;
  studentCounts: Record<string, number>;
}

type SortField = 'name' | 'subject' | 'students' | 'price';
type SortDir = 'asc' | 'desc';

const subjectColorMap: Record<string, string> = {
  رياضيات: 'text-primary bg-primary/10 ring-primary/20',
  عربي: 'text-success bg-success/10 ring-success/20',
  علوم: 'text-info bg-info-soft ring-info/20',
  إنجليزي: 'text-warning bg-warning/10 ring-warning/20',
  فيزياء: 'text-accent bg-accent/10 ring-accent/20',
  كيمياء: 'text-error bg-error/10 ring-error/20',
  لغات: 'text-accent bg-accent/10 ring-accent/20',
  أدبي: 'text-warning bg-warning/10 ring-warning/20',
  دراسات: 'text-success bg-success/10 ring-success/20',
  قرآن: 'text-primary bg-primary/10 ring-primary/20',
};

const getSubjectStyle = (subject?: string) => {
  if (!subject) return 'text-muted bg-surface ring-border';
  const key = Object.keys(subjectColorMap).find(k => subject.includes(k) || k.includes(subject));
  return key ? subjectColorMap[key] : 'text-info bg-info-soft ring-info/20';
};

const Tooltip = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="relative group">
    {children}
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-main text-inverse text-[9px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-sm">
      {label}
    </div>
  </div>
);

export const TeacherTable = memo(({ teachers, onEdit, onDelete, onSelect, onChat, onNotify, selectedId, studentCounts }: TeacherTableProps) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    const list = [...teachers];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'subject': cmp = a.subject.localeCompare(b.subject); break;
        case 'students': cmp = (studentCounts[a.name] || 0) - (studentCounts[b.name] || 0); break;
        case 'price': cmp = a.price - b.price; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [teachers, sortField, sortDir, studentCounts]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={10} className="opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />;
  };

  const computeStatus = (teacher: Teacher): { label: string; dot: string; text: string } => {
    const count = studentCounts[teacher.name] || 0;
    if (count > 0) return { label: 'نشطة', dot: 'bg-success', text: 'text-success bg-success/10 ring-success/20' };
    return { label: 'متوقفة', dot: 'bg-error', text: 'text-error bg-error/10 ring-error/20' };
  };

  const computeRating = (teacher: Teacher): number => {
    const count = studentCounts[teacher.name] || 0;
    if (teacher.points) return Math.min(5, Math.round((teacher.points / 20) * 10) / 10);
    return Math.min(5, Math.round((count / 3) * 10) / 10);
  };

  const thClass = "px-5 py-3 font-bold text-[10px] tracking-wider text-muted select-none cursor-pointer hover:text-main transition-colors";
  const thInnerClass = "flex items-center gap-1";

  if (teachers.length === 0) {
    return (
      <div className="py-24 text-center">
        <GraduationCap size={48} className="mx-auto mb-4 text-muted/40" />
        <p className="text-xs text-muted">لا توجد بيانات معلمات حالياً</p>
      </div>
    );
  }

  return (
    <div className="w-full" dir="rtl">
      {/* Desktop View */}
      <div className="hidden lg:block bg-card border border-border rounded-2xl overflow-hidden shadow-elevation-1">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead className="sticky top-0 z-20">
              <tr className="bg-surface border-b border-border">
                <th className={thClass} onClick={() => toggleSort('name')}>
                  <div className={thInnerClass}><SortIcon field="name" /> المعلمة</div>
                </th>
                <th className={cn(thClass, 'text-center')} onClick={() => toggleSort('subject')}>
                  <div className={cn(thInnerClass, 'justify-center')}><SortIcon field="subject" /> التخصص</div>
                </th>
                <th className={cn(thClass, 'text-center')}>
                  <div className={cn(thInnerClass, 'justify-center')}>التقييم</div>
                </th>
                <th className={cn(thClass, 'text-center')}>
                  <div className={cn(thInnerClass, 'justify-center')}>الحالة</div>
                </th>
                <th className={cn(thClass, 'text-center')} onClick={() => toggleSort('students')}>
                  <div className={cn(thInnerClass, 'justify-center')}><SortIcon field="students" /> الطلاب</div>
                </th>
                <th className={cn(thClass, 'text-center')} onClick={() => toggleSort('price')}>
                  <div className={cn(thInnerClass, 'justify-center')}><SortIcon field="price" /> التعريفة</div>
                </th>
                <th className={cn(thClass, 'text-center')}>
                  <div className={cn(thInnerClass, 'justify-center')}>إجراءات</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {sorted.map((teacher) => {
                const isSelected = selectedId === teacher.id;
                const status = computeStatus(teacher);
                const rating = computeRating(teacher);
                const subjectStyle = getSubjectStyle(teacher.subject);
                return (
                  <tr
                    key={teacher.id}
                    onClick={() => onSelect(teacher)}
                    className={cn(
                      "transition-colors cursor-pointer",
                      isSelected ? "bg-primary-soft" : "hover:bg-hover"
                    )}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-deep flex items-center justify-center font-bold text-sm text-on-primary shrink-0 shadow-sm ring-2 ring-primary/20">
                          {(teacher.name || '?').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-main leading-tight">{teacher.name || '—'}</p>
                          <p className="text-[10px] text-muted mt-0.5">ID: {(teacher.id || '').substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ring-1", subjectStyle)}>
                        {teacher.subject}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-warning">
                        <Star size={11} />
                        {rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold ring-1", status.text)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="w-7 h-7 inline-flex items-center justify-center font-bold text-xs rounded-lg bg-info-soft text-info ring-1 ring-info/20">
                        {studentCounts[teacher.name] || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <span className="text-sm font-bold text-success">{teacher.price}</span>
                        <span className="text-[9px] text-muted">{CURRENCY_SYMBOL}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <Tooltip label="تعديل">
                          <button onClick={(e) => { e.stopPropagation(); onEdit(teacher); }} className="min-w-[34px] min-h-[34px] flex items-center justify-center bg-primary text-on-primary rounded-xl text-[10px] font-bold hover:bg-primary-hover transition-all active:scale-95 shadow-sm" aria-label="تعديل">
                            <Edit size={13} />
                          </button>
                        </Tooltip>
                        <Tooltip label="إشعار">
                          <button onClick={(e) => { e.stopPropagation(); onNotify(teacher); }} className="min-w-[34px] min-h-[34px] flex items-center justify-center text-muted hover:bg-warning-soft hover:text-warning rounded-xl transition-all" aria-label="إرسال إشعار">
                            <Bell size={13} />
                          </button>
                        </Tooltip>
                        <Tooltip label="محادثة">
                          <button onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }} className="min-w-[34px] min-h-[34px] flex items-center justify-center text-muted hover:bg-info-soft hover:text-info rounded-xl transition-all" aria-label="مراسلة">
                            <MessageCircle size={13} />
                          </button>
                        </Tooltip>
                        <Tooltip label="حذف">
                          <button onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }} className="min-w-[34px] min-h-[34px] flex items-center justify-center text-muted hover:bg-error-soft hover:text-error rounded-xl transition-all" aria-label="حذف">
                            <Trash2 size={13} />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-2">
        {sorted.map((teacher) => {
          const isSelected = selectedId === teacher.id;
          const status = computeStatus(teacher);
          const rating = computeRating(teacher);
          const subjectStyle = getSubjectStyle(teacher.subject);
          return (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onSelect(teacher)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(teacher); } }}
              className={cn(
                "bg-card border border-border rounded-2xl p-3 active:scale-[0.98] transition-all shadow-elevation-1",
                isSelected && "ring-1 ring-primary/30"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-deep flex items-center justify-center font-bold text-sm text-on-primary shrink-0 ring-2 ring-primary/20">
                    {(teacher.name || '?').charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-main leading-tight truncate">{teacher.name || '—'}</h4>
                      <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ring-1", status.text)}>
                        <span className={cn("w-1 h-1 rounded-full", status.dot)} />
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ring-1", subjectStyle)}>
                        {teacher.subject}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-warning">
                        <Star size={9} />{rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-end shrink-0 ms-2">
                  <span className="text-sm font-bold text-success">{teacher.price}</span>
                  <span className="text-[9px] text-muted block">{CURRENCY_SYMBOL} / حصة</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Tooltip label="محادثة">
                  <button onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }} className="flex-1 h-8 rounded-xl bg-primary text-on-primary text-[10px] font-bold active:scale-95 transition-transform">مراسلة</button>
                </Tooltip>
                <Tooltip label="إشعار">
                  <button onClick={(e) => { e.stopPropagation(); onNotify(teacher); }} className="min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl bg-warning-soft text-warning active:bg-hover transition-colors" aria-label="إرسال إشعار"><Bell size={13} /></button>
                </Tooltip>
                <Tooltip label="تعديل">
                  <button onClick={(e) => { e.stopPropagation(); onEdit(teacher); }} className="min-w-[34px] min-h-[34px] flex items-center justify-center bg-success/10 text-success rounded-xl active:bg-hover transition-colors" aria-label="تعديل"><Edit size={13} /></button>
                </Tooltip>
                <Tooltip label="حذف">
                  <button onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }} className="min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl bg-error-soft text-error active:bg-hover transition-colors" aria-label="حذف"><Trash2 size={13} /></button>
                </Tooltip>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});
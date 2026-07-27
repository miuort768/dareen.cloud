import { memo } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, GraduationCap, MessageCircle, Bell } from 'lucide-react';
import type { Teacher } from '../types';
import { cn } from '../../../lib/utils';

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

export const TeacherTable = memo(({ teachers, onEdit, onDelete, onSelect, onChat, onNotify, selectedId, studentCounts }: TeacherTableProps) => {
    if (teachers.length === 0) {
        return (
            <div className="py-24 text-center opacity-40">
                <GraduationCap size={48} className="mx-auto mb-4 text-muted" />
                <p className="text-xs text-muted tracking-label">لا توجد بيانات معلمات حالياً</p>
            </div>
        );
    }

    return (
        <div className="w-full" dir="rtl">
            {/* Desktop View */}
            <div className="hidden lg:block bg-card border border-border rounded-2xl overflow-x-auto">
                <div className="overflow-x-auto">
                    <table className="w-full text-start border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-border">
                                <th className="px-6 py-3 font-bold text-xs tracking-wider text-muted">المعلمة</th>
                                <th className="px-6 py-3 font-bold text-xs tracking-wider text-muted text-center">التخصص</th>
                                <th className="px-6 py-3 font-bold text-xs tracking-wider text-muted text-center">الطلاب</th>
                                <th className="px-6 py-3 font-bold text-xs tracking-wider text-muted text-center">التعريفة</th>
                                <th className="px-6 py-3 font-bold text-xs tracking-wider text-muted text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {teachers.map((teacher) => {
                                const isSelected = selectedId === teacher.id;
                                return (
                                    <tr
                                        key={teacher.id}
                                        onClick={() => onSelect(teacher)}
                                        className={cn(
                                            "hover:bg-hover transition-colors cursor-pointer",
                                            isSelected ? "bg-primary-soft" : ""
                                        )}
                                    >
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs bg-primary-soft text-primary ring-1 ring-primary/20">
                                                    {teacher.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-main leading-tight">{teacher.name}</p>
                                                    <p className="text-[10px] text-muted mt-0.5">ID: {teacher.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-center">
                                            <span className="text-xs px-2 py-0.5 rounded-lg bg-primary-soft text-primary">
                                                {teacher.subject}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-center">
                                            <span className="w-7 h-7 inline-flex items-center justify-center font-bold text-xs rounded-lg bg-info-soft text-info">
                                                {studentCounts[teacher.name] || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-center">
                                            <div className="inline-flex items-center gap-1 text-success">
                                                <span className="text-sm font-bold">{teacher.price}</span>
                                                <span className="text-xs">ج.م</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={(e) => { e.stopPropagation(); onEdit(teacher); }} className="min-w-[32px] min-h-[32px] w-8 h-8 flex items-center justify-center text-muted hover:bg-success-soft hover:text-success rounded-xl transition-all" title="تعديل" aria-label="تعديل"><Edit size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onNotify(teacher); }} className="min-w-[32px] min-h-[32px] w-8 h-8 flex items-center justify-center text-muted hover:bg-warning-soft hover:text-warning rounded-xl transition-all" title="إرسال إشعار" aria-label="إرسال إشعار"><Bell size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }} className="min-w-[32px] min-h-[32px] w-8 h-8 flex items-center justify-center text-muted hover:bg-info-soft hover:text-info rounded-xl transition-all" title="مراسلة" aria-label="مراسلة"><MessageCircle size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }} className="min-w-[32px] min-h-[32px] w-8 h-8 flex items-center justify-center text-muted hover:bg-error-soft hover:text-error rounded-xl transition-all" title="حذف" aria-label="حذف"><Trash2 size={14} /></button>
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
                {teachers.map((teacher) => {
                    const isSelected = selectedId === teacher.id;
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
                                "bg-card border border-border rounded-2xl p-3 active:scale-[0.98] transition-all",
                                isSelected && "ring-1 ring-primary/30"
                            )}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center font-bold text-sm text-primary shrink-0 ring-1 ring-primary/20">
                                        {teacher.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-xs font-bold text-main leading-tight truncate">{teacher.name}</h4>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-primary-soft text-primary rounded">{teacher.subject}</span>
                                    </div>
                                </div>
                                <div className="text-end shrink-0 ms-2">
                                    <span className="text-xs font-bold text-success">{teacher.price}</span>
                                    <span className="text-[9px] text-muted block">ج.م / حصة</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }} className="flex-1 h-8 rounded-xl bg-primary text-on-primary text-[10px] font-bold active:scale-95 transition-transform">مراسلة</button>
                                <button onClick={(e) => { e.stopPropagation(); onNotify(teacher); }} className="min-w-[32px] min-h-[32px] w-8 h-8 flex items-center justify-center rounded-xl bg-warning-soft text-warning active:bg-hover transition-colors" aria-label="إرسال إشعار"><Bell size={13} /></button>
                                <button onClick={(e) => { e.stopPropagation(); onEdit(teacher); }} className="min-w-[32px] min-h-[32px] w-8 h-8 flex items-center justify-center bg-surface border border-border text-muted rounded-xl active:bg-hover transition-colors" aria-label="تعديل"><Edit size={13} /></button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }} className="min-w-[32px] min-h-[32px] w-8 h-8 flex items-center justify-center rounded-xl bg-error-soft text-error active:bg-hover transition-colors" aria-label="حذف"><Trash2 size={13} /></button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
});

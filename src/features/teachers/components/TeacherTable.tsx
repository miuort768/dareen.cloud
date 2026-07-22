import { memo } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, GraduationCap, MessageCircle, BookOpen, Users, Bell } from 'lucide-react';
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
            <div className="hidden lg:block bg-card border border-border/50 shadow-soft rounded-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-start border-collapse">
                        <thead>
                            <tr className="bg-primary">
                                <th className="px-6 py-4 font-bold text-xs text-on-primary/80">المعلمة</th>
                                <th className="px-6 py-4 font-bold text-xs text-on-primary/80 text-center">التخصص</th>
                                <th className="px-6 py-4 font-bold text-xs text-on-primary/80 text-center">الطلاب</th>
                                <th className="px-6 py-4 font-bold text-xs text-on-primary/80 text-center">التعريفة</th>
                                <th className="px-6 py-4 font-bold text-xs text-on-primary/80 text-center">إجراءات</th>
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
                                            "hover:bg-surface transition-colors cursor-pointer",
                                            isSelected ? "bg-primary-soft" : ""
                                        )}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-card flex items-center justify-center font-bold text-sm bg-primary-soft text-primary">
                                                    {teacher.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-main leading-tight">{teacher.name}</p>
                                                    <p className="text-xs text-muted mt-0.5">ID: {teacher.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs px-2 py-0.5 rounded-card bg-primary-soft text-primary">
                                                {teacher.subject}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="w-7 h-7 inline-flex items-center justify-center font-bold text-xs rounded-card bg-info-soft text-info">
                                                {studentCounts[teacher.name] || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1 text-success">
                                                <span className="text-sm">{teacher.price}</span>
                                                <span className="text-xs">ج.م</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={(e) => { e.stopPropagation(); onEdit(teacher); }} className="w-8 h-8 flex items-center justify-center text-muted hover:bg-success/10 hover:text-success rounded-card transition-all" title="تعديل" aria-label="تعديل"><Edit size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onNotify(teacher); }} className="w-8 h-8 flex items-center justify-center text-muted hover:bg-warning/10 hover:text-warning rounded-card transition-all" title="إرسال إشعار" aria-label="إرسال إشعار"><Bell size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }} className="w-8 h-8 flex items-center justify-center text-muted hover:bg-info/10 hover:text-info rounded-card transition-all" title="مراسلة" aria-label="مراسلة"><MessageCircle size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }} className="w-8 h-8 flex items-center justify-center text-muted hover:bg-error/10 hover:text-error rounded-card transition-all" title="حذف" aria-label="حذف"><Trash2 size={14} /></button>
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
                                "bg-card border border-border/50 rounded-xl p-3 active:scale-[0.98] transition-all",
                                isSelected && "ring-1 ring-primary/30"
                            )}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <div className="w-9 h-9 rounded-lg bg-primary-soft flex items-center justify-center font-bold text-sm text-primary shrink-0">
                                        {teacher.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-xs font-bold text-main leading-tight truncate">{teacher.name}</h4>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-primary-soft text-primary rounded">{teacher.subject}</span>
                                    </div>
                                </div>
                                <div className="text-end shrink-0 ms-2">
                                    <span className="text-xs font-bold text-success">{teacher.price}</span>
                                    <span className="text-[9px] text-dim block">ج.م / حصة</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }} className="flex-1 h-8 rounded-lg bg-primary text-on-primary text-[10px] font-bold active:scale-95 transition-transform">مراسلة</button>
                                <button onClick={(e) => { e.stopPropagation(); onNotify(teacher); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-warning-soft text-warning active:bg-hover transition-colors" aria-label="إرسال إشعار"><Bell size={13} /></button>
                                <button onClick={(e) => { e.stopPropagation(); onEdit(teacher); }} className="w-8 h-8 flex items-center justify-center bg-background border border-border text-dim rounded-lg active:bg-hover transition-colors" aria-label="تعديل"><Edit size={13} /></button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-error-soft text-error active:bg-hover transition-colors" aria-label="حذف"><Trash2 size={13} /></button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
});

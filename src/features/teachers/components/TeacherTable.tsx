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
            <div className="lg:hidden space-y-3">
                {teachers.map((teacher) => {
                    const isSelected = selectedId === teacher.id;
                    return (
                        <motion.div
                            key={teacher.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => onSelect(teacher)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(teacher); } }}
                            className={cn(
                                "bg-card border border-border/50 shadow-soft rounded-card p-5 active:scale-[0.98] transition-all",
                                isSelected ? "ring-1 ring-primary/30" : ""
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-card flex items-center justify-center font-bold text-sm bg-primary-soft text-primary">
                                        {teacher.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold font-heading text-main leading-tight mb-1">{teacher.name}</h4>
                                        <span className="text-xs px-1.5 py-0.5 rounded-card bg-primary-soft text-primary">{teacher.subject}</span>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <span className="text-sm font-bold text-success block leading-none">{teacher.price}</span>
                                    <span className="text-xs text-success/60">ج.م / حصة</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="p-2 text-center flex items-center justify-center gap-2 rounded-card bg-primary-soft">
                                    <Users size={12} className="text-primary" />
                                    <span className="text-xs text-primary">{studentCounts[teacher.name] || 0} طالبة</span>
                                </div>
                                <div className="p-2 text-center flex items-center justify-center gap-2 rounded-card bg-success-soft">
                                    <BookOpen size={12} className="text-success" />
                                    <span className="text-xs text-success">نشطة</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <button onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }} className="flex-1 h-9 rounded-xl bg-primary text-on-primary text-xs shadow-soft active:scale-95 transition-all hover:bg-primary-hover">مراسلة</button>
                                <button onClick={(e) => { e.stopPropagation(); onNotify(teacher); }} className="w-9 h-9 flex items-center justify-center rounded-card shadow-soft transition-all bg-warning/10 text-warning hover:bg-warning hover:text-on-warning" aria-label="إرسال إشعار"><Bell size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation(); onEdit(teacher); }} className="w-9 h-9 flex items-center justify-center bg-card border border-border/60 text-muted hover:text-success rounded-card shadow-soft transition-all" aria-label="تعديل"><Edit size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }} className="w-9 h-9 flex items-center justify-center rounded-card shadow-soft transition-all bg-error/10 text-error hover:bg-error hover:text-on-error" aria-label="حذف"><Trash2 size={14} /></button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
});

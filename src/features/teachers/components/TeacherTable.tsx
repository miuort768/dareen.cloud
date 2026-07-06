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
                <GraduationCap size={48} className="mx-auto mb-4 text-dim" />
                <p className="text-micro font-normal text-dim uppercase tracking-[4px]">لا توجد بيانات معلمات حالياً</p>
            </div>
        );
    }

    return (
        <div className="w-full" dir="rtl">
            {/* Desktop View */}
            <div className="hidden lg:block bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-primary">
                                <th className="px-6 py-4 font-bold text-micro uppercase tracking-[0.2em] text-on-primary opacity-80">المعلمة</th>
                                <th className="px-6 py-4 font-bold text-micro uppercase tracking-[0.2em] text-on-primary opacity-80 text-center">التخصص</th>
                                <th className="px-6 py-4 font-bold text-micro uppercase tracking-[0.2em] text-on-primary opacity-80 text-center">الطلاب</th>
                                <th className="px-6 py-4 font-bold text-micro uppercase tracking-[0.2em] text-on-primary opacity-80 text-center">التعريفة</th>
                                <th className="px-6 py-4 font-bold text-micro uppercase tracking-[0.2em] text-on-primary opacity-80 text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
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
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm bg-primary-soft text-primary">
                                                    {teacher.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-xs text-main leading-tight">{teacher.name}</p>
                                                    <p className="text-micro font-bold text-dim mt-0.5">ID: {teacher.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-micro font-bold px-2 py-0.5 rounded-xl bg-primary-soft text-primary">
                                                {teacher.subject}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="w-7 h-7 inline-flex items-center justify-center font-bold text-xs rounded-xl bg-info-soft text-info">
                                                {studentCounts[teacher.name] || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1 text-success font-normal">
                                                <span className="text-xs">{teacher.price}</span>
                                                <span className="text-micro uppercase">ج.م</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); onEdit(teacher); }} className="w-8 h-8 flex items-center justify-center text-dim hover:bg-hover hover:text-success rounded-xl transition-all" title="تعديل"><Edit size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onNotify(teacher); }} className="w-8 h-8 flex items-center justify-center text-dim hover:bg-warning-soft hover:text-warning rounded-xl transition-all" title="إشعار"><Bell size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }} className="w-8 h-8 flex items-center justify-center text-dim hover:bg-hover hover:text-info rounded-xl transition-all" title="مراسلة"><MessageCircle size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }} className="w-8 h-8 flex items-center justify-center text-dim hover:bg-error-soft hover:text-error rounded-xl transition-all" title="حذف"><Trash2 size={14} /></button>
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
            <div className="lg:hidden space-y-4">
                {teachers.map((teacher) => {
                    const isSelected = selectedId === teacher.id;
                    return (
                        <motion.div
                            key={teacher.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => onSelect(teacher)}
                            className={cn(
                                "bg-card border border-border p-5 shadow-sm rounded-2xl active:scale-[0.98] transition-all relative",
                                isSelected ? "ring-1 ring-primary/30 shadow-md" : ""
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm bg-primary-soft text-primary">
                                        {teacher.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-main leading-tight mb-1">{teacher.name}</h4>
                                        <span className="text-micro font-bold px-1.5 py-0.5 uppercase rounded-xl bg-primary-soft text-primary">{teacher.subject}</span>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <span className="text-xs font-bold text-success block leading-none">{teacher.price}</span>
                                    <span className="text-micro font-bold text-success opacity-60 uppercase">ج.م / حصة</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="p-2 text-center flex items-center justify-center gap-2 rounded-xl bg-primary-soft">
                                    <Users size={12} className="text-primary" />
                                    <span className="text-xs font-bold text-primary">{studentCounts[teacher.name] || 0} طالبة</span>
                                </div>
                                <div className="p-2 text-center flex items-center justify-center gap-2 rounded-xl bg-success-soft">
                                    <BookOpen size={12} className="text-success" />
                                    <span className="text-xs font-bold text-success">نشطة</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <button onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }} className="flex-1 h-9 rounded-xl bg-primary text-on-primary font-bold text-micro shadow-sm active:scale-95 transition-all hover:shadow-lg hover:shadow-primary/25">مراسلة</button>
                                <button onClick={(e) => { e.stopPropagation(); onNotify(teacher); }} className="w-9 h-9 flex items-center justify-center rounded-xl shadow-sm transition-all bg-warning-soft text-warning hover:bg-warning hover:text-on-warning"><Bell size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation(); onEdit(teacher); }} className="w-9 h-9 flex items-center justify-center bg-card border border-border text-dim hover:text-success rounded-xl shadow-sm transition-all"><Edit size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }} className="w-9 h-9 flex items-center justify-center rounded-xl shadow-sm transition-all bg-error-soft text-error hover:bg-error hover:text-on-error"><Trash2 size={14} /></button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
});

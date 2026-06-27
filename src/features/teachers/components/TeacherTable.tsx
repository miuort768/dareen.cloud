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
                <GraduationCap size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                <p className="text-[10px] font-normal text-slate-400 uppercase tracking-[4px]">لا توجد بيانات معلمات حالياً</p>
            </div>
        );
    }

    return (
        <div className="w-full" dir="rtl">
            {/* Desktop View */}
            <div className="hidden lg:block bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-br from-[#6C4BFF] to-[#8B5CF6]">
                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-[0.2em] text-white/80">المعلمة</th>
                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-[0.2em] text-white/80 text-center">التخصص</th>
                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-[0.2em] text-white/80 text-center">الطلاب</th>
                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-[0.2em] text-white/80 text-center">التعريفة</th>
                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-[0.2em] text-white/80 text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                            {teachers.map((teacher) => {
                                const isSelected = selectedId === teacher.id;
                                return (
                                    <tr
                                        key={teacher.id}
                                        onClick={() => onSelect(teacher)}
                                        className={cn(
                                            "hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer",
                                            isSelected ? "bg-purple-50/50 dark:bg-purple-900/20" : ""
                                        )}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm bg-[#6C4BFF]/10 text-[#6C4BFF]">
                                                    {teacher.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-xs text-slate-800 dark:text-white leading-tight">{teacher.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">ID: {teacher.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-xl bg-[#6C4BFF]/10 text-[#6C4BFF]">
                                                {teacher.subject}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="w-7 h-7 inline-flex items-center justify-center font-bold text-[11px] rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                                                {studentCounts[teacher.name] || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1 text-emerald-500 font-normal">
                                                <span className="text-xs">{teacher.price}</span>
                                                <span className="text-[8px] uppercase">ج.م</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); onEdit(teacher); }} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-emerald-500 rounded-xl transition-all" title="تعديل"><Edit size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onNotify(teacher); }} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-500 rounded-xl transition-all" title="إشعار"><Bell size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-500 rounded-xl transition-all" title="مراسلة"><MessageCircle size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-500 rounded-xl transition-all" title="حذف"><Trash2 size={14} /></button>
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
                                "bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 shadow-sm rounded-2xl active:scale-[0.98] transition-all relative",
                                isSelected ? "ring-1 ring-[#6C4BFF]/30 shadow-md" : ""
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm bg-[#6C4BFF]/10 text-[#6C4BFF]">
                                        {teacher.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight mb-1">{teacher.name}</h4>
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 uppercase rounded-xl bg-[#6C4BFF]/10 text-[#6C4BFF]">{teacher.subject}</span>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <span className="text-xs font-bold text-emerald-500 block leading-none">{teacher.price}</span>
                                    <span className="text-[8px] font-bold text-emerald-400/60 uppercase">ج.م / حصة</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="p-2 text-center flex items-center justify-center gap-2 rounded-xl bg-[#6C4BFF]/10">
                                    <Users size={12} className="text-[#6C4BFF]" />
                                    <span className="text-xs font-bold text-[#6C4BFF]">{studentCounts[teacher.name] || 0} طالبة</span>
                                </div>
                                <div className="p-2 text-center flex items-center justify-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                                    <BookOpen size={12} className="text-emerald-500" />
                                    <span className="text-xs font-bold text-emerald-500">نشطة</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <button onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }} className="flex-1 h-9 rounded-xl bg-gradient-to-l from-[#6C4BFF] to-[#8B5CF6] text-white font-bold text-[10px] shadow-sm active:scale-95 transition-all hover:shadow-lg hover:shadow-purple-500/25">مراسلة</button>
                                <button onClick={(e) => { e.stopPropagation(); onNotify(teacher); }} className="w-9 h-9 flex items-center justify-center rounded-xl shadow-sm transition-all bg-amber-50 dark:bg-amber-900/20 text-amber-500 hover:bg-amber-500 hover:text-white"><Bell size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation(); onEdit(teacher); }} className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-slate-400 hover:text-emerald-500 rounded-xl shadow-sm transition-all"><Edit size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }} className="w-9 h-9 flex items-center justify-center rounded-xl shadow-sm transition-all bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-500 hover:text-white"><Trash2 size={14} /></button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
});


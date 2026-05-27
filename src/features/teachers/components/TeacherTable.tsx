import { Edit, Trash2, GraduationCap, MessageCircle, BookOpen, Users } from 'lucide-react';
import type { Teacher } from '../types';
import { cn } from '../../../lib/utils';

interface TeacherTableProps {
    teachers: Teacher[];
    onEdit: (teacher: Teacher) => void;
    onDelete: (id: string) => void;
    onSelect: (teacher: Teacher) => void;
    onChat: (id: string) => void;
    selectedId?: string;
    studentCounts: Record<string, number>;
}

export const TeacherTable = ({ teachers, onEdit, onDelete, onSelect, onChat, selectedId, studentCounts }: TeacherTableProps) => {
    if (teachers.length === 0) {
        return (
            <div className="py-24 text-center opacity-40">
                <GraduationCap size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-[10px] font-normal text-slate-400 uppercase tracking-[4px]">لا توجد بيانات معلمات حالياً</p>
            </div>
        );
    }

    return (
        <div className="w-full" dir="rtl">
            {/* Desktop View */}
            <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-[var(--primary-color,#2563EB)] text-white">
                            <tr>
                                <th className="px-6 py-4 font-medium text-[10px] uppercase tracking-[0.2em]">المعلمة</th>
                                <th className="px-6 py-4 font-medium text-[10px] uppercase tracking-[0.2em] text-center">التخصص</th>
                                <th className="px-6 py-4 font-medium text-[10px] uppercase tracking-[0.2em] text-center">الطلاب</th>
                                <th className="px-6 py-4 font-medium text-[10px] uppercase tracking-[0.2em] text-center">التعريفة</th>
                                <th className="px-6 py-4 font-medium text-[10px] uppercase tracking-[0.2em] text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {teachers.map((teacher) => {
                                const isSelected = selectedId === teacher.id;
                                return (
                                    <tr
                                        key={teacher.id}
                                        onClick={() => onSelect(teacher)}
                                        className={cn(
                                            "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer",
                                            isSelected ? "bg-blue-50/50 dark:bg-blue-900/20" : ""
                                        )}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm" style={{ backgroundColor: '#8B5CF612', color: '#8B5CF6' }}>
                                                    {teacher.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-normal text-xs text-slate-800 dark:text-white leading-tight">{teacher.name}</p>
                                                    <p className="text-[9px] font-normal text-slate-400 mt-0.5">ID: {teacher.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-[10px] font-normal text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                {teacher.subject}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="w-7 h-7 inline-flex items-center justify-center bg-blue-50 text-[#2563EB] font-normal text-[11px] rounded-lg">
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
                                                <button onClick={(e) => { e.stopPropagation(); onEdit(teacher); }} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-emerald-500 rounded-lg transition-all" title="تعديل"><Edit size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-blue-500 rounded-lg transition-all" title="مراسلة"><MessageCircle size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-all" title="حذف"><Trash2 size={14} /></button>
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
                        <div 
                            key={teacher.id} 
                            onClick={() => onSelect(teacher)} 
                            className={cn(
                                "bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 p-5 rounded-2xl shadow-sm active:scale-[0.98] transition-all relative",
                                isSelected ? "ring-1 ring-[#8B5CF6]/20 shadow-sm" : ""
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm" style={{ backgroundColor: '#8B5CF612', color: '#8B5CF6' }}>
                                        {teacher.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-normal text-slate-800 dark:text-white leading-tight mb-1">{teacher.name}</h4>
                                        <span className="text-[9px] font-normal text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded uppercase">{teacher.subject}</span>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <span className="text-xs font-medium text-emerald-500 block leading-none">{teacher.price}</span>
                                    <span className="text-[8px] font-normal text-emerald-400/60 uppercase">ج.م / حصة</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-[#8B5CF608] border border-[#8B5CF6]15 p-2 rounded-xl text-center flex items-center justify-center gap-2">
                                    <Users size={12} style={{ color: '#8B5CF6' }} />
                                    <span className="text-xs font-bold text-[#0F172A] dark:text-white">{studentCounts[teacher.name] || 0} طالبة</span>
                                </div>
                                <div className="bg-[#22C55E08] border border-[#22C55E]15 p-2 rounded-xl text-center flex items-center justify-center gap-2">
                                    <BookOpen size={12} style={{ color: '#22C55E' }} />
                                    <span className="text-xs font-bold text-[#22C55E]">نشطة</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <button onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }} className="flex-1 h-9 rounded-xl bg-[#8B5CF6] text-white font-bold text-[10px] shadow-sm active:scale-95 transition-all">مراسلة</button>
                                <button onClick={(e) => { e.stopPropagation(); onEdit(teacher); }} className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-emerald-500 rounded-xl shadow-sm transition-all"><Edit size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }} className="w-9 h-9 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl shadow-sm transition-all hover:bg-rose-500 hover:text-white"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


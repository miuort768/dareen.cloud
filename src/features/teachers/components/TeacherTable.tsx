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
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 text-slate-300 flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                    <GraduationCap size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">لا توجد بيانات</h3>
                <p className="text-xs font-bold text-slate-400 italic">لم يتم العثور على أية معلمات حالياً</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24" dir="rtl">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">المعلمة</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">التخصص الرئيسي</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">قاعدة الطلاب</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">التعريفة</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">التحكم</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {teachers.map(teacher => {
                            const isSelected = selectedId === teacher.id;
                            return (
                                <tr
                                    key={teacher.id}
                                    onClick={() => onSelect(teacher)}
                                    className={cn(
                                        "cursor-pointer transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/30 group",
                                        isSelected ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-r-4 border-r-[#5c59f2]" : "border-r-4 border-r-transparent"
                                    )}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#5c59f2] text-white flex items-center justify-center font-black text-sm shadow-inner group-hover:rotate-2 transition-transform">
                                                {teacher.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 dark:text-white text-sm leading-none mb-1 group-hover:text-[#5c59f2] transition-colors">{teacher.name}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">ID: {teacher.id.substring(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-tighter border border-slate-100 dark:border-slate-700">
                                            {teacher.subject}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-black text-slate-700 dark:text-slate-200">{studentCounts[teacher.name] || 0}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">طالبة</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-baseline gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 border border-emerald-100 dark:border-emerald-900/50">
                                            <span className="text-sm font-black text-emerald-600">{teacher.price}</span>
                                            <span className="text-[9px] font-bold text-emerald-400 uppercase">ج.م</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEdit(teacher); }}
                                                className="w-8 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-[#5c59f2] hover:border-[#5c59f2] transition-all"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }}
                                                className="w-8 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-all"
                                            >
                                                <MessageCircle size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }}
                                                className="w-8 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-500 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile View: High Density Cards */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
                {teachers.map(teacher => {
                    const isSelected = selectedId === teacher.id;
                    return (
                        <div
                            key={teacher.id}
                            onClick={() => onSelect(teacher)}
                            className={cn(
                                "bg-white dark:bg-slate-900 border p-4 shadow-sm relative transition-all active:scale-[0.98]",
                                isSelected ? "border-[#5c59f2] ring-1 ring-[#5c59f2]" : "border-slate-100 dark:border-slate-800"
                            )}
                        >
                            <div className="absolute top-0 right-0 w-1.5 h-full bg-[#5c59f2]"></div>
                            
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-black text-lg shadow-sm">
                                        {teacher.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 dark:text-white text-[13px] leading-tight mb-0.5">{teacher.name}</h3>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-black text-[#5c59f2] uppercase tracking-tighter">{teacher.subject}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                    <span className="text-sm font-black text-emerald-600 block leading-none">{teacher.price}</span>
                                    <span className="text-[8px] font-black text-emerald-400 block uppercase tracking-tighter">ج.م / حصة</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-2 border border-slate-100 dark:border-slate-700 flex flex-col items-center">
                                    <Users size={14} className="text-slate-400 mb-1" />
                                    <span className="text-xs font-black text-slate-800 dark:text-white">{studentCounts[teacher.name] || 0}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase italic">طالبة</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-2 border border-slate-100 dark:border-slate-700 flex flex-col items-center">
                                    <BookOpen size={14} className="text-[#5c59f2] mb-1 opacity-50" />
                                    <span className="text-[10px] font-black text-[#5c59f2] uppercase leading-none">نشطة</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }}
                                    className="flex-1 bg-slate-900 dark:bg-slate-800 text-white py-2 font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-[#5c59f2] transition-colors"
                                >
                                    مراسلة
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(teacher); }}
                                    className="p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-blue-500 shadow-sm"
                                >
                                    <Edit size={14} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }}
                                    className="p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-rose-500 shadow-sm"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

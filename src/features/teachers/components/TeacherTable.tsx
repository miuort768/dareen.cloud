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
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <GraduationCap size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">لا توجد نتائج</h3>
                <p className="text-sm text-gray-500 mt-1">لم يتم العثور على معلمات بهذا الاسم أو التخصص</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <table className="w-full text-right">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">المعلمة</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">التخصص</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">الطلاب</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">سعر الحصة</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {teachers.map(teacher => {
                            const isSelected = selectedId === teacher.id;
                            return (
                                <tr
                                    key={teacher.id}
                                    onClick={() => onSelect(teacher)}
                                    className={cn(
                                        "group cursor-pointer transition-all hover:bg-primary-50/30 dark:hover:bg-primary-900/5",
                                        isSelected && "bg-primary-50 dark:bg-primary-900/10"
                                    )}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/40 flex items-center justify-center text-primary-600 font-black border border-primary-200/20 shadow-sm transition-transform group-hover:scale-110">
                                                {teacher.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{teacher.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{teacher.id.substring(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-bold border border-gray-100 dark:border-gray-700">
                                            {teacher.subject}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="font-black text-gray-900 dark:text-white">{studentCounts[teacher.name] || 0}</span>
                                            <span className="text-[9px] text-gray-400 font-bold uppercase">طالب</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{teacher.price}</span>
                                        <span className="text-[10px] text-gray-400 font-bold mr-1 uppercase">ج.م</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEdit(teacher); }}
                                                className="w-9 h-9 flex items-center justify-center text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                                title="تعديل"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }}
                                                className="w-9 h-9 flex items-center justify-center text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                                                title="مراسلة"
                                            >
                                                <MessageCircle size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }}
                                                className="w-9 h-9 flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                                                title="حذف"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
                {teachers.map(teacher => {
                    const isSelected = selectedId === teacher.id;
                    return (
                        <div
                            key={teacher.id}
                            onClick={() => onSelect(teacher)}
                            className={cn(
                                "bg-white dark:bg-gray-900 rounded-2xl border p-5 shadow-sm transition-all active:scale-[0.98]",
                                isSelected
                                    ? "border-primary-500 ring-4 ring-primary-500/10 shadow-lg"
                                    : "border-gray-100 dark:border-gray-800"
                            )}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-primary-600/20">
                                        {teacher.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-gray-900 dark:text-white text-base leading-tight">{teacher.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                                            <BookOpen size={12} />
                                            <span className="text-xs font-bold">{teacher.subject}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none block">{teacher.price}</span>
                                    <span className="text-[10px] text-emerald-400 font-black uppercase">ج.م / حصة</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 flex flex-col items-center">
                                    <Users size={16} className="text-gray-400 mb-1" />
                                    <span className="text-sm font-black text-gray-900 dark:text-white">{studentCounts[teacher.name] || 0}</span>
                                    <span className="text-[10px] text-gray-400 font-bold">طالب نشط</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 flex flex-col items-center">
                                    <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)] mb-1" />
                                    <span className="text-sm font-black text-emerald-500">نشطة</span>
                                    <span className="text-[10px] text-gray-400 font-bold">حالة الحساب</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-gray-50 dark:border-gray-800">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }}
                                    className="flex-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all active:bg-primary-100"
                                >
                                    <MessageCircle size={16} />
                                    دردشة
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(teacher); }}
                                    className="w-12 h-12 flex items-center justify-center border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }}
                                    className="w-12 h-12 flex items-center justify-center border border-rose-50 dark:border-rose-900/10 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

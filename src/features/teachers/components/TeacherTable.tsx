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
            <div className="bg-white border-4 border-gray-950 p-16 text-center shadow-[10px_10px_0px_0px_black] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="w-20 h-20 bg-gray-950 text-white border-4 border-gray-950 flex items-center justify-center mx-auto mb-6 transform rotate-12 shadow-[4px_4px_0px_0px_#444]">
                    <GraduationCap size={40} />
                </div>
                <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tighter mb-2">قاعدة البيانات فارغة</h3>
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest italic">لم يتم العثور على أية معلمات بهذا الاسم حالياً</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white border-4 border-gray-950 shadow-[8px_8px_0px_0px_black] overflow-hidden">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-gray-950 text-white">
                            <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] border-l border-white/10 italic">المعلمة</th>
                            <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] border-l border-white/10 italic text-center">التخصص</th>
                            <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] border-l border-white/10 italic text-center">الطلاب</th>
                            <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] border-l border-white/10 italic text-center">التعريفة</th>
                            <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] italic text-center">الإجراءات والتحكم</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-4 divide-gray-100">
                        {teachers.map(teacher => {
                            const isSelected = selectedId === teacher.id;
                            return (
                                <tr
                                    key={teacher.id}
                                    onClick={() => onSelect(teacher)}
                                    className={cn(
                                        "cursor-pointer transition-all hover:bg-indigo-50/50",
                                        isSelected && "bg-amber-400/20"
                                    )}
                                >
                                    <td className="px-6 py-5 border-l-2 border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-950 text-white flex items-center justify-center font-black text-xl border-2 border-gray-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] transform -rotate-1">
                                                {teacher.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-950 text-base uppercase leading-none mb-1">{teacher.name}</p>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50 px-2 py-0.5 border border-gray-100 w-fit">ID: {teacher.id.substring(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 border-l-2 border-gray-100 text-center">
                                        <span className="px-3 py-1 bg-white border-2 border-gray-950 text-gray-950 text-[10px] font-black uppercase tracking-[0.1em] shadow-[2px_2px_0px_0px_black]">
                                            {teacher.subject}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 border-l-2 border-gray-100 text-center font-black">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl text-gray-950 leading-none">{studentCounts[teacher.name] || 0}</span>
                                            <span className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">طالب نشط</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 border-l-2 border-gray-100 text-center">
                                        <span className="text-xl font-black text-emerald-600 bg-emerald-50 px-3 py-1 border-2 border-emerald-600 shadow-[2px_2px_0px_0px_black]">{teacher.price} <span className="text-[10px] text-gray-400 uppercase ml-1">ج.م</span></span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEdit(teacher); }}
                                                className="w-10 h-10 bg-white border-2 border-gray-950 flex items-center justify-center text-blue-600 shadow-[2px_2px_0px_0px_black] hover:bg-gray-950 hover:text-white transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                                            >
                                                <Edit size={20} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }}
                                                className="w-10 h-10 bg-white border-2 border-gray-950 flex items-center justify-center text-emerald-600 shadow-[2px_2px_0px_0px_black] hover:bg-gray-950 hover:text-white transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                                            >
                                                <MessageCircle size={20} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }}
                                                className="w-10 h-10 bg-white border-2 border-gray-950 flex items-center justify-center text-rose-500 shadow-[2px_2px_0px_0px_black] hover:bg-gray-950 hover:text-white transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile/Tablet Card Grid */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-8 pb-12">
                {teachers.map(teacher => {
                    const isSelected = selectedId === teacher.id;
                    return (
                        <div
                            key={teacher.id}
                            onClick={() => onSelect(teacher)}
                            className={cn(
                                "bg-white border-4 border-gray-950 p-6 shadow-[8px_8px_0px_0px_black] relative transition-transform active:scale-95",
                                isSelected ? "bg-amber-400/10 border-amber-500" : ""
                            )}
                        >
                            <div className="absolute top-0 right-0 w-3 h-full bg-indigo-600"></div>
                            
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-950 text-white flex items-center justify-center font-black text-2xl border-2 border-gray-950 shadow-[4px_4px_0px_0px_black] transform rotate-1">
                                        {teacher.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-950 text-xl tracking-tighter leading-none mb-1">{teacher.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <BookOpen size={12} className="text-indigo-600" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">{teacher.subject}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <div className="bg-emerald-50 border-2 border-emerald-600 px-3 py-2 shadow-[2px_2px_0px_0px_black]">
                                        <span className="text-xl font-black text-emerald-600 leading-none block">{teacher.price}</span>
                                        <span className="text-[8px] font-black uppercase text-gray-400 mt-0.5 block italic">ج.م / حصة</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 border-2 border-gray-950 p-4 flex flex-col items-center shadow-[4px_4px_0px_0px_black]">
                                    <Users size={20} className="text-gray-950 mb-1" />
                                    <span className="text-lg font-black text-gray-950">{studentCounts[teacher.name] || 0}</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase italic">طالب مسجل</span>
                                </div>
                                <div className="bg-gray-50 border-2 border-gray-950 p-4 flex flex-col items-center shadow-[4px_4px_0px_0px_black]">
                                    <div className="w-5 h-5 bg-emerald-500 border-2 border-gray-950 shadow-[0_0_10px_rgba(16,185,129,0.3)] mb-1" />
                                    <span className="text-xs font-black text-emerald-500 uppercase">نشطة</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase italic">الحالة</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-4">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }}
                                    className="flex-1 bg-primary-600 text-white border-2 border-gray-950 py-4 font-black text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_black] active:shadow-none"
                                >
                                    مراسلة
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(teacher); }}
                                    className="w-14 h-14 bg-white border-2 border-gray-950 text-blue-600 flex items-center justify-center shadow-[3px_3px_0px_0px_black] active:shadow-none"
                                >
                                    <Edit size={22} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }}
                                    className="w-14 h-14 bg-white border-2 border-gray-950 text-rose-500 flex items-center justify-center shadow-[3px_3px_0px_0px_black] active:shadow-none"
                                >
                                    <Trash2 size={22} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

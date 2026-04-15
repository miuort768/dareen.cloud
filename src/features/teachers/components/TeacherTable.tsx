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
                            <th className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border-l border-white/10 italic">المعلمة</th>
                            <th className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border-l border-white/10 italic text-center">التخصص</th>
                            <th className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border-l border-white/10 italic text-center">الطلاب</th>
                            <th className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border-l border-white/10 italic text-center">التعريفة</th>
                            <th className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] italic text-center">الإجراءات والتحكم</th>
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
                                    <td className="px-4 py-2 border-l-2 border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-950 text-white flex items-center justify-center font-black text-xs border-2 border-gray-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] transform -rotate-1">
                                                {teacher.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-950 text-sm uppercase leading-none mb-0.5">{teacher.name}</p>
                                                <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest bg-gray-50 px-1 py-0.2 border border-gray-100 w-fit">ID: {teacher.id.substring(0, 6)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 border-l-2 border-gray-100 text-center">
                                        <span className="px-2 py-0.5 bg-white border border-gray-950 text-gray-950 text-[9px] font-black uppercase tracking-[0.1em] shadow-[1px_1px_0px_0px_black]">
                                            {teacher.subject}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 border-l-2 border-gray-100 text-center font-black">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm text-gray-950 leading-none">{studentCounts[teacher.name] || 0}</span>
                                            <span className="text-[8px] text-gray-400 uppercase tracking-widest mt-0.5">طالب</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 border-l-2 border-gray-100 text-center">
                                        <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 border-2 border-emerald-600 shadow-[1px_1px_0px_0px_black]">{teacher.price} <span className="text-[8px] text-gray-400 uppercase">ج.م</span></span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEdit(teacher); }}
                                                className="w-8 h-8 bg-white border-2 border-gray-950 flex items-center justify-center text-blue-600 shadow-[1px_1px_0px_0px_black] hover:bg-gray-950 hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }}
                                                className="w-8 h-8 bg-white border-2 border-gray-950 flex items-center justify-center text-emerald-600 shadow-[1px_1px_0px_0px_black] hover:bg-gray-950 hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                            >
                                                <MessageCircle size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }}
                                                className="w-8 h-8 bg-white border-2 border-gray-950 flex items-center justify-center text-rose-500 shadow-[1px_1px_0px_0px_black] hover:bg-gray-950 hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
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

            {/* Mobile/Tablet Card Grid */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-8 pb-12">
                {teachers.map(teacher => {
                    const isSelected = selectedId === teacher.id;
                    return (
                        <div
                            key={teacher.id}
                            onClick={() => onSelect(teacher)}
                            className={cn(
                                "bg-white border-2 border-gray-950 p-4 shadow-[4px_4px_0px_0px_black] relative transition-transform active:scale-95",
                                isSelected ? "bg-amber-400/10 border-amber-500" : ""
                            )}
                        >
                            <div className="absolute top-0 right-0 w-2 h-full bg-indigo-600"></div>
                            
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-950 text-white flex items-center justify-center font-black text-xl border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] transform rotate-1">
                                        {teacher.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-950 text-sm tracking-tighter leading-none mb-1">{teacher.name}</h3>
                                        <div className="flex items-center gap-1.5">
                                            <BookOpen size={10} className="text-indigo-600" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 italic">{teacher.subject}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <div className="bg-emerald-50 border-2 border-emerald-600 px-2 py-1 shadow-[1px_1px_0px_0px_black]">
                                        <span className="text-sm font-black text-emerald-600 leading-none block">{teacher.price}</span>
                                        <span className="text-[7px] font-black uppercase text-gray-400 block italic">ج.م / حصة</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-gray-50 border-2 border-gray-950 p-2 flex flex-col items-center shadow-[2px_2px_0px_0px_black]">
                                    <Users size={16} className="text-gray-950 mb-1" />
                                    <span className="text-sm font-black text-gray-950">{studentCounts[teacher.name] || 0}</span>
                                    <span className="text-[9px] font-black text-gray-400 uppercase italic">طالب</span>
                                </div>
                                <div className="bg-gray-50 border-2 border-gray-950 p-2 flex flex-col items-center shadow-[2px_2px_0px_0px_black]">
                                    <div className="w-4 h-4 bg-emerald-500 border-2 border-gray-950 shadow-[0_0_10px_rgba(16,185,129,0.3)] mb-0.5" />
                                    <span className="text-[10px] font-black text-emerald-500 uppercase leading-none">نشطة</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onChat(teacher.id); }}
                                    className="flex-1 bg-primary-600 text-white border-2 border-gray-950 py-2.5 font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_black] active:shadow-none"
                                >
                                    مراسلة
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(teacher); }}
                                    className="w-10 h-10 bg-white border-2 border-gray-950 text-blue-600 flex items-center justify-center shadow-[2px_2px_0px_0px_black] active:shadow-none"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }}
                                    className="w-10 h-10 bg-white border-2 border-gray-950 text-rose-500 flex items-center justify-center shadow-[2px_2px_0px_0px_black] active:shadow-none"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

import { Eye, Edit, Trash, GraduationCap, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Student } from '../types';

interface StudentTableProps {
    students: Student[];
    selectedId?: string;
    onSelect: (student: Student) => void;
    onEdit: (student: Student) => void;
    onDelete: (id: string) => void;
    showDetails: boolean;
    isTeacherView: boolean;
}

export const StudentTable = ({ students, selectedId, onSelect, onEdit, onDelete, showDetails, isTeacherView }: StudentTableProps) => {
    return (
        <div className="bg-transparent">
            {/* Desktop View */}
            <div className="hidden md:block bg-white border-4 border-gray-950 dark:bg-gray-900 dark:border-gray-800 shadow-[8px_8px_0px_0px_black] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-950 text-white">
                                <th className={cn("px-6 py-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10", showDetails && "px-2 py-3 text-[10px]")}>اسم الطالب</th>
                                <th className={cn("px-6 py-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10", showDetails && "px-2 py-3 text-[10px]")}>الصف الدراسي</th>
                                <th className={cn("px-6 py-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10", showDetails && "px-2 py-3 text-[10px]")}>رقم التواصل</th>
                                <th className={cn("px-6 py-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10", showDetails && "px-2 py-3 text-[10px]")}>الاشتراكات</th>
                                <th className={cn("px-6 py-4 text-center font-black text-xs uppercase tracking-widest", showDetails && "px-2 py-3 text-[10px]")}>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-gray-950">
                            {students.map((student) => {
                                const hasLowBalance = student.enrollments?.some(en => (en.sessionsTotal - en.sessionsUsed) <= 2);
                                const isSelected = selectedId === student.id;

                                return (
                                    <tr
                                        key={student.id}
                                        className={cn(
                                            "cursor-pointer transition-all hover:bg-primary-50/50",
                                            isSelected ? 'bg-amber-400/20' : '',
                                            hasLowBalance ? 'bg-rose-50' : ''
                                        )}
                                        onClick={() => onSelect(student)}
                                    >
                                        <td className={cn("px-6 py-4 text-center border-l-2 border-gray-100", showDetails && "px-2 py-2")}>
                                            <div className="flex flex-col items-center">
                                                <span className={cn("font-black text-gray-950 dark:text-white uppercase tracking-tight", showDetails ? "text-xs" : "text-sm")}>{student.name}</span>
                                                {hasLowBalance && (
                                                    <div className="flex items-center gap-1 mt-1 bg-rose-600 px-2 py-0.5 shadow-[2px_2px_0px_0px_black]">
                                                        <AlertCircle size={8} className="text-white" />
                                                        <span className="text-[8px] font-black text-white uppercase italic">رصيد منخفض</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className={cn("px-6 py-4 text-center border-l-2 border-gray-100", showDetails && "px-2 py-2")}>
                                            <span className={cn("inline-block bg-primary-50 text-primary-700 font-black border-2 border-primary-600 px-3 py-1 text-[10px] uppercase shadow-[2px_2px_0px_0px_black]", showDetails && "px-1.5 py-0.5 text-[8px]")}>
                                                {student.grade}
                                            </span>
                                        </td>
                                        <td className={cn("px-6 py-4 text-center border-l-2 border-gray-100 font-mono font-black text-gray-500", showDetails ? "px-1 py-1 text-[10px]" : "text-xs")} dir="ltr">
                                            {isTeacherView ? '••••••••' : student.parentPhone}
                                        </td>
                                        <td className={cn("px-6 py-4 text-center border-l-2 border-gray-100", showDetails && "px-2 py-2")}>
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-8 h-8 bg-gray-950 text-white flex items-center justify-center font-black text-xs border-2 border-gray-950 shadow-[2px_2px_0px_0px_#444]">
                                                    {student.enrollments?.length || 0}
                                                </div>
                                            </div>
                                        </td>
                                        <td className={cn("px-6 py-4 text-center", showDetails && "px-1 py-1")}>
                                            <div className={cn("flex items-center justify-center gap-2", showDetails && "gap-1")}>
                                                <button onClick={(e) => { e.stopPropagation(); onSelect(student); }} className="p-2 bg-white border-2 border-gray-950 text-primary-600 hover:bg-gray-950 hover:text-white transition-all shadow-[2px_2px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"><Eye size={showDetails ? 14 : 18} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onEdit(student); }} className="p-2 bg-white border-2 border-gray-950 text-emerald-600 hover:bg-gray-950 hover:text-white transition-all shadow-[2px_2px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"><Edit size={showDetails ? 14 : 18} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onDelete(student.id); }} className="p-2 bg-white border-2 border-gray-950 text-rose-600 hover:bg-gray-950 hover:text-white transition-all shadow-[2px_2px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"><Trash size={showDetails ? 14 : 18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-6">
                {students.map((student) => {
                    const hasLowBalance = student.enrollments?.some(en => (en.sessionsTotal - en.sessionsUsed) <= 2);
                    const isSelected = selectedId === student.id;

                    return (
                        <div
                            key={student.id}
                            onClick={() => onSelect(student)}
                            className={cn(
                                "bg-white dark:bg-gray-900 border-4 border-gray-950 p-6 shadow-[8px_8px_0px_0px_black] relative overflow-hidden",
                                isSelected ? 'bg-amber-400/10' : ''
                            )}
                        >
                            <div className="absolute top-0 right-0 w-2 h-full bg-primary-600"></div>
                            
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-black text-gray-950 dark:text-white mb-1 uppercase tracking-tight">{student.name}</h3>
                                    <div className="flex gap-2">
                                        <span className="bg-gray-950 text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                                            {student.grade}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit(student); }}
                                        className="w-10 h-10 bg-white border-2 border-gray-950 flex items-center justify-center text-emerald-600 shadow-[2px_2px_0px_0px_black]"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(student.id); }}
                                        className="w-10 h-10 bg-white border-2 border-gray-950 flex items-center justify-center text-rose-600 shadow-[2px_2px_0px_0px_black]"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 border-2 border-gray-950 p-3 shadow-[2px_2px_0px_0px_black]">
                                    <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">بيانات التواصل</span>
                                    <span className="font-mono font-black text-xs text-gray-950" dir="ltr">
                                        {isTeacherView ? '••••••••' : student.parentPhone}
                                    </span>
                                </div>
                                <div className="bg-gray-50 border-2 border-gray-950 p-3 shadow-[2px_2px_0px_0px_black]">
                                    <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">المواد المسجل بها</span>
                                    <span className="font-black text-primary-600 text-xs">
                                        {student.enrollments?.length || 0} اشتراكات
                                    </span>
                                </div>
                            </div>

                            {hasLowBalance && (
                                <div className="mt-4 flex items-center justify-center gap-2 bg-rose-600 text-white p-2 border-2 border-gray-950 shadow-[2px_2px_0px_0px_black]">
                                    <AlertCircle size={14} />
                                    <span className="text-[10px] font-black uppercase italic tracking-widest">تنبيه: الرصيد شارف على الانتهاء</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {students.length === 0 && (
                <div className="py-24 text-center bg-white border-4 border-gray-950 border-dashed shadow-[10px_10px_0px_0px_black]">
                    <GraduationCap size={64} className="mx-auto mb-6 text-gray-200" />
                    <p className="text-gray-400 font-black text-xl uppercase tracking-[0.2em]">قاعدة البيانات فارغة حالياً</p>
                </div>
            )}
        </div>
    );
};

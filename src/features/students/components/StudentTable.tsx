import { Edit, Trash, GraduationCap } from 'lucide-react';
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

export const StudentTable = ({ students, selectedId, onSelect, onEdit, onDelete }: StudentTableProps) => {
    return (
        <div className="w-full">
            {/* Desktop View */}
            <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-[var(--primary-color,#5c59f2)]">
                            <tr>
                                <th className="px-6 py-3 font-medium text-[10px] text-white uppercase tracking-widest">توصيف الطالب</th>
                                <th className="px-6 py-3 font-medium text-[10px] text-white uppercase tracking-widest text-center">المستوى</th>
                                <th className="px-6 py-3 font-medium text-[10px] text-white uppercase tracking-widest text-center">الاشتراكات</th>
                                <th className="px-6 py-3 font-medium text-[10px] text-white uppercase tracking-widest text-center">الحصص</th>
                                <th className="px-6 py-3 font-medium text-[10px] text-white uppercase tracking-widest text-center">مؤشر التقدم</th>
                                <th className="px-6 py-3 font-medium text-[10px] text-white uppercase tracking-widest text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {students.map((student) => {
                                const totalExpected = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsTotal || 0), 0);
                                const totalUsed = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsUsed || 0), 0);
                                const progress = totalExpected > 0 ? Math.round((totalUsed / totalExpected) * 100) : 0;
                                const hasLowBalance = (student.enrollments || []).some(en => (en.sessionsTotal - en.sessionsUsed) <= 2);
                                const isSelected = selectedId === student.id;

                                return (
                                    <tr
                                        key={student.id}
                                        onClick={() => onSelect(student)}
                                        className={cn(
                                            "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer",
                                            isSelected ? "bg-indigo-50/50 dark:bg-indigo-900/20" : ""
                                        )}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-normal text-sm shadow-sm">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-normal text-xs text-slate-800 dark:text-white leading-tight">{student.name}</p>
                                                    {hasLowBalance && (
                                                        <span className="text-[9px] font-normal text-rose-500 uppercase tracking-tighter bg-rose-50 px-1">رصيد منخفض ⚠️</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-[10px] font-normal text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5">
                                                {student.grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="w-7 h-7 inline-flex items-center justify-center bg-indigo-50 text-[#5c59f2] font-normal text-[11px]">
                                                {student.enrollments?.length || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-[11px] font-normal text-slate-600 dark:text-slate-300 font-mono">
                                                {totalUsed} <span className="text-slate-300">/</span> {totalExpected}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 min-w-[140px]">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 overflow-hidden">
                                                    <div 
                                                        className={cn(
                                                            "h-full transition-all duration-1000",
                                                            progress < 30 ? "bg-rose-500" : progress < 70 ? "bg-amber-500" : "bg-emerald-500"
                                                        )} 
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[10px] font-normal text-slate-400 font-mono">{progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); onEdit(student); }} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-emerald-500 transition-all" title="تعديل"><Edit size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onDelete(student.id); }} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all" title="حذف"><Trash size={14} /></button>
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
            <div className="md:hidden space-y-4">
                {students.map((student) => {
                    const totalExpected = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsTotal || 0), 0);
                    const totalUsed = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsUsed || 0), 0);
                    const progress = totalExpected > 0 ? Math.round((totalUsed / totalExpected) * 100) : 0;
                    const hasLowBalance = (student.enrollments || []).some(en => (en.sessionsTotal - en.sessionsUsed) <= 2);

                    return (
                        <div 
                            key={student.id} 
                            onClick={() => onSelect(student)} 
                            className={cn(
                                "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-sm active:scale-[0.98] transition-all relative overflow-hidden",
                                hasLowBalance ? "border-rose-100" : ""
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center font-normal text-sm">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-normal text-slate-800 dark:text-white leading-tight mb-1">{student.name}</h4>
                                        <span className="text-[9px] font-normal text-slate-400 bg-slate-50 px-1.5 py-0.5 uppercase">{student.grade}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(student); }} className="w-8 h-8 bg-slate-50 text-slate-400 flex items-center justify-center"><Edit size={14} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(student.id); }} className="w-8 h-8 bg-rose-50 text-rose-500 flex items-center justify-center"><Trash size={14} /></button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-2 text-center">
                                    <span className="text-[8px] font-normal text-slate-400 block uppercase mb-1 italic tracking-widest">العقود</span>
                                    <span className="text-xs font-normal text-indigo-500">{student.enrollments?.length || 0}</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-2 text-center">
                                    <span className="text-[8px] font-normal text-slate-400 block uppercase mb-1 italic tracking-widest">المستخدم</span>
                                    <span className="text-xs font-normal text-emerald-500">{totalUsed}</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-2 text-center">
                                    <span className="text-[8px] font-normal text-slate-400 block uppercase mb-1 italic tracking-widest">الرصيد</span>
                                    <span className={cn("text-xs font-normal", hasLowBalance ? "text-rose-500" : "text-slate-600")}>{totalExpected - totalUsed}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[9px] font-normal text-slate-400 uppercase tracking-widest">
                                    <span>معدل الاستهلاك</span>
                                    <span className="font-mono">{progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 overflow-hidden">
                                    <div 
                                        className={cn(
                                            "h-full transition-all",
                                            progress < 30 ? "bg-rose-500" : progress < 70 ? "bg-amber-500" : "bg-emerald-500"
                                        )} 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {students.length === 0 && (
                <div className="py-24 text-center opacity-40">
                    <GraduationCap size={48} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-[10px] font-normal text-slate-400 uppercase tracking-[4px]">لا توجد بيانات طلاب حالياً</p>
                </div>
            )}
        </div>
    );
};


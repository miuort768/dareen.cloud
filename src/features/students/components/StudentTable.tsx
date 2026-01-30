import { Eye, Edit, Trash, GraduationCap } from 'lucide-react';
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
            <div className="hidden md:block bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-none">
                <div className="overflow-x-auto">
                    <table className="premium-table w-full">
                        <thead>
                            <tr>
                                <th className={cn("text-center", showDetails && "px-2 py-2 text-[10px]")}>اسم الطالب</th>
                                <th className={cn("text-center", showDetails && "px-2 py-2 text-[10px]")}>الصف</th>
                                <th className={cn("text-center", showDetails && "px-2 py-2 text-[10px]")}>رقم ولي الأمر</th>
                                <th className={cn("text-center", showDetails && "px-2 py-2 text-[10px]")}>الاشتراكات</th>
                                <th className={cn("text-center", showDetails && "px-2 py-2 text-[10px]")}>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {students.map((student) => {
                                const hasLowBalance = student.enrollments?.some(en => (en.sessionsTotal - en.sessionsUsed) <= 2);
                                const isSelected = selectedId === student.id;

                                return (
                                    <tr
                                        key={student.id}
                                        className={cn(
                                            "cursor-pointer",
                                            isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : '',
                                            hasLowBalance ? 'bg-rose-50/10' : ''
                                        )}
                                        onClick={() => onSelect(student)}
                                    >
                                        <td className={cn("text-center", showDetails && "px-2 py-2")}>
                                            <div className={cn("flex items-center justify-center", showDetails ? "gap-1" : "gap-3")}>
                                                <div className="text-right">
                                                    <span className={cn("font-black text-gray-900 dark:text-white block", showDetails ? "text-xs" : "text-sm")}>{student.name}</span>
                                                    {hasLowBalance && <span className="text-[9px] font-black text-rose-600 uppercase">انتهى الرصيد</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className={cn("text-center", showDetails && "px-2 py-2")}>
                                            <span className={cn("inline-block bg-gray-100 text-gray-700 font-black uppercase dark:bg-gray-800 dark:text-gray-300 rounded-none", showDetails ? "px-1.5 py-0.5 text-[8px]" : "px-3 py-1 text-[10px]")}>
                                                {student.grade}
                                            </span>
                                        </td>
                                        <td className={cn("text-center font-mono text-gray-500", showDetails ? "px-1 py-1 text-[10px]" : "px-6 py-3 text-xs")} dir="ltr">
                                            {isTeacherView ? '••••••••' : student.parentPhone}
                                        </td>
                                        <td className={cn("text-center", showDetails && "px-2 py-2")}>
                                            <span className={cn("inline-flex items-center justify-center bg-primary-50 text-primary-700 font-black dark:bg-primary-900/40 dark:text-primary-400 rounded-none", showDetails ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs")}>
                                                {student.enrollments?.length || 0}
                                            </span>
                                        </td>
                                        <td className={cn("text-center", showDetails && "px-1 py-1")}>
                                            <div className={cn("flex items-center justify-center", showDetails ? "gap-0" : "gap-1")}>
                                                <button onClick={(e) => { e.stopPropagation(); onSelect(student); }} className={cn("text-primary-600 hover:bg-primary-50 rounded-none", showDetails ? "p-1" : "p-2")}><Eye size={showDetails ? 14 : 16} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onEdit(student); }} className={cn("text-emerald-600 hover:bg-emerald-50 rounded-none", showDetails ? "p-1" : "p-2")}><Edit size={showDetails ? 14 : 16} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onDelete(student.id); }} className={cn("text-red-600 hover:bg-red-50 rounded-none", showDetails ? "p-1" : "p-2")}><Trash size={showDetails ? 14 : 16} /></button>
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
            <div className="md:hidden space-y-3">
                {students.map((student) => {
                    const hasLowBalance = student.enrollments?.some(en => (en.sessionsTotal - en.sessionsUsed) <= 2);
                    const isSelected = selectedId === student.id;

                    return (
                        <div
                            key={student.id}
                            onClick={() => onSelect(student)}
                            className={cn(
                                "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-none shadow-sm relative overflow-hidden",
                                isSelected ? 'ring-2 ring-primary-500' : '',
                                hasLowBalance ? 'border-r-4 border-r-rose-500' : 'border-r-4 border-r-primary-500'
                            )}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-base font-black text-gray-900 dark:text-white mb-1">{student.name}</h3>
                                    <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-none">
                                        {student.grade}
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit(student); }}
                                        className="w-8 h-8 rounded-none bg-blue-50 text-blue-600 flex items-center justify-center"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(student.id); }}
                                        className="w-8 h-8 rounded-none bg-rose-50 text-rose-600 flex items-center justify-center"
                                    >
                                        <Trash size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-none">
                                    <span className="text-[10px] text-gray-500 block mb-0.5">ولي الأمر</span>
                                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200" dir="ltr">
                                        {isTeacherView ? '••••••••' : student.parentPhone}
                                    </span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-none">
                                    <span className="text-[10px] text-gray-500 block mb-0.5">الاشتراكات</span>
                                    <span className="font-bold text-primary-600">
                                        {student.enrollments?.length || 0} مواد
                                    </span>
                                </div>
                            </div>

                            {hasLowBalance && (
                                <div className="mt-2 text-[10px] font-black text-rose-600 flex items-center gap-1 bg-rose-50 dark:bg-rose-900/20 p-1.5 rounded-none">
                                    <span className="w-1.5 h-1.5 rounded-none bg-rose-600"></span>
                                    تنبيه: رصيد الحصص قارب على الانتهاء
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {students.length === 0 && (
                <div className="py-20 text-center bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800">
                    <GraduationCap size={48} className="mx-auto mb-4 text-gray-200" />
                    <p className="text-gray-400 font-bold">لا توجد نتائج</p>
                </div>
            )}
        </div>
    );
};

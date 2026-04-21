import React from 'react';
import { Edit, Trash, GraduationCap, AlertCircle, Eye, User } from 'lucide-react';
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

export const StudentTable = ({ students, selectedId, onSelect, onEdit, onDelete, showDetails, isTeacherView: _isTeacherView }: StudentTableProps) => {
    return (
        <div className="w-full overflow-hidden">
            {/* Desktop View: High-Density Premium Table */}
            <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm rounded-none">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse text-right">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-5 py-4 text-center font-black text-[10px] uppercase tracking-widest text-slate-400">اسم الطالب</th>
                                <th className="px-5 py-4 text-center font-black text-[10px] uppercase tracking-widest text-slate-400">الصف الدراسي</th>
                                <th className="px-3 py-4 text-center font-black text-[10px] uppercase tracking-widest text-slate-400">الاشتراكات</th>
                                <th className="px-3 py-4 text-center font-black text-[10px] uppercase tracking-widest text-slate-400 font-mono">الحصص</th>
                                <th className="px-5 py-4 text-center font-black text-[10px] uppercase tracking-widest text-slate-400">نسبة الإنجاز</th>
                                <th className="px-5 py-4 text-center font-black text-[10px] uppercase tracking-widest text-slate-400">الإجراءات</th>
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
                                        className={cn(
                                            "group cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
                                            isSelected && "bg-indigo-50/50 dark:bg-indigo-900/10 border-l-4 border-l-[#5c59f2]",
                                            hasLowBalance && !isSelected && "bg-rose-50/30 dark:bg-rose-900/5"
                                        )}
                                        onClick={() => onSelect(student)}
                                    >
                                        <td className="px-5 py-3 relative">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black text-xs shrink-0">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-slate-800 dark:text-white text-[13px] truncate">{student.name}</p>
                                                    {hasLowBalance && (
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                                                            <span className="text-[9px] font-bold text-rose-500 uppercase tracking-tighter">رصيد منخفض</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap bg-slate-50 dark:bg-slate-800 px-2 py-1">
                                                {student.grade}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <div className="inline-flex items-center justify-center min-w-[24px] h-6 bg-indigo-50 dark:bg-indigo-900/30 text-[#5c59f2] font-black text-[10px] px-1.5">
                                                {student.enrollments?.length || 0}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 tabular-nums">
                                                    {totalUsed} / {totalExpected}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1 rounded-none overflow-hidden min-w-[60px]">
                                                    <div 
                                                        className={cn(
                                                            "h-full transition-all duration-1000",
                                                            progress < 30 ? "bg-rose-500" : progress < 70 ? "bg-amber-500" : "bg-emerald-500"
                                                        )} 
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-900 dark:text-slate-200 tabular-nums">{progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onSelect(student); }} 
                                                    className="p-1.5 bg-white dark:bg-slate-800 text-[#5c59f2] border border-slate-100 dark:border-slate-700 hover:bg-[#5c59f2] hover:text-white transition-all shadow-sm"
                                                    title="عرض التفاصيل"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onEdit(student); }} 
                                                    className="p-1.5 bg-white dark:bg-slate-800 text-emerald-600 border border-slate-100 dark:border-slate-700 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                    title="تعديل البيانات"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onDelete(student.id); }} 
                                                    className="p-1.5 bg-white dark:bg-slate-800 text-rose-500 border border-slate-100 dark:border-slate-700 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                    title="حذف الطالب"
                                                >
                                                    <Trash size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View: High-Performance List Cards */}
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
                                "bg-white dark:bg-slate-900 border-r-4 p-5 shadow-sm active:scale-[0.98] transition-all",
                                hasLowBalance ? "border-r-rose-500 shadow-rose-50 dark:shadow-none" : "border-r-[#5c59f2]"
                            )}
                        >
                            <div className="flex justify-between items-start mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[#5c59f2]">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-800 dark:text-white leading-none mb-1.5 tracking-tight">{student.name}</h4>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{student.grade}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(student); }} className="w-9 h-9 bg-slate-50 dark:bg-slate-800 text-emerald-600 flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm"><Edit size={16} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(student.id); }} className="w-9 h-9 bg-slate-50 dark:bg-slate-800 text-rose-500 flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm"><Trash size={16} /></button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 text-center">
                                    <span className="text-[8px] font-black text-slate-400 block uppercase mb-1">الاشتراكات</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{student.enrollments?.length || 0}</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 text-center">
                                    <span className="text-[8px] font-black text-slate-400 block uppercase mb-1">مستخدمة</span>
                                    <span className="text-sm font-black text-emerald-600 tabular-nums">{totalUsed}</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 text-center">
                                    <span className="text-[8px] font-black text-slate-400 block uppercase mb-1">المتبقي</span>
                                    <span className={cn("text-sm font-black tabular-nums", hasLowBalance ? "text-rose-500" : "text-slate-600")}>
                                        {totalExpected - totalUsed}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5">
                                    <div 
                                        className={cn(
                                            "h-full",
                                            progress < 30 ? "bg-rose-500" : "bg-[#5c59f2]"
                                        )} 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-black tabular-nums italic text-slate-400">{progress}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {students.length === 0 && (
                <div className="py-24 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                    <GraduationCap size={48} className="mx-auto mb-4 text-slate-100 dark:text-slate-800" />
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] italic">لا توجد بيانات طلاب حالياً</p>
                </div>
            )}
        </div>
    );
};

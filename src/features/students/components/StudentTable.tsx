import { Edit, Trash, GraduationCap, AlertCircle } from 'lucide-react';
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
        <div className="bg-transparent">
            {/* Desktop View - Technical Report Style */}
            <div className="hidden md:block bg-white border-4 border-gray-950 dark:bg-gray-900 dark:border-gray-800 shadow-[8px_8px_0px_0px_black] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-right">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                                <th className={cn("px-4 py-4 text-center font-black text-[10px] uppercase tracking-widest border-l border-white/10", showDetails && "px-1 text-[8px]")}>اسم الطالب</th>
                                <th className={cn("px-4 py-4 text-center font-black text-[10px] uppercase tracking-widest border-l border-white/10", showDetails && "px-1 text-[8px]")}>الصف</th>
                                <th className={cn("px-4 py-4 text-center font-black text-[10px] uppercase tracking-widest border-l border-white/10", showDetails && "px-1 text-[8px]")}>الاشتراكات</th>
                                <th className={cn("px-4 py-4 text-center font-black text-[10px] uppercase tracking-widest border-l border-white/10", showDetails && "px-1 text-[8px]")}>المتوقعة</th>
                                <th className={cn("px-4 py-4 text-center font-black text-[10px] uppercase tracking-widest border-l border-white/10", showDetails && "px-1 text-[8px]")}>المستخدمة</th>
                                <th className={cn("px-4 py-4 text-center font-black text-[10px] uppercase tracking-widest border-l border-white/10", showDetails && "px-1 text-[8px]")}>نسبة التقدم</th>
                                <th className={cn("px-4 py-4 text-center font-black text-[10px] uppercase tracking-widest", showDetails && "px-1 text-[8px]")}>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-gray-950">
                            {students.map((student) => {
                                const totalExpected = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsTotal || 0), 0);
                                const totalUsed = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsUsed || 0), 0);
                                const progress = totalExpected > 0 ? Math.round((totalUsed / totalExpected) * 100) : 0;
                                
                                const hasLowBalance = student.enrollments?.some(en => (en.sessionsTotal - en.sessionsUsed) <= 2);
                                const isSelected = selectedId === student.id;

                                return (
                                    <tr
                                        key={student.id}
                                        className={cn(
                                            "cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800 animate-in fade-in duration-300",
                                            isSelected ? 'bg-amber-400/20' : '',
                                            hasLowBalance ? 'bg-rose-50' : ''
                                        )}
                                        onClick={() => onSelect(student)}
                                    >
                                        <td className="px-4 py-3 text-center border-l-2 border-gray-100 dark:border-gray-800">
                                            <div className="flex flex-col items-center">
                                                <span className={cn("font-black text-gray-950 dark:text-white uppercase tracking-tight", showDetails ? "text-[10px]" : "text-xs italic")}>{student.name}</span>
                                                {hasLowBalance && (
                                                    <div className="mt-1 bg-rose-600 px-1.5 py-0.5 shadow-[1px_1px_0px_0px_black] flex items-center gap-1">
                                                        <AlertCircle size={8} className="text-white" />
                                                        <span className="text-[7px] font-black text-white uppercase italic">تحذير رصيد</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center border-l-2 border-gray-100 dark:border-gray-800">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                                {student.grade}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center border-l-2 border-gray-100 dark:border-gray-800">
                                            <div className="inline-flex items-center justify-center w-6 h-6 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-black text-[10px]">
                                                {student.enrollments?.length || 0}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center border-l-2 border-gray-100 dark:border-gray-800">
                                            <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 tabular-nums">{totalExpected}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center border-l-2 border-gray-100 dark:border-gray-800">
                                            <span className="text-[11px] font-black text-emerald-600 tabular-nums">{totalUsed}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center border-l-2 border-gray-100 dark:border-gray-800">
                                            <div className="flex items-center justify-center gap-2">
                                                {!showDetails && (
                                                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-none overflow-hidden max-w-[80px] border border-slate-200 dark:border-slate-700">
                                                        <div 
                                                            className={cn("h-full transition-all duration-1000 bg-indigo-600")} 
                                                            style={{ width: `${progress}%` }}
                                                        ></div>
                                                    </div>
                                                )}
                                                <span className="text-[10px] font-black text-slate-900 dark:text-slate-200 tabular-nums">{progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button onClick={(e) => { e.stopPropagation(); onSelect(student); }} className="p-1.5 bg-white border border-gray-950 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-[2px_2px_0px_0px_black] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-black text-[8px] uppercase px-2">عرض</button>
                                                <button onClick={(e) => { e.stopPropagation(); onEdit(student); }} className="p-1.5 bg-white border border-gray-950 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-[2px_2px_0px_0px_black] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-black text-[8px] uppercase px-2">تعديل</button>
                                                <button onClick={(e) => { e.stopPropagation(); onDelete(student.id); }} className="p-1.5 bg-white border border-gray-950 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-[2px_2px_0px_0px_black] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-black text-[8px] uppercase px-2">حذف</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View - High Contrast Detail Cards */}
            <div className="md:hidden space-y-4">
                {students.map((student) => {
                    const totalExpected = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsTotal || 0), 0);
                    const totalUsed = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsUsed || 0), 0);
                    const progress = totalExpected > 0 ? Math.round((totalUsed / totalExpected) * 100) : 0;
                    const hasLowBalance = student.enrollments?.some(en => (en.sessionsTotal - en.sessionsUsed) <= 2);

                    return (
                        <div key={student.id} onClick={() => onSelect(student)} className="bg-white dark:bg-gray-950 border-4 border-gray-950 p-4 shadow-[6px_6px_0px_0px_black] transition-transform active:scale-95">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-tighter italic">{student.name}</h4>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{student.grade}</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(student); }} className="w-8 h-8 bg-white border-2 border-gray-950 flex items-center justify-center text-emerald-600 shadow-[2px_2px_0px_0px_black]"><Edit size={14} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(student.id); }} className="w-8 h-8 bg-white border-2 border-gray-950 flex items-center justify-center text-rose-600 shadow-[2px_2px_0px_0px_black]"><Trash size={14} /></button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="bg-slate-50 p-2 border border-slate-200 text-center">
                                    <span className="text-[7px] font-black text-slate-400 block uppercase">الاشتراكات</span>
                                    <span className="text-xs font-black text-slate-900">{student.enrollments?.length || 0}</span>
                                </div>
                                <div className="bg-slate-50 p-2 border border-slate-200 text-center">
                                    <span className="text-[7px] font-black text-slate-400 block uppercase">المتوقعة</span>
                                    <span className="text-xs font-black text-slate-900">{totalExpected}</span>
                                </div>
                                <div className="bg-slate-50 p-2 border border-slate-200 text-center">
                                    <span className="text-[7px] font-black text-slate-400 block uppercase">المستخدمة</span>
                                    <span className="text-xs font-black text-emerald-600">{totalUsed}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-slate-100 h-2 border border-slate-200">
                                    <div className="h-full bg-indigo-600" style={{ width: `${progress}%` }}></div>
                                </div>
                                <span className="text-[10px] font-black italic">{progress}%</span>
                            </div>

                            {hasLowBalance && (
                                <div className="mt-4 bg-rose-600 text-white p-2 text-center text-[8px] font-black flex items-center justify-center gap-2 uppercase tracking-widest">
                                     رصيد منخفض جداً - يرجى المراجعة
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {students.length === 0 && (
                <div className="py-24 text-center bg-white border-4 border-gray-950 border-dashed shadow-[10px_10px_0px_0px_black] p-8">
                    <GraduationCap size={48} className="mx-auto mb-4 text-gray-200" />
                    <p className="text-gray-400 font-black text-sm uppercase tracking-[0.4em] italic">NO STUDENT DATA FOUND</p>
                </div>
            )}
        </div>
    );
};

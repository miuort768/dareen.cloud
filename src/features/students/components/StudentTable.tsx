import { Eye, Edit, Trash, GraduationCap, AlertCircle, Activity } from 'lucide-react';
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
            {/* Desktop View - High-End Technical Monochrome */}
            <div className="hidden md:block bg-white border-2 border-slate-900 dark:bg-slate-900 dark:border-slate-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-right">
                        <thead>
                            <tr className="bg-slate-950 text-white">
                                <th className={cn("px-4 py-4 text-center font-black text-[9px] uppercase tracking-[0.3em] border-l border-white/5", showDetails && "px-1 text-[8px]")}>Student Profile</th>
                                <th className={cn("px-4 py-4 text-center font-black text-[9px] uppercase tracking-[0.3em] border-l border-white/5", showDetails && "px-1 text-[8px]")}>Level</th>
                                <th className={cn("px-4 py-4 text-center font-black text-[9px] uppercase tracking-[0.3em] border-l border-white/5", showDetails && "px-1 text-[8px]")}>Subs</th>
                                <th className={cn("px-4 py-4 text-center font-black text-[9px] uppercase tracking-[0.3em] border-l border-white/5", showDetails && "px-1 text-[8px]")}>Expected</th>
                                <th className={cn("px-4 py-4 text-center font-black text-[9px] uppercase tracking-[0.3em] border-l border-white/5", showDetails && "px-1 text-[8px]")}>Used</th>
                                <th className={cn("px-4 py-4 text-center font-black text-[9px] uppercase tracking-[0.3em] border-l border-white/5", showDetails && "px-1 text-[8px]")}>KPI Progress</th>
                                <th className={cn("px-4 py-4 text-center font-black text-[9px] uppercase tracking-[0.3em]", showDetails && "px-1 text-[8px]")}>Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
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
                                            "cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800 group animate-in fade-in duration-300",
                                            isSelected ? 'bg-indigo-50/50' : '',
                                            hasLowBalance ? 'bg-rose-50/50' : ''
                                        )}
                                        onClick={() => onSelect(student)}
                                    >
                                        <td className="px-4 py-3 text-center border-l border-slate-50 dark:border-slate-800">
                                            <div className="flex flex-col items-center">
                                                <span className={cn("font-black text-slate-900 dark:text-white uppercase tracking-tighter italic", showDetails ? "text-[10px]" : "text-xs")}>{student.name}</span>
                                                {hasLowBalance && (
                                                    <div className="mt-1 bg-red-600 px-1 py-0 shadow-sm flex items-center gap-1">
                                                        <AlertCircle size={7} className="text-white" />
                                                        <span className="text-[6px] font-black text-white uppercase tracking-tighter">Low Funds</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center border-l border-slate-50 dark:border-slate-800">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                {student.grade}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center border-l border-slate-50 dark:border-slate-800">
                                            <span className="text-[10px] font-black tabular-nums text-indigo-600">{student.enrollments?.length || 0}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center border-l border-slate-50 dark:border-slate-800">
                                            <span className="text-[10px] font-black text-slate-400 tabular-nums">{totalExpected}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center border-l border-slate-50 dark:border-slate-800">
                                            <span className="text-[10px] font-black text-slate-900 tabular-nums">{totalUsed}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center border-l border-slate-50 dark:border-slate-800">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[9px] font-black text-slate-900 tabular-nums">{progress}%</span>
                                                <div className="w-16 bg-slate-100 h-0.5 rounded-none overflow-hidden relative">
                                                    <div 
                                                        className={cn("h-full transition-all duration-1000 bg-slate-900")} 
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); onSelect(student); }} className="p-1 px-2 border border-slate-900 text-slate-950 font-black text-[9px] uppercase hover:bg-slate-950 hover:text-white transition-all">VIEW</button>
                                                <button onClick={(e) => { e.stopPropagation(); onEdit(student); }} className="p-1 px-2 border border-slate-900 text-slate-950 font-black text-[9px] uppercase hover:bg-slate-950 hover:text-white transition-all">EDIT</button>
                                                <button onClick={(e) => { e.stopPropagation(); onDelete(student.id); }} className="p-1 px-2 border border-red-600 text-red-600 font-black text-[9px] uppercase hover:bg-red-600 hover:text-white transition-all">DEL</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View - Sleek Cards */}
            <div className="md:hidden space-y-4">
                {students.map((student) => {
                    const totalExpected = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsTotal || 0), 0);
                    const totalUsed = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsUsed || 0), 0);
                    const progress = totalExpected > 0 ? Math.round((totalUsed / totalExpected) * 100) : 0;
                    const hasLowBalance = student.enrollments?.some(en => (en.sessionsTotal - en.sessionsUsed) <= 2);

                    return (
                        <div key={student.id} onClick={() => onSelect(student)} className="bg-white dark:bg-slate-950 border border-slate-900 p-4 shadow-sm relative transition-all active:bg-slate-50">
                            {hasLowBalance && <div className="absolute top-0 right-0 w-1 h-full bg-red-600"></div>}
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="text-[11px] font-black text-slate-950 dark:text-white uppercase italic">{student.name}</h4>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{student.grade}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(student); }} className="w-7 h-7 border border-slate-900 flex items-center justify-center text-slate-950 text-[10px]"><Edit size={12} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(student.id); }} className="w-7 h-7 border border-red-600 flex items-center justify-center text-red-600 text-[10px]"><Trash size={12} /></button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-1 mb-3">
                                <div className="text-center">
                                    <span className="text-[6px] font-black text-slate-300 block">SUBS</span>
                                    <span className="text-[10px] font-black">{student.enrollments?.length || 0}</span>
                                </div>
                                <div className="text-center">
                                    <span className="text-[6px] font-black text-slate-300 block">EXPECT</span>
                                    <span className="text-[10px] font-black">{totalExpected}</span>
                                </div>
                                <div className="text-center">
                                    <span className="text-[6px] font-black text-slate-300 block">USED</span>
                                    <span className="text-[10px] font-black">{totalUsed}</span>
                                </div>
                                <div className="text-center">
                                    <span className="text-[6px] font-black text-slate-300 block">KPI</span>
                                    <span className="text-[10px] font-black">{progress}%</span>
                                </div>
                            </div>

                            <div className="w-full bg-slate-50 h-[1px] relative">
                                <div className="h-full bg-slate-950" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {students.length === 0 && (
                <div className="py-24 text-center border-2 border-slate-100 border-dashed p-8">
                    <GraduationCap size={32} className="mx-auto mb-4 text-slate-100" />
                    <p className="text-slate-200 font-black text-[10px] uppercase tracking-[0.5em]">System Database Empty</p>
                </div>
            )}
        </div>
    );
};

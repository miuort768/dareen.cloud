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

export const StudentTable = ({ students, selectedId, onSelect, onEdit, onDelete, showDetails: _showDetails, isTeacherView: _isTeacherView }: StudentTableProps) => {
    return (
        <div className="w-full">
            {/* Desktop View: High-Density Premium Table */}
            <div className="hidden md:block bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse text-right">
                        <thead>
                            <tr className="bg-slate-900 dark:bg-black text-slate-400">
                                <th className="px-6 py-5 text-right font-black text-[10px] uppercase tracking-[2px] italic">توصيف الطالب</th>
                                <th className="px-6 py-5 text-center font-black text-[10px] uppercase tracking-[2px] italic border-r border-slate-800">المستوى الأكاديمي</th>
                                <th className="px-6 py-5 text-center font-black text-[10px] uppercase tracking-[2px] italic border-r border-slate-800">الاشتراكات</th>
                                <th className="px-6 py-5 text-center font-black text-[10px] uppercase tracking-[2px] italic border-r border-slate-800 font-mono">بيان الحصص</th>
                                <th className="px-6 py-5 text-center font-black text-[10px] uppercase tracking-[2px] italic border-r border-slate-800">مؤشر التقدم</th>
                                <th className="px-6 py-5 text-center font-black text-[10px] uppercase tracking-[2px] italic border-r border-slate-800">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
                                            "group cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-white/[0.02]",
                                            isSelected && "bg-indigo-50/50 dark:bg-indigo-900/10 border-l-8 border-l-indigo-600",
                                            hasLowBalance && !isSelected && "bg-rose-50/20 dark:bg-rose-900/5"
                                        )}
                                        onClick={() => onSelect(student)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-900 dark:bg-black flex items-center justify-center text-white font-black text-sm italic shadow-lg group-hover:bg-indigo-600 transition-colors">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight italic group-hover:text-indigo-600 transition-colors">{student.name}</p>
                                                    {hasLowBalance && (
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <div className="w-2 h-2 bg-rose-500 animate-pulse"></div>
                                                            <span className="text-[9px] font-black text-rose-600 uppercase tracking-tighter italic">رصيد حرج</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center border-r border-slate-50 dark:border-slate-800">
                                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1.5 uppercase italic tracking-widest">
                                                {student.grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center border-r border-slate-50 dark:border-slate-800">
                                            <div className="inline-flex items-center justify-center w-8 h-8 bg-indigo-600 text-white font-black text-xs italic">
                                                {student.enrollments?.length || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center border-r border-slate-50 dark:border-slate-800">
                                            <span className="text-sm font-black text-slate-900 dark:text-slate-300 font-mono italic">
                                                {totalUsed} <span className="text-[9px] text-slate-400">/</span> {totalExpected}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 border-r border-slate-50 dark:border-slate-800">
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 overflow-hidden min-w-[80px]">
                                                    <div 
                                                        className={cn(
                                                            "h-full transition-all duration-1000",
                                                            progress < 30 ? "bg-rose-500" : progress < 70 ? "bg-amber-500" : "bg-emerald-500"
                                                        )} 
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[11px] font-black text-slate-900 dark:text-slate-200 font-mono italic">{progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center border-r border-slate-50 dark:border-slate-800">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <TableAction onClick={(e: any) => { e.stopPropagation(); onEdit(student); }} icon={Edit} color="emerald" title="تعديل" />
                                                <TableAction onClick={(e: any) => { e.stopPropagation(); onDelete(student.id); }} icon={Trash} color="rose" title="حذف" />
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
            <div className="md:hidden space-y-6">
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
                                "bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] active:scale-[0.98] transition-all relative overflow-hidden",
                                hasLowBalance && "border-rose-500 dark:border-rose-500"
                            )}
                        >
                            <div className="absolute top-0 left-0 w-16 h-16 bg-slate-50 dark:bg-white/5 -skew-x-12 -translate-x-8 -translate-y-8"></div>
                            
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-900 dark:bg-black text-white flex items-center justify-center italic font-black text-lg">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white leading-none uppercase tracking-tight italic mb-2">{student.name}</h4>
                                        <span className="bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">{student.grade}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(student); }} className="w-10 h-10 bg-emerald-500 text-white flex items-center justify-center shadow-lg active:translate-y-1 transition-all"><Edit size={16} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(student.id); }} className="w-10 h-10 bg-rose-500 text-white flex items-center justify-center shadow-lg active:translate-y-1 transition-all"><Trash size={16} /></button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <MobileStat label="العقود" value={student.enrollments?.length || 0} color="indigo" />
                                <MobileStat label="المستخدم" value={totalUsed} color="emerald" />
                                <MobileStat label="الرصيد" value={totalExpected - totalUsed} color={hasLowBalance ? "rose" : "slate"} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase italic">
                                    <span>معدل الاستهلاك</span>
                                    <span className="font-mono">{progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2">
                                    <div 
                                        className={cn(
                                            "h-full shadow-[0_0_8px_rgba(0,0,0,0.1)]",
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
                <div className="py-32 text-center bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 p-12">
                    <GraduationCap size={64} className="mx-auto mb-6 text-slate-200 dark:text-slate-800" />
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[5px] italic">قاعدة البيانات الطلابية فارغة</p>
                </div>
            )}
        </div>
    );
};

const TableAction = ({ onClick, icon: Icon, color, title }: any) => {
    const colors: any = {
        emerald: "bg-emerald-500 hover:bg-emerald-600",
        rose: "bg-rose-500 hover:bg-rose-700",
        indigo: "bg-indigo-600 hover:bg-indigo-700"
    };
    return (
        <button 
            onClick={onClick} 
            className={cn("p-2 text-white shadow-lg active:translate-y-1 transition-all", colors[color])}
            title={title}
        >
            <Icon size={14} />
        </button>
    );
};

const MobileStat = ({ label, value, color }: any) => {
    const colors: any = {
        indigo: "text-indigo-600",
        emerald: "text-emerald-600",
        rose: "text-rose-500",
        slate: "text-slate-600"
    };
    return (
        <div className="bg-slate-50 dark:bg-white/5 p-3 text-center border border-slate-100 dark:border-white/5">
            <span className="text-[8px] font-black text-slate-400 block uppercase mb-1 italic tracking-widest">{label}</span>
            <span className={cn("text-base font-black font-mono italic", colors[color])}>{value}</span>
        </div>
    );
};

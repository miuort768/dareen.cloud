import { Edit, Trash2, Users, Phone, Mail, ArrowUpRight, MessageCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Parent, Student } from '../../../types';

interface ParentsTableProps {
    parents: Parent[];
    students: Student[];
    selectedParentId: string | null;
    showDetails: boolean;
    onSelectParent: (parent: Parent) => void;
    onEdit: (parent: Parent) => void;
    onDelete: (id: string) => void;
    onViewParent?: (parent: Parent) => void;
}

export const ParentsTable: React.FC<ParentsTableProps> = ({
    parents,
    students,
    selectedParentId,
    showDetails,
    onSelectParent,
    onEdit,
    onDelete,
    onViewParent
}) => {
    return (
        <div className={cn("bg-transparent", showDetails ? "lg:col-span-2" : "col-span-3")}>
            
            {/* ── Desktop View ── */}
            <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm overflow-hidden rounded-2xl">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-gradient-to-l from-[#6C4BFF] to-[#8B5CF6]">
                            <th className="px-6 py-4 font-bold text-[9px] uppercase tracking-widest text-white/70 text-center w-16">ID</th>
                            <th className="px-6 py-4 font-bold text-[9px] uppercase tracking-widest text-white/70">ولي الأمر</th>
                            <th className="px-6 py-4 font-bold text-[9px] uppercase tracking-widest text-white/70">بيانات التواصل</th>
                            <th className="px-6 py-4 font-bold text-[9px] uppercase tracking-widest text-white/70 text-center">الطلاب المرتبطين</th>
                            <th className="px-6 py-4 font-bold text-[9px] uppercase tracking-widest text-white/70 text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parents.length > 0 ? parents.map((parent, idx) => {
                            const children = students.filter(s => s.parentPhone === parent.phone);
                            const isSelected = selectedParentId === parent.id;

                            return (
                                <tr
                                    key={parent.id}
                                    onClick={() => onSelectParent(parent)}
                                    className={cn(
                                        "group cursor-pointer transition-all duration-200",
                                        isSelected ? "bg-blue-50 dark:bg-blue-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                    )}
                                >
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-[10px] font-medium text-slate-300 font-mono">
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 flex items-center justify-center font-bold text-sm bg-[#6C4BFF]/10 text-[#6C4BFF] rounded-xl">
                                                {parent.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-[13px] text-slate-800 dark:text-white uppercase tracking-tight">{parent.name}</p>
                                                <p className="text-[9px] font-normal text-slate-400 mt-0.5 font-mono">#{parent.id.substring(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-lg">
                                                    <Phone size={10} className="text-emerald-600" />
                                                </div>
                                                <span className="font-mono text-[11px] font-medium text-slate-700 dark:text-slate-300" dir="ltr">{parent.phone}</span>
                                            </div>
                                            {parent.email && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg">
                                                        <Mail size={10} className="text-slate-400" />
                                                    </div>
                                                    <span className="text-[10px] font-normal text-slate-400 truncate max-w-[180px]">{parent.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="flex -space-x-2 space-x-reverse">
                                                {children.slice(0, 3).map((child, i) => (
                                                    <div key={i} className="w-7 h-7 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-medium text-[#6C4BFF] rounded-lg">
                                                        {child.name.charAt(0)}
                                                    </div>
                                                ))}
                                                {children.length > 3 && (
                                                    <div className="w-7 h-7 bg-gradient-to-br from-[#6C4BFF] to-[#8B5CF6] border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-medium text-white rounded-lg">
                                                        +{children.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{children.length} طلاب</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onEdit(parent); }}
                                                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-[#6C4BFF] hover:text-white hover:border-[#6C4BFF] transition-all rounded-xl"
                                                    >
                                                        <Edit size={13} />
                                                    </button>
                                                    <a
                                                        href={`https://wa.me/${parent.phone.replace(/[^0-9]/g, '')}`}
                                                        target="_blank" rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 transition-all rounded-xl"
                                                        title="واتساب"
                                                    >
                                                        <MessageCircle size={13} />
                                                    </a>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onDelete(parent.id); }}
                                                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all rounded-xl"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                    <button onClick={() => onViewParent?.(parent)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-[#6C4BFF] hover:text-white hover:border-[#6C4BFF] transition-all rounded-xl">
                                                        <ArrowUpRight size={13} />
                                                    </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700/50 rounded-2xl">
                                        <Users size={32} className="text-slate-200 dark:text-slate-600" />
                                    </div>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]">لا توجد سجلات حالياً</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Mobile View ── */}
            <div className="md:hidden space-y-3">
                {parents.map((parent) => {
                    const children = students.filter(s => s.parentPhone === parent.phone);
                    const isSelected = selectedParentId === parent.id;

                    return (
                        <div
                            key={parent.id}
                            onClick={() => onSelectParent(parent)}
                            className={cn(
                                "bg-white dark:bg-slate-900 border transition-all duration-200 p-4 relative shadow-sm rounded-2xl",
                                isSelected ? "border-[#6C4BFF] ring-1 ring-[#6C4BFF]/20" : "border-slate-100/50 dark:border-slate-800/50"
                            )}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 flex items-center justify-center font-bold text-base shadow-sm bg-[#6C4BFF]/10 text-[#6C4BFF] rounded-xl">
                                        {parent.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-800 dark:text-white uppercase tracking-tight leading-tight">{parent.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Phone size={10} className="text-emerald-500" />
                                            <span className="text-[10px] font-medium text-slate-500 font-mono" dir="ltr">{parent.phone}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(parent); }} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-emerald-500 shadow-sm transition-all rounded-xl"><Edit size={13} /></button>
                                    <a href={`https://wa.me/${parent.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-emerald-500 shadow-sm transition-all rounded-xl"><MessageCircle size={13} /></a>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(parent.id); }} className="w-8 h-8 flex items-center justify-center shadow-sm transition-all rounded-xl" style={{ backgroundColor: '#F43F5E12', color: '#F43F5E' }}><Trash2 size={13} /></button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-[#64748B]">الأبناء</span>
                                    <div className="flex -space-x-2 space-x-reverse">
                                        {children.slice(0, 3).map((_, i) => (
                                            <div key={i} className="w-5 h-5 rounded-md" style={{ backgroundColor: '#6C4BFF20', border: '1px solid #6C4BFF40' }} />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 shadow-sm text-white text-[10px] font-bold rounded-xl bg-gradient-to-l from-[#6C4BFF] to-[#8B5CF6]">
                                    <Users size={11} />
                                    {children.length}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

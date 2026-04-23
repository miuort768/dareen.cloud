import React from 'react';
import { Edit, Trash2, Users, Phone, Mail, Search, ArrowUpRight } from 'lucide-react';
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
}

export const ParentsTable: React.FC<ParentsTableProps> = ({
    parents,
    students,
    selectedParentId,
    showDetails,
    onSelectParent,
    onEdit,
    onDelete
}) => {
    return (
        <div className={cn("bg-transparent", showDetails ? "lg:col-span-2" : "col-span-3")}>
            
            {/* ── Desktop View ── */}
            <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm overflow-hidden">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-white">
                            <th className="px-6 py-4 font-black text-[9px] uppercase tracking-widest text-center w-16">ID</th>
                            <th className="px-6 py-4 font-black text-[9px] uppercase tracking-widest">ولي الأمر</th>
                            <th className="px-6 py-4 font-black text-[9px] uppercase tracking-widest">بيانات التواصل</th>
                            <th className="px-6 py-4 font-black text-[9px] uppercase tracking-widest text-center">الطلاب المرتبطين</th>
                            <th className="px-6 py-4 font-black text-[9px] uppercase tracking-widest text-center">الإجراءات</th>
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
                                        isSelected ? "bg-indigo-50 dark:bg-indigo-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                    )}
                                >
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-[10px] font-black text-slate-300 font-mono">
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 flex items-center justify-center bg-slate-950 text-white rounded-none font-black text-sm relative overflow-hidden group-hover:scale-105 transition-transform">
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                                                {parent.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-[13px] text-slate-800 dark:text-white uppercase tracking-tight">{parent.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 mt-0.5 font-mono">#{parent.id.substring(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 rounded-none border border-emerald-100 dark:border-emerald-800/50">
                                                    <Phone size={10} className="text-emerald-600" />
                                                </div>
                                                <span className="font-mono text-[11px] font-black text-slate-700 dark:text-slate-300" dir="ltr">{parent.phone}</span>
                                            </div>
                                            {parent.email && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-100 dark:border-slate-700">
                                                        <Mail size={10} className="text-slate-400" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400 truncate max-w-[180px]">{parent.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="flex -space-x-2 space-x-reverse">
                                                {children.slice(0, 3).map((child, i) => (
                                                    <div key={i} className="w-7 h-7 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-black text-indigo-500">
                                                        {child.name.charAt(0)}
                                                    </div>
                                                ))}
                                                {children.length > 3 && (
                                                    <div className="w-7 h-7 bg-indigo-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-black text-white">
                                                        +{children.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{children.length} طلاب</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEdit(parent); }}
                                                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all rounded-none"
                                            >
                                                <Edit size={13} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(parent.id); }}
                                                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all rounded-none"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                            <button className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all rounded-none">
                                                <ArrowUpRight size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-none flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700/50">
                                        <Users size={32} className="text-slate-200 dark:text-slate-600" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">لا توجد سجلات حالياً</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Mobile View ── */}
            <div className="md:hidden space-y-3">
                {parents.map((parent, idx) => {
                    const children = students.filter(s => s.parentPhone === parent.phone);
                    const isSelected = selectedParentId === parent.id;

                    return (
                        <div
                            key={parent.id}
                            onClick={() => onSelectParent(parent)}
                            className={cn(
                                "bg-white dark:bg-slate-900 border transition-all duration-200 p-4 rounded-none relative overflow-hidden",
                                isSelected ? "border-indigo-500 ring-1 ring-indigo-500/20" : "border-slate-100 dark:border-slate-800"
                            )}
                        >
                            {isSelected && <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500" />}
                            
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-950 text-white rounded-none flex items-center justify-center font-black text-base shadow-lg">
                                        {parent.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight leading-tight">{parent.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Phone size={10} className="text-emerald-500" />
                                            <span className="text-[10px] font-black text-slate-500 font-mono" dir="ltr">{parent.phone}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(parent); }} className="w-8 h-8 flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 rounded-none transition-all"><Edit size={13} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(parent.id); }} className="w-8 h-8 flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-rose-500 rounded-none transition-all"><Trash2 size={13} /></button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">الأبناء</span>
                                    <div className="flex -space-x-2 space-x-reverse">
                                        {children.slice(0, 3).map((_, i) => (
                                            <div key={i} className="w-5 h-5 bg-indigo-50 border border-indigo-200 rounded-full" />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-none shadow-sm">
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

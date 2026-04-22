import React from 'react';
import { Edit, Trash2, Users, Phone, Mail } from 'lucide-react';
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
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-3 font-bold text-[10px] text-slate-500 uppercase">ولي الأمر</th>
                                <th className="px-6 py-3 font-bold text-[10px] text-slate-500 uppercase">بيانات الاتصال</th>
                                <th className="px-6 py-3 font-bold text-[10px] text-slate-500 uppercase text-center">عدد الأبناء</th>
                                <th className="px-6 py-3 font-bold text-[10px] text-slate-500 uppercase text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {parents.length > 0 ? parents.map((parent) => {
                                const children = students.filter(s => s.parentPhone === parent.phone);
                                const isSelected = selectedParentId === parent.id;

                                return (
                                    <tr
                                        key={parent.id}
                                        onClick={() => onSelectParent(parent)}
                                        className={cn(
                                            "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer",
                                            isSelected ? "bg-indigo-50/50 dark:bg-indigo-900/20" : ""
                                        )}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-slate-900 dark:bg-slate-800 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                                                    {parent.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-xs text-slate-800 dark:text-white">
                                                    {parent.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5" dir="ltr">
                                                    <Phone size={12} className="text-emerald-500" />
                                                    {parent.phone}
                                                </span>
                                                {parent.email && (
                                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5" dir="ltr">
                                                        <Mail size={12} className="text-slate-300" />
                                                        {parent.email}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-400 font-bold text-[10px] rounded-md">
                                                    <Users size={10} />
                                                    {children.length} طلاب
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onEdit(parent); }}
                                                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-[#5c59f2] rounded-lg transition-all"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDelete(parent.id); }}
                                                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center">
                                        <Users size={32} className="mx-auto text-slate-100 mb-2" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">لا توجد سجلات</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-3">
                {parents.map((parent) => {
                    const children = students.filter(s => s.parentPhone === parent.phone);
                    const isSelected = selectedParentId === parent.id;

                    return (
                        <div
                            key={parent.id}
                            onClick={() => onSelectParent(parent)}
                            className={cn(
                                "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm relative",
                                isSelected ? 'ring-2 ring-[#5c59f2]' : ''
                            )}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold">
                                        {parent.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{parent.name}</h3>
                                        <span className="text-[10px] font-bold text-slate-400" dir="ltr">
                                            {parent.phone}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(parent); }} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center"><Edit size={14} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(parent.id); }} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">الأبناء المسجلين</span>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-[#5c59f2] text-[10px] font-bold rounded-md">
                                    <Users size={12} />
                                    {children.length} طالب
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

import React from 'react';
import { Edit, Trash2, Users } from 'lucide-react';
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
            {/* Desktop View */}
            <div className="hidden md:block bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                <div className="overflow-x-auto overflow-y-auto max-h-[700px]">
                    <table className="premium-table w-full">
                        <thead>
                            <tr>
                                <th className="text-center">الاسم الكامل</th>
                                <th className="text-center">رقم الاتصال</th>
                                <th className="text-center">البريد</th>
                                <th className="text-center">عدد الأبناء</th>
                                <th className="text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parents.length > 0 ? parents.map((parent) => {
                                const children = students.filter(s => s.parentPhone === parent.phone);
                                const isSelected = selectedParentId === parent.id;

                                return (
                                    <tr
                                        key={parent.id}
                                        className={isSelected ? "bg-primary-50 dark:bg-primary-900/20 shadow-inner" : ""}
                                        onClick={() => onSelectParent(parent)}
                                    >
                                        <td className="text-center">
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                {parent.name}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className="font-mono text-[13px] font-bold" dir="ltr">
                                                {parent.phone}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className="text-[12px] font-bold text-gray-400 italic" dir="ltr">
                                                {parent.email || '—'}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex justify-center">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 font-black text-[10px] dark:bg-gray-800 dark:text-gray-400">
                                                    <Users size={12} />
                                                    {children.length}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onEdit(parent); }}
                                                    className="table-action-btn text-primary-600 hover:bg-primary-50"
                                                    title="تعديل الحساب"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDelete(parent.id); }}
                                                    className="table-action-btn text-red-600 hover:bg-red-50"
                                                    title="حذف الحساب"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-gray-400 font-bold">لا يوجد سجلات متاحة</td>
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
                                "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-none shadow-sm relative overflow-hidden transition-all active:scale-[0.98]",
                                isSelected ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-950 border-primary-500' : 'border-r-4 border-r-primary-500'
                            )}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-base font-black text-gray-900 dark:text-white mb-1">{parent.name}</h3>
                                    <span className="text-[10px] font-bold text-gray-400" dir="ltr">
                                        {parent.email || 'لا يوجد بريد إلكتروني'}
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit(parent); }}
                                        className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(parent.id); }}
                                        className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-none">
                                    <span className="text-[10px] text-gray-500 block mb-0.5">رقم الهاتف</span>
                                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200" dir="ltr">
                                        {parent.phone}
                                    </span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-none">
                                    <span className="text-[10px] text-gray-500 block mb-0.5">الأبناء المسجلين</span>
                                    <div className="flex items-center gap-1 font-bold text-primary-600">
                                        <Users size={12} />
                                        {children.length} طالب
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {parents.length === 0 && (
                    <div className="py-20 text-center bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800">
                        <Users size={48} className="mx-auto mb-4 text-gray-200" />
                        <p className="text-gray-400 font-bold">لا يوجد سجلات متاحة</p>
                    </div>
                )}
            </div>
        </div>
    );
};

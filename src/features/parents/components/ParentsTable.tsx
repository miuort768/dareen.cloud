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
        <div className={cn("table-container", showDetails ? "lg:col-span-2" : "col-span-3")}>
            <div className="overflow-x-auto overflow-y-auto max-h-[700px]">
                <table className="premium-table">
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
    );
};

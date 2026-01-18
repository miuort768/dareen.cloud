import { Edit, Trash2, GraduationCap, MessageCircle } from 'lucide-react';
import type { Teacher } from '../types';

interface TeacherTableProps {
    teachers: Teacher[];
    onEdit: (teacher: Teacher) => void;
    onDelete: (id: string) => void;
    onSelect: (teacher: Teacher) => void;
    selectedId?: string;
    studentCounts: Record<string, number>;
}

export const TeacherTable = ({ teachers, onEdit, onDelete, onSelect, selectedId, studentCounts }: TeacherTableProps) => {
    return (
        <div className="bg-white border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-primary-600 border-b border-primary-700 dark:bg-gray-800 dark:border-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">المعلمة</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider hidden sm:table-cell">التخصص</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider hidden md:table-cell">الطلاب</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">الحصة</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {teachers.length > 0 ? (
                            teachers.map(teacher => {
                                const isSelected = selectedId === teacher.id;
                                return (
                                    <tr
                                        key={teacher.id}
                                        onClick={() => onSelect(teacher)}
                                        className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${isSelected ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'} dark:bg-gray-800 dark:text-gray-300`}>
                                                    {teacher.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{teacher.name}</p>
                                                    <p className="text-xs text-gray-500 sm:hidden">{teacher.subject}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell font-medium">
                                            {teacher.subject}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center hidden md:table-cell">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                                {studentCounts[teacher.name] || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{teacher.price}</span>
                                            <span className="text-[10px] text-gray-400 mr-1">ج.م</span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onEdit(teacher); }}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="تعديل"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.location.hash = `#/chat?userId=${teacher.id}`;
                                                    }}
                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                                    title="مراسلة"
                                                >
                                                    <MessageCircle size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    <GraduationCap size={40} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-medium">لا توجد نتائج</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

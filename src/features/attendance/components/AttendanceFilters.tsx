import React from 'react';
import { Search, Filter, GraduationCap, X, SlidersHorizontal } from 'lucide-react';

interface AttendanceFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterStatus: string;
    onStatusChange: (value: string) => void;
    filterTeacher: string;
    onTeacherChange: (value: string) => void;
    uniqueTeachers: string[];
}

export const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
    searchTerm,
    onSearchChange,
    filterStatus,
    onStatusChange,
    filterTeacher,
    onTeacherChange,
    uniqueTeachers
}) => {
    const hasActiveFilters = searchTerm || filterStatus !== 'all' || filterTeacher !== 'all';

    return (
        <div className="px-0 mb-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center rounded-xl">
                            <SlidersHorizontal size={14} className="text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-xs font-normal text-slate-800 dark:text-white">فلترة السجلات</h3>
                            <p className="text-[10px] text-slate-400">تخصيص عرض الجلسات</p>
                        </div>
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={() => { onSearchChange(''); onStatusChange('all'); onTeacherChange('all'); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white font-normal text-[10px] rounded-lg transition-all"
                        >
                            <X size={12} /> إعادة التعيين
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="اسم الطالب، المادة..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600 transition-all"
                        />
                    </div>

                    <div className="relative">
                        <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                            value={filterStatus}
                            onChange={(e) => onStatusChange(e.target.value)}
                            className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="scheduled">مجدولة</option>
                            <option value="completed">حضور</option>
                            <option value="cancelled">غياب</option>
                        </select>
                    </div>

                    <div className="relative">
                        <GraduationCap size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                            value={filterTeacher}
                            onChange={(e) => onTeacherChange(e.target.value)}
                            className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">كافة المعلمات</option>
                            {uniqueTeachers.map(teacher => (
                                <option key={teacher} value={teacher}>{teacher}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

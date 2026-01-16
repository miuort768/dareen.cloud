import React from 'react';
import { Search, Filter, GraduationCap } from 'lucide-react';

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
    return (
        <div className="bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="ابحث عن طالب، معلمة أو مادة..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 border border-gray-200 focus:outline-none focus:border-primary-500 text-sm rounded-none bg-gray-50 focus:bg-white transition-colors dark:bg-gray-800 dark:border-gray-700"
                    />
                </div>

                <div className="relative">
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                        value={filterStatus}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 border border-gray-200 focus:outline-none focus:border-primary-500 text-sm rounded-none bg-gray-50 dark:bg-gray-800 dark:border-gray-700 appearance-none cursor-pointer"
                    >
                        <option value="all">جميع الحالات</option>
                        <option value="scheduled">مجدولة</option>
                        <option value="completed">حضور</option>
                        <option value="cancelled">غياب</option>
                    </select>
                </div>

                <div className="relative">
                    <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                        value={filterTeacher}
                        onChange={(e) => onTeacherChange(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 border border-gray-200 focus:outline-none focus:border-primary-500 text-sm rounded-none bg-gray-50 dark:bg-gray-800 dark:border-gray-700 appearance-none cursor-pointer"
                    >
                        <option value="all">جميع المعلمات</option>
                        {uniqueTeachers.map(teacher => (
                            <option key={teacher} value={teacher}>{teacher}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

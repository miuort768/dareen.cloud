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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-600 flex items-center justify-center">
                        <SlidersHorizontal size={14} className="text-white" />
                    </div>
                    <h3 className="text-xs font-black text-slate-700 dark:text-white uppercase tracking-widest">لوحة التحكم في فرز السجلات</h3>
                    {hasActiveFilters && (
                        <span className="bg-indigo-100 text-indigo-700 text-[8px] font-black px-1.5 py-0.5 uppercase tracking-wider">
                            فلتر نشط
                        </span>
                    )}
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={() => { onSearchChange(''); onStatusChange('all'); onTeacherChange('all'); }}
                        className="flex items-center gap-1 text-[9px] font-black text-rose-500 hover:text-rose-700 uppercase tracking-wider transition-colors"
                    >
                        <X size={11} /> إعادة ضبط
                    </button>
                )}
            </div>

            {/* Filters Row */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">

                {/* Search */}
                <div className="relative">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">بحث</label>
                    <div className="relative">
                        <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="اسم الطالب أو المعلمة..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pr-8 pl-8 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 dark:bg-slate-900 transition-all placeholder:text-slate-300 placeholder:font-normal text-slate-700 dark:text-white"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => onSearchChange('')}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        <Filter size={9} className="inline ml-1" />
                        حالة الحصة
                    </label>
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => onStatusChange(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 dark:bg-slate-900 appearance-none cursor-pointer text-slate-700 dark:text-white transition-all"
                        >
                            <option value="all">كافة الحالات</option>
                            <option value="scheduled">مجدولة ⏳</option>
                            <option value="completed">تم الحضور 🟢</option>
                            <option value="cancelled">غياب 🔴</option>
                        </select>
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="square"/></svg>
                        </div>
                    </div>
                </div>

                {/* Teacher Filter */}
                <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        <GraduationCap size={9} className="inline ml-1" />
                        المعلمة
                    </label>
                    <div className="relative">
                        <select
                            value={filterTeacher}
                            onChange={(e) => onTeacherChange(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 dark:bg-slate-900 appearance-none cursor-pointer text-slate-700 dark:text-white transition-all"
                        >
                            <option value="all">جميع المعلمات</option>
                            {uniqueTeachers.map(teacher => (
                                <option key={teacher} value={teacher}>{teacher}</option>
                            ))}
                        </select>
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="square"/></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

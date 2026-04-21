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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm mb-10 overflow-hidden px-4 lg:px-0">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <SlidersHorizontal size={14} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-white uppercase italic tracking-tighter leading-none">محرك فلترة وتخصيص السجلات</h3>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">إعدادات العرض • ذكاء البيانات</p>
                    </div>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={() => { onSearchChange(''); onStatusChange('all'); onTeacherChange('all'); }}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white font-black text-[9px] uppercase tracking-widest transition-all italic border border-rose-500/20"
                    >
                        <X size={12} /> إعادة التعيين
                    </button>
                )}
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block italic">البحث المباشر</label>
                    <div className="relative group">
                        <Search size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="اسم الطالب، المادة العلمية..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pr-12 pl-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-indigo-600 outline-none text-xs font-black rounded-none transition-all dark:text-white uppercase italic"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block italic">تصنيف الحالة</label>
                    <div className="relative group">
                        <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                        <select
                            value={filterStatus}
                            onChange={(e) => onStatusChange(e.target.value)}
                            className="w-full pr-12 pl-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-indigo-600 outline-none text-xs font-black rounded-none transition-all dark:text-white appearance-none cursor-pointer uppercase italic"
                        >
                            <option value="all">بيانات الجلسات (الكل)</option>
                            <option value="scheduled">مجدولة ⏳</option>
                            <option value="completed">تم التنفيذ 🟢</option>
                            <option value="cancelled">إلغاء النشاط 🔴</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block italic">فرز حسب المعلمة</label>
                    <div className="relative group">
                        <GraduationCap size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                        <select
                            value={filterTeacher}
                            onChange={(e) => onTeacherChange(e.target.value)}
                            className="w-full pr-12 pl-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-indigo-600 outline-none text-xs font-black rounded-none transition-all dark:text-white appearance-none cursor-pointer uppercase italic"
                        >
                            <option value="all">كافة الكوادر التعليمية</option>
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

/* eslint-disable react-refresh/only-export-components */
import { Search, Filter, GraduationCap, X, SlidersHorizontal } from 'lucide-react';

export const DAYS_OF_WEEK = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

interface AppointmentsFiltersProps {
    searchTerm: string;
    onSearchChange: (v: string) => void;
    filterDay: string;
    onDayChange: (v: string) => void;
    filterTeacher: string;
    onTeacherChange: (v: string) => void;
    uniqueTeachers: string[];
    hasActiveFilters: boolean;
    onReset: () => void;
}

export const AppointmentsFilters = ({ searchTerm, onSearchChange, filterDay, onDayChange, filterTeacher, onTeacherChange, uniqueTeachers, hasActiveFilters, onReset }: AppointmentsFiltersProps) => (
    <div className="bg-card border border-border rounded-2xl mb-4">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-xl flex items-center justify-center bg-primary-soft">
                    <SlidersHorizontal size={12} className="text-primary" />
                </div>
                <span className="text-xs font-bold text-muted">تصفية النتائج</span>
                {hasActiveFilters && <span className="text-micro font-bold px-1.5 py-0.5 rounded-lg bg-primary-soft text-primary">نشط</span>}
            </div>
            {hasActiveFilters && (
                <button onClick={onReset}
                    className="flex items-center gap-1 px-2 py-1 text-micro font-bold rounded-xl active:scale-95 transition-all bg-error-soft text-error">
                    <X size={12} /> إعادة تعيين
                </button>
            )}
        </div>
        <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
                <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                <input type="text" aria-label="بحث" placeholder="ابحث باسم الطالب أو المادة..." value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full ps-8 pe-8 py-2 border border-border text-xs font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus bg-surface transition-all placeholder:text-muted text-main rounded-xl" />
                {searchTerm && (
                    <button onClick={() => onSearchChange('')} className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-error transition-colors" aria-label="مسح البحث">
                        <X size={11} />
                    </button>
                )}
            </div>
            <div className="relative">
                <Filter size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                <select value={filterDay} onChange={(e) => onDayChange(e.target.value)}
                    aria-label="تصفية حسب اليوم"
                    className="w-full ps-8 pe-3 py-2 border border-border text-micro font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus bg-surface appearance-none cursor-pointer text-main transition-all rounded-xl">
                    <option value="all">كل الأيام</option>
                    {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
            </div>
            <div className="relative">
                <GraduationCap size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                <select value={filterTeacher} onChange={(e) => onTeacherChange(e.target.value)}
                    aria-label="تصفية حسب المعلمة"
                    className="w-full ps-8 pe-3 py-2 border border-border text-micro font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus bg-surface appearance-none cursor-pointer text-main transition-all rounded-xl">
                    <option value="all">كل المعلمات</option>
                    {uniqueTeachers.map(teacher => <option key={teacher} value={teacher}>{teacher}</option>)}
                </select>
            </div>
        </div>
    </div>
);

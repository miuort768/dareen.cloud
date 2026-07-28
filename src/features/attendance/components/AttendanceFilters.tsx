import React from 'react';
import { Search, Filter, GraduationCap, X, SlidersHorizontal } from 'lucide-react';

export type PeriodFilter = 'today' | 'week' | 'month' | 'custom';

interface AttendanceFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterStatus: string;
    onStatusChange: (value: string) => void;
    filterTeacher: string;
    onTeacherChange: (value: string) => void;
    uniqueTeachers: string[];
    periodFilter?: PeriodFilter;
    onPeriodChange?: (value: PeriodFilter) => void;
    customStartDate?: string;
    customEndDate?: string;
    onCustomStartChange?: (value: string) => void;
    onCustomEndChange?: (value: string) => void;
}

const periodLabels: Record<PeriodFilter, string> = {
    today: 'اليوم',
    week: 'هذا الأسبوع',
    month: 'هذا الشهر',
    custom: 'فترة مخصصة'
};

export const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
    searchTerm,
    onSearchChange,
    filterStatus,
    onStatusChange,
    filterTeacher,
    onTeacherChange,
    uniqueTeachers,
    periodFilter,
    onPeriodChange,
    customStartDate,
    customEndDate,
    onCustomStartChange,
    onCustomEndChange
}) => {
    const hasActiveFilters = searchTerm || filterStatus !== 'all' || filterTeacher !== 'all';

    return (
        <div className="px-0 mb-4">
            <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary-soft text-primary">
                            <SlidersHorizontal size={14} />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-main">فلترة السجلات</h3>
                            <p className="text-micro font-bold text-muted">تخصيص عرض الجلسات</p>
                        </div>
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={() => { onSearchChange(''); onStatusChange('all'); onTeacherChange('all'); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 font-bold text-micro rounded-xl transition-all bg-error-soft text-error"
                        >
                            <X size={12} /> إعادة التعيين
                        </button>
                    )}
                </div>

                {periodFilter && onPeriodChange && (
                    <div className="mb-4 pb-4 border-b border-border">
                        <div className="flex flex-wrap items-center gap-2">
                            {(Object.keys(periodLabels) as PeriodFilter[]).map(key => (
                                <button
                                    key={key}
                                    onClick={() => onPeriodChange(key)}
                                    className={`px-3 py-1.5 text-micro font-bold rounded-xl transition-all ${periodFilter === key ? 'bg-primary text-on-primary' : 'text-muted bg-card hover:bg-surface'}`}
                                >
                                    {periodLabels[key]}
                                </button>
                            ))}
                        </div>
                        {periodFilter === 'custom' && (
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-micro font-bold text-muted">من</span>
                                    <input type="date" value={customStartDate || ''} onChange={e => onCustomStartChange?.(e.target.value)}
                                        className="px-2 py-1.5 bg-card border border-border rounded-xl text-micro font-bold outline-none focus:border-primary transition-all" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-micro font-bold text-muted">إلى</span>
                                    <input type="date" value={customEndDate || ''} onChange={e => onCustomEndChange?.(e.target.value)}
                                        className="px-2 py-1.5 bg-card border border-border rounded-xl text-micro font-bold outline-none focus:border-primary transition-all" />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            placeholder="اسم الطالب، المادة..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full ps-9 pe-3 py-2 bg-card border border-border rounded-xl text-xs font-medium focus:outline-none focus:border-primary transition-all"
                        />
                    </div>

                    <div className="relative">
                        <Filter size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                        <select
                            value={filterStatus}
                            onChange={(e) => onStatusChange(e.target.value)}
                            aria-label="تصفية حسب الحالة"
                            className="w-full ps-9 pe-3 py-2 bg-card border border-border rounded-xl text-xs font-medium focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="scheduled">مجدولة</option>
                            <option value="completed">حضور</option>
                            <option value="cancelled">غياب</option>
                        </select>
                    </div>

                    <div className="relative">
                        <GraduationCap size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                        <select
                            value={filterTeacher}
                            onChange={(e) => onTeacherChange(e.target.value)}
                            aria-label="تصفية حسب المعلمة"
                            className="w-full ps-9 pe-3 py-2 bg-card border border-border rounded-xl text-xs font-medium focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
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

import { motion } from 'framer-motion';
import { Search, GraduationCap, X, SlidersHorizontal, CalendarDays, Filter } from 'lucide-react';

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

const periodLabels: Record<PeriodFilter, { label: string; icon: React.ComponentType<{ size?: number }> }> = {
    today: { label: 'اليوم', icon: CalendarDays },
    week: { label: 'أسبوع', icon: CalendarDays },
    month: { label: 'شهر', icon: CalendarDays },
    custom: { label: 'مخصص', icon: CalendarDays },
};

export const AttendanceFilters = ({
    searchTerm, onSearchChange, filterStatus, onStatusChange, filterTeacher, onTeacherChange,
    uniqueTeachers, periodFilter, onPeriodChange, customStartDate, customEndDate,
    onCustomStartChange, onCustomEndChange,
}: AttendanceFiltersProps) => {
    const hasActiveFilters = searchTerm || filterStatus !== 'all' || filterTeacher !== 'all';

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-4">
            <div className="bg-card border border-border rounded-2xl p-3 md:p-4">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary-soft text-primary">
                            <SlidersHorizontal size={12} />
                        </div>
                        <span className="text-xs font-bold text-main">فلترة السجلات</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Segmented Control */}
                        {periodFilter && onPeriodChange && (
                            <div className="flex bg-surface rounded-lg p-0.5 gap-0.5" dir="ltr">
                                {(Object.keys(periodLabels) as PeriodFilter[]).map(key => {
                                    const isActive = periodFilter === key;
                                    return (
                                        <button key={key} onClick={() => onPeriodChange(key)}
                                            className={`relative px-2.5 py-1 text-[9px] font-bold rounded-md transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${isActive ? 'text-on-primary' : 'text-muted hover:text-main'}`}>
                                            {isActive && (
                                                <motion.div layoutId="period-pill-att"
                                                    className="absolute inset-0 bg-primary rounded-md"
                                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                />
                                            )}
                                            <span className="relative z-10">{periodLabels[key].label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        {hasActiveFilters && (
                            <button onClick={() => { onSearchChange(''); onStatusChange('all'); onTeacherChange('all'); }}
                                className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold rounded-lg transition-all bg-error-soft text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                                <X size={10} /> مسح
                            </button>
                        )}
                    </div>
                </div>

                {/* Custom date range */}
                {periodFilter === 'custom' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b border-border">
                        <span className="text-[9px] font-bold text-muted">من</span>
                        <input aria-label="تاريخ البداية" type="date" value={customStartDate || ''} onChange={e => onCustomStartChange?.(e.target.value)}
                            className="px-2 py-1.5 bg-surface border border-border rounded-lg text-[9px] font-bold outline-none focus-visible:border-primary transition-all" />
                        <span className="text-[9px] font-bold text-muted">إلى</span>
                        <input aria-label="تاريخ النهاية" type="date" value={customEndDate || ''} onChange={e => onCustomEndChange?.(e.target.value)}
                            className="px-2 py-1.5 bg-surface border border-border rounded-lg text-[9px] font-bold outline-none focus-visible:border-primary transition-all" />
                    </motion.div>
                )}

                {/* Filters row */}
                <div className="flex flex-col md:flex-row gap-2">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input aria-label="بحث بالاسم أو المادة" type="text" placeholder="اسم الطالب، المادة..."
                            value={searchTerm} onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full ps-8 pe-3 py-2 bg-surface border border-border rounded-lg text-[10px] font-medium focus-visible:outline-none focus-visible:border-primary transition-all" />
                    </div>

                    {/* Status + Teacher in one row */}
                    <div className="flex gap-2">
                        <div className="relative">
                            <Filter size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                            <select value={filterStatus} onChange={(e) => onStatusChange(e.target.value)} aria-label="تصفية حسب الحالة"
                                className="ps-8 pe-3 py-2 bg-surface border border-border rounded-lg text-[10px] font-medium focus-visible:outline-none focus-visible:border-primary transition-all appearance-none cursor-pointer">
                                <option value="all">جميع الحالات</option>
                                <option value="scheduled">مجدولة</option>
                                <option value="completed">حضور</option>
                                <option value="cancelled">غياب</option>
                            </select>
                        </div>
                        <div className="relative">
                            <GraduationCap size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                            <select value={filterTeacher} onChange={(e) => onTeacherChange(e.target.value)} aria-label="تصفية حسب المعلمة"
                                className="ps-8 pe-3 py-2 bg-surface border border-border rounded-lg text-[10px] font-medium focus-visible:outline-none focus-visible:border-primary transition-all appearance-none cursor-pointer">
                                <option value="all">كافة المعلمات</option>
                                {uniqueTeachers.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
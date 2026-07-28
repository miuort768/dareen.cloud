import { Search } from 'lucide-react';
import { DAYS_OF_WEEK } from './types';

interface AppointmentFiltersProps {
    searchTerm: string;
    onSearchChange: (v: string) => void;
    filterDay: string;
    onDayChange: (v: string) => void;
    filterTeacher: string;
    onTeacherChange: (v: string) => void;
    uniqueTeachers: string[];
}

export const AppointmentFilters = ({ searchTerm, onSearchChange, filterDay, onDayChange, filterTeacher, onTeacherChange, uniqueTeachers }: AppointmentFiltersProps) => (
    <div className="px-4 pb-2 space-y-2">
        <div className="relative">
            <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" aria-label="بحث" value={searchTerm} onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ابحث باسم الطالب أو المادة..."
                className="w-full ps-8 pe-8 py-2.5 bg-card border border-border text-xs font-bold outline-none focus:border-primary rounded-2xl transition-all placeholder:text-muted text-main" />
        </div>
        <div className="flex gap-2">
            <select value={filterDay} onChange={(e) => onDayChange(e.target.value)} aria-label="تصفية حسب اليوم"
                className="flex-1 px-3 py-2 bg-card border border-border text-micro font-bold rounded-2xl outline-none text-muted">
                <option value="all">كل الأيام</option>
                {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
            <select value={filterTeacher} onChange={(e) => onTeacherChange(e.target.value)} aria-label="تصفية حسب المعلمة"
                className="flex-1 px-3 py-2 bg-card border border-border text-micro font-bold rounded-2xl outline-none text-muted">
                <option value="all">كل المعلمات</option>
                {uniqueTeachers.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
        </div>
    </div>
);

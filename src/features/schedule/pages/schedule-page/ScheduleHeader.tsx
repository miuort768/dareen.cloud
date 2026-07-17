import { Search, Clock, Printer, CalendarDays } from 'lucide-react';
import { cn } from '../../../../lib/utils';

const DAYS_OF_WEEK = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

interface ScheduleHeaderProps {
    searchTerm: string;
    onSearchChange: (v: string) => void;
    filterDay: string;
    onDayChange: (v: string) => void;
    todayDayName: string;
    onPrint: () => void;
}

export const ScheduleHeader = ({ searchTerm, onSearchChange, filterDay, onDayChange, todayDayName, onPrint }: ScheduleHeaderProps) => (
    <div className="shadow-sm px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 rounded-2xl bg-primary">
        <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-white/15">
                <CalendarDays size={22} className="text-on-primary" />
            </div>
            <div>
                <h1 className="text-lg md:text-xl font-bold text-on-primary leading-tight">الجداول الدراسية</h1>
                <p className="text-xs font-bold text-on-primary/70 mt-0.5">جدول الحصص الأسبوعي</p>
            </div>
        </div>
        <div className="flex items-center gap-2 no-print">
            <div className="relative">
                <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-on-primary/50" />
                <input type="text" placeholder="بحث..." value={searchTerm}
                    onChange={e => onSearchChange(e.target.value)}
                    className="w-28 sm:w-36 h-9 bg-white/15 border border-white/20 text-on-primary placeholder:text-on-primary/50 text-micro font-bold rounded-xl px-8 outline-none focus:border-white/50 transition-all" />
            </div>
            <button onClick={() => onDayChange(filterDay === todayDayName ? 'all' : todayDayName)}
                className={cn("h-9 px-2.5 text-micro font-bold rounded-xl transition-all active:scale-95 flex items-center gap-1.5 border",
                    filterDay === todayDayName
                        ? "bg-white/25 border-white/30 text-on-primary"
                        : "bg-white/15 border-white/20 text-on-primary/70 hover:bg-white/25 hover:text-on-primary")}>
                <Clock size={12} />
                <span className="hidden sm:inline">اليوم</span>
            </button>
            <select value={filterDay} onChange={e => onDayChange(e.target.value)}
                className="h-9 px-2.5 bg-white/15 border border-white/20 text-on-primary text-micro font-bold rounded-xl outline-none focus:border-white/50 transition-all">
                <option value="all" className="text-main">كل الأيام</option>
                {DAYS_OF_WEEK.map(day => <option key={day} value={day} className="text-main">{day}</option>)}
            </select>
            <button onClick={onPrint}
                className="h-9 px-4 bg-white/15 border border-white/20 text-on-primary text-micro font-bold rounded-xl shadow-sm hover:bg-white/30 transition-all active:scale-95 flex items-center gap-2">
                <Printer size={13} />
                طباعة
            </button>
        </div>
    </div>
);

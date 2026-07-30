import { Search, Printer, CalendarDays, ChevronRight, ChevronLeft, GraduationCap, BookOpen } from 'lucide-react';

interface ScheduleHeaderProps {
    searchTerm: string;
    onSearchChange: (v: string) => void;
    filterDay: string;
    onDayChange: (v: string) => void;
    filterTeacher: string;
    onTeacherChange: (v: string) => void;
    filterSubject: string;
    onSubjectChange: (v: string) => void;
    uniqueTeachers: string[];
    uniqueSubjects: string[];
    todayDayName: string;
    weekLabel: string;
    onWeekChange: (direction: -1 | 1) => void;
    onPrint: () => void;
    stats: { sessions: number; teachers: number; students: number };
}

const DAYS_OF_WEEK = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

export const ScheduleHeader = ({
    searchTerm, onSearchChange, filterDay, onDayChange,
    filterTeacher, onTeacherChange, filterSubject, onSubjectChange,
    uniqueTeachers, uniqueSubjects, todayDayName,
    weekLabel, onWeekChange, onPrint, stats
}: ScheduleHeaderProps) => (
    <div className="shadow-sm px-4 md:px-6 py-4 md:py-5 flex flex-col gap-4 mb-4 rounded-2xl bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]">
            <svg width="100%" height="100%"><defs><pattern id="sch-header-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="white" /></pattern></defs><rect width="100%" height="100%" fill="url(#sch-header-grid)" /></svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Title */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 bg-white/15 ring-2 ring-white/20">
                    <CalendarDays size={20} className="text-on-primary" />
                </div>
                <div>
                    <h1 className="text-base md:text-xl font-bold text-on-primary leading-tight">الجداول الدراسية</h1>
                    <p className="text-[10px] md:text-xs font-bold text-on-primary/70 mt-0.5">جدول الحصص الأسبوعي</p>
                </div>
            </div>

            {/* Actions right side */}
            <div className="flex items-center gap-2 flex-wrap no-print">
                {/* Search */}
                <div className="relative">
                    <Search size={13} className="absolute start-2.5 top-1/2 -translate-y-1/2 text-on-primary/50" />
                    <input type="text" aria-label="بحث" placeholder="بحث..." value={searchTerm}
                        onChange={e => onSearchChange(e.target.value)}
                        className="w-24 sm:w-32 h-8 bg-white/15 border border-white/20 text-on-primary placeholder:text-on-primary/50 text-[10px] font-bold rounded-xl px-7 outline-none focus:border-white/50 transition-all" />
                </div>

                {/* Today button */}
                <button onClick={() => onDayChange(filterDay === todayDayName ? 'all' : todayDayName)}
                    className={`h-8 px-2 text-[10px] font-bold rounded-xl transition-all active:scale-95 flex items-center gap-1 border whitespace-nowrap
                        ${filterDay === todayDayName
                            ? 'bg-white/25 border-white/30 text-on-primary'
                            : 'bg-white/15 border-white/20 text-on-primary/70 hover:bg-white/25 hover:text-on-primary'}`}>
                    <CalendarDays size={11} />
                    <span className="hidden sm:inline">اليوم</span>
                </button>

                {/* Day select */}
                <select value={filterDay} onChange={e => onDayChange(e.target.value)} aria-label="اليوم"
                    className="h-8 px-2 bg-white/15 border border-white/20 text-on-primary text-[10px] font-bold rounded-xl outline-none focus:border-white/50 transition-all">
                    <option value="all" className="text-main">كل الأيام</option>
                    {DAYS_OF_WEEK.map(day => <option key={day} value={day} className="text-main">{day}</option>)}
                </select>

                {/* Print */}
                <button onClick={onPrint}
                    className="h-8 px-3 bg-white/15 border border-white/20 text-on-primary text-[10px] font-bold rounded-xl hover:bg-white/30 transition-all active:scale-95 flex items-center gap-1.5">
                    <Printer size={12} />
                </button>
            </div>
        </div>

        {/* Second row: navigation + extra filters + stats */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {/* Week navigation */}
            <div className="flex items-center gap-2">
                <button onClick={() => onWeekChange(-1)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 text-on-primary transition-all active:scale-90">
                    <ChevronRight size={14} />
                </button>
                <span className="text-[10px] font-bold text-on-primary px-2 py-1 bg-white/10 rounded-lg min-w-[90px] text-center">
                    {weekLabel}
                </span>
                <button onClick={() => onWeekChange(1)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 text-on-primary transition-all active:scale-90">
                    <ChevronLeft size={14} />
                </button>
            </div>

            {/* Summary pills */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg">
                    <CalendarDays size={10} className="text-on-primary/60" />
                    <span className="text-[9px] font-bold text-on-primary/80">{stats.sessions} حصة</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg">
                    <GraduationCap size={10} className="text-on-primary/60" />
                    <span className="text-[9px] font-bold text-on-primary/80">{stats.teachers} معلمة</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg">
                    <BookOpen size={10} className="text-on-primary/60" />
                    <span className="text-[9px] font-bold text-on-primary/80">{stats.students} طالب</span>
                </div>

                {/* Teacher filter */}
                <select value={filterTeacher} onChange={e => onTeacherChange(e.target.value)} aria-label="المعلمة"
                    className="h-7 px-2 bg-white/15 border border-white/20 text-on-primary text-[9px] font-bold rounded-lg outline-none focus:border-white/50 transition-all">
                    <option value="all" className="text-main">كل المعلمات</option>
                    {uniqueTeachers.map(t => <option key={t} value={t} className="text-main">{t}</option>)}
                </select>

                {/* Subject filter */}
                <select value={filterSubject} onChange={e => onSubjectChange(e.target.value)} aria-label="المادة"
                    className="h-7 px-2 bg-white/15 border border-white/20 text-on-primary text-[9px] font-bold rounded-lg outline-none focus:border-white/50 transition-all">
                    <option value="all" className="text-main">كل المواد</option>
                    {uniqueSubjects.map(s => <option key={s} value={s} className="text-main">{s}</option>)}
                </select>
            </div>
        </div>
    </div>
);
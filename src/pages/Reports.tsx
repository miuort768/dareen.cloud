import { Award, CheckCircle2, DollarSign, Target, LayoutDashboard, Users, TrendingUp, Calendar } from 'lucide-react';
import { Skeleton } from '../shared/components/Skeleton';
import { useReports } from '../features/reports/hooks/useReports';
import { ReportsHeader } from '../features/reports/components/ReportsHeader';
import { AcademicReport } from '../features/reports/components/AcademicReport';
import { AttendanceReport } from '../features/reports/components/AttendanceReport';
import { FinancialReport } from '../features/reports/components/FinancialReport';
import { cn } from '../lib/utils';
import type { ReportType } from '../features/reports/types';

// ── Stat card for overview ────────────────────────────────────────────────────
const OverviewCard = ({ label, value, sub, icon: Icon, gradient }: any) => (
    <div className={cn("relative overflow-hidden rounded-none p-5 flex flex-col justify-between text-white shadow-sm", gradient)}>
        <div className="absolute -left-3 -bottom-3 opacity-10"><Icon size={72} /></div>
        <div className="w-9 h-9 bg-white/15 rounded-none flex items-center justify-center mb-3">
            <Icon size={18} className="text-white" />
        </div>
        <div>
            <p className="text-2xl font-black font-mono leading-none">{value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mt-1">{label}</p>
            {sub && <p className="text-[9px] text-white/50 font-bold mt-0.5">{sub}</p>}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20" />
    </div>
);

// ── Overview quick-stat bar ────────────────────────────────────────────────────
const MiniStat = ({ label, value, color }: any) => (
    <div className="flex flex-col items-center text-center py-4 px-2">
        <p className={cn("text-xl font-black font-mono", color)}>{value}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export const Reports = () => {
    const { state, actions, filtered } = useReports();

    if (state.loading) {
        return (
            <div className="space-y-6 p-4 md:p-6">
                <Skeleton className="h-20 rounded-none" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-none" />)}
                </div>
                <Skeleton className="h-16 rounded-none" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-80 rounded-none" />
                    <Skeleton className="h-80 rounded-none" />
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard, activeGrad: 'from-slate-700 to-slate-900' },
        { id: 'academic', label: 'الأكاديمي', icon: Award, activeGrad: 'from-purple-600 to-purple-800' },
        { id: 'attendance', label: 'الحضور والغياب', icon: CheckCircle2, activeGrad: 'from-emerald-600 to-emerald-800' },
        { id: 'financial', label: 'المالي', icon: DollarSign, activeGrad: 'from-amber-500 to-orange-700' },
        { id: 'enrollment', label: 'التسجيلات', icon: Target, activeGrad: 'from-rose-600 to-rose-800' },
    ];

    const uniqueSubjects = new Set(state.subjectPieData.map(s => s.name)).size;

    return (
        <div className="space-y-4 pb-20 min-h-full bg-[#f1f5f9] dark:bg-[#020617] md:animate-in md:fade-in md:duration-700 font-sans" dir="rtl">

            <ReportsHeader onExport={() => window.print()} />

            {/* ── Tab Selection ── */}
            <div className="px-4 md:px-6 no-print">
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = state.activeReport === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => actions.setActiveReport(tab.id as ReportType)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-3 rounded-none transition-all border text-right",
                                    isActive
                                        ? `bg-gradient-to-l ${tab.activeGrad} border-transparent text-white shadow-lg`
                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300"
                                )}
                            >
                                <Icon size={14} className={isActive ? "text-white" : "text-slate-400"} />
                                <span className="text-[10px] font-black uppercase tracking-wide whitespace-nowrap">{tab.label}</span>
                                {isActive && <div className="mr-auto w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Reports Content ── */}
            <div className="px-4 md:px-6 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">

                {/* ── نظرة عامة ── */}
                {state.activeReport === 'overview' && (
                    <div className="space-y-4">
                        {/* Big stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <OverviewCard label="إجمالي الطلاب" value={state.totalStudents} sub={`${state.totalEnrollments} اشتراك نشط`} icon={Users} gradient="bg-gradient-to-br from-blue-600 to-blue-800" />
                            <OverviewCard label="الحصص المتوقعة" value={state.totalSessions} sub={`${state.completedSessions} مكتملة`} icon={Calendar} gradient="bg-gradient-to-br from-emerald-600 to-emerald-800" />
                            <OverviewCard label="نسبة الحضور" value={`${state.attendanceRate}%`} sub={`${state.cancelledSessions} غياب`} icon={TrendingUp} gradient="bg-gradient-to-br from-indigo-600 to-violet-800" />
                            <OverviewCard label="الإيرادات الكلية" value={state.totalRevenue.toLocaleString()} sub={`${state.monthRevenue.toLocaleString()} ج.م/شهر`} icon={DollarSign} gradient="bg-gradient-to-br from-amber-500 to-orange-700" />
                        </div>

                        {/* ملخص التسجيلات */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm overflow-hidden">
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                                <div className="w-8 h-8 bg-rose-600 flex items-center justify-center rounded-none">
                                    <Target size={15} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">ملخص إحصائيات التسجيلات النشطة</p>
                                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">تحليل تركز الاشتراكات الأكاديمية</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 divide-x divide-x-reverse divide-slate-100 dark:divide-slate-800">
                                <MiniStat label="إجمالي الطلاب" value={state.totalStudents} color="text-blue-600" />
                                <MiniStat label="إجمالي الاشتراكات" value={state.totalEnrollments} color="text-emerald-600" />
                                <MiniStat label="المواد الأكاديمية" value={uniqueSubjects} color="text-purple-600" />
                            </div>
                            {/* Visual bar for subjects */}
                            <div className="px-5 pb-5 pt-2">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {state.subjectPieData.slice(0, 6).map((s, i) => {
                                        const colors = ['bg-blue-500','bg-emerald-500','bg-purple-500','bg-amber-500','bg-rose-500','bg-indigo-500'];
                                        const pct = state.totalEnrollments > 0 ? Math.round((s.value / state.totalEnrollments) * 100) : 0;
                                        return (
                                            <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-none border border-slate-100 dark:border-slate-700">
                                                <div className={cn("w-1.5 h-8 rounded-none shrink-0", colors[i])} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">{s.name}</p>
                                                    <p className="text-xs font-black text-slate-900 dark:text-white font-mono">{s.value} <span className="text-[9px] text-slate-400">({pct}%)</span></p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Quick links */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {tabs.filter(t => t.id !== 'overview').map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => actions.setActiveReport(tab.id as ReportType)}
                                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-none hover:border-indigo-300 transition-all group text-right"
                                    >
                                        <Icon size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors mb-2" />
                                        <p className="text-xs font-black text-slate-700 dark:text-slate-300">{tab.label}</p>
                                        <p className="text-[9px] text-slate-400 font-bold mt-0.5 uppercase tracking-widest">عرض التقرير ←</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── الأكاديمي ── */}
                {state.activeReport === 'academic' && (
                    <AcademicReport
                        gradeBarData={state.gradeBarData}
                        subjectPieData={state.subjectPieData}
                        totalEnrollments={state.totalEnrollments}
                        totalStudents={state.totalStudents}
                        uniqueSubjects={uniqueSubjects}
                        filteredStudentProgress={filtered.studentProgress}
                        studentProgressTotal={state.studentProgressData.length}
                        searchTerm={state.searchTerm}
                        setSearchTerm={actions.setSearchTerm}
                    />
                )}

                {/* ── الحضور ── */}
                {state.activeReport === 'attendance' && (
                    <AttendanceReport
                        monthlySessionsData={state.monthlySessionsData}
                        teacherPerformanceData={state.teacherPerformanceData}
                    />
                )}

                {/* ── المالي ── */}
                {state.activeReport === 'financial' && (
                    <FinancialReport
                        totalRevenue={state.totalRevenue}
                        monthRevenue={state.monthRevenue}
                        totalExpenses={state.totalExpenses}
                        monthExpenses={state.monthExpenses}
                        completedSessions={state.completedSessions}
                    />
                )}

                {/* ── التسجيلات ── */}
                {state.activeReport === 'enrollment' && (
                    <AcademicReport
                        gradeBarData={state.gradeBarData}
                        subjectPieData={state.subjectPieData}
                        totalEnrollments={state.totalEnrollments}
                        totalStudents={state.totalStudents}
                        uniqueSubjects={uniqueSubjects}
                        filteredStudentProgress={filtered.studentProgress}
                        studentProgressTotal={state.studentProgressData.length}
                        searchTerm={state.searchTerm}
                        setSearchTerm={actions.setSearchTerm}
                    />
                )}
            </div>
        </div>
    );
};

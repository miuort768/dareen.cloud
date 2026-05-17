import { Award, CheckCircle2, DollarSign, Target, LayoutDashboard, Users, TrendingUp, Calendar } from 'lucide-react';
import { Skeleton } from '../shared/components/Skeleton';
import { useReports } from '../features/reports/hooks/useReports';
import { ReportsHeader } from '../features/reports/components/ReportsHeader';
import { AcademicReport } from '../features/reports/components/AcademicReport';
import { AttendanceReport } from '../features/reports/components/AttendanceReport';
import { FinancialReport } from '../features/reports/components/FinancialReport';
import { cn } from '../lib/utils';
import type { ReportType } from '../features/reports/types';



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
            <div className="px-0 no-print">
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
            <div className="px-0 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">

                {/* ── نظرة عامة ── */}
                {state.activeReport === 'overview' && (
                    <div className="space-y-6">
                        {/* 1. اول مستطيل (Hero Card) */}
                        <div className="relative overflow-hidden bg-slate-950 p-8 rounded-none border border-white/5 shadow-2xl">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rotate-45 translate-y-[-50%] translate-x-[30%] blur-3xl pointer-events-none" />
                             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">ملخص الأداء العام</h2>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-md">
                                        تقرير شامل يوضح الحالة الأكاديمية والمالية للمؤسسة. تم تحليل {state.totalEnrollments} اشتراك نشط عبر {uniqueSubjects} مادة مختلفة.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 bg-white/5 p-4 border border-white/10 rounded-none">
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">معدل الإنجاز</p>
                                        <p className="text-2xl font-black text-white font-mono leading-none mt-1">{state.attendanceRate}%</p>
                                    </div>
                                    <div className="w-[1px] h-10 bg-white/10 mx-2" />
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">النمو الشهري</p>
                                        <p className="text-2xl font-black text-white font-mono leading-none mt-1">+{Math.round((state.monthRevenue / (state.totalRevenue || 1)) * 100)}%</p>
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* 2. 4 أزرار (Navigation Buttons) */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {tabs.filter(t => t.id !== 'overview').map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => actions.setActiveReport(tab.id as ReportType)}
                                        className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-5 rounded-none hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity"><Icon size={48} /></div>
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-10 h-10 bg-slate-950 text-white rounded-none flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                                                <Icon size={18} />
                                            </div>
                                            <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tighter">{tab.label}</p>
                                            <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-widest">انتقال سريع</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* 3. 8 مربعات (Mini Stats Squares) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                            {[
                                { label: 'الطلاب', value: state.totalStudents, icon: Users, color: 'from-blue-600 to-blue-700' },
                                { label: 'الاشتراكات', value: state.totalEnrollments, icon: Target, color: 'from-indigo-600 to-indigo-700' },
                                { label: 'المواد', value: uniqueSubjects, icon: Award, color: 'from-purple-600 to-purple-700' },
                                { label: 'الحصص', value: state.totalSessions, icon: Calendar, color: 'from-emerald-600 to-emerald-700' },
                                { label: 'المكتملة', value: state.completedSessions, icon: CheckCircle2, color: 'from-teal-600 to-teal-700' },
                                { label: 'الإيرادات', value: Math.round(state.totalRevenue / 1000) + 'k', icon: DollarSign, color: 'from-amber-500 to-amber-600' },
                                { label: 'النمو', value: state.attendanceRate + '%', icon: TrendingUp, color: 'from-rose-600 to-rose-700' },
                                { label: 'النشطة', value: state.totalEnrollments, icon: Target, color: 'from-slate-700 to-slate-800' }
                            ].map((stat, i) => (
                                <div key={i} className={cn("relative overflow-hidden aspect-square p-3 flex flex-col justify-between text-white rounded-none shadow-md bg-gradient-to-br", stat.color)}>
                                    <div className="absolute -left-1 -bottom-1 opacity-20"><stat.icon size={24} /></div>
                                    <div className="w-6 h-6 bg-white/20 rounded-none flex items-center justify-center">
                                        <stat.icon size={12} className="text-white" />
                                    </div>
                                    <div className="mt-auto">
                                        <p className="text-[14px] font-black font-mono leading-none">{stat.value}</p>
                                        <p className="text-[8px] font-black uppercase tracking-tighter text-white/80 mt-1 truncate">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Visual Breakdown */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm p-6">
                             <div className="flex items-center justify-between mb-6">
                                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">توزيع الاشتراكات حسب المادة</h3>
                                 <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-none uppercase">Live Analysis</span>
                             </div>
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                {state.subjectPieData.slice(0, 6).map((s, i) => {
                                    const colors = ['bg-blue-600','bg-emerald-600','bg-purple-600','bg-amber-600','bg-rose-600','bg-indigo-600'];
                                    const pct = state.totalEnrollments > 0 ? Math.round((s.value / state.totalEnrollments) * 100) : 0;
                                    return (
                                        <div key={i} className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 rounded-none group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className={cn("w-2 h-2 rounded-none", colors[i])} />
                                                <p className="text-[10px] font-black font-mono text-slate-900 dark:text-white">{pct}%</p>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-500 truncate">{s.name}</p>
                                            <div className="w-full h-1 bg-slate-100 dark:bg-slate-900 rounded-none mt-1">
                                                <div className={cn("h-full", colors[i])} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                             </div>
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

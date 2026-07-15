import { Award, CheckCircle2, DollarSign, Target, LayoutDashboard, Users, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
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
                <Skeleton className="h-20" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
                </div>
                <Skeleton className="h-16" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
        { id: 'academic', label: 'الأكاديمي', icon: Award },
        { id: 'attendance', label: 'الحضور والغياب', icon: CheckCircle2 },
        { id: 'financial', label: 'المالي', icon: DollarSign },
        { id: 'enrollment', label: 'التسجيلات', icon: Target },
    ];

    const uniqueSubjects = new Set(state.subjectPieData.map(s => s.name)).size;

    const tabVariants: Record<string, { bg: string; iconBg: string; text: string }> = {
        academic: { bg: 'bg-primary-soft', iconBg: 'bg-primary-light', text: 'text-primary' },
        attendance: { bg: 'bg-success-soft', iconBg: 'bg-success-light', text: 'text-success' },
        financial: { bg: 'bg-warning-soft', iconBg: 'bg-warning-light', text: 'text-warning' },
        enrollment: { bg: 'bg-error-soft', iconBg: 'bg-error-light', text: 'text-error' },
    };

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="mx-auto px-2 space-y-4">

            <ReportsHeader onExport={() => window.print()} />

            {/* ── Tab Selection ── */}
            <div className="no-print bg-card rounded-card border border-border p-1 flex overflow-x-auto no-scrollbar gap-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = state.activeReport === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => actions.setActiveReport(tab.id as ReportType)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-micro font-normal transition-all whitespace-nowrap ${isActive ? 'bg-primary-soft text-primary shadow-soft' : 'text-muted hover:text-main'}`}
                        >
                            <Icon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── Reports Content ── */}
            <div className="px-0 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">

                {/* ── نظرة عامة ── */}
                {state.activeReport === 'overview' && (
                    <div className="space-y-6">
                        {/* Hero Card */}
                        <div className="bg-card rounded-card shadow-soft border border-border p-5 md:p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary-soft">
                                            <BarChart3 size={16} className="text-primary" />
                                        </div>
                                        <h2 className="text-base font-black text-main">ملخص الأداء العام</h2>
                                    </div>
                                    <p className="text-xs font-bold text-muted leading-relaxed max-w-md">
                                        تقرير شامل يوضح الحالة الأكاديمية والمالية للمؤسسة. تم تحليل {state.totalEnrollments} اشتراك نشط عبر {uniqueSubjects} مادة مختلفة.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-xl border bg-surface border-border">
                                    <div>
                                        <p className="text-xs font-bold text-primary">معدل الإنجاز</p>
                                        <p className="text-2xl font-black font-mono leading-none mt-1 text-main">{state.attendanceRate}%</p>
                                    </div>
                                    <div className="w-px h-10 bg-border" />
                                    <div>
                                        <p className="text-xs font-bold text-success">النمو الشهري</p>
                                        <p className="text-2xl font-black font-mono leading-none mt-1 text-main">+{Math.round((state.monthRevenue / (state.totalRevenue || 1)) * 100)}%</p>
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {tabs.filter(t => t.id !== 'overview').map((tab) => {
                                const Icon = tab.icon;
                                const v = tabVariants[tab.id] || tabVariants.academic;
                                return (
                                        <button
                                            key={tab.id}
                                            onClick={() => actions.setActiveReport(tab.id as ReportType)}
                                            className={`border-0 p-5 transition-all group rounded-card shadow-soft hover:shadow-md active:scale-95 ${v.bg}`}
                                        >
                                        <div className="flex flex-col items-center text-center">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${v.iconBg}`}>
                                                <Icon size={20} className={v.text} />
                                            </div>
                                            <p className={`text-xs font-bold ${v.text}`}>{tab.label}</p>
                                            <p className={`text-micro font-bold mt-1 ${v.text} opacity-60`}>انتقال سريع</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Mini Stats Squares */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                            {[
                                { label: 'الطلاب', value: state.totalStudents, icon: Users, color: 'var(--chart-1)' },
                                { label: 'الاشتراكات', value: state.totalEnrollments, icon: Target, color: 'var(--chart-1)' },
                                { label: 'المواد', value: uniqueSubjects, icon: Award, color: 'var(--chart-4)' },
                                { label: 'الحصص', value: state.totalSessions, icon: Calendar, color: 'var(--chart-2)' },
                                { label: 'المكتملة', value: state.completedSessions, icon: CheckCircle2, color: 'var(--chart-6)' },
                                { label: 'الإيرادات', value: Math.round(state.totalRevenue / 1000) + 'k', icon: DollarSign, color: 'var(--chart-5)' },
                                { label: 'النمو', value: state.attendanceRate + '%', icon: TrendingUp, color: 'var(--chart-3)' },
                                { label: 'النشطة', value: state.totalEnrollments, icon: Target, color: 'var(--text-muted)' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-card border border-border shadow-soft rounded-card p-3 flex flex-col justify-between aspect-square">
                                    <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 12%, transparent)` }}>
                                        <stat.icon size={14} style={{ color: stat.color }} />
                                    </div>
                                    <div className="mt-auto">
                                        <p className="text-sm font-black font-mono leading-none" style={{ color: stat.color }}>{stat.value}</p>
                                        <p className="text-micro font-bold mt-1 truncate text-muted">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Subject Distribution Cards */}
                        <div className="bg-card border border-border rounded-card shadow-soft p-5">
                             <div className="flex items-center justify-between mb-5">
                                 <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-primary-soft">
                                         <BarChart3 size={14} className="text-primary" />
                                     </div>
                                     <h3 className="text-micro font-bold text-muted">توزيع الاشتراكات حسب المادة</h3>
                                 </div>
                                 <span className="text-micro font-bold px-2 py-0.5 rounded-lg bg-success-soft text-success-dark">تحليل مباشر</span>
                             </div>
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                {state.subjectPieData.slice(0, 6).map((s, i) => {
                                    const chartColors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-3)', 'var(--chart-1)'];
                                    const color = chartColors[i];
                                    const pct = state.totalEnrollments > 0 ? Math.round((s.value / state.totalEnrollments) * 100) : 0;
                                    return (
                                        <div key={i} className="flex flex-col gap-2 p-3 rounded-card border transition-all bg-card" style={{ borderColor: `color-mix(in srgb, ${color} 25%, transparent)` }}>
                                            <div className="flex items-center justify-between">
                                                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                                                <p className="text-micro font-black font-mono" style={{ color }}>{pct}%</p>
                                            </div>
                                            <p className="text-micro font-bold text-muted truncate">{s.name}</p>
                                            <div className="w-full h-1.5 rounded-xl overflow-hidden bg-surface">
                                                <div className="h-full rounded-xl transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
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
                        reportCurrency="KWD"
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
        </div>
    );
};

import { Award, CheckCircle2, DollarSign, Target, LayoutPanelTop, RefreshCw } from 'lucide-react';
import { Skeleton } from '../shared/components/Skeleton';
import { useReports } from '../features/reports/hooks/useReports';
import { ReportsHeader } from '../features/reports/components/ReportsHeader';
import { ReportsStatsGrid } from '../features/reports/components/ReportsStatsGrid';
import { AcademicReport } from '../features/reports/components/AcademicReport';
import { AttendanceReport } from '../features/reports/components/AttendanceReport';
import { FinancialReport } from '../features/reports/components/FinancialReport';
import { cn } from '../lib/utils';

import type { ReportType } from '../features/reports/types';

// ── Reusable Styled Components ──────────────────────────────────────────────

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-4 md:p-5',
        className
    )}>
        {children}
    </div>
);

const SectionTitle = ({ icon: Icon, label, sub }: { icon: any; label: string; sub?: string }) => (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 flex items-center justify-center bg-[#eef2ff] dark:bg-indigo-900/30 rounded-xl">
            <Icon size={16} className="text-[#5c59f2]" />
        </div>
        <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
            {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

export const Reports = () => {
    const { state, actions, filtered } = useReports();

    if (state.loading) {
        return (
            <div className="space-y-6 p-4 md:p-6">
                <Skeleton className="h-20 rounded-2xl" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-2xl" />
                    ))}
                </div>
                <Skeleton className="h-16 rounded-2xl" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-80 rounded-2xl" />
                    <Skeleton className="h-80 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-20 min-h-full bg-[#f1f5f9] dark:bg-[#020617] md:animate-in md:fade-in md:duration-700 font-sans" dir="rtl">
            
            <ReportsHeader onExport={() => window.print()} />

            <div className="px-4 md:px-6">
                <ReportsStatsGrid
                    totalStudents={state.totalStudents}
                    totalEnrollments={state.totalEnrollments}
                    totalSessions={state.totalSessions}
                    completedSessions={state.completedSessions}
                    attendanceRate={state.attendanceRate}
                    cancelledSessions={state.cancelledSessions}
                    totalRevenue={state.totalRevenue}
                    monthRevenue={state.monthRevenue}
                />
            </div>

            {/* ── Report Type Selection ── */}
            <div className="px-4 md:px-6 no-print">
                <SectionCard className="p-2 md:p-2">
                    <div className="flex flex-wrap md:flex-nowrap gap-2">
                        {[
                            { id: 'academic', label: 'الأكاديمي', icon: Award, color: 'text-purple-500', bg: 'bg-purple-50' },
                            { id: 'attendance', label: 'الحضور والغياب', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            { id: 'financial', label: 'المالي العام', icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-50' },
                            { id: 'enrollment', label: 'التسجيلات', icon: Target, color: 'text-rose-500', bg: 'bg-rose-50' },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = state.activeReport === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => actions.setActiveReport(tab.id as ReportType)}
                                    className={cn(
                                        "flex-1 min-w-[100px] flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all border",
                                        isActive
                                            ? "bg-[#5c59f2] border-[#5c59f2] text-white shadow-md shadow-indigo-200 dark:shadow-none"
                                            : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                                    )}
                                >
                                    <div className={cn(
                                        "w-7 h-7 flex items-center justify-center rounded-lg shrink-0",
                                        isActive ? "bg-white/20" : tab.bg + " dark:bg-slate-700"
                                    )}>
                                        <Icon size={14} className={isActive ? "text-white" : tab.color} />
                                    </div>
                                    <span className="text-[11px] font-bold whitespace-nowrap">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </SectionCard>
            </div>

            {/* ── Reports Content ── */}
            <div className="px-4 md:px-6 transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-2">
                {state.activeReport === 'academic' && (
                    <AcademicReport
                        gradeBarData={state.gradeBarData}
                        subjectPieData={state.subjectPieData}
                        totalEnrollments={state.totalEnrollments}
                        filteredStudentProgress={filtered.studentProgress}
                        studentProgressTotal={state.studentProgressData.length}
                        searchTerm={state.searchTerm}
                        setSearchTerm={actions.setSearchTerm}
                    />
                )}

                {state.activeReport === 'attendance' && (
                    <AttendanceReport
                        monthlySessionsData={state.monthlySessionsData}
                        teacherPerformanceData={state.teacherPerformanceData}
                    />
                )}

                {state.activeReport === 'financial' && (
                    <FinancialReport
                        totalRevenue={state.totalRevenue}
                        monthRevenue={state.monthRevenue}
                        totalExpenses={state.totalExpenses}
                        monthExpenses={state.monthExpenses}
                        completedSessions={state.completedSessions}
                    />
                )}

                {state.activeReport === 'enrollment' && (
                    <div className="space-y-6">
                        <AcademicReport
                            gradeBarData={state.gradeBarData}
                            subjectPieData={state.subjectPieData}
                            totalEnrollments={state.totalEnrollments}
                            filteredStudentProgress={filtered.studentProgress}
                            studentProgressTotal={state.studentProgressData.length}
                            searchTerm={state.searchTerm}
                            setSearchTerm={actions.setSearchTerm}
                        />

                        <SectionCard>
                            <SectionTitle
                                icon={Target}
                                label="ملخص إحصائيات التسجيلات النشطة"
                                sub="تحليل تركز الاشتراكات"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {[
                                    { label: 'إجمالي الطلاب', value: state.totalStudents, sub: 'ACTIVE STUD. REGISTERED', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                                    { label: 'إجمالي الاشتراكات', value: state.totalEnrollments, sub: 'PAID SERVICE CONTRACTS', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                                    { label: 'المواد الأكاديمية', value: new Set(state.subjectPieData.map(s => s.name)).size, sub: 'DIVERSE SUBJECTS', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                                ].map((item, i) => (
                                    <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex flex-col items-center text-center">
                                        <span className={cn("text-[9px] font-bold uppercase tracking-wider mb-1", item.color)}>{item.label}</span>
                                        <span className="text-xl font-black text-slate-800 dark:text-white">{item.value}</span>
                                        <span className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{item.sub}</span>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </div>
                )}
            </div>
        </div>
    );
};

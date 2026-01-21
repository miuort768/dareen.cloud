import { Award, CheckCircle2, DollarSign, Target } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { useReports } from '../features/reports/hooks/useReports';
import { ReportsHeader } from '../features/reports/components/ReportsHeader';
import { ReportsStatsGrid } from '../features/reports/components/ReportsStatsGrid';
import { AcademicReport } from '../features/reports/components/AcademicReport';
import { AttendanceReport } from '../features/reports/components/AttendanceReport';
import { FinancialReport } from '../features/reports/components/FinancialReport';

import type { ReportType } from '../features/reports/types';

export const Reports = () => {
    const { state, actions, filtered } = useReports();

    if (state.loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-48 rounded-none" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-96 rounded-none" />
                    <Skeleton className="h-96 rounded-none" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-32">
            <ReportsHeader onExport={() => window.print()} />

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

            {/* Report Type Tabs */}
            <div className="bg-white border border-gray-200 overflow-hidden dark:bg-gray-900 dark:border-gray-800 no-print">
                <div className="flex gap-1 p-2 bg-gray-50 dark:bg-gray-800/50 overflow-x-auto">
                    {[
                        { id: 'academic', label: 'التقرير الأكاديمي', icon: Award },
                        { id: 'attendance', label: 'تقرير الحضور', icon: CheckCircle2 },
                        { id: 'financial', label: 'التقرير المالي', icon: DollarSign },
                        { id: 'enrollment', label: 'تقرير التسجيلات', icon: Target },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => actions.setActiveReport(tab.id as ReportType)}
                            className={`px-2 py-1.5 md:px-4 md:py-2 rounded-none font-bold text-[10px] md:text-sm transition-all whitespace-nowrap ${state.activeReport === tab.id
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-1.5 md:gap-2">
                                <tab.icon size={14} className="hidden md:block md:w-4 md:h-4" />
                                <span>{tab.label}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Reports Content */}
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

                    {/* Enrollment Stats summary for the enrollment tab */}
                    <div className="bg-white p-6 border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-xl">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 dark:text-white flex items-center gap-2">
                            <Target size={20} className="text-purple-600" />
                            ملخص التسجيلات
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-bold block mb-1">إجمالي الطلاب</span>
                                <span className="text-2xl font-black text-blue-700 dark:text-blue-300">{state.totalStudents}</span>
                            </div>
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block mb-1">إجمالي الاشتراكات</span>
                                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{state.totalEnrollments}</span>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                                <span className="text-xs text-purple-600 dark:text-purple-400 font-bold block mb-1">المواد المختلفة</span>
                                <span className="text-2xl font-black text-purple-700 dark:text-purple-300">{new Set(state.subjectPieData.map(s => s.name)).size}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

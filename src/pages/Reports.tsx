import { Award, CheckCircle2, DollarSign, Target, Sparkles, LayoutPanelTop } from 'lucide-react';
import { Skeleton } from '../shared/components/Skeleton';
import { useReports } from '../features/reports/hooks/useReports';
import { ReportsHeader } from '../features/reports/components/ReportsHeader';
import { ReportsStatsGrid } from '../features/reports/components/ReportsStatsGrid';
import { AcademicReport } from '../features/reports/components/AcademicReport';
import { AttendanceReport } from '../features/reports/components/AttendanceReport';
import { FinancialReport } from '../features/reports/components/FinancialReport';
import { cn } from '../lib/utils';

import type { ReportType } from '../features/reports/types';

export const Reports = () => {
    const { state, actions, filtered } = useReports();

    if (state.loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-48 rounded-none" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-none" />
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
        <div className="space-y-6 pb-20">
            <ReportsHeader onExport={() => window.print()} />

            <div className="px-1">
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

            {/* Premium Brutalist Report Tabs */}
            <div className="bg-white border-2 border-gray-950 shadow-[4px_4px_0px_0px_black] no-print mb-4">
                <div className="flex items-center gap-2 p-3 border-b-2 border-gray-950 bg-gray-50">
                    <div className="w-8 h-8 bg-gray-950 text-white flex items-center justify-center border border-gray-950 shadow-[1px_1px_0px_0px_black]">
                        <LayoutPanelTop size={16} />
                    </div>
                    <div>
                         <h3 className="text-sm font-black text-gray-950 uppercase tracking-tighter italic leading-none">تحديد نوع التقرير الفني</h3>
                         <div className="flex items-center gap-1.5 mt-0.5">
                             <div className="w-1.5 h-1.5 bg-purple-600 border border-gray-950 rounded-full animate-pulse"></div>
                             <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest italic">البيانات المتاحة للتحليل</span>
                         </div>
                    </div>
                </div>
                
                <div className="flex flex-wrap md:flex-nowrap p-3 gap-3 bg-white">
                    { [
                        { id: 'academic', label: 'الأكاديمي', icon: Award, color: 'purple' },
                        { id: 'attendance', label: 'الحضور والغياب', icon: CheckCircle2, color: 'emerald' },
                        { id: 'financial', label: 'المالي العام', icon: DollarSign, color: 'amber' },
                        { id: 'enrollment', label: 'التسجيلات', icon: Target, color: 'rose' },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => actions.setActiveReport(tab.id as ReportType)}
                                className={cn(
                                    "flex-1 min-w-[100px] px-3 py-3 border-2 transition-all flex flex-col items-center justify-center gap-1.5 group relative overflow-hidden",
                                    state.activeReport === tab.id
                                        ? "bg-gray-950 text-white border-gray-950 shadow-[2px_2px_0px_0px_#444] translate-x-0.5 translate-y-0.5 shadow-none"
                                        : "bg-white text-gray-950 border-gray-950 shadow-[4px_4px_0px_0px_black] hover:bg-gray-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                )}
                            >
                                <Icon size={16} strokeWidth={3} className={cn(
                                    "transition-transform group-hover:scale-110",
                                    state.activeReport === tab.id ? "text-white" : `text-${tab.color}-600`
                                )} />
                                <span className="text-[9px] font-black uppercase tracking-tight text-center">{tab.label}</span>
                                
                                {state.activeReport === tab.id && (
                                    <div className="absolute top-2 right-2 flex items-center gap-1">
                                        <Sparkles size={10} className="text-amber-400" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Reports Content - Enhanced Containers */}
            <div className="transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-5">
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
                    <div className="space-y-12">
                        <AcademicReport
                            gradeBarData={state.gradeBarData}
                            subjectPieData={state.subjectPieData}
                            totalEnrollments={state.totalEnrollments}
                            filteredStudentProgress={filtered.studentProgress}
                            studentProgressTotal={state.studentProgressData.length}
                            searchTerm={state.searchTerm}
                            setSearchTerm={actions.setSearchTerm}
                        />

                        {/* Premium Brutalist Enrollment Summary */}
                        <div className="bg-white border-2 border-gray-950 p-4 shadow-[4px_4px_0px_0px_black] relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-rose-600/5 -rotate-45 transform translate-x-12 -translate-y-12 pointer-events-none"></div>
                             
                            <div className="flex items-center gap-3 mb-6 border-b-2 border-gray-950 pb-3">
                                <div className="w-8 h-8 bg-rose-600 text-white flex items-center justify-center border border-gray-950 shadow-[2px_2px_0px_0px_black] transform rotate-3">
                                    <Target size={16} strokeWidth={3} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-gray-950 uppercase tracking-tighter italic">ملخص إحصائيات التسجيلات النشطة</h2>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5 italic">تحليل تركز الاشتراكات</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 border-2 border-gray-950 shadow-[3px_3px_0px_0px_black] flex flex-col items-center group hover:bg-blue-100 transition-colors">
                                    <span className="text-[8px] text-blue-700 font-black uppercase tracking-widest mb-2 italic border-b border-blue-200 pb-1">إجمالي الطلاب</span>
                                    <span className="text-2xl font-black text-gray-950 tracking-tighter italic">{state.totalStudents}</span>
                                    <div className="mt-2 text-[7px] font-black text-blue-600 uppercase tracking-widest">ACTIVE STUD. REGISTERED</div>
                                </div>
                                
                                <div className="p-4 bg-emerald-50 border-2 border-gray-950 shadow-[3px_3px_0px_0px_black] flex flex-col items-center group hover:bg-emerald-100 transition-colors">
                                    <span className="text-[8px] text-emerald-700 font-black uppercase tracking-widest mb-2 italic border-b border-emerald-200 pb-1">إجمالي الاشتراكات</span>
                                    <span className="text-2xl font-black text-gray-950 tracking-tighter italic">{state.totalEnrollments}</span>
                                    <div className="mt-2 text-[7px] font-black text-emerald-600 uppercase tracking-widest">PAID SERVICE CONTRACTS</div>
                                </div>

                                <div className="p-4 bg-purple-50 border-2 border-gray-950 shadow-[3px_3px_0px_0px_black] flex flex-col items-center group hover:bg-purple-100 transition-colors">
                                    <span className="text-[8px] text-purple-700 font-black uppercase tracking-widest mb-2 italic border-b border-purple-200 pb-1">المواد الأكاديمية</span>
                                    <span className="text-2xl font-black text-gray-950 tracking-tighter italic">{new Set(state.subjectPieData.map(s => s.name)).size}</span>
                                    <div className="mt-2 text-[7px] font-black text-purple-600 uppercase tracking-widest">DIVERSE SUBJECTS OFFERED</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

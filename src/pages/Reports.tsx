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
        { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard, activeGrad: 'from-slate-700 to-slate-900' },
        { id: 'academic', label: 'الأكاديمي', icon: Award, activeGrad: 'from-purple-600 to-purple-800' },
        { id: 'attendance', label: 'الحضور والغياب', icon: CheckCircle2, activeGrad: 'from-emerald-600 to-emerald-800' },
        { id: 'financial', label: 'المالي', icon: DollarSign, activeGrad: 'from-amber-500 to-orange-700' },
        { id: 'enrollment', label: 'التسجيلات', icon: Target, activeGrad: 'from-rose-600 to-rose-800' },
    ];

    const uniqueSubjects = new Set(state.subjectPieData.map(s => s.name)).size;

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="mx-auto px-2 space-y-4">

            <ReportsHeader onExport={() => window.print()} />

            {/* ── Tab Selection ── */}
            <div className="no-print bg-white dark:bg-slate-900 rounded-none border border-slate-100/50 dark:border-slate-800/50 p-1 flex overflow-x-auto no-scrollbar gap-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = state.activeReport === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => actions.setActiveReport(tab.id as ReportType)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-none text-[10px] font-normal transition-all whitespace-nowrap ${isActive ? 'bg-[#2563EB12] text-[#2563EB] shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
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
                        <div className="bg-white dark:bg-slate-900 rounded-none shadow-sm border border-slate-100/50 dark:border-slate-800/50 p-5 md:p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-none flex items-center justify-center" style={{ backgroundColor: '#2563EB12' }}>
                                            <BarChart3 size={16} style={{ color: '#2563EB' }} />
                                        </div>
                                        <h2 className="text-base font-black text-slate-900 dark:text-white">ملخص الأداء العام</h2>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed max-w-md">
                                        تقرير شامل يوضح الحالة الأكاديمية والمالية للمؤسسة. تم تحليل {state.totalEnrollments} اشتراك نشط عبر {uniqueSubjects} مادة مختلفة.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-none border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                    <div>
                                        <p className="text-[11px] font-bold" style={{ color: '#2563EB' }}>معدل الإنجاز</p>
                                        <p className="text-2xl font-black font-mono leading-none mt-1 text-slate-900 dark:text-white">{state.attendanceRate}%</p>
                                    </div>
                                    <div className="w-px h-10" style={{ backgroundColor: '#E2E8F0' }} />
                                    <div>
                                        <p className="text-[11px] font-bold" style={{ color: '#10B981' }}>النمو الشهري</p>
                                        <p className="text-2xl font-black font-mono leading-none mt-1 text-slate-900 dark:text-white">+{Math.round((state.monthRevenue / (state.totalRevenue || 1)) * 100)}%</p>
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {tabs.filter(t => t.id !== 'overview').map((tab) => {
                                const Icon = tab.icon;
                                const tabColors: Record<string, string> = { academic: '#8B5CF6', attendance: '#10B981', financial: '#F59E0B', enrollment: '#F43F5E' };
                                const color = tabColors[tab.id] || '#2563EB';
                                return (
                                        <button
                                            key={tab.id}
                                            onClick={() => actions.setActiveReport(tab.id as ReportType)}
                                            className="border-0 p-5 transition-all group rounded-none shadow-sm hover:shadow-md active:scale-95"
                                            style={{ backgroundColor: `${color}10` }}
                                        >
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-11 h-11 rounded-none flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${color}25` }}>
                                                <Icon size={20} style={{ color }} />
                                            </div>
                                            <p className="text-[11px] font-bold" style={{ color }}>{tab.label}</p>
                                            <p className="text-[10px] font-bold mt-1" style={{ color: `${color}aa` }}>انتقال سريع</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Mini Stats Squares */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                            {[
                                { label: 'الطلاب', value: state.totalStudents, icon: Users, color: '#2563EB' },
                                { label: 'الاشتراكات', value: state.totalEnrollments, icon: Target, color: '#2563EB' },
                                { label: 'المواد', value: uniqueSubjects, icon: Award, color: '#8B5CF6' },
                                { label: 'الحصص', value: state.totalSessions, icon: Calendar, color: '#10B981' },
                                { label: 'المكتملة', value: state.completedSessions, icon: CheckCircle2, color: '#14B8A6' },
                                { label: 'الإيرادات', value: Math.round(state.totalRevenue / 1000) + 'k', icon: DollarSign, color: '#F59E0B' },
                                { label: 'النمو', value: state.attendanceRate + '%', icon: TrendingUp, color: '#F43F5E' },
                                { label: 'النشطة', value: state.totalEnrollments, icon: Target, color: '#64748B' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm rounded-none p-3 flex flex-col justify-between aspect-square">
                                    <div className="w-7 h-7 rounded-none flex items-center justify-center" style={{ backgroundColor: `${stat.color}12` }}>
                                        <stat.icon size={14} style={{ color: stat.color }} />
                                    </div>
                                    <div className="mt-auto">
                                        <p className="text-sm font-black font-mono leading-none" style={{ color: stat.color }}>{stat.value}</p>
                                        <p className="text-[10px] font-bold mt-1 truncate text-slate-400">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Subject Distribution Cards */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 rounded-none shadow-sm p-5">
                             <div className="flex items-center justify-between mb-5">
                                 <div className="flex items-center gap-2">
                                     <div className="w-7 h-7 rounded-none flex items-center justify-center" style={{ backgroundColor: '#8B5CF612' }}>
                                         <BarChart3 size={14} style={{ color: '#8B5CF6' }} />
                                     </div>
                                     <h3 className="text-[10px] font-bold text-slate-400">توزيع الاشتراكات حسب المادة</h3>
                                 </div>
                                 <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ backgroundColor: '#10B98112', color: '#059669' }}>تحليل مباشر</span>
                             </div>
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                {state.subjectPieData.slice(0, 6).map((s, i) => {
                                    const hexColors = ['#2563EB','#10B981','#8B5CF6','#F59E0B','#F43F5E','#2563EB'];
                                    const color = hexColors[i];
                                    const pct = state.totalEnrollments > 0 ? Math.round((s.value / state.totalEnrollments) * 100) : 0;
                                    return (
                                        <div key={i} className="flex flex-col gap-2 p-3 rounded-none border transition-all" style={{ backgroundColor: `${color}08`, borderColor: `${color}15` }}>
                                            <div className="flex items-center justify-between">
                                                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                                                <p className="text-[10px] font-black font-mono" style={{ color }}>{pct}%</p>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-500 truncate">{s.name}</p>
                                            <div className="w-full h-1.5 rounded-xl overflow-hidden" style={{ backgroundColor: `${color}10` }}>
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

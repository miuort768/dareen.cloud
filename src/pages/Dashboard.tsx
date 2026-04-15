import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import { DashboardHeader } from '../features/dashboard/components/DashboardHeader';
import { DashboardStats } from '../features/dashboard/components/DashboardStats';
import { ImportantNotifications } from '../features/dashboard/components/ImportantNotifications';
import { DashboardCharts } from '../features/dashboard/components/DashboardCharts';
import { PerformanceSummary } from '../features/dashboard/components/PerformanceSummary';
import { TasksAndRequests } from '../features/dashboard/components/TasksAndRequests';
import { SessionAnalysis } from '../features/dashboard/components/SessionAnalysis';
import { TeacherAchievements } from '../features/dashboard/components/TeacherAchievements';
import { RenewalAlertsList } from '../features/dashboard/components/RenewalAlertsList';
import { SmartAlerts } from '../features/dashboard/components/SmartAlerts';
import { AnalyticsDashboard } from '../features/dashboard/components/AnalyticsDashboard';
import { ModernAnnouncements } from '../features/dashboard/components/ModernAnnouncements';
import { QuickActionsHub } from '../features/dashboard/components/QuickActionsHub';
import { RecentActivityFeed } from '../features/dashboard/components/RecentActivityFeed';
import { TeacherSessionTimeline } from '../features/dashboard/components/TeacherSessionTimeline';
import { StudentQuickBrief } from '../features/dashboard/components/StudentQuickBrief';
import { MonthlyReportPreview } from '../features/dashboard/components/MonthlyReportPreview';

export const Dashboard = () => {
    const { currentUser } = useApp();

    const {
        stats,
        monthlyData,
        lowBalanceStudents,
        tasks,
        loading,
        rawStudents,
        rawSessions,
        rawStudentInvoices
    } = useDashboardData(currentUser);

    const [briefingStudent, setBriefingStudent] = useState<any | null>(null);
    const [selectedStudentForReport, setSelectedStudentForReport] = useState<any | null>(null);

    const isTeacher = currentUser?.role === 'teacher';

    if (!currentUser || (!currentUser.permissions?.includes('*') && !currentUser.permissions?.includes('dashboard') && currentUser.role !== 'teacher')) {
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-950" />;
    }

    if (loading) {
        return (
            <div className="space-y-8 p-4 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
                <div className="h-64 bg-gray-200/50 dark:bg-slate-800 animate-pulse rounded-2xl border border-gray-100 dark:border-slate-800"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200/50 dark:bg-slate-800 animate-pulse rounded-2xl border border-gray-100 dark:border-slate-800"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-20 max-w-[1600px] mx-auto px-4" dir="rtl">
            <DashboardHeader
                isTeacher={isTeacher}
                currentUser={currentUser}
                stats={stats}
            />

            {/* Unified 12-Item Command Center (8 Stats + 4 Quick Actions) */}
            {!isTeacher && (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                    <DashboardStats stats={stats} isTeacher={false} />
                    <QuickActionsHub />
                </div>
            )}

            {/* Main Operational Layout */}
            {isTeacher ? (
                /* Teacher View (Already compact) */
                <div className="space-y-6 animate-in fade-in duration-500">
                    <DashboardStats stats={stats} isTeacher={true} />
                    <ModernAnnouncements />
                    <div className="w-full">
                        <TeacherSessionTimeline sessions={stats.todayTimeline || []} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                        <div className="lg:col-span-2">
                            <TeacherAchievements
                                stats={stats}
                                lowBalanceStudents={lowBalanceStudents}
                                isTeacher={true}
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <TasksAndRequests tasks={tasks} />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Admin Executive View (NEW: Re-Balanced & High-Density) */}
                    <div className="space-y-4">
                        
                        {/* Row 1: High-Priority Operational Metrics */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <PerformanceSummary stats={stats} isTeacher={false} />
                            <SessionAnalysis stats={stats} monthlyData={monthlyData} />
                            <TasksAndRequests tasks={tasks} />
                        </div>

                        {/* Row 2: Visual Insights & Urgent Alerts */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                            <div className="xl:col-span-8">
                                <div className="bg-white dark:bg-slate-900 border-2 border-gray-950 p-2 shadow-[4px_4px_0px_0px_black] h-full">
                                     <DashboardCharts isTeacher={false} monthlyData={monthlyData} />
                                </div>
                            </div>
                            <div className="xl:col-span-4 space-y-4">
                                <ImportantNotifications tasks={tasks} lowBalanceStudents={lowBalanceStudents} />
                                <SmartAlerts
                                    students={rawStudents}
                                    sessions={rawSessions}
                                    studentInvoices={rawStudentInvoices}
                                    lowBalanceStudents={lowBalanceStudents}
                                />
                            </div>
                        </div>

                        {/* Row 3: Deep Data Analytics (Tables - FULL WIDTH) */}
                        <div className="w-full">
                            <AnalyticsDashboard
                                students={rawStudents}
                                sessions={rawSessions}
                                monthlyData={monthlyData}
                            />
                        </div>

                        {/* Row 4: Chronology & Administrative Monitoring */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <RenewalAlertsList stats={stats} lowBalanceStudents={lowBalanceStudents} />
                                <ModernAnnouncements />
                            </div>
                            <RecentActivityFeed sessions={rawSessions} tasks={tasks} />
                        </div>
                    </div>
                </>
            )}

            {/* Suggestion 2: Quick Brief Modal */}
            {isTeacher && briefingStudent && (
                <StudentQuickBrief
                    isOpen={!!briefingStudent}
                    onClose={() => setBriefingStudent(null)}
                    onGenerateReport={(student) => {
                        setSelectedStudentForReport(student);
                        setBriefingStudent(null);
                    }}
                    student={briefingStudent}
                    enrollment={briefingStudent.enrollments?.find((e: any) => e.teacherId === currentUser.id || e.teacher === (currentUser.teacherName || currentUser.name))}
                    recentSessions={rawSessions
                        .filter(s => s.studentId === briefingStudent.id && (s.status === 'completed' || s.status === 'مكتملة'))
                        .sort((a,b) => (b.date || '').localeCompare(a.date || ''))
                        .slice(0, 3)
                        .map(s => ({
                            date: s.date,
                            topics: s.topics || 'حصة عادية',
                            rating: 'ممتاز'
                        }))
                    }
                />
            )}

            {selectedStudentForReport && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-md overflow-y-auto">
                    <div className="my-8 w-full max-w-lg">
                        <MonthlyReportPreview 
                            student={{
                                id: selectedStudentForReport.id,
                                name: selectedStudentForReport.name,
                                grade: selectedStudentForReport.grade,
                                subject: 'تحفيظ القرآن الكريم',
                                points: selectedStudentForReport.totalPoints || 0,
                                attendance: 95,
                                sessionsCompleted: rawSessions.filter(s => s.studentId === selectedStudentForReport.id && s.status === 'completed').length,
                                lastNotes: rawSessions
                                    .filter(s => s.studentId === selectedStudentForReport.id && s.topics)
                                    .slice(0, 3)
                                    .map(s => s.topics!)
                            }}
                            onShare={(p) => {
                                console.log(`Sharing via ${p}`);
                                setSelectedStudentForReport(null);
                            }}
                        />
                        <button 
                            onClick={() => setSelectedStudentForReport(null)}
                            className="mt-6 w-full py-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-100 dark:border-slate-700 font-bold text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm rounded-xl"
                        >
                            إغلاق المعاينة
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

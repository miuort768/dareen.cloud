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
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] pb-20 -mt-8 -mx-4 md:-mx-8 overflow-x-hidden" dir="rtl">
            {/* Premium Header Section */}
            <div className="relative bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 pt-12 pb-24 px-4 md:px-8">
                <DashboardHeader
                    isTeacher={isTeacher}
                    currentUser={currentUser}
                    stats={stats}
                />
            </div>

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 -mt-20 space-y-8">
                {/* Row 1: Key Statistics (Premium Floating Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardStats stats={stats} isTeacher={isTeacher} />
                </div>

                {/* Quick Command Bar */}
                {!isTeacher && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <QuickActionsHub />
                    </div>
                )}

                {/* Main Content Area */}
                {isTeacher ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <ModernAnnouncements />
                        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-slate-800 p-8 shadow-2xl shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-all duration-500">
                            <TeacherSessionTimeline sessions={stats.todayTimeline || []} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
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
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        
                        {/* Analytical Mainframe (8/12) */}
                        <div className="xl:col-span-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <PerformanceSummary stats={stats} isTeacher={false} />
                                <SessionAnalysis stats={stats} monthlyData={monthlyData} />
                            </div>

                            <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-slate-800 p-8 shadow-2xl shadow-indigo-500/5 overflow-hidden transition-all duration-500 hover:shadow-indigo-500/10">
                                <DashboardCharts isTeacher={false} monthlyData={monthlyData} />
                            </div>

                            <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-slate-800 p-2 shadow-2xl shadow-indigo-500/5 transition-all duration-500">
                                <AnalyticsDashboard
                                    students={rawStudents}
                                    sessions={rawSessions}
                                    monthlyData={monthlyData}
                                />
                            </div>
                        </div>

                        {/* Operational Sidebar (4/12) */}
                        <div className="xl:col-span-4 space-y-8">
                            <TasksAndRequests tasks={tasks} />

                            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 backdrop-blur-xl rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30 p-4 shadow-xl shadow-indigo-500/5">
                                <ImportantNotifications tasks={tasks} lowBalanceStudents={lowBalanceStudents} />
                            </div>

                            <SmartAlerts
                                students={rawStudents}
                                sessions={rawSessions}
                                studentInvoices={rawStudentInvoices}
                                lowBalanceStudents={lowBalanceStudents}
                            />

                            <div className="space-y-8">
                                <RenewalAlertsList stats={stats} lowBalanceStudents={lowBalanceStudents} />
                                <RecentActivityFeed sessions={rawSessions} tasks={tasks} />
                                <ModernAnnouncements />
                            </div>
                        </div>
                    </div>
                )}
            </div>

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

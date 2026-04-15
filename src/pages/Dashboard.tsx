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
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] pb-20 overflow-x-hidden" dir="rtl">
            {/* Premium Header Section */}
            <div className="relative pt-6 pb-20">
                <DashboardHeader
                    isTeacher={isTeacher}
                    currentUser={currentUser}
                />
            </div>

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 -mt-10 space-y-12">
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
                    <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        
                        {/* 1. Full Width Analysis Center */}
                        <div className="w-full bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-slate-800 p-8 shadow-2xl shadow-indigo-500/5">
                            <DashboardCharts isTeacher={false} monthlyData={monthlyData} />
                        </div>

                        {/* 2. Side by Side Alerts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <ImportantNotifications tasks={tasks} lowBalanceStudents={lowBalanceStudents} />
                            <SmartAlerts
                                students={rawStudents}
                                sessions={rawSessions}
                                studentInvoices={rawStudentInvoices}
                                lowBalanceStudents={lowBalanceStudents}
                            />
                        </div>

                        {/* 3. Main Analytical Grid & Sidebar */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                            {/* Main Analytical Core (8/12) */}
                            <div className="xl:col-span-8 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <PerformanceSummary stats={stats} isTeacher={false} />
                                    <SessionAnalysis stats={stats} monthlyData={monthlyData} />
                                </div>

                                <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-slate-800 p-2 shadow-2xl shadow-indigo-500/5 overflow-hidden">
                                    <AnalyticsDashboard
                                        students={rawStudents}
                                        sessions={rawSessions}
                                        monthlyData={monthlyData}
                                    />
                                </div>
                            </div>

                            {/* Operational Sidebar (4/12) */}
                            <div className="xl:col-span-4 space-y-10">
                                <TasksAndRequests tasks={tasks} />
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
                        const studentDataForReport = {
                            id: student.id,
                            name: student.name,
                            grade: student.grade,
                            subject: 'مادة عامة',
                            points: student.totalPoints || 0,
                            attendance: 95, // mock or derived
                            sessionsCompleted: 12, // mock or derived
                            lastNotes: [student.notes || 'تقدم ممتاز في المادة']
                        };
                        setSelectedStudentForReport(studentDataForReport);
                        setBriefingStudent(null);
                    }}
                    student={briefingStudent}
                    recentSessions={[]} // Pass sessions here if available
                />
            )}

            {selectedStudentForReport && (
                <MonthlyReportPreview
                    isOpen={!!selectedStudentForReport}
                    onClose={() => setSelectedStudentForReport(null)}
                    student={selectedStudentForReport}
                    onShare={(platform) => console.log('Sharing on', platform)}
                />
            )}
        </div>
    );
};

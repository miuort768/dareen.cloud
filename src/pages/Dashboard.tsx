import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import { DashboardHeader } from '../features/dashboard/components/DashboardHeader';
import { DashboardStats } from '../features/dashboard/components/DashboardStats';
import { ImportantNotifications } from '../features/dashboard/components/ImportantNotifications';
import { DashboardCharts } from '../features/dashboard/components/DashboardCharts';
import { TasksAndRequests } from '../features/dashboard/components/TasksAndRequests';
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
            <div className="space-y-4 p-4 lg:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
                <div className="h-48 bg-gray-200/50 dark:bg-slate-800 animate-pulse rounded-none border border-gray-100 dark:border-slate-800"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200/50 dark:bg-slate-800 animate-pulse rounded-none border border-gray-100 dark:border-slate-800"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#020617] pb-[120px] overflow-x-hidden text-sm" dir="rtl">
            
            {/* Modern Gradient Header */}
            <DashboardHeader
                isTeacher={isTeacher}
                currentUser={currentUser}
            />

            <div className="max-w-[1600px] mx-auto px-0 md:px-6 mt-6 space-y-6">
                
                {/* Row 1: Key Statistics (Sharp Floating Cards) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <DashboardStats stats={stats} isTeacher={isTeacher} />
                </div>

                {/* Quick Command Bar */}
                {!isTeacher && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <QuickActionsHub />
                    </div>
                )}

                {/* Main Content Area */}
                {isTeacher ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <ModernAnnouncements />

                        {/* Session Timeline Card - only shows if sessions exist */}
                        {(stats.todayTimeline || []).length > 0 && (
                            <div className="bg-white dark:bg-slate-900 border-y md:border border-slate-200 dark:border-slate-800 shadow-sm p-4">
                                <TeacherSessionTimeline sessions={stats.todayTimeline || []} />
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <TeacherAchievements
                                stats={stats}
                                lowBalanceStudents={lowBalanceStudents}
                                isTeacher={true}
                            />
                            <TasksAndRequests tasks={tasks} />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        
                        {/* 🏆 1. Announcements & Urgent Alerts (Moved to TOP of content) */}
                        <ModernAnnouncements />

                        {/* 2. Primary Operations Row: Side by Side (Alerts) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <ImportantNotifications tasks={tasks} lowBalanceStudents={lowBalanceStudents} />
                            <SmartAlerts
                                students={rawStudents}
                                sessions={rawSessions}
                                studentInvoices={rawStudentInvoices}
                                lowBalanceStudents={lowBalanceStudents}
                            />
                        </div>

                        {/* 3. Full Width Analysis Center (Charts) */}
                        <div className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <DashboardCharts isTeacher={false} monthlyData={monthlyData} />
                        </div>

                        {/* 4. The Analytical Core (Commitment, Subject Stats, Honor Roll) */}
                        <div className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                            <AnalyticsDashboard
                                students={rawStudents}
                                sessions={rawSessions}
                                monthlyData={monthlyData}
                            />
                        </div>

                        {/* 5. Secondary Operations Row: More Side-by-Side (Renewal & Activity) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <RenewalAlertsList stats={stats} lowBalanceStudents={lowBalanceStudents} />
                            <RecentActivityFeed sessions={rawSessions} tasks={tasks} />
                        </div>

                        {/* 6. Tasks & Requests (Now occupies single column area) */}
                        <div className="w-full">
                            <TasksAndRequests tasks={tasks} />
                        </div>
                    </div>
                )}
            </div>

            {/* Suggen 2: Quick Brief Modal */}
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
                            attendance: 95, 
                            sessionsCompleted: 12, 
                            lastNotes: [student.notes || 'تقدم ممتاز في المادة']
                        };
                        setSelectedStudentForReport(studentDataForReport);
                        setBriefingStudent(null);
                    }}
                    student={briefingStudent}
                    recentSessions={[]} 
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

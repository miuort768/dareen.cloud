import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import { DashboardHeader } from '../features/dashboard/components/DashboardHeader';
import { DashboardStats } from '../features/dashboard/components/DashboardStats';
import { NotificationsCenter } from '../features/dashboard/components/NotificationsCenter';
import { DashboardCharts } from '../features/dashboard/components/DashboardCharts';
import { TasksAndRequests } from '../features/dashboard/components/TasksAndRequests';
import { TeacherAchievements } from '../features/dashboard/components/TeacherAchievements';
import { OperationsDashboard } from '../features/dashboard/components/OperationsDashboard';
import { AnalyticsDashboard } from '../features/dashboard/components/AnalyticsDashboard';
import { HonorRoll } from '../features/dashboard/components/HonorRoll';
import { ModernAnnouncements } from '../features/dashboard/components/ModernAnnouncements';
import { QuickActionsHub } from '../features/dashboard/components/QuickActionsHub';
import { RecentActivityFeed } from '../features/dashboard/components/RecentActivityFeed';
import { TeacherSessionTimeline } from '../features/dashboard/components/TeacherSessionTimeline';
import { StudentQuickBrief } from '../features/dashboard/components/StudentQuickBrief';
import { MonthlyReportPreview } from '../features/dashboard/components/MonthlyReportPreview';
import { PageLoader } from '../components/ui/PageLoader';

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
        return <div className="min-h-full bg-slate-50 dark:bg-slate-950" />;
    }

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-full bg-[#f1f5f9] dark:bg-[#020617] pb-20 pt-4 overflow-x-hidden" dir="rtl">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 space-y-6">
                {/* 1. Header & Quick Actions */}
                <DashboardHeader
                    isTeacher={isTeacher}
                    currentUser={currentUser}
                />

                {!isTeacher && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <QuickActionsHub />
                    </div>
                )}

                {/* 2. Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <DashboardStats stats={stats} isTeacher={isTeacher} />
                </div>

                {/* 3. Main Content Section */}
                {isTeacher ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="lg:col-span-8 space-y-6">
                            <ModernAnnouncements />
                            
                            {(stats.todayTimeline || []).length > 0 && (
                                <TeacherSessionTimeline sessions={stats.todayTimeline || []} />
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <TeacherAchievements
                                    stats={stats}
                                    lowBalanceStudents={lowBalanceStudents}
                                    isTeacher={true}
                                />
                                <TasksAndRequests tasks={tasks} />
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            <RecentActivityFeed sessions={rawSessions} tasks={tasks} />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Urgent / Announcements Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-12">
                                <ModernAnnouncements />
                            </div>
                        </div>

                        {/* Critical Operations Center */}
                        <NotificationsCenter
                            tasks={tasks}
                            lowBalanceStudents={lowBalanceStudents}
                            students={rawStudents}
                            sessions={rawSessions}
                            studentInvoices={rawStudentInvoices}
                        />

                        {/* Data & Analytics Hub */}
                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                            <DashboardCharts isTeacher={false} monthlyData={monthlyData} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                             <AnalyticsDashboard
                                students={rawStudents}
                                sessions={rawSessions}
                                monthlyData={monthlyData}
                            />
                        </div>

                        {/* Hall of Fame */}
                        <HonorRoll students={rawStudents} />

                        {/* Integrated Operations Center (Subscriptions & Tasks) */}
                        <OperationsDashboard 
                            tasks={tasks} 
                            lowBalanceStudents={lowBalanceStudents} 
                            stats={stats} 
                        />

                        {/* Secondary Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-12">
                                <RecentActivityFeed sessions={rawSessions} tasks={tasks} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
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

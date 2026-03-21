import { Megaphone } from 'lucide-react';
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

    const isTeacher = currentUser?.role === 'teacher';

    if (!currentUser || (!currentUser.permissions?.includes('*') && !currentUser.permissions?.includes('dashboard') && currentUser.role !== 'teacher')) {
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-950" />;
    }

    if (loading) {
        return (
            <div className="space-y-8 p-4 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
                <div className="h-64 bg-gray-200 dark:bg-gray-800 border-4 border-gray-950 dark:border-gray-700"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 border-4 border-gray-950 dark:border-gray-700"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-32 max-w-[1600px] mx-auto" dir="rtl">
            <DashboardHeader
                isTeacher={isTeacher}
                currentUser={currentUser}
                stats={stats}
            />

            {/* Modern Announcements Hub */}
            <ModernAnnouncements />

            <DashboardStats stats={stats} isTeacher={isTeacher} />

            {isTeacher ? (
                <div className="space-y-8 animate-in fade-in duration-700">
                    <div className="flex items-center justify-between mb-4 border-b-2 border-gray-100 dark:border-gray-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-600 text-white shadow-lg">
                                <Megaphone size={18} />
                            </div>
                            <h2 className="text-xl font-black text-gray-950 dark:text-white uppercase tracking-tighter">مركز المعلمة الدراسي (Teacher Hub)</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                             <TeacherAchievements
                                stats={stats}
                                lowBalanceStudents={lowBalanceStudents}
                                isTeacher={true}
                            />
                        </div>
                        <TasksAndRequests tasks={tasks} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <SessionAnalysis stats={stats} monthlyData={monthlyData} />
                        <RenewalAlertsList
                            stats={stats}
                            lowBalanceStudents={lowBalanceStudents}
                        />
                    </div>

                    <div className="w-full">
                        <PerformanceSummary stats={stats} isTeacher={true} />
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Admin Specific Sharp Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <PerformanceSummary stats={stats} isTeacher={false} />
                        <TasksAndRequests tasks={tasks} />
                        <SessionAnalysis stats={stats} monthlyData={monthlyData} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ImportantNotifications
                            tasks={tasks}
                            lowBalanceStudents={lowBalanceStudents}
                        />
                        <DashboardCharts isTeacher={false} monthlyData={monthlyData} />
                    </div>

                    <SmartAlerts
                        students={rawStudents}
                        sessions={rawSessions}
                        studentInvoices={rawStudentInvoices}
                        lowBalanceStudents={lowBalanceStudents}
                    />

                    <div className="w-full">
                        <RenewalAlertsList
                            stats={stats}
                            lowBalanceStudents={lowBalanceStudents}
                        />
                    </div>

                    <div className="w-full">
                        <AnalyticsDashboard
                            students={rawStudents}
                            sessions={rawSessions}
                            monthlyData={monthlyData}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

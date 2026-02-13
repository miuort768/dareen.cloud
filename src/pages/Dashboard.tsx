import { Bell, AlertCircle, Activity } from 'lucide-react';
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


export const Dashboard = () => {
    const { currentUser } = useApp();
    // currentTime moved to DashboardHeader

    const {
        stats,
        monthlyData,
        lowBalanceStudents,
        tasks,
        loading
    } = useDashboardData(currentUser);

    const isTeacher = currentUser?.role === 'teacher';

    // The previous handleSendWhatsAppReminder function is removed as per instruction
    // The imported sendWhatsAppReminder function will be used directly where needed.

    if (!currentUser || (!currentUser.permissions?.includes('*') && !currentUser.permissions?.includes('dashboard') && currentUser.role !== 'teacher')) {
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-950" />;
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-32">
            <DashboardHeader
                isTeacher={isTeacher}
                currentUser={currentUser}
                stats={stats}
            />

            <DashboardStats stats={stats} isTeacher={isTeacher} />

            {/* General System Notes */}
            <div className="bg-gradient-to-r from-blue-50 to-primary-50 p-6 border border-blue-200 dark:from-blue-900/20 dark:to-primary-900/20 dark:border-blue-900/30">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-none dark:bg-blue-900/40">
                        <Bell className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-blue-900 dark:text-blue-200 mb-2 font-black uppercase text-sm tracking-widest">تنبيهات عامة</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {!isTeacher && stats.pendingInvoices > 0 && (
                                <div className="flex items-center gap-2 text-sm">
                                    <AlertCircle className="text-amber-600" size={18} />
                                    <span className="text-blue-800 dark:text-blue-300 font-bold">لديك <strong className="text-amber-700">{stats.pendingInvoices}</strong> فاتورة معلقة</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                                <Activity className="text-primary-600" size={18} />
                                <span className="text-blue-800 dark:text-blue-300 font-bold uppercase">النظام يعمل بكفاءة عالية</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isTeacher ? (
                <div className="space-y-6">
                    {/* Row 1: 3 Primary Squares */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <TeacherAchievements
                            stats={stats}
                            lowBalanceStudents={lowBalanceStudents}
                            isTeacher={true}
                        />
                        <TasksAndRequests tasks={tasks} />
                        <SessionAnalysis stats={stats} monthlyData={monthlyData} />
                    </div>

                    {/* Row 2: 2 Main Analysis Blocks */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DashboardCharts isTeacher={true} monthlyData={monthlyData} />
                        <RenewalAlertsList
                            stats={stats}
                            lowBalanceStudents={lowBalanceStudents}
                        />
                    </div>

                    {/* Full width bottom summary */}
                    <div className="w-full">
                        <PerformanceSummary stats={stats} isTeacher={true} />
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Row 1: 3 Primary Squares */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <PerformanceSummary stats={stats} isTeacher={false} />
                        <TasksAndRequests tasks={tasks} />
                        <SessionAnalysis stats={stats} monthlyData={monthlyData} />
                    </div>

                    {/* Row 2: 2 Main Analysis Blocks */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ImportantNotifications
                            tasks={tasks}
                            lowBalanceStudents={lowBalanceStudents}
                        />
                        <DashboardCharts isTeacher={false} monthlyData={monthlyData} />
                    </div>

                    {/* Additional Full Width Table */}
                    <div className="w-full">
                        <RenewalAlertsList
                            stats={stats}
                            lowBalanceStudents={lowBalanceStudents}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};


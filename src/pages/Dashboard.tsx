import { useApp } from '../context/AppContext';
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import { DashboardHeader } from '../features/dashboard/components/DashboardHeader';
import { DashboardStats } from '../features/dashboard/components/DashboardStats';
import { NotificationsCenter } from '../features/dashboard/components/NotificationsCenter';
import { DashboardCharts } from '../features/dashboard/components/DashboardCharts';
import { OperationsDashboard } from '../features/dashboard/components/OperationsDashboard';
import { AnalyticsDashboard } from '../features/dashboard/components/AnalyticsDashboard';
import { HonorRoll } from '../features/dashboard/components/HonorRoll';
import { ModernAnnouncements } from '../features/dashboard/components/ModernAnnouncements';
import { QuickActionsHub } from '../features/dashboard/components/QuickActionsHub';
import { RecentActivityFeed } from '../features/dashboard/components/RecentActivityFeed';
import { PageLoader } from '../components/ui/PageLoader';
import { LiveClasses } from '../components/dashboard/LiveClasses';
import { MobileAdminDashboard } from '../features/dashboard/components/MobileAdminDashboard';
import { cn } from '../lib/utils';

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

    if (!currentUser || (!currentUser.permissions?.includes('*') && !currentUser.permissions?.includes('dashboard'))) {
        return <div className="min-h-full bg-slate-50 dark:bg-slate-950" />;
    }

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className={cn(
            "min-h-full pb-20 pt-4 overflow-x-hidden relative bg-[#f1f5f9] dark:bg-[#020617]"
        )} dir="rtl">
            {/* Desktop View */}
            <div className="hidden md:block max-w-[1600px] mx-auto px-0 space-y-6">
                {/* 1. Header & Quick Actions */}
                <DashboardHeader
                    isTeacher={false}
                    currentUser={currentUser}
                />

                <QuickActionsHub />

                {/* 2. Stats Grid */}
                <DashboardStats stats={stats} isTeacher={false} />

                {/* 3. Main Content Section */}
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    {/* Urgent / Announcements Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-12">
                            <LiveClasses />
                        </div>
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
            </div>

            {/* Mobile View */}
            <div className="block md:hidden px-0">
                <MobileAdminDashboard 
                    stats={stats} 
                    lowBalanceStudents={lowBalanceStudents} 
                />
            </div>
        </div>
    );
};


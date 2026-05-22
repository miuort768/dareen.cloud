import { useCurrentUser } from '../../../context/AppContext';
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardStats } from '../components/DashboardStats';
import { NotificationsCenter } from '../components/NotificationsCenter';
import { DashboardCharts } from '../components/DashboardCharts';
import { OperationsDashboard } from '../components/OperationsDashboard';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { HonorRoll } from '../components/HonorRoll';
import { ModernAnnouncements } from '../components/ModernAnnouncements';
import { QuickActionsHub } from '../components/QuickActionsHub';
import { RecentActivityFeed } from '../components/RecentActivityFeed';
import { PageLoader } from '../../../components/ui/PageLoader';
import { LiveClasses } from '../../../components/dashboard/LiveClasses';
import { MobileAdminDashboard } from '../components/MobileAdminDashboard';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';

const Section = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={cn("relative", className)}
    >
        {children}
    </motion.section>
);

export const Dashboard = () => {
    const currentUser = useCurrentUser();

    const {
        stats,
        monthlyData,
        lowBalanceStudents,
        tasks,
        loading,
        rawStudents,
        rawSessions,
        rawStudentInvoices,
        fetchDashboardData
    } = useDashboardData(currentUser);

    if (!currentUser || (!currentUser.permissions?.includes('*') && !currentUser.permissions?.includes('dashboard'))) {
        return <div className="min-h-full bg-slate-50 dark:bg-slate-950" />;
    }

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className={cn(
            "min-h-full pb-24 overflow-x-hidden relative",
            "bg-gradient-to-br from-slate-50 via-white to-indigo-50/30",
            "dark:from-[#020617] dark:via-slate-950 dark:to-indigo-950/20"
        )} dir="rtl">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-\[0\.03\] dark:opacity-\[0\.05\] opacity-50 pointer-events-none" />

            {/* Desktop View */}
            <div className="hidden md:block max-w-[1600px] mx-auto px-6 space-y-8 relative z-10">
                {/* 1. Header */}
                <Section>
                    <DashboardHeader
                        isTeacher={false}
                        currentUser={currentUser}
                    />
                </Section>

                {/* 2. Quick Actions */}
                <Section>
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h2 className="text-sm font-medium text-slate-800 dark:text-white uppercase tracking-tight">الإجراءات السريعة</h2>
                        </div>
                        <QuickActionsHub />
                    </div>
                </Section>

                {/* 3. Stats Grid */}
                <Section>
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            </div>
                            <h2 className="text-sm font-medium text-slate-800 dark:text-white uppercase tracking-tight">مؤشرات الأداء الرئيسية</h2>
                        </div>
                        <DashboardStats stats={stats} isTeacher={false} />
                    </div>
                </Section>

                {/* 4. Main Content Sections */}
                <div className="space-y-8">
                    {/* Live Classes & Announcements */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Section className="h-full">
                            <LiveClasses />
                        </Section>
                        <Section className="h-full">
                            <ModernAnnouncements />
                        </Section>
                    </div>

                    {/* Critical Operations Center */}
                    <Section>
                        <NotificationsCenter
                            tasks={tasks}
                            lowBalanceStudents={lowBalanceStudents}
                            students={rawStudents}
                            sessions={rawSessions}
                            studentInvoices={rawStudentInvoices}
                        />
                    </Section>

                    {/* Charts & Analytics */}
                    <Section>
                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                            <DashboardCharts isTeacher={false} monthlyData={monthlyData} />
                        </div>
                    </Section>

                    <Section>
                        <AnalyticsDashboard
                            students={rawStudents}
                            sessions={rawSessions}
                            monthlyData={monthlyData}
                        />
                    </Section>

                    {/* Hall of Fame */}
                    <Section>
                        <HonorRoll students={rawStudents} />
                    </Section>

                    {/* Operations & Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Section>
                            <OperationsDashboard 
                                tasks={tasks} 
                                lowBalanceStudents={lowBalanceStudents} 
                                stats={stats} 
                            />
                        </Section>
                        <Section>
                            <RecentActivityFeed sessions={rawSessions} tasks={tasks} />
                        </Section>
                    </div>
                </div>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden px-0 pt-0">
                <MobileAdminDashboard 
                    stats={stats} 
                    lowBalanceStudents={lowBalanceStudents} 
                    onRefresh={fetchDashboardData}
                />
            </div>
        </div>
    );
};

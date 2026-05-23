import { useAuthStore } from '../../../store/authStore';
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
    const currentUser = useAuthStore(s => s.currentUser);

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
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-400/10 dark:bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="hidden md:block max-w-[1600px] mx-auto px-6 space-y-8 relative z-10">
                <Section><DashboardHeader isTeacher={false} currentUser={currentUser} /></Section>

                <Section>
                    <QuickActionsHub />
                </Section>

                <Section>
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/30">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-950">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            </div>
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white">مؤشرات الأداء الرئيسية</h2>
                        </div>
                        <DashboardStats stats={stats} isTeacher={false} />
                    </div>
                </Section>

                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Section className="h-full"><LiveClasses /></Section>
                        <Section className="h-full"><ModernAnnouncements /></Section>
                    </div>

                    <Section>
                        <NotificationsCenter
                            tasks={tasks}
                            lowBalanceStudents={lowBalanceStudents}
                            students={rawStudents}
                            sessions={rawSessions}
                            studentInvoices={rawStudentInvoices}
                        />
                    </Section>

                    <Section>
                        <DashboardCharts isTeacher={false} monthlyData={monthlyData} />
                    </Section>

                    <Section>
                        <AnalyticsDashboard students={rawStudents} sessions={rawSessions} monthlyData={monthlyData} />
                    </Section>

                    <Section>
                        <HonorRoll students={rawStudents} />
                    </Section>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Section>
                            <OperationsDashboard tasks={tasks} lowBalanceStudents={lowBalanceStudents} stats={stats} />
                        </Section>
                        <Section>
                            <RecentActivityFeed sessions={rawSessions} tasks={tasks} />
                        </Section>
                    </div>
                </div>
            </div>

            <div className="block md:hidden">
                <MobileAdminDashboard stats={stats} lowBalanceStudents={lowBalanceStudents} onRefresh={fetchDashboardData} />
            </div>
        </div>
    );
};

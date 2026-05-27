import { useAuthStore } from '../../../store/authStore';
import { useDashboardData } from '../hooks/useDashboardData';
import { ExecutiveHeroSection } from '../components/ExecutiveHeroSection';
import { SmartActionDock } from '../components/SmartActionDock';
import { SmartAlerts } from '../components/SmartAlerts';
import { AnalyticsTabs } from '../components/AnalyticsTabs';
import { HonorRoll } from '../components/HonorRoll';
import { ModernAnnouncements } from '../components/ModernAnnouncements';
import { RecentActivityFeed } from '../components/RecentActivityFeed';
import { PageLoader } from '../../../components/ui/PageLoader';
import { LiveClasses } from '../../../components/dashboard/LiveClasses';
import { OperationsDashboard } from '../components/OperationsDashboard';
import { MobileAdminDashboard } from '../components/MobileAdminDashboard';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';

const Section = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <motion.section
        initial={{ opacity: 0, filter: 'blur(8px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
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
        return <div className="min-h-full bg-[radial-gradient(circle_at_top,#EFF6FF,white_40%)] dark:bg-slate-950" />;
    }

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className={cn(
            "min-h-full pb-24 overflow-x-hidden relative",
            "bg-[radial-gradient(circle_at_top,#EFF6FF,white_40%)]",
            "dark:bg-slate-950"
        )} dir="rtl">

            <div className="hidden md:block max-w-[1600px] mx-auto px-6 space-y-6 relative z-10">
                <Section><ExecutiveHeroSection stats={stats} /></Section>
                <Section><SmartActionDock /></Section>

                <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
                    <Section className="lg:col-span-5"><LiveClasses /></Section>
                    <Section className="lg:col-span-3"><OperationsDashboard tasks={tasks} lowBalanceStudents={lowBalanceStudents} stats={stats} /></Section>
                </div>

                <Section>
                    <SmartAlerts
                        tasks={tasks}
                        lowBalanceStudents={lowBalanceStudents}
                        students={rawStudents}
                        sessions={rawSessions}
                        studentInvoices={rawStudentInvoices}
                    />
                </Section>

                <Section>
                    <AnalyticsTabs monthlyData={monthlyData} students={rawStudents} sessions={rawSessions} />
                </Section>

                <Section>
                    <HonorRoll students={rawStudents as { id: string; name: string; totalPoints?: number; avatar?: string }[]} />
                </Section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Section>
                        <ModernAnnouncements />
                    </Section>
                    <Section>
                        <RecentActivityFeed sessions={rawSessions as { id: string; studentName: string; date?: string; status?: string }[]} tasks={tasks as { id: string; title: string; dueDate?: string; status?: string }[]} />
                    </Section>
                </div>
            </div>

            <div className="block md:hidden">
                <MobileAdminDashboard stats={stats} lowBalanceStudents={lowBalanceStudents} onRefresh={fetchDashboardData} />
            </div>
        </div>
    );
};

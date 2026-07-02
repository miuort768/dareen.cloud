import { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardStats } from '../components/DashboardStats';
import { TeacherFocusList } from '../components/TeacherFocusList';
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
import { ExecutiveDashboard } from '../components/executive/ExecutiveDashboardLayout';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';
import { LayoutDashboard, TrendingUp } from 'lucide-react';

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
        focusStudents,
        tasks,
        loading,
        rawStudents,
        rawSessions,
        rawStudentInvoices,
        fetchDashboardData
    } = useDashboardData(currentUser);

    const [view, setView] = useState<'standard' | 'executive'>('standard');

    if (!currentUser || (!currentUser.permissions?.includes('*') && !currentUser.permissions?.includes('dashboard'))) {
        return <div className="min-h-full bg-background dark:bg-background" />;
    }

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className={cn(
            "min-h-full pb-24 overflow-x-hidden relative",
            "bg-background",
            "dark:bg-background"
        )} dir="rtl">

            <div className="hidden md:block max-w-[1600px] mx-auto px-6 space-y-8 relative z-10">
                <Section><DashboardHeader isTeacher={false} currentUser={currentUser} /></Section>

                {currentUser.permissions?.includes('*') && (
                    <Section>
                        <div className="flex justify-center">
                            <div className="inline-flex bg-white rounded-full shadow-[0_2px_12px_#0000000F] p-1 gap-1">
                                <button
                                    onClick={() => setView('standard')}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                        view === 'standard'
                                            ? 'bg-info text-on-primary shadow-sm'
                                            : 'text-muted hover:text-main'
                                    }`}
                                >
                                    <LayoutDashboard size={18} /> لوحة الإدارة
                                </button>
                                <button
                                    onClick={() => setView('executive')}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                        view === 'executive'
                                            ? 'bg-info text-on-primary shadow-sm'
                                            : 'text-muted hover:text-main'
                                    }`}
                                >
                                    <TrendingUp size={18} /> لوحة القيادة التنفيذية
                                </button>
                            </div>
                        </div>
                    </Section>
                )}

                {view === 'executive' ? (
                    <ExecutiveDashboard />
                ) : (
                    <>
                <Section>
                    <QuickActionsHub />
                </Section>

                <Section>
                    <DashboardStats stats={stats} isTeacher={false} />
                </Section>

                <div className="space-y-8">

                    {/* 1. غرفة البث المباشر */}
                    <Section><LiveClasses /></Section>

                    {/* 2. تجديد الاشتراكات + المهام والطلبات */}
                    <Section><OperationsDashboard tasks={tasks} lowBalanceStudents={lowBalanceStudents} stats={stats} /></Section>

                    {/* 3. مركز التنبيهات (الإخطارات الذكية + غرفة العمليات) */}
                    <Section>
                        <NotificationsCenter
                            tasks={tasks}
                            lowBalanceStudents={lowBalanceStudents}
                            students={rawStudents}
                            sessions={rawSessions}
                            studentInvoices={rawStudentInvoices}
                        />
                    </Section>

                    {/* 3.5 الطلاب ذوو الرصد المنخفض */}
                    {focusStudents && focusStudents.length > 0 && (
                        <Section>
                            <TeacherFocusList students={focusStudents} />
                        </Section>
                    )}

                    {/* 4. مركز تحليل الأداء */}
                    <Section>
                        <DashboardCharts isTeacher={false} monthlyData={monthlyData} />
                    </Section>

                    {/* 5. مركز تحليل البيانات + خارطة توزيع المناهج */}
                    <Section>
                        <AnalyticsDashboard students={rawStudents} sessions={rawSessions} monthlyData={monthlyData} />
                    </Section>

                    {/* 6. لوحة الشرف */}
                    <Section>
                        <HonorRoll students={rawStudents} />
                    </Section>

                    {/* 7. سجل النشاطات + الإعلانات */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Section>
                            <RecentActivityFeed sessions={rawSessions} tasks={tasks} />
                        </Section>
                        <Section>
                            <ModernAnnouncements />
                        </Section>
                    </div>
                </div>
                    </>
                )}
            </div>

            <div className="block md:hidden">
                <MobileAdminDashboard stats={stats} lowBalanceStudents={lowBalanceStudents} onRefresh={fetchDashboardData} />
            </div>
        </div>
    );
};

export default Dashboard;

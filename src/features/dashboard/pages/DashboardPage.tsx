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
import { RecentArticles } from '../components/RecentArticles';
import { Skeleton, SkeletonCard } from '../../../shared/components/ui';
import { LiveClasses } from '../../../components/dashboard/LiveClasses';
import { MobileAdminDashboard } from '../components/MobileAdminDashboard';
import { ExecutiveDashboard } from '../components/executive/ExecutiveDashboardLayout';
import { cn } from '../../../lib/utils';
import { LayoutDashboard, TrendingUp } from 'lucide-react';

const Section = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <section className={cn("relative animate-fadeIn", className)}>
        {children}
    </section>
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
        return (
            <div className="min-h-full bg-background pb-24" dir="rtl">
                {/* Desktop skeleton */}
                <div className="hidden md:block max-w-page mx-auto px-6 space-y-8 relative z-10">
                    <div className="flex items-center justify-between py-6">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-8 w-32 rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonCard key={`skel-${i}`} />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Skeleton className="h-80 rounded-card" />
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={`skel-${i}`} className="h-16 rounded-card" />
                            ))}
                        </div>
                    </div>
                    <Skeleton className="h-72 rounded-card" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Skeleton className="h-96 rounded-card" />
                        <Skeleton className="h-96 rounded-card" />
                    </div>
                </div>
                {/* Mobile skeleton */}
                <div className="block md:hidden px-4 pt-4 space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                        <Skeleton className="w-9 h-9 rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-36" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <SkeletonCard key={`skel-${i}`} />
                        ))}
                    </div>
                    <Skeleton className="h-40 rounded-2xl" />
                    <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={`skel-${i}`} className="h-20 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "min-h-full pb-24 overflow-x-hidden relative",
            "bg-background",
            "dark:bg-background"
        )} dir="rtl">

            <div className="hidden md:block max-w-page mx-auto px-6 space-y-8 relative z-10">
                <Section><DashboardHeader isTeacher={false} currentUser={currentUser} /></Section>

                {currentUser.permissions?.includes('*') && (
                    <Section>
                        <div className="flex justify-center">
                            <div className="inline-flex bg-card rounded-full shadow-soft p-1 gap-1">
                                <button
                                    onClick={() => setView('standard')}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                        view === 'standard'
                                            ? 'bg-info text-on-info shadow-sm'
                                            : 'text-muted hover:text-main'
                                    }`}
                                >
                                    <LayoutDashboard size={18} /> لوحة الإدارة
                                </button>
                                <button
                                    onClick={() => setView('executive')}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                        view === 'executive'
                                            ? 'bg-info text-on-info shadow-sm'
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

                    {/* 8. أحدث المقالات */}
                    <Section>
                        <RecentArticles />
                    </Section>
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

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LiveClasses } from '../../../components/dashboard/LiveClasses';
import { MobileAdminDashboard } from '../components/MobileAdminDashboard';
import { ExecutiveDashboard } from '../components/executive/ExecutiveDashboardLayout';
import { cn } from '@/lib/utils';
import { LayoutDashboard, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
    }
};

const Section = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <motion.div variants={itemVariants} className={cn("w-full", className)}>
        {children}
    </motion.div>
);

export const Dashboard = () => {
    useEffect(() => { document.title = 'لوحة التحكم | دارين السابعة للتعليم والتدريب'; }, []);
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
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-error/10 flex items-center justify-center ring-1 ring-error/20">
                        <AlertCircle size={28} className="text-error" />
                    </div>
                    <h2 className="text-lg font-bold text-main mb-2">لا تملك صلاحية الوصول</h2>
                    <p className="text-sm text-muted mb-4">ليس لديك صلاحية لعرض لوحة التحكم. يرجى التواصل مع مدير النظام.</p>
                    <Button variant="outline" size="sm" onClick={() => window.history.back()}>العودة</Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-full pb-24"
                dir="rtl"
            >
                <div className="hidden md:block max-w-page mx-auto px-6 space-y-8 relative z-10">
                    {/* Header skeleton */}
                    <Skeleton className="h-[120px] rounded-2xl" />

                    {/* View toggle skeleton */}
                    <div className="flex justify-center">
                        <Skeleton className="h-10 w-64 rounded-full" />
                    </div>

                    {/* Stats skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card key={`skel-card-${i}`} className="overflow-hidden">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <Skeleton className="h-10 w-10 rounded-xl" />
                                        <Skeleton className="h-5 w-14 rounded-full" />
                                    </div>
                                    <Skeleton className="h-8 w-24 mb-1" />
                                    <Skeleton className="h-3 w-20" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Quick actions skeleton */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card key={`skel-action-${i}`}>
                                <CardContent className="p-5">
                                    <Skeleton className="h-10 w-10 rounded-xl mb-3" />
                                    <Skeleton className="h-4 w-24 mb-1" />
                                    <Skeleton className="h-3 w-16" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Charts skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Skeleton className="h-[320px] rounded-2xl" />
                        <Skeleton className="h-[320px] rounded-2xl" />
                    </div>

                    {/* Activity skeleton */}
                    <Skeleton className="h-[240px] rounded-2xl" />
                </div>

                <div className="block md:hidden px-4 pt-4 space-y-4">
                    <Skeleton className="h-[100px] rounded-2xl" />
                    <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={`skel-mob-${i}`} className="h-24 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn(
                "min-h-full pb-24",
                "bg-background"
            )}
            dir="rtl"
        >
            <div className="hidden md:block max-w-page mx-auto px-6 space-y-6 relative z-10">
                {/* Header */}
                <Section>
                    <DashboardHeader isTeacher={false} currentUser={currentUser} />
                </Section>

                {/* View Toggle */}
                {currentUser.permissions?.includes('*') && (
                    <Section>
                        <div className="flex items-center justify-between">
                            <div />
                            <div className="inline-flex items-center bg-card border border-border/50 rounded-xl p-0.5 gap-0.5 shadow-sm">
                                <Button
                                    variant={view === 'standard' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setView('standard')}
                                    className="rounded-lg gap-1.5 h-8 text-xs"
                                >
                                    <LayoutDashboard size={14} />
                                    لوحة الإدارة
                                </Button>
                                <Button
                                    variant={view === 'executive' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setView('executive')}
                                    className="rounded-lg gap-1.5 h-8 text-xs"
                                >
                                    <TrendingUp size={14} />
                                    لوحة القيادة
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted"
                                onClick={fetchDashboardData}
                                title="تحديث البيانات"
                            >
                                <RefreshCw size={14} />
                            </Button>
                        </div>
                    </Section>
                )}

                {view === 'executive' ? (
                    <ExecutiveDashboard />
                ) : (
                    <motion.div variants={containerVariants} className="space-y-6">
                        {/* Quick Actions */}
                        <Section>
                            <QuickActionsHub />
                        </Section>

                        {/* Stats */}
                        <Section>
                            <DashboardStats stats={stats} isTeacher={false} />
                        </Section>

                        {/* Live Classes + Operations Dashboard */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Section>
                                <LiveClasses />
                            </Section>
                            <Section>
                                <OperationsDashboard
                                    tasks={tasks}
                                    lowBalanceStudents={lowBalanceStudents}
                                    stats={stats}
                                />
                            </Section>
                        </div>

                        {/* Notifications Center */}
                        <Section>
                            <NotificationsCenter
                                tasks={tasks}
                                lowBalanceStudents={lowBalanceStudents}
                                students={rawStudents}
                                sessions={rawSessions}
                                studentInvoices={rawStudentInvoices}
                            />
                        </Section>

                        {/* Focus List */}
                        {focusStudents && focusStudents.length > 0 && (
                            <Section>
                                <TeacherFocusList students={focusStudents} />
                            </Section>
                        )}

                        {/* Charts */}
                        <Section>
                            <DashboardCharts isTeacher={false} monthlyData={monthlyData} />
                        </Section>

                        {/* Analytics */}
                        <Section>
                            <AnalyticsDashboard
                                students={rawStudents}
                                sessions={rawSessions}
                                monthlyData={monthlyData}
                            />
                        </Section>

                        {/* Honor Roll */}
                        <Section>
                            <HonorRoll students={rawStudents} />
                        </Section>

                        {/* Activity + Announcements */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Section>
                                <RecentActivityFeed sessions={rawSessions} tasks={tasks} />
                            </Section>
                            <Section>
                                <ModernAnnouncements />
                            </Section>
                        </div>

                        {/* Recent Articles */}
                        <Section>
                            <RecentArticles />
                        </Section>
                    </motion.div>
                )}
            </div>

            <div className="block md:hidden">
                <MobileAdminDashboard
                    stats={stats}
                    lowBalanceStudents={lowBalanceStudents}
                    onRefresh={fetchDashboardData}
                />
            </div>
        </motion.div>
    );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../../store/authStore';
import { useDashboardData } from '../hooks/useDashboardData';
import { HeroSection } from '../components/HeroSection';
import { KPICards } from '../components/KPICards';
import { TodaysFocus } from '../components/TodaysFocus';
import { QuickActions } from '../components/QuickActions';
import { LiveSessions } from '../components/LiveSessions';
import { FinanceOverview } from '../components/FinanceOverview';
import { NotificationsCenter } from '../components/NotificationsCenter';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { SystemHealth } from '../components/SystemHealth';
import { ExecutiveDashboard } from '../components/executive/ExecutiveDashboardLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        todaySessions,
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
                <div className="hidden md:block max-w-page mx-auto px-6 space-y-6 relative z-10">
                    <Skeleton className="h-[120px] rounded-2xl" />
                    <div className="grid grid-cols-4 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card key={`skel-kpi-${i}`} className="overflow-hidden">
                                <CardContent className="p-5">
                                    <Skeleton className="h-10 w-10 rounded-xl mb-3" />
                                    <Skeleton className="h-8 w-24 mb-1" />
                                    <Skeleton className="h-3 w-20" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <Skeleton className="h-[300px] rounded-2xl" />
                        <Skeleton className="h-[300px] rounded-2xl" />
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <Skeleton className="h-[280px] rounded-2xl" />
                        <Skeleton className="h-[280px] rounded-2xl" />
                        <Skeleton className="h-[280px] rounded-2xl" />
                    </div>
                </div>

                <div className="block md:hidden px-4 pt-4 space-y-4">
                    <Skeleton className="h-[100px] rounded-2xl" />
                    <div className="flex gap-3 overflow-hidden">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={`skel-mob-${i}`} className="h-24 w-[140px] rounded-2xl shrink-0" />
                        ))}
                    </div>
                    <Skeleton className="h-[200px] rounded-2xl" />
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-full pb-24 bg-background"
            dir="rtl"
        >
            {/* Desktop */}
            <div className="hidden md:block max-w-page mx-auto px-6 space-y-6 relative z-10">
                {/* Hero */}
                <Section>
                    <HeroSection currentUser={currentUser} isTeacher={false} />
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
                        {/* KPI Cards */}
                        <Section>
                            <KPICards stats={stats} />
                        </Section>

                        {/* Quick Actions */}
                        <Section>
                            <QuickActions />
                        </Section>

                        {/* Main Grid: TodaysFocus + LiveSessions + SystemHealth */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* TodaysFocus — 4 cols */}
                            <div className="lg:col-span-4">
                                <Section>
                                    <TodaysFocus
                                        todaySessions={todaySessions}
                                        tasks={tasks}
                                        lowBalanceCount={stats.lowBalanceCount}
                                    />
                                </Section>
                            </div>

                            {/* LiveSessions — 5 cols */}
                            <div className="lg:col-span-5">
                                <Section>
                                    <LiveSessions />
                                </Section>
                            </div>

                            {/* SystemHealth — 3 cols */}
                            <div className="lg:col-span-3">
                                <Section>
                                    <SystemHealth stats={stats} />
                                </Section>
                            </div>
                        </div>

                        {/* Finance Overview — Full width */}
                        <Section>
                            <FinanceOverview monthlyData={monthlyData} />
                        </Section>

                        {/* Notifications + Activity — 2 cols */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                <ActivityTimeline sessions={rawSessions} tasks={tasks} />
                            </Section>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Mobile */}
            <div className="block md:hidden px-4 pt-4 space-y-4">
                <HeroSection currentUser={currentUser} isTeacher={false} />

                <KPICards stats={stats} />

                <QuickActions />

                <TodaysFocus
                    todaySessions={[]}
                    tasks={tasks}
                    lowBalanceCount={stats.lowBalanceCount}
                />

                <LiveSessions />

                <FinanceOverview monthlyData={monthlyData} />

                <NotificationsCenter
                    tasks={tasks}
                    lowBalanceStudents={lowBalanceStudents}
                    students={rawStudents}
                    sessions={rawSessions}
                    studentInvoices={rawStudentInvoices}
                />

                <ActivityTimeline sessions={rawSessions} tasks={tasks} />

                <SystemHealth stats={stats} />
            </div>
        </motion.div>
    );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../store/authStore';
import { useDashboardData } from '../hooks/useDashboardData';
import { HeroSection } from '../components/HeroSection';
import { KPICards } from '../components/KPICards';
import { TodaysFocus } from '../components/TodaysFocus';
import { QuickActions } from '../components/QuickActions';
import { FinanceOverview } from '../components/FinanceOverview';
import { NotificationsCenter } from '../components/NotificationsCenter';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { SystemHealth } from '../components/SystemHealth';
import { ExecutiveDashboard } from '../components/executive/ExecutiveDashboardLayout';
import { MobileDashboardView } from '../components/MobileDashboardView';
import type { DashboardTask } from '../types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const SectionDivider = () => (
    <div className="relative py-2">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-divider" />
    </div>
);

const SectionLabel = ({ label, hint }: { label: string; hint?: string }) => (
    <div className="flex items-center gap-3 mb-5">
        <span className="w-1 h-5 rounded-full bg-primary" />
        <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-bold text-main">{label}</h2>
            {hint && <span className="text-[10px] font-medium text-dim">{hint}</span>}
        </div>
        <div className="flex-1 h-px bg-divider" />
    </div>
);

const asTasks = (tasks: { status?: string }[]) => tasks as DashboardTask[];
const asRecordList = (list: unknown[]) => list as Record<string, unknown>[];
const asTimelineSessions = (list: unknown[]) =>
    list as { id: string; studentName: string; date?: string; status?: string }[];

export const Dashboard = () => {
    useEffect(() => { document.title = 'لوحة التحكم | دارين السابعة للتعليم والتدريب'; }, []);
    const currentUser = useAuthStore(s => s.currentUser);

    const {
        stats,
        todaySessions,
        monthlyData,
        lowBalanceStudents,
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
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-error-soft flex items-center justify-center">
                        <AlertCircle size={28} className="text-error" />
                    </div>
                    <h2 className="text-lg font-bold text-main mb-2">لا تملك صلاحية الوصول</h2>
                    <p className="text-sm text-muted mb-4">ليس لديك صلاحية لعرض لوحة التحكم. يرجى التواصل مع مدير النظام.</p>
                    <Button variant="outline" size="sm" onClick={() => window.history.back()}>العودة</Button>
                </div>
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            {loading ? (
                <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="min-h-full pb-24"
                    dir="rtl"
                >
                    <div className="hidden md:block max-w-page mx-auto px-6 space-y-6 relative z-10">
                        <Skeleton className="h-[180px] rounded-2xl" />
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
                            <Skeleton className="h-[280px] rounded-2xl" />
                            <Skeleton className="h-[280px] rounded-2xl" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <Skeleton className="h-[240px] rounded-2xl" />
                            <Skeleton className="h-[240px] rounded-2xl" />
                        </div>
                    </div>

                    <div className="block md:hidden px-4 pt-4 space-y-4">
                        <Skeleton className="h-[160px] rounded-2xl" />
                        <div className="flex gap-3 overflow-hidden">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={`skel-mob-${i}`} className="h-24 w-[140px] rounded-2xl shrink-0" />
                            ))}
                        </div>
                        <Skeleton className="h-[200px] rounded-2xl" />
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="content"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="min-h-full pb-24 bg-background"
                    dir="rtl"
                >
                    {/* Desktop */}
                    <div className="hidden md:block max-w-page mx-auto px-6 relative z-10">

                        {/* ── Hero ── */}
                        <div className="pt-6 pb-4 max-w-5xl mx-auto">
                            <HeroSection currentUser={currentUser} stats={stats} />
                        </div>

                        {/* ── View Toggle ── */}
                        {currentUser.permissions?.includes('*') && (
                            <div className="flex items-center justify-between mb-6">
                                <div />
                                <div className="inline-flex items-center bg-card border border-border rounded-xl p-1 gap-1 shadow-sm" role="tablist" aria-label="اختيار طريقة العرض">
                                    <button
                                        role="tab"
                                        aria-selected={view === 'standard'}
                                        onClick={() => setView('standard')}
                                        className={cn(
                                            "inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-bold transition-all duration-fast",
                                            view === 'standard'
                                                ? "bg-primary text-on-primary shadow-sm"
                                                : "text-muted hover:text-main hover:bg-hover"
                                        )}
                                    >
                                        <LayoutDashboard size={14} />
                                        لوحة الإدارة
                                    </button>
                                    <button
                                        role="tab"
                                        aria-selected={view === 'executive'}
                                        onClick={() => setView('executive')}
                                        className={cn(
                                            "inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-bold transition-all duration-fast",
                                            view === 'executive'
                                                ? "bg-primary text-on-primary shadow-sm"
                                                : "text-muted hover:text-main hover:bg-hover"
                                        )}
                                    >
                                        <TrendingUp size={14} />
                                        لوحة القيادة
                                    </button>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted"
                                    onClick={fetchDashboardData}
                                    title="تحديث البيانات"
                                    aria-label="تحديث البيانات"
                                >
                                    <RefreshCw size={14} />
                                </Button>
                            </div>
                        )}

                        {view === 'executive' ? (
                            <ExecutiveDashboard />
                        ) : (
                            <motion.div initial="hidden" animate="visible" variants={containerVariants}>

                                {/* ════════════════════════════════════════
                                    KPI Cards
                                   ════════════════════════════════════════ */}
                                <div className="mb-8">
                                    <SectionLabel label="المؤشرات الرئيسية" hint="ملخص الأداء المالي والتعليمي" />
                                    <KPICards stats={stats} />
                                </div>

                                <SectionDivider />

                                {/* ════════════════════════════════════════
                                    Chart + Performance
                                   ════════════════════════════════════════ */}
                                <div className="mb-8">
                                    <SectionLabel label="تحليل الأداء" hint="الإيرادات والمصروفات الشهرية" />
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                        <div className="lg:col-span-2">
                                            <FinanceOverview monthlyData={monthlyData} />
                                        </div>
                                        <div className="lg:col-span-1">
                                            <QuickActions />
                                        </div>
                                    </div>
                                </div>

                                <SectionDivider />

                                {/* ════════════════════════════════════════
                                    Upcoming + Notifications
                                   ════════════════════════════════════════ */}
                                <div className="mb-8">
                                    <SectionLabel label="الجدول والتنبيهات" hint="حصص اليوم والمهام والتنبيهات" />
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                        <TodaysFocus
                                            todaySessions={todaySessions}
                                            tasks={asTasks(tasks)}
                                            lowBalanceCount={stats.lowBalanceCount}
                                        />
                                        <NotificationsCenter
                                            tasks={asTasks(tasks)}
                                            lowBalanceStudents={lowBalanceStudents}
                                            students={asRecordList(rawStudents)}
                                            sessions={asRecordList(rawSessions)}
                                            studentInvoices={asRecordList(rawStudentInvoices)}
                                        />
                                    </div>
                                </div>

                                <SectionDivider />

                                {/* ════════════════════════════════════════
                                    Activity
                                   ════════════════════════════════════════ */}
                                <div className="mb-8">
                                    <SectionLabel label="النشاطات" hint="آخر العمليات والجلسات" />
                                    <ActivityTimeline sessions={asTimelineSessions(rawSessions)} tasks={asTasks(tasks)} />
                                </div>

                                <SectionDivider />

                                {/* ════════════════════════════════════════
                                    System Health
                                   ════════════════════════════════════════ */}
                                <div className="mb-8">
                                    <SectionLabel label="صحة النظام" hint="الحالة الفنية والأداء" />
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                        <SystemHealth stats={stats} />
                                        <div className="rounded-2xl bg-card border border-border shadow-sm p-5">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
                                                        <TrendingUp size={16} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-main">نظرة سريعة</h3>
                                                        <p className="text-[10px] text-muted">مؤشرات الأداء</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-4 rounded-xl bg-surface">
                                                    <p className="text-[10px] text-muted mb-1">نسبة الحضور</p>
                                                    <p className="text-xl font-bold text-main tabular-nums">{stats.attendanceRate}%</p>
                                                    <div className="mt-2 h-1.5 rounded-full bg-hover overflow-hidden">
                                                        <div className="h-full rounded-full bg-success transition-all duration-700" style={{ width: `${Math.min(100, stats.attendanceRate)}%` }} />
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-xl bg-surface">
                                                    <p className="text-[10px] text-muted mb-1">فواتير مدفوعة</p>
                                                    <p className="text-xl font-bold text-main tabular-nums">{stats.paidInvoices}</p>
                                                    <div className="mt-2 h-1.5 rounded-full bg-hover overflow-hidden">
                                                        <div className="h-full rounded-full bg-info transition-all duration-700" style={{ width: `${Math.min(100, (stats.paidInvoices / Math.max(1, stats.pendingInvoices + stats.paidInvoices)) * 100)}%` }} />
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-xl bg-surface">
                                                    <p className="text-[10px] text-muted mb-1">حصص مكتملة</p>
                                                    <p className="text-xl font-bold text-main tabular-nums">{stats.completedSessions}</p>
                                                    <div className="mt-2 h-1.5 rounded-full bg-hover overflow-hidden">
                                                        <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.min(100, stats.totalSessions > 0 ? (stats.completedSessions / stats.totalSessions) * 100 : 0)}%` }} />
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-xl bg-surface">
                                                    <p className="text-[10px] text-muted mb-1">طلاب نشطون</p>
                                                    <p className="text-xl font-bold text-main tabular-nums">{stats.studentsCount}</p>
                                                    <div className="mt-2 h-1.5 rounded-full bg-hover overflow-hidden">
                                                        <div className="h-full rounded-full bg-warning transition-all duration-700" style={{ width: `${Math.min(100, (stats.studentsCount / Math.max(1, stats.studentsCount + stats.lowBalanceCount)) * 100)}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </motion.div>
                        )}
                    </div>

                    {/* Mobile */}
                    <div className="block md:hidden">
                        <MobileDashboardView
                            currentUser={currentUser}
                            stats={stats}
                            todaySessions={todaySessions}
                            monthlyData={monthlyData}
                            lowBalanceStudents={lowBalanceStudents}
                            tasks={tasks}
                            rawStudents={rawStudents}
                            rawSessions={rawSessions}
                            rawStudentInvoices={rawStudentInvoices}
                            onRefresh={fetchDashboardData}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Dashboard;

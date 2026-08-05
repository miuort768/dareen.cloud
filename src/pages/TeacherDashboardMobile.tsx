import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, Award, Bell, LayoutDashboard, Calendar, CheckSquare, Sparkles, Wallet, ArrowLeft, Loader2, RefreshCw, User as UserIcon } from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';
import { EmptyState } from '../shared/components/ui/EmptyState';
import { cn } from '../lib/utils';
import { Card } from '@/components/ui/card';
import { GlassCard } from '@/shared/components/ui';
import { TeacherAchievements } from '../features/dashboard/components/TeacherAchievements';
import { TasksAndRequests } from '../features/dashboard/components/TasksAndRequests';
import { ModernAnnouncements } from '../features/dashboard/components/ModernAnnouncements';
import { TopAttendanceStudents } from '../features/dashboard/components/TopAttendanceStudents';
import { TeacherSessionTimeline } from '../features/dashboard/components/TeacherSessionTimeline';
import { StudentQuickBrief } from '../features/dashboard/components/StudentQuickBrief';
import { MonthlyReportPreview } from '../features/dashboard/components/MonthlyReportPreview';
import { LiveSessions } from '../features/dashboard/components/LiveSessions';
import { NextSessionHero } from '../features/dashboard/components/NextSessionHero';
import { QuickActions } from '../features/dashboard/components/QuickActions';
import { SmartNotifications } from '../features/dashboard/components/SmartNotifications';
import { FinancialSnapshot } from '../features/dashboard/components/FinancialSnapshot';
import { AttendanceChart } from '../features/dashboard/components/AttendanceChart';
import type { DashboardStats as DashboardStatsType, LowBalanceStudent, DashboardTask } from '../features/dashboard/types';
import type { User } from '../types/auth';

interface TeacherDashboardMobileProps {
    currentUser: User | null;
    stats: DashboardStatsType;
    rawSessions: unknown[];
    tasks: DashboardTask[];
    lowBalanceStudents: LowBalanceStudent[];
    focusStudents: { id: string; name: string; reason: string; type: string }[];
    timeline: { id: string; studentName: string; time: string; subject: string; status: string }[];
    onRefresh: () => void;
}

const tabs = [
    { id: 'home' as const, label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'schedule' as const, label: 'الجدول', icon: Calendar },
    { id: 'reports' as const, label: 'التقارير', icon: CheckSquare },
];

const glass = "bg-surface/80 backdrop-blur-xl border-b border-border";

export const TeacherDashboardMobile = ({ currentUser, stats, rawSessions, tasks, lowBalanceStudents, focusStudents, timeline, onRefresh }: TeacherDashboardMobileProps) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'reports'>('home');
    const handleTabChange = (tab: 'home' | 'schedule' | 'reports') => { triggerHaptic('light'); setActiveTab(tab); };
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [startY, setStartY] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleRefresh = async () => {
        triggerHaptic('medium');
        setIsRefreshing(true);
        try { await onRefresh(); } catch { void 0; }
        setTimeout(() => { setIsRefreshing(false); setPullDistance(0); setStartY(0); triggerHaptic('light'); }, 400);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        const scrollY = containerRef.current?.scrollTop ?? window.scrollY;
        if (scrollY === 0 && !isRefreshing) setStartY(e.touches[0].clientY);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY === 0 || isRefreshing) return;
        const scrollY = containerRef.current?.scrollTop ?? window.scrollY;
        if (scrollY > 0) return;
        const diff = e.touches[0].clientY - startY;
        if (diff > 0) setPullDistance(Math.min(diff * 0.4, 90));
    };
    const handleTouchEnd = async () => {
        if (pullDistance > 55) { await handleRefresh(); }
        else { setPullDistance(0); setStartY(0); }
    };
    const [briefingStudent, setBriefingStudent] = useState<{ id?: string; name?: string; grade?: string; notes?: string; totalPoints?: number } | null>(null);
    const [selectedStudentForReport, setSelectedStudentForReport] = useState<{ id: string; name: string; grade: string; subject: string; points: number; attendance: number; sessionsCompleted: number; lastNotes: string[] } | null>(null);

    const nextSession = timeline.find(s => s.status === 'scheduled' || s.status === 'in-progress');

    return (
        <div
            ref={containerRef}
            className="min-h-full pb-28 relative bg-background font-sans overflow-x-hidden"
            dir="rtl"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull to refresh indicator */}
            <motion.div
                animate={{ height: isRefreshing ? 44 : pullDistance }}
                className="overflow-hidden flex items-center justify-center"
            >
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    {isRefreshing ? (
                        <><Loader2 size={16} className="animate-spin" /><span>جاري التحديث...</span></>
                    ) : pullDistance > 40 ? (
                        <><RefreshCw size={16} className="animate-pulse" /><span>أفلت للتحديث</span></>
                    ) : (
                        <span className="text-muted">اسحب للتحديث</span>
                    )}
                </div>
            </motion.div>

            {/* Frosted Glass Header */}
            <div className={cn("sticky top-0 z-50 transition-all duration-500", glass)}>
                <div className="px-5 pt-5 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
                                <UserIcon size={18} className="text-on-primary" />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-main leading-tight">{(currentUser?.name || currentUser?.username || 'المعلم').split(' ')[0]}</h1>
                                <p className="text-[11px] font-medium text-muted">معلم</p>
                            </div>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center relative">
                            <Bell size={15} className="text-primary" />
                            <span className="absolute -top-0.5 -end-0.5 w-2 h-2 bg-error rounded-full border-2 border-surface" />
                        </div>
                    </div>
                    {/* Stats row */}
                    <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1 bg-primary-soft rounded-xl py-2.5 px-3 flex items-center gap-2 border border-primary/20">
                            <Clock size={13} className="text-primary shrink-0" />
                            <div className="flex items-baseline gap-1"><span className="text-main font-bold text-base">{stats.todaySessions || 0}</span><span className="text-muted text-[11px] font-medium">حصص</span></div>
                        </div>
                        <div className="flex-1 bg-primary-soft rounded-xl py-2.5 px-3 flex items-center gap-2 border border-primary/20">
                            <Users size={13} className="text-info shrink-0" />
                            <div className="flex items-baseline gap-1"><span className="text-main font-bold text-base">{stats.studentsCount || 0}</span><span className="text-muted text-[11px] font-medium">طلاب</span></div>
                        </div>
                        <div className="flex-1 bg-primary-soft rounded-xl py-2.5 px-3 flex items-center gap-2 border border-primary/20">
                            <Award size={13} className="text-success shrink-0" />
                            <div className="flex items-baseline gap-1"><span className="text-main font-bold text-base">{(stats.attendanceRate || 0)}%</span><span className="text-muted text-[11px] font-medium">حضور</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="px-4 pt-4 pb-4">
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                        {activeTab === 'home' && (
                            <div className="space-y-4">
                                {nextSession && (
                                    <GlassCard className="p-4">
                                        <NextSessionHero timeline={timeline} onStart={(id) => navigate(`/classroom/${id}`)} />
                                    </GlassCard>
                                )}
                                <GlassCard className="p-4">
                                    <QuickActions onStartSession={() => { if (nextSession) navigate(`/classroom/${nextSession.id}`); }} sessionAvailable={!!nextSession} />
                                </GlassCard>
                                <GlassCard className="p-4">
                                    <SmartNotifications lowBalanceStudents={lowBalanceStudents} focusStudents={focusStudents || []} />
                                </GlassCard>
                                <GlassCard className="p-4">
                                    <button onClick={() => navigate('/teacher-payment-history')}
                                        className="w-full flex items-center gap-3 py-1 text-start"
                                        aria-label="سجل الدفعات"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-success-soft flex items-center justify-center shrink-0">
                                            <Wallet size={16} className="text-success" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-main">سجل الدفعات</p>
                                            <p className="text-[10px] text-muted">عرض المدفوعات والمستحقات</p>
                                        </div>
                                        <ArrowLeft size={14} className="text-muted shrink-0" />
                                    </button>
                                </GlassCard>
                                <section>
                                    <div className="flex items-center gap-2 mb-3 px-1">
                                        <Sparkles size={14} className="text-primary" />
                                        <h2 className="text-[13px] font-bold text-main">البث المباشر</h2>
                                    </div>
                                    <Card><div className="p-3.5"><LiveSessions /></div></Card>
                                </section>
                                <section>
                                    <div className="flex items-center gap-2 mb-3 px-1">
                                        <Sparkles size={14} className="text-warning" />
                                        <h2 className="text-[13px] font-bold text-main">الإعلانات</h2>
                                    </div>
                                    <Card><div className="p-3.5"><ModernAnnouncements /></div></Card>
                                </section>
                            </div>
                        )}
                        {activeTab === 'schedule' && (
                            <div className="space-y-4">
                                {timeline.length > 0 ? (
                                    <section>
                                        <div className="flex items-center gap-2 mb-3 px-1">
                                            <Sparkles size={14} className="text-info" />
                                            <h2 className="text-[13px] font-bold text-main">حصص اليوم</h2>
                                        </div>
                                        <GlassCard className="p-4">
                                            <TeacherSessionTimeline sessions={timeline} onStudentClick={setBriefingStudent} onSessionStart={(id) => navigate(`/classroom/${id}`)} />
                                        </GlassCard>
                                    </section>
                                ) : (
                                    <EmptyState
                                    icon={Calendar}
                                    title="لا توجد حصص اليوم"
                                    subtitle="استمتع بيومك!"
                                    compact
                                />
                                )}
                            </div>
                        )}
                        {activeTab === 'reports' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <GlassCard className="p-4">
                                        <FinancialSnapshot monthNetProfit={stats.monthNetProfit} monthRevenue={stats.monthRevenue} expectedCollection={stats.expectedCollection} />
                                    </GlassCard>
                                    <GlassCard className="p-4">
                                        <AttendanceChart rate={stats.attendanceRate} />
                                    </GlassCard>
                                </div>
                                <section>
                                    <div className="flex items-center gap-2 mb-3 px-1">
                                        <Sparkles size={14} className="text-success" />
                                        <h2 className="text-[13px] font-bold text-main">الإنجازات</h2>
                                    </div>
                                    <Card><div className="p-3.5"><TeacherAchievements stats={stats} lowBalanceStudents={lowBalanceStudents} isTeacher={true} /></div></Card>
                                </section>
                                <section>
                                    <div className="flex items-center gap-2 mb-3 px-1">
                                        <Sparkles size={14} className="text-error" />
                                        <h2 className="text-[13px] font-bold text-main">المهام والطلبات</h2>
                                    </div>
                                    <Card><div className="p-3.5"><TasksAndRequests tasks={tasks} /></div></Card>
                                </section>
                                <section>
                                    <div className="flex items-center gap-2 mb-3 px-1">
                                        <Sparkles size={14} className="text-warning" />
                                        <h2 className="text-[13px] font-bold text-main">أعلى حضور</h2>
                                    </div>
                                    <Card><div className="p-3.5"><TopAttendanceStudents sessions={rawSessions} onStudentClick={setBriefingStudent} /></div></Card>
                                </section>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* iOS-style Bottom Tab Bar */}
            <div className="fixed bottom-0 inset-x-0 z-50">
                <div className="h-2 bg-background" />
                <div className="bg-card border-t border-border shadow-2xl shadow-black/5 pb-[env(safe-area-inset-bottom)]">
                    <div className="flex items-center justify-around px-2 py-1.5">
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                                    <motion.button key={tab.id} whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleTabChange(tab.id)}
                                                    className="relative flex flex-col items-center gap-0.5 py-1 px-5 min-w-[60px]"
                                >
                                    <div className={cn(
                                        "rounded-xl p-1.5 transition-all duration-300 relative",
                                        isActive && "bg-primary/10"
                                    )}>
                                        <tab.icon size={20} strokeWidth={isActive ? 2.2 : 1.5}
                                            className={cn("transition-colors duration-300", isActive ? "text-primary" : "text-muted")}
                                        />
                                    </div>
                                    <span className={cn("text-[10px] font-bold transition-all duration-300", isActive ? "text-primary" : "text-muted")}>
                                        {tab.label}
                                    </span>
                                    {isActive && (
                                        <motion.div layoutId="teacher-tab-indicator"
                                            className="absolute -top-1.5 w-8 h-1 rounded-full bg-gradient-to-r from-primary to-primary-active shadow-lg shadow-primary/30"
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {briefingStudent && (
                <StudentQuickBrief isOpen={!!briefingStudent} onClose={() => setBriefingStudent(null)}
                    onGenerateReport={(student) => {
                        const studentSessions = rawSessions.filter((s: Record<string, unknown>) => s.studentId === student.id || s.studentID === student.id);
                        const completed = studentSessions.filter((s: Record<string, unknown>) => s.status === 'completed').length;
                        const total = studentSessions.filter((s: Record<string, unknown>) => s.status === 'completed' || s.status === 'cancelled').length;
                        setSelectedStudentForReport({
                            id: student.id, name: student.name, grade: student.grade,
                            subject: student.curriculum || 'مادة عامة',
                            points: student.totalPoints || 0,
                            attendance: total > 0 ? Math.round((completed / total) * 100) : 0,
                            sessionsCompleted: completed,
                            lastNotes: [student.notes || 'تقدم ممتاز في المادة']
                        });
                        setBriefingStudent(null);
                    }}
                    student={briefingStudent} recentSessions={[]} />
            )}
            {selectedStudentForReport && (
                <MonthlyReportPreview isOpen={!!selectedStudentForReport} onClose={() => setSelectedStudentForReport(null)} student={selectedStudentForReport} onShare={() => {}} />
            )}
        </div>
    );
};
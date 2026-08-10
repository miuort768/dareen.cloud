import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { getRankByPoints, STUDENT_RANKS } from '../../shared/utils/ranks';
import { triggerHaptic } from '../../lib/haptics';
import { ParentDashboardHeader } from './ParentDashboardHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { HeroSection } from './HeroSection';
import { ChildrenCards } from './ChildrenCards';
import { TodaySummary } from './TodaySummary';
import { AcademicPerformance } from './AcademicPerformance';
import { NextSessionBanner } from './NextSessionBanner';
import { HomeworkNotes } from './HomeworkNotes';
import { AchievementsSection } from './AchievementsSection';
import { RecentActivity } from './RecentActivity';
import { ActiveTimersBanner } from './ActiveTimersBanner';
import { SupportBanner } from './SupportBanner';
import type { Student } from '../../types';
import type { PointLogEntry } from './types';

const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
});

interface ParentDashboardMobileProps {
    currentUser: { name?: string; username?: string } | null;
    adminPhone: string;
    children: Student[];
    sessions: Student[];
    allPointLogs: PointLogEntry[];
    activeTimers: Student[];
    todayTasks: { studentName: string; subject: string; teacher: string; time: string; period: string }[];
    formatTime: (startedAt: string | null | undefined) => string;
    logout: () => void;
    onRefresh: () => void;
}

export const ParentDashboardMobile = ({ currentUser, adminPhone, children, sessions, allPointLogs, activeTimers, todayTasks, formatTime, logout, onRefresh }: ParentDashboardMobileProps) => {
    const navigate = useNavigate();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [startY, setStartY] = useState(0);

    const stats = useMemo(() => {
        const completed = sessions.filter(s => s.status === 'completed').length;
        const totalRecorded = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled').length;
        const attendanceRate = totalRecorded > 0 ? Math.round((completed / totalRecorded) * 100) : 0;
        let sessionsUsed = 0, sessionsTotal = 0;
        children.forEach(c => {
            (c.enrollments || []).forEach((en: { sessionsUsed: number; sessionsTotal: number }) => {
                sessionsUsed += Number(en.sessionsUsed || 0);
                sessionsTotal += Number(en.sessionsTotal || 0);
            });
        });
        const academicProgress = sessionsTotal > 0 ? Math.round((sessionsUsed / sessionsTotal) * 100) : 0;
        return { attendanceRate, academicProgress };
    }, [sessions, children]);

    const points = allPointLogs?.reduce((sum, log) => sum + (log.points || 0), 0) || 0;
    const rank = getRankByPoints(points, STUDENT_RANKS);

    const handleRefresh = async () => {
        triggerHaptic('medium');
        setIsRefreshing(true);
        try { await onRefresh(); } catch { void 0; }
        setTimeout(() => { setIsRefreshing(false); setPullDistance(0); setStartY(0); triggerHaptic('light'); }, 400);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0 && !isRefreshing) setStartY(e.touches[0].clientY);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY === 0 || isRefreshing || window.scrollY > 0) return;
        const diff = e.touches[0].clientY - startY;
        if (diff > 0) setPullDistance(Math.min(diff * 0.4, 90));
    };
    const handleTouchEnd = async () => {
        if (pullDistance > 55) { await handleRefresh(); }
        else { setPullDistance(0); setStartY(0); }
    };

    return (
        <div
            className="min-h-screen bg-background dark:bg-black overflow-x-hidden transition-colors duration-500"
            dir="rtl"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <motion.div
                animate={{ height: isRefreshing ? 44 : pullDistance }}
                className="overflow-hidden flex items-center justify-center"
            >
                <div className="flex items-center gap-2 text-primary dark:text-[#D4AF37] font-bold text-xs">
                    {isRefreshing ? (
                        <><Loader2 size={16} className="animate-spin" /><span>جاري التحديث...</span></>
                    ) : pullDistance > 40 ? (
                        <><RefreshCw size={16} className="animate-pulse" /><span>أفلت للتحديث</span></>
                    ) : (
                        <span className="text-muted">اسحب للتحديث</span>
                    )}
                </div>
            </motion.div>

            <ParentDashboardHeader logout={logout} />

            <main className="max-w-page mx-auto px-4 pt-4 pb-28 space-y-3 md:space-y-4">
                <motion.div {...fadeUp(0)}>
                    <HeroSection
                        name={currentUser?.name || currentUser?.username || 'ولي الأمر'}
                        children={children}
                        attendanceRate={stats.attendanceRate}
                        academicProgress={stats.academicProgress}
                    />
                </motion.div>

                <motion.div {...fadeUp(0.06)}>
                    <TodaySummary sessions={sessions} children={children} todayTasks={todayTasks} />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
                    <div className="lg:col-span-2 space-y-3 md:space-y-4">
                        {activeTimers.length > 0 && (
                            <motion.div {...fadeUp(0.1)}>
                                <ActiveTimersBanner activeTimers={activeTimers} children={children} formatTime={formatTime} />
                            </motion.div>
                        )}
                        <motion.div {...fadeUp(0.12)}>
                            <NextSessionBanner todayTasks={todayTasks} />
                        </motion.div>
                        <motion.div {...fadeUp(0.16)}>
                            <ChildrenCards children={children} />
                        </motion.div>
                        <motion.div {...fadeUp(0.2)}>
                            <HomeworkNotes children={children} />
                        </motion.div>
                        {allPointLogs.length > 0 && (
                            <motion.div {...fadeUp(0.24)}>
                                <RecentActivity allPointLogs={allPointLogs} />
                            </motion.div>
                        )}
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        <motion.div {...fadeUp(0.14)}>
                            <AcademicPerformance sessions={sessions} children={children} points={points} rank={rank} />
                        </motion.div>
                        <motion.div {...fadeUp(0.18)}>
                            <AchievementsSection points={points} rank={rank} />
                        </motion.div>
                        <motion.div {...fadeUp(0.28)}>
                            <SupportBanner adminPhone={adminPhone} />
                        </motion.div>
                        <motion.div {...fadeUp(0.3)}>
                            <button onClick={() => navigate('/parent-payment-history')}
                                className="w-full bg-card dark:bg-[#0d0d0f] border border-border dark:border-[#D4AF37]/20 rounded-2xl p-4 flex items-center gap-3 hover:bg-hover dark:hover:bg-[#D4AF37]/5 transition-all duration-200 text-start hover:shadow-sm active:scale-[0.99]"
                                aria-label="سجل الدفعات"
                            >
                                <div className="w-10 h-10 rounded-xl bg-success-soft dark:bg-[#D4AF37]/15 flex items-center justify-center shrink-0">
                                    <Wallet size={18} className="text-success dark:text-[#D4AF37]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-main dark:text-white">سجل الدفعات</p>
                                    <p className="text-[11px] text-muted dark:text-zinc-400">عرض فواتير أبنائك ومدفوعاتك</p>
                                </div>
                                <ArrowLeft size={16} className="text-muted dark:text-zinc-500 shrink-0" />
                            </button>
                        </motion.div>
                    </div>
                </div>
            </main>

            <div className="block md:hidden">
                <MobileBottomNav />
            </div>
        </div>
    );
};

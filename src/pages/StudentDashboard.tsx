import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { useCurrentUser, useLogout } from '../context/AppContext';
import { getRankByPoints, getNextRank, STUDENT_RANKS } from '../shared/utils/ranks';
import { Skeleton } from '../shared/components/ui';
import { triggerHaptic } from '../lib/haptics';
import type {
    StudentDashboardData, Session, PointLog, Enrollment,
    DashboardStats, NextSession, TodayTask
} from './student-dashboard/types';
import { HeroSection } from './student-dashboard/HeroSection';
import { NextSessionCard } from './student-dashboard/NextSessionCard';
import { TodayTasks } from './student-dashboard/TodayTasks';
import { ProgressOverview } from './student-dashboard/ProgressOverview';
import { SubjectCards } from './student-dashboard/SubjectCards';
import { ContinueLearning } from './student-dashboard/ContinueLearning';
import { InvoicesCard } from './student-dashboard/InvoicesCard';
import { AchievementsSection } from './student-dashboard/AchievementsSection';
import { RecentActivity } from './student-dashboard/RecentActivity';
import { StudentDashboardHeader } from './student-dashboard/StudentDashboardHeader';
import { MobileBottomNav } from './student-dashboard/MobileBottomNav';

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
});

export const StudentDashboard = () => {
    useEffect(() => { document.title = 'لوحة تحكم الطالب | دارين السابعة للتعليم والتدريب'; }, []);
    const currentUser = useCurrentUser();
    const logout = useLogout();

    const [studentData, setStudentData] = useState<StudentDashboardData | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [pointLogs, setPointLogs] = useState<PointLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [startY, setStartY] = useState(0);

    const fetchAll = async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            const [meRes, sessionsRes, logsRes] = await Promise.all([
                api.get<StudentDashboardData>('/student-portal/me'),
                api.get<Session[]>('/student-portal/me/sessions'),
                api.get<PointLog[]>('/student-portal/me/points-log'),
            ]);
            setStudentData(meRes);
            setSessions(sessionsRes);
            setPointLogs(logsRes);
        } catch (error) {
            console.error('Error fetching student dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.role === 'student') fetchAll();
    }, [currentUser]);

    const enrollments = useMemo(() => studentData?.enrollments || [], [studentData?.enrollments]);
    const points = studentData?.totalPoints || 0;
    const rank = getRankByPoints(points, STUDENT_RANKS);
    const nextRank = getNextRank(points, STUDENT_RANKS);

    const stats = useMemo<DashboardStats>(() => {
        const totalAttendance = sessions.filter(s => s.status === 'completed').length;
        const totalAbsence = sessions.filter(s => s.status === 'cancelled').length;
        const totalRecorded = totalAttendance + totalAbsence;
        let sessionsUsed = 0, sessionsTotal = 0;
        enrollments.forEach((en: Enrollment) => {
            sessionsUsed += Number(en.sessionsUsed || 0);
            sessionsTotal += Number(en.sessionsTotal || 0);
        });
        return {
            sessionsUsed, sessionsTotal, totalAttendance, totalAbsence,
            attendanceRate: totalRecorded > 0 ? Math.round((totalAttendance / totalRecorded) * 100) : 0,
            curriculumProgress: sessionsTotal > 0 ? Math.round((sessionsUsed / sessionsTotal) * 100) : 0,
        };
    }, [sessions, enrollments]);

    const todayDay = ARABIC_DAYS[new Date().getDay()];

    const nextSession = useMemo<NextSession | null>(() => {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        let closest: NextSession | null = null;
        let minDiff = Infinity;

        enrollments.forEach((en: Enrollment) => {
            (en.schedule || []).forEach((slot) => {
                if (slot.day === todayDay) {
                    const [h, m] = (slot.hour || '0:0').split(':').map(Number);
                    const diff = ((h || 0) * 60 + (m || 0)) - nowMinutes;
                    if (diff > 0 && diff < minDiff) {
                        minDiff = diff;
                        closest = {
                            subject: en.subject || 'دورة',
                            teacher: en.teacherName || en.teacher || '',
                            time: slot.hour || '',
                            hour: slot.hour || '',
                            day: slot.day,
                            enrollment: en,
                        };
                    }
                }
            });
        });
        return closest;
    }, [enrollments, todayDay]);

    const todayTasks = useMemo<TodayTask[]>(() => {
        const tasks: TodayTask[] = [];
        enrollments.forEach((en: Enrollment) => {
            if (en.nextSessionNotes) {
                tasks.push({
                    id: `hw-${en.subject}`,
                    subject: en.subject || '',
                    teacher: en.teacherName || en.teacher || '',
                    time: '',
                    type: 'homework',
                    completed: false,
                });
            }
            (en.schedule || []).forEach((slot) => {
                if (slot.day === todayDay) {
                    tasks.push({
                        id: `sess-${en.subject}-${slot.hour}`,
                        subject: en.subject || '',
                        teacher: en.teacherName || en.teacher || '',
                        time: slot.hour || '',
                        type: 'session',
                        completed: false,
                    });
                }
            });
        });
        return tasks.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    }, [enrollments, todayDay]);

    const handleRefresh = async () => {
        triggerHaptic('medium');
        setIsRefreshing(true);
        try { await fetchAll(true); } catch (e) { console.error(e); }
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background" dir="rtl">
                <div className="sticky top-0 z-[100] bg-surface border-b border-border">
                    <div className="px-5 pt-4 pb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <div className="space-y-1.5"><Skeleton className="h-4 w-20" /><Skeleton className="h-3 w-12" /></div>
                        </div>
                        <Skeleton className="w-8 h-8 rounded-xl" />
                    </div>
                </div>
                <div className="max-w-page mx-auto px-4 pt-4 space-y-3">
                    <Skeleton className="h-36 rounded-3xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                    <div className="grid grid-cols-2 gap-3">
                        <Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" />
                    </div>
                    <Skeleton className="h-40 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-background overflow-x-hidden"
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

            <StudentDashboardHeader logout={logout} />

            <main className="max-w-page mx-auto px-4 pt-4 pb-28 space-y-3 md:space-y-4">
                <motion.div {...fadeUp(0)}>
                    <HeroSection
                        name={studentData?.name || 'الطالب'}
                        grade={studentData?.grade || ''}
                        curriculum={studentData?.curriculum || ''}
                        points={points}
                        rank={rank}
                        attendanceRate={stats.attendanceRate}
                    />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
                    <div className="lg:col-span-2 space-y-3 md:space-y-4">
                        <motion.div {...fadeUp(0.04)}>
                            <NextSessionCard nextSession={nextSession} />
                        </motion.div>

                        {todayTasks.length > 0 && (
                            <motion.div {...fadeUp(0.08)}>
                                <TodayTasks tasks={todayTasks} />
                            </motion.div>
                        )}

                        {enrollments.length > 0 && (
                            <motion.div {...fadeUp(0.14)}>
                                <SubjectCards enrollments={enrollments} />
                            </motion.div>
                        )}

                        <motion.div {...fadeUp(0.18)}>
                            <ContinueLearning enrollments={enrollments} />
                        </motion.div>

                        {pointLogs.length > 0 && (
                            <motion.div {...fadeUp(0.22)}>
                                <RecentActivity pointLogs={pointLogs} />
                            </motion.div>
                        )}
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        <motion.div {...fadeUp(0.06)}>
                            <ProgressOverview stats={stats} points={points} rank={rank} nextRank={nextRank} />
                        </motion.div>

                        <motion.div {...fadeUp(0.12)}>
                            <AchievementsSection points={points} rank={rank} nextRank={nextRank} />
                        </motion.div>

                        <motion.div {...fadeUp(0.2)}>
                            <InvoicesCard />
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

export default StudentDashboard;

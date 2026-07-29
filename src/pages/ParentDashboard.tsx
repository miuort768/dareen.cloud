import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useCurrentUser, useAdminPhone, useLogout } from '../context/AppContext';
import { getRankByPoints, STUDENT_RANKS } from '../shared/utils/ranks';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Skeleton } from '../shared/components/ui';
import { ParentDashboardHeader } from './parent-dashboard/ParentDashboardHeader';
import { MobileBottomNav } from './parent-dashboard/MobileBottomNav';
import { HeroSection } from './parent-dashboard/HeroSection';
import { ChildrenCards } from './parent-dashboard/ChildrenCards';
import { TodaySummary } from './parent-dashboard/TodaySummary';
import { AcademicPerformance } from './parent-dashboard/AcademicPerformance';
import { NextSessionBanner } from './parent-dashboard/NextSessionBanner';
import { HomeworkNotes } from './parent-dashboard/HomeworkNotes';
import { AchievementsSection } from './parent-dashboard/AchievementsSection';
import { RecentActivity } from './parent-dashboard/RecentActivity';
import { ActiveTimersBanner } from './parent-dashboard/ActiveTimersBanner';
import { SupportBanner } from './parent-dashboard/SupportBanner';
import type { Student } from '../types';
import type { PointLogEntry } from './parent-dashboard/types';

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
});

export const ParentDashboard = () => {
    useEffect(() => { document.title = 'لوحة تحكم ولي الأمر | دارين السابعة للتعليم والتدريب'; }, []);
    const currentUser = useCurrentUser();
    const adminPhone = useAdminPhone();
    const logout = useLogout();

    const [children, setChildren] = useState<Student[]>([]);
    const [sessions, setSessions] = useState<Student[]>([]);
    const [allPointLogs, setAllPointLogs] = useState<PointLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const todayArabic = format(new Date(), 'eeee', { locale: ar });

    useEffect(() => {
        let cancelled = false;
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const students = await api.get<Student[]>('/parents/my-children');
                if (cancelled) return;
                setChildren(students);

                const sessionsPromises = students.map(async s => {
                    try {
                        return await api.get<unknown[]>(`/parents/child-sessions/${s.id}`) || [];
                    } catch (e) {
                        console.error(`Failed to fetch sessions for child ${s.id}:`, e);
                        return [];
                    }
                });
                const logsPromises = students.map(async s => {
                    try {
                        return await api.get<unknown[]>(`/student-portal/me/points-log?studentId=${s.id}`) || [];
                    } catch (e) {
                        console.error(`Failed to fetch logs for child ${s.id}:`, e);
                        return [];
                    }
                });

                const [allSessionsResults, allLogsResults] = await Promise.all([
                    Promise.all(sessionsPromises),
                    Promise.all(logsPromises)
                ]);

                if (cancelled) return;

                setSessions(allSessionsResults.flat());

                const flattenedLogs = allLogsResults.map((logs, idx) =>
                    (Array.isArray(logs) ? logs : []).map((l: { id: string; date: string; status: string; timestamp?: string; points?: number }) => ({ ...l, studentName: students[idx].name }))
                ).flat();

                setAllPointLogs(flattenedLogs.sort((a, b) => {
                    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                    return timeB - timeA;
                }));
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        fetchAllData();
        return () => { cancelled = true; };
    }, []);

    // ── Active timer polling ──
    const [activeTimers, setActiveTimers] = useState<Student[]>([]);
    const timerTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollIdRef = useRef(0);
    const [, setTimerTick] = useState(0);

    useEffect(() => {
        const poll = async () => {
            const id = ++pollIdRef.current;
            try {
                const token = localStorage.getItem('auth_token');
                const res = await fetch('/api/active-sessions/my', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) return;
                if (id !== pollIdRef.current) return;
                const data: Student[] = await res.json();
                setActiveTimers(data);

                const students = await api.get<Student[]>('/parents/my-children');
                if (id !== pollIdRef.current) return;
                setChildren(students);

                if (data.length > 0 && !timerTickRef.current) {
                    timerTickRef.current = setInterval(() => setTimerTick(t => t + 1), 1000);
                } else if (data.length === 0 && timerTickRef.current) {
                    clearInterval(timerTickRef.current);
                    timerTickRef.current = null;
                }
            } catch (e) { console.warn('فشل التحقق من الجلسات النشطة', e); }
        };
        poll();
        const interval = setInterval(poll, 5000);
        return () => {
            clearInterval(interval);
            if (timerTickRef.current) clearInterval(timerTickRef.current);
        };
    }, []);

    const formatTime = (startedAt: string | null | undefined) => {
        if (!startedAt) return '--:--';
        const secs = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const stats = useMemo(() => {
        const completed = sessions.filter(s => s.status === 'completed').length;
        const totalRecorded = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled').length;
        const attendanceRate = totalRecorded > 0 ? Math.round((completed / totalRecorded) * 100) : 0;

        let sessionsUsed = 0;
        let sessionsTotal = 0;
        children.forEach(c => {
            (c.enrollments || []).forEach((en: { sessionsUsed: number; sessionsTotal: number }) => {
                sessionsUsed += Number(en.sessionsUsed || 0);
                sessionsTotal += Number(en.sessionsTotal || 0);
            });
        });

        const academicProgress = sessionsTotal > 0 ? Math.round((sessionsUsed / sessionsTotal) * 100) : 0;
        const upcomingSessions = sessions.filter(s => s.status !== 'completed' && s.status !== 'cancelled').length;

        return { childCount: children.length, upcomingSessions, attendanceRate, academicProgress, totalSessionsUsed: sessionsUsed, totalSessionsTotal: sessionsTotal };
    }, [sessions, children]);

    const todayTasks = useMemo(() => {
        const tasks: { studentName: string; subject: string; teacher: string; time: string; period: string }[] = [];
        children.forEach(child => {
            (child.enrollments || []).forEach((en: { teacherName?: string; subject?: string; teacher?: string; schedule?: { day: string; hour: string; period: string }[] }) => {
                (en.schedule || []).forEach((slot: { day: string; hour: string; period: string }) => {
                    if (slot.day === todayArabic) {
                        tasks.push({
                            studentName: child.name,
                            subject: en.subject || en.teacherName || '',
                            teacher: en.teacher || '',
                            time: slot.hour,
                            period: slot.period
                        });
                    }
                });
            });
        });
        return tasks.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    }, [children, todayArabic]);

    const points = allPointLogs?.reduce((sum, log) => sum + (log.points || 0), 0) || 0;
    const rank = getRankByPoints(points, STUDENT_RANKS);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background" dir="rtl">
                <div className="sticky top-0 z-[100] bg-surface border-b border-border">
                    <div className="max-w-page mx-auto px-5 pt-4 pb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <div className="space-y-1.5"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16" /></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-11 h-11 rounded-xl" />
                            <Skeleton className="w-11 h-11 rounded-xl" />
                            <Skeleton className="w-11 h-11 rounded-xl" />
                        </div>
                    </div>
                </div>
                <div className="max-w-page mx-auto px-4 pt-4 space-y-3">
                    <Skeleton className="h-36 rounded-3xl" />
                    <div className="grid grid-cols-2 gap-3">
                        <Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" />
                    </div>
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-40 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background overflow-x-hidden" dir="rtl">
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
                    </div>
                </div>
            </main>

            <div className="block md:hidden">
                <MobileBottomNav />
            </div>
        </div>
    );
};

export default ParentDashboard;
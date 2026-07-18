import { useState, useEffect, useMemo, useRef } from 'react';

import { api } from '../lib/api';
import { useCurrentUser, useAdminPhone, useLogout } from '../context/AppContext';
import { getRankByPoints, STUDENT_RANKS } from '../shared/utils/ranks';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { PageLoader } from '../components/ui/PageLoader';
import { ParentDesktopView } from './parent-dashboard/DesktopView';
import { ParentMobileView } from './parent-dashboard/MobileView';
import { ParentBottomNav } from './parent-dashboard/BottomNav';
import type { Student } from '../types';

export const ParentDashboard = () => {
    const currentUser = useCurrentUser();
    const adminPhone = useAdminPhone();
    const logout = useLogout();
    const [children, setChildren] = useState<Student[]>([]);
    const [sessions, setSessions] = useState<Student[]>([]);
    const [allPointLogs, setAllPointLogs] = useState<{ id: string; date: string; status: string; points?: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('home');

    const todayArabic = format(new Date(), 'eeee', { locale: ar });

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const students = await api.get<Student[]>('/parents/my-children');
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
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // ── Active timer for parent ──
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
            (c.enrollments || []).forEach((en: { teacherName: string; sessionsTotal: number; sessionsUsed: number; nextSessionNotes?: string; schedule?: { day: string; time: string }[] }) => {
                sessionsUsed += Number(en.sessionsUsed || 0);
                sessionsTotal += Number(en.sessionsTotal || 0);
            });
        });

        const academicProgress = sessionsTotal > 0 ? Math.round((sessionsUsed / sessionsTotal) * 100) : 0;
        const upcomingSessions = sessions.filter(s => s.status !== 'completed' && s.status !== 'cancelled').length;

        return { childCount: children.length, upcomingSessions, attendanceRate, academicProgress };
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
        return <PageLoader />;
    }

    const viewProps = {
        currentUser, adminPhone, children, sessions, allPointLogs,
        activeTimers, stats, todayTasks, points, rank, logout, formatTime,
    };

    return (
        <>
            <ParentDesktopView {...viewProps} />
            <ParentMobileView {...viewProps} activeTab={activeTab} setActiveTab={setActiveTab} />
            <ParentBottomNav />
        </>
    );
};

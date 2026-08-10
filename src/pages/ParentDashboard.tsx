import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useCurrentUser, useAdminPhone, useLogout, useAcademyName } from '../context/AppContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Skeleton } from '../shared/components/ui';
import { ParentDashboardDesktop } from './parent-dashboard/ParentDashboardDesktop';
import { ParentDashboardMobile } from './parent-dashboard/ParentDashboardMobile';
import type { Student } from '../types';
import type { PointLogEntry } from './parent-dashboard/types';

export const ParentDashboard = () => {
    const academyName = useAcademyName();
    useEffect(() => { document.title = `·ÊÕ…  Õﬂ„ Ê·Ì «·√„— | ${academyName}`; }, [academyName]);
    const currentUser = useCurrentUser();
    const adminPhone = useAdminPhone();
    const logout = useLogout();
    const navigate = useNavigate();

    const [partialError, setPartialError] = useState<string | null>(null);

    const todayArabic = format(new Date(), 'eeee', { locale: ar });

    const { data: parentData, isLoading, error, refetch } = useQuery({
        queryKey: ['parent-dashboard', currentUser?.id],
        queryFn: async () => {
            setPartialError(null);
            const students = await api.get<Student[]>('/parents/my-children');

            let failedChildren = 0;
            const sessionsPromises = students.map(async s => {
                try { return await api.get<unknown[]>(`/parents/child-sessions/${s.id}`) || []; }
                catch { failedChildren++; return []; }
            });
            const logsPromises = students.map(async s => {
                try { return await api.get<unknown[]>(`/student-portal/me/points-log?studentId=${s.id}`) || []; }
                catch { failedChildren++; return []; }
            });

            const [allSessionsResults, allLogsResults] = await Promise.all([
                Promise.all(sessionsPromises),
                Promise.all(logsPromises)
            ]);

            if (failedChildren > 0) setPartialError(` ⁄–—  Õ„Ì· »Ì«‰«  ${failedChildren} „‰ «·√»‰«¡. »⁄÷ «·»Ì«‰«  ﬁœ  ﬂÊ‰ €Ì— „ÕœÀ….`);

            const flattenedLogs = allLogsResults.map((logs, idx) =>
                (Array.isArray(logs) ? logs : []).map((l: { id: string; date: string; status: string; timestamp?: string; points?: number }) => ({ ...l, studentName: students[idx].name }))
            ).flat();

            return {
                children: students,
                sessions: allSessionsResults.flat(),
                allPointLogs: flattenedLogs.sort((a, b) => {
                    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                    return timeB - timeA;
                }),
            };
        },
        enabled: currentUser?.role === 'parent',
    });

    const children = parentData?.children ?? [];
    const sessions = parentData?.sessions ?? [];
    const allPointLogs = parentData?.allPointLogs ?? [];

    const { data: activeTimers = [] } = useQuery({
        queryKey: ['active-sessions'],
        queryFn: () => api.get<Student[]>('/active-sessions/my'),
        refetchInterval: 5000,
    });

    const timerTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [, setTimerTick] = useState(0);

    useEffect(() => {
        if (activeTimers.length > 0 && !timerTickRef.current) {
            timerTickRef.current = setInterval(() => setTimerTick(t => t + 1), 1000);
        } else if (activeTimers.length === 0 && timerTickRef.current) {
            clearInterval(timerTickRef.current);
            timerTickRef.current = null;
        }
        return () => {
            if (timerTickRef.current) {
                clearInterval(timerTickRef.current);
                timerTickRef.current = null;
            }
        };
    }, [activeTimers.length]);

    const formatTime = (startedAt: string | null | undefined) => {
        if (!startedAt) return '--:--';
        const secs = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background dark:bg-background" dir="rtl">
                <div className="sticky top-0 z-[100] bg-surface dark:bg-surface border-b border-border dark:border-primary/20">
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

    if (error) {
        return (
            <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center" dir="rtl">
                <div className="text-center space-y-3 p-6">
                    <p className="text-muted dark:text-muted text-sm">›‘·  Õ„Ì· «·»Ì«‰« .  Õﬁﬁ „‰ « ’«·ﬂ »«·≈‰ —‰ .</p>
                    <button onClick={() => refetch()} className="text-sm text-primary dark:text-primary hover:underline">≈⁄«œ… «·„Õ«Ê·…</button>
                </div>
            </div>
        );
    }

    const sharedProps = {
        currentUser,
        adminPhone,
        children,
        sessions,
        allPointLogs,
        activeTimers,
        todayTasks,
        formatTime,
        logout,
        onRefresh: () => refetch(),
    };

    return (
        <>
            {partialError && (
                <div className="bg-warning/10 border-b border-warning/20 px-4 py-2 text-center">
                    <p className="text-xs font-medium text-warning">{partialError}</p>
                </div>
            )}
            <div className="hidden md:block">
                <ParentDashboardDesktop {...sharedProps} />
            </div>
            <div className="block md:hidden">
                <ParentDashboardMobile {...sharedProps} />
            </div>
        </>
    );
};

export default ParentDashboard;

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useCurrentUser, useLogout, useAcademyName } from '../context/AppContext';
import { Skeleton } from '../shared/components/ui';
import type { StudentDashboardData, Session, PointLog } from './student-dashboard/types';
import { StudentDashboardDesktop } from './student-dashboard/StudentDashboardDesktop';
import { StudentDashboardMobile } from './student-dashboard/StudentDashboardMobile';

export const StudentDashboard = () => {
    const academyName = useAcademyName();
    useEffect(() => { document.title = `لوحة تحكم الطالب | ${academyName}`; }, [academyName]);
    const currentUser = useCurrentUser();
    const logout = useLogout();
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery<{ studentData: StudentDashboardData; sessions: Session[]; pointLogs: PointLog[] }>({
        queryKey: ['student-dashboard', currentUser?.id],
        queryFn: async () => {
            const [me, sessions, pointLogs] = await Promise.all([
                api.get<StudentDashboardData>('/student-portal/me'),
                api.get<Session[]>('/student-portal/me/sessions'),
                api.get<PointLog[]>('/student-portal/me/points-log'),
            ]);
            return { studentData: me, sessions, pointLogs };
        },
        enabled: currentUser?.role === 'student',
    });

    const studentData = data?.studentData ?? null;
    const sessions = data?.sessions ?? [];
    const pointLogs = data?.pointLogs ?? [];

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

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
                <div className="text-center space-y-3 p-6">
                    <p className="text-muted text-sm">{error.message || 'فشل تحميل البيانات. تحقق من اتصالك بالإنترنت.'}</p>
                    <button onClick={() => queryClient.invalidateQueries({ queryKey: ['student-dashboard', currentUser?.id] })} className="text-sm text-primary hover:underline">إعادة المحاولة</button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="hidden md:block">
                <StudentDashboardDesktop studentData={studentData} sessions={sessions} pointLogs={pointLogs} onRefresh={() => queryClient.invalidateQueries({ queryKey: ['student-dashboard', currentUser?.id] })} />
            </div>
            <div className="block md:hidden">
                <StudentDashboardMobile
                    currentUser={currentUser}
                    studentData={studentData}
                    sessions={sessions}
                    pointLogs={pointLogs}
                    logout={logout}
                    onRefresh={() => queryClient.invalidateQueries({ queryKey: ['student-dashboard', currentUser?.id] })}
                />
            </div>
        </>
    );
};

export default StudentDashboard;

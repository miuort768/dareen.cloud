import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLoader } from '../components/ui/PageLoader';
import { useCurrentUser, useLogout } from '../context/AppContext';
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import { TeacherDashboardDesktop } from './TeacherDashboardDesktop';
import { TeacherDashboardMobile } from './TeacherDashboardMobile';

export const TeacherDashboard = () => {
    useEffect(() => { document.title = 'لوحة تحكم المعلمة | دارين السابعة للتعليم والتدريب'; }, []);
    const currentUser = useCurrentUser();
    const logout = useLogout();
    const navigate = useNavigate();
    const { stats, tasks, loading, rawSessions, lowBalanceStudents, focusStudents, fetchDashboardData } = useDashboardData(currentUser);

    const isInvalidRole = !!currentUser && currentUser.role !== 'teacher';
    useEffect(() => { if (isInvalidRole) navigate('/', { replace: true }); }, [isInvalidRole, navigate]);

    if (!currentUser || currentUser.role !== 'teacher') return <div className="min-h-full bg-surface font-sans" />;
    if (loading) return <PageLoader />;

    const timeline = stats.todayTimeline || [];

    return (
        <>
            <div className="hidden md:block min-h-full pb-24 overflow-x-hidden relative bg-background font-sans" dir="rtl">
                <TeacherDashboardDesktop currentUser={currentUser} stats={stats} rawSessions={rawSessions} tasks={tasks} lowBalanceStudents={lowBalanceStudents} focusStudents={focusStudents} timeline={timeline} logout={logout} />
            </div>
            <div className="block md:hidden">
                <TeacherDashboardMobile currentUser={currentUser} stats={stats} rawSessions={rawSessions} tasks={tasks} lowBalanceStudents={lowBalanceStudents} focusStudents={focusStudents} timeline={timeline} onRefresh={fetchDashboardData} />
            </div>
        </>
    );
};

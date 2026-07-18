import { PageLoader } from '../components/ui/PageLoader';
import { useCurrentUser } from '../context/AppContext';
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import { TeacherDashboardDesktop } from './TeacherDashboardDesktop';
import { TeacherDashboardMobile } from './TeacherDashboardMobile';

export const TeacherDashboard = () => {
    const currentUser = useCurrentUser();
    const { stats, tasks, loading, rawSessions, lowBalanceStudents, focusStudents } = useDashboardData(currentUser);

    if (!currentUser || currentUser.role !== 'teacher') return <div className="min-h-full bg-surface font-sans" />;
    if (loading) return <PageLoader />;

    const timeline = stats.todayTimeline || [];

    return (
        <>
            <div className="hidden md:block min-h-full pb-24 overflow-x-hidden relative bg-surface font-sans" dir="rtl">
                <TeacherDashboardDesktop currentUser={currentUser} stats={stats} rawSessions={rawSessions} tasks={tasks} lowBalanceStudents={lowBalanceStudents} focusStudents={focusStudents} timeline={timeline} />
            </div>
            <div className="block md:hidden">
                <TeacherDashboardMobile currentUser={currentUser} stats={stats} rawSessions={rawSessions} tasks={tasks} lowBalanceStudents={lowBalanceStudents} focusStudents={focusStudents} timeline={timeline} />
            </div>
        </>
    );
};

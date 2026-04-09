import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import { DashboardHeader } from '../features/dashboard/components/DashboardHeader';
import { DashboardStats } from '../features/dashboard/components/DashboardStats';
import { ImportantNotifications } from '../features/dashboard/components/ImportantNotifications';
import { DashboardCharts } from '../features/dashboard/components/DashboardCharts';
import { PerformanceSummary } from '../features/dashboard/components/PerformanceSummary';
import { TasksAndRequests } from '../features/dashboard/components/TasksAndRequests';
import { SessionAnalysis } from '../features/dashboard/components/SessionAnalysis';
import { TeacherAchievements } from '../features/dashboard/components/TeacherAchievements';
import { RenewalAlertsList } from '../features/dashboard/components/RenewalAlertsList';
import { SmartAlerts } from '../features/dashboard/components/SmartAlerts';
import { AnalyticsDashboard } from '../features/dashboard/components/AnalyticsDashboard';
import { ModernAnnouncements } from '../features/dashboard/components/ModernAnnouncements';
import { QuickActionsHub } from '../features/dashboard/components/QuickActionsHub';
import { RecentActivityFeed } from '../features/dashboard/components/RecentActivityFeed';
import { TeacherLeaderboard } from '../features/dashboard/components/TeacherLeaderboard';
import { TeacherFocusList } from '../features/dashboard/components/TeacherFocusList';
import { TeacherWeeklySummary } from '../features/dashboard/components/TeacherWeeklySummary';
import { TeacherSessionTimeline } from '../features/dashboard/components/TeacherSessionTimeline';
import { TeacherSalaryPreview } from '../features/dashboard/components/TeacherSalaryPreview';
import { StudentQuickBrief } from '../features/dashboard/components/StudentQuickBrief';
import { TeacherRewardsKPIs } from '../features/dashboard/components/TeacherRewardsKPIs';
import { MonthlyReportPreview } from '../features/dashboard/components/MonthlyReportPreview';

export const Dashboard = () => {
    const { currentUser } = useApp();

    const {
        stats,
        monthlyData,
        lowBalanceStudents,
        tasks,
        loading,
        rawStudents,
        rawSessions,
        rawStudentInvoices,
        topStudents,
        focusStudents
    } = useDashboardData(currentUser);

    const [briefingStudent, setBriefingStudent] = useState<any | null>(null);
    const [selectedStudentForReport, setSelectedStudentForReport] = useState<any | null>(null);

    const isTeacher = currentUser?.role === 'teacher';

    if (!currentUser || (!currentUser.permissions?.includes('*') && !currentUser.permissions?.includes('dashboard') && currentUser.role !== 'teacher')) {
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-950" />;
    }

    if (loading) {
        return (
            <div className="space-y-8 p-4 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
                <div className="h-64 bg-gray-200 dark:bg-gray-800 border-4 border-gray-950 dark:border-gray-700"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 border-4 border-gray-950 dark:border-gray-700"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-32 max-w-[1600px] mx-auto" dir="rtl">
            <DashboardHeader
                isTeacher={isTeacher}
                currentUser={currentUser}
                stats={stats}
            />

            {/* Modern Announcements Hub */}
            <ModernAnnouncements />

            {!isTeacher && <QuickActionsHub />}

            <DashboardStats stats={stats} isTeacher={isTeacher} />

            {isTeacher ? (
                <div className="space-y-8 animate-in fade-in duration-700">
                    <div className="flex items-center justify-between mb-4 border-b-2 border-gray-100 dark:border-gray-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-600 text-white shadow-lg">
                                <Megaphone size={18} />
                            </div>
                            <h2 className="text-xl font-black text-gray-950 dark:text-white uppercase tracking-tighter">مركز المعلمة الدراسي (Teacher Hub)</h2>
                        </div>
                    </div>

                    {/* NEW: Timeline of Today's Sessions */}
                    <div className="w-full">
                        <TeacherSessionTimeline sessions={stats.todayTimeline || []} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <TeacherAchievements
                                stats={stats}
                                lowBalanceStudents={lowBalanceStudents}
                                isTeacher={true}
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <TasksAndRequests tasks={tasks} />
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <TeacherWeeklySummary 
                            stats={{
                                weekTotalSessions: stats.weekTotalSessions || 0,
                                newBadgesRecommended: stats.newBadgesRecommended || 0,
                                bestStudentName: stats.bestStudentName,
                                pointsEarnedThisWeek: (stats.weekTotalSessions || 0) * 5
                            }}
                        />
                        <TeacherSalaryPreview 
                            stats={{
                                totalEarnings: (stats.completedSessions || 0) * (stats.teacherSessionPrice || 0),
                                completedSessions: stats.completedSessions || 0,
                                sessionsGoal: 100, 
                                pricePerSession: stats.teacherSessionPrice || 0
                            }}
                        />
                        <TeacherRewardsKPIs 
                            stats={{
                                attendanceRate: stats.attendanceRate || 0,
                                studentsCount: stats.studentsCount || 0,
                                evaluationsCompleted: stats.evaluationsCompleted || 0,
                                teacherPoints: stats.teacherPoints || 0
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <TeacherFocusList 
                            students={focusStudents || []} 
                            onStudentClick={(s) => setBriefingStudent(s)}
                        />
                         <TeacherLeaderboard 
                            students={topStudents || []} 
                            onStudentClick={(s) => setBriefingStudent(s)}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <SessionAnalysis stats={stats} monthlyData={monthlyData} />
                        <RenewalAlertsList
                            stats={stats}
                            lowBalanceStudents={lowBalanceStudents}
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in duration-700">
                    {/* Admin Reorganized Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            <PerformanceSummary stats={stats} isTeacher={false} />
                            <ImportantNotifications
                                tasks={tasks}
                                lowBalanceStudents={lowBalanceStudents}
                            />
                        </div>
                        <div className="space-y-8">
                            <TasksAndRequests tasks={tasks} />
                            <RecentActivityFeed sessions={rawSessions} tasks={tasks} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                        <SessionAnalysis stats={stats} monthlyData={monthlyData} />
                        <SmartAlerts
                            students={rawStudents}
                            sessions={rawSessions}
                            studentInvoices={rawStudentInvoices}
                            lowBalanceStudents={lowBalanceStudents}
                        />
                    </div>

                    <div className="w-full">
                         <DashboardCharts isTeacher={false} monthlyData={monthlyData} />
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                         <RenewalAlertsList
                            stats={stats}
                            lowBalanceStudents={lowBalanceStudents}
                        />
                        <AnalyticsDashboard
                            students={rawStudents}
                            sessions={rawSessions}
                            monthlyData={monthlyData}
                        />
                    </div>
                </div>
            )}

            {/* Suggestion 2: Quick Brief Modal */}
            {isTeacher && briefingStudent && (
                <StudentQuickBrief
                    isOpen={!!briefingStudent}
                    onClose={() => setBriefingStudent(null)}
                    onGenerateReport={(student) => {
                        setSelectedStudentForReport(student);
                        setBriefingStudent(null);
                    }}
                    student={briefingStudent}
                    enrollment={briefingStudent.enrollments?.find((e: any) => e.teacherId === currentUser.id || e.teacher === (currentUser.teacherName || currentUser.name))}
                    recentSessions={rawSessions
                        .filter(s => s.studentId === briefingStudent.id && (s.status === 'completed' || s.status === 'مكتملة'))
                        .sort((a,b) => (b.date || '').localeCompare(a.date || ''))
                        .slice(0, 3)
                        .map(s => ({
                            date: s.date,
                            topics: s.topics || 'حصة عادية',
                            rating: 'ممتاز'
                        }))
                    }
                />
            )}

            {selectedStudentForReport && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-md overflow-y-auto">
                    <div className="my-8 w-full max-w-lg">
                        <MonthlyReportPreview 
                            student={{
                                id: selectedStudentForReport.id,
                                name: selectedStudentForReport.name,
                                grade: selectedStudentForReport.grade,
                                subject: 'تحفيظ القرآن الكريم',
                                points: selectedStudentForReport.totalPoints || 0,
                                attendance: 95,
                                sessionsCompleted: rawSessions.filter(s => s.studentId === selectedStudentForReport.id && s.status === 'completed').length,
                                lastNotes: rawSessions
                                    .filter(s => s.studentId === selectedStudentForReport.id && s.topics)
                                    .slice(0, 3)
                                    .map(s => s.topics!)
                            }}
                            onShare={(p) => {
                                console.log(`Sharing via ${p}`);
                                setSelectedStudentForReport(null);
                            }}
                        />
                        <button 
                            onClick={() => setSelectedStudentForReport(null)}
                            className="mt-6 w-full py-4 bg-white text-gray-950 border-4 border-gray-950 font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                        >
                            إغلاق المعاينة
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

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
                <div className="h-64 bg-gray-200/50 dark:bg-slate-800 animate-pulse rounded-2xl border border-gray-100 dark:border-slate-800"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200/50 dark:bg-slate-800 animate-pulse rounded-2xl border border-gray-100 dark:border-slate-800"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-20 max-w-[1600px] mx-auto px-4" dir="rtl">
            <DashboardHeader
                isTeacher={isTeacher}
                currentUser={currentUser}
                stats={stats}
            />

            {/* Top Row: Statistics (Small & Compact) */}
            <DashboardStats stats={stats} isTeacher={isTeacher} />

            {/* Main Operational Layout */}
            {isTeacher ? (
                /* Teacher View (Already compact) */
                <div className="space-y-6 animate-in fade-in duration-500">
                    <ModernAnnouncements />
                    <div className="w-full">
                        <TeacherSessionTimeline sessions={stats.todayTimeline || []} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                        <div className="lg:col-span-2">
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
                </div>
            ) : (
                /* Admin Executive View (NEW: Compact & Optimized) */
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in duration-500">
                    
                    {/* Left Column (Main Analytics & Feed) - 8/12 Columns */}
                    <div className="xl:col-span-8 space-y-6">
                        {/* Highlights & Hero Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <PerformanceSummary stats={stats} isTeacher={false} />
                            <SessionAnalysis stats={stats} monthlyData={monthlyData} />
                        </div>

                        {/* Large Charts Section */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm">
                             <DashboardCharts isTeacher={false} monthlyData={monthlyData} />
                        </div>

                        {/* Comprehensive Table Area */}
                        <div className="space-y-6">
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

                    {/* Right Column (Operational Sidepanel) - 4/12 Columns */}
                    <div className="xl:col-span-4 space-y-6">
                        {/* Quick Control Hub */}
                        <QuickActionsHub />

                        {/* Urgent Matters */}
                        <div className="bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/30 p-1">
                            <ImportantNotifications
                                tasks={tasks}
                                lowBalanceStudents={lowBalanceStudents}
                            />
                        </div>

                        {/* AI Smart Alerts */}
                        <SmartAlerts
                            students={rawStudents}
                            sessions={rawSessions}
                            studentInvoices={rawStudentInvoices}
                            lowBalanceStudents={lowBalanceStudents}
                        />

                        {/* Recent Activity & Communication */}
                        <div className="space-y-6">
                            <TasksAndRequests tasks={tasks} />
                            <RecentActivityFeed sessions={rawSessions} tasks={tasks} />
                            <ModernAnnouncements />
                        </div>
                    </div>
                </div>
            )}v>
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
                            className="mt-6 w-full py-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-100 dark:border-slate-700 font-bold text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm rounded-xl"
                        >
                            إغلاق المعاينة
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

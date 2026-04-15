import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import { DashboardHeader } from '../features/dashboard/components/DashboardHeader';
import { DashboardStats } from '../features/dashboard/components/DashboardStats';
import { ImportantNotifications } from '../features/dashboard/components/ImportantNotifications';
import { DashboardCharts } from '../features/dashboard/components/DashboardCharts';
import { TasksAndRequests } from '../features/dashboard/components/TasksAndRequests';
import { TeacherAchievements } from '../features/dashboard/components/TeacherAchievements';
import { RenewalAlertsList } from '../features/dashboard/components/RenewalAlertsList';
import { SmartAlerts } from '../features/dashboard/components/SmartAlerts';
import { AnalyticsDashboard } from '../features/dashboard/components/AnalyticsDashboard';
import { ModernAnnouncements } from '../features/dashboard/components/ModernAnnouncements';
import { QuickActionsHub } from '../features/dashboard/components/QuickActionsHub';
import { RecentActivityFeed } from '../features/dashboard/components/RecentActivityFeed';
import { TeacherSessionTimeline } from '../features/dashboard/components/TeacherSessionTimeline';
import { StudentQuickBrief } from '../features/dashboard/components/StudentQuickBrief';
import { MonthlyReportPreview } from '../features/dashboard/components/MonthlyReportPreview';
import { Star } from 'lucide-react';

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
        rawStudentInvoices
    } = useDashboardData(currentUser);

    const [briefingStudent, setBriefingStudent] = useState<any | null>(null);
    const [selectedStudentForReport, setSelectedStudentForReport] = useState<any | null>(null);

    const isTeacher = currentUser?.role === 'teacher';

    if (!currentUser || (!currentUser.permissions?.includes('*') && !currentUser.permissions?.includes('dashboard') && currentUser.role !== 'teacher')) {
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-950" />;
    }

    if (loading) {
        return (
            <div className="space-y-4 p-4 lg:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
                <div className="h-48 bg-gray-200/50 dark:bg-slate-800 animate-pulse rounded-none border border-gray-100 dark:border-slate-800"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200/50 dark:bg-slate-800 animate-pulse rounded-none border border-gray-100 dark:border-slate-800"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#020617] pb-10 overflow-x-hidden text-sm" dir="rtl">
            
            {/* 🏆 Top Honor Banner (Full Width, Sharp) */}
            {!isTeacher && (
                <div className="bg-slate-900 dark:bg-indigo-950 p-2 border-b-2 border-indigo-500 flex items-center justify-center gap-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:150px_150px] animate-[shimmer_8s_infinite] pointer-events-none"></div>
                    <Star className="text-yellow-400 fill-yellow-400" size={12} />
                    <h2 className="text-[11px] font-black text-indigo-100 tracking-[0.2em] uppercase italic">تهانينا لأنكم أفراد العائلة المميزين</h2>
                    <Star className="text-yellow-400 fill-yellow-400" size={12} />
                </div>
            )}

            {/* Premium Header Section */}
            <div className="relative pt-4 pb-12">
                <DashboardHeader
                    isTeacher={isTeacher}
                    currentUser={currentUser}
                />
            </div>

            <div className="max-w-[1600px] mx-auto px-4 md:px-6 -mt-8 space-y-8">
                
                {/* Row 1: Key Statistics (Sharp Floating Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <DashboardStats stats={stats} isTeacher={isTeacher} />
                </div>

                {/* Quick Command Bar */}
                {!isTeacher && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <QuickActionsHub />
                    </div>
                )}

                {/* Main Content Area */}
                {isTeacher ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <ModernAnnouncements />
                        <div className="bg-white/90 dark:bg-slate-900/50 backdrop-blur-md rounded-none border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
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
                    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        
                        {/* 1. Primary Operations Row: Side by Side (Alerts Moved UP) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <ImportantNotifications tasks={tasks} lowBalanceStudents={lowBalanceStudents} />
                            <SmartAlerts
                                students={rawStudents}
                                sessions={rawSessions}
                                studentInvoices={rawStudentInvoices}
                                lowBalanceStudents={lowBalanceStudents}
                            />
                        </div>

                        {/* 2. Full Width Analysis Center (Charts Moved DOWN) */}
                        <div className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <DashboardCharts isTeacher={false} monthlyData={monthlyData} />
                        </div>

                        {/* 3. The Analytical Core (Commitment, Subject Stats, Honor Roll) */}
                        <div className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                            <AnalyticsDashboard
                                students={rawStudents}
                                sessions={rawSessions}
                                monthlyData={monthlyData}
                            />
                        </div>

                        {/* 4. Secondary Operations Row: More Side-by-Side (Sharp) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <RenewalAlertsList stats={stats} lowBalanceStudents={lowBalanceStudents} />
                            <RecentActivityFeed sessions={rawSessions} tasks={tasks} />
                        </div>

                        {/* 5. Bottom Tasks & Information */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-7">
                                <TasksAndRequests tasks={tasks} />
                            </div>
                            <div className="lg:col-span-5">
                                <ModernAnnouncements />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals keep their premium look but will be adjusted if needed */}
            {isTeacher && briefingStudent && (
                <StudentQuickBrief
                    isOpen={!!briefingStudent}
                    onClose={() => setBriefingStudent(null)}
                    onGenerateReport={(student) => {
                        const studentDataForReport = {
                            id: student.id,
                            name: student.name,
                            grade: student.grade,
                            subject: 'مادة عامة',
                            points: student.totalPoints || 0,
                            attendance: 95, 
                            sessionsCompleted: 12, 
                            lastNotes: [student.notes || 'تقدم ممتاز في المادة']
                        };
                        setSelectedStudentForReport(studentDataForReport);
                        setBriefingStudent(null);
                    }}
                    student={briefingStudent}
                    recentSessions={[]} 
                />
            )}

            {selectedStudentForReport && (
                <MonthlyReportPreview
                    isOpen={!!selectedStudentForReport}
                    onClose={() => setSelectedStudentForReport(null)}
                    student={selectedStudentForReport}
                    onShare={(platform) => console.log('Sharing on', platform)}
                />
            )}
        </div>
    );
};

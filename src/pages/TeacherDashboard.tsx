import { useState } from 'react';
import { useCurrentUser } from '../context/AppContext';
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import { DashboardHeader } from '../features/dashboard/components/DashboardHeader';
import { DashboardStats } from '../features/dashboard/components/DashboardStats';
import { TeacherAchievements } from '../features/dashboard/components/TeacherAchievements';
import { TasksAndRequests } from '../features/dashboard/components/TasksAndRequests';
import { ModernAnnouncements } from '../features/dashboard/components/ModernAnnouncements';
import { TopAttendanceStudents } from '../features/dashboard/components/TopAttendanceStudents';
import { TeacherSessionTimeline } from '../features/dashboard/components/TeacherSessionTimeline';
import { StudentQuickBrief } from '../features/dashboard/components/StudentQuickBrief';
import { MonthlyReportPreview } from '../features/dashboard/components/MonthlyReportPreview';
import { PageLoader } from '../components/ui/PageLoader';
import { LiveClasses } from '../components/dashboard/LiveClasses';

export const TeacherDashboard = () => {
    const currentUser = useCurrentUser();

    const {
        stats,
        tasks,
        loading,
        rawSessions,
        lowBalanceStudents
    } = useDashboardData(currentUser);

    const [briefingStudent, setBriefingStudent] = useState<Record<string, unknown> | null>(null);
    const [selectedStudentForReport, setSelectedStudentForReport] = useState<Record<string, unknown> | null>(null);

    if (!currentUser || currentUser.role !== 'teacher') {
        return <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-emerald-950/20 font-sans" />;
    }

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-emerald-950/20 font-sans" dir="rtl">
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 space-y-6">
                {/* 1. Header */}
                <DashboardHeader
                    isTeacher={true}
                    currentUser={currentUser}
                />

                {/* 2. Stats Grid */}
                <DashboardStats stats={stats} isTeacher={true} />

                {/* 3. Main Content Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="lg:col-span-8 space-y-6">
                        <LiveClasses />
                        <ModernAnnouncements />
                        
                        {(stats.todayTimeline || []).length > 0 && (
                            <TeacherSessionTimeline 
                                sessions={stats.todayTimeline || []} 
                                onStudentClick={setBriefingStudent}
                            />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TeacherAchievements
                                stats={stats}
                                lowBalanceStudents={lowBalanceStudents}
                                isTeacher={true}
                            />
                            <TasksAndRequests tasks={tasks} />
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <TopAttendanceStudents 
                            sessions={rawSessions} 
                            onStudentClick={setBriefingStudent}
                        />
                    </div>
                </div>

            {/* Modals */}
            {briefingStudent && (
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
        </div>
    );
};

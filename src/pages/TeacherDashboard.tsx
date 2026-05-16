import { useState } from 'react';
import { useApp } from '../context/AppContext';
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
import { cn } from '../lib/utils';

export const TeacherDashboard = () => {
    const { currentUser } = useApp();

    const {
        stats,
        tasks,
        loading,
        rawSessions,
        lowBalanceStudents
    } = useDashboardData(currentUser);

    const [briefingStudent, setBriefingStudent] = useState<any | null>(null);
    const [selectedStudentForReport, setSelectedStudentForReport] = useState<any | null>(null);

    if (!currentUser || currentUser.role !== 'teacher') {
        return <div className="min-h-full bg-slate-50 dark:bg-slate-950" />;
    }

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className={cn(
            "min-h-full pb-20 pt-4 overflow-x-hidden relative bg-slate-50 dark:bg-slate-950"
        )} dir="rtl">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 space-y-6">
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
                            <TeacherSessionTimeline sessions={stats.todayTimeline || []} />
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
                        <TopAttendanceStudents sessions={rawSessions} />
                    </div>
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
    );
};

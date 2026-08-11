import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TeacherDashboardHeader } from './TeacherDashboardHeader';
import { DashboardStats } from '../features/dashboard/components/DashboardStats';
import { TeacherAchievements } from '../features/dashboard/components/TeacherAchievements';
import { TasksAndRequests } from '../features/dashboard/components/TasksAndRequests';
import { ModernAnnouncements } from '../features/dashboard/components/ModernAnnouncements';
import { TopAttendanceStudents } from '../features/dashboard/components/TopAttendanceStudents';
import { TeacherSessionTimeline } from '../features/dashboard/components/TeacherSessionTimeline';
import { StudentQuickBrief } from '../features/dashboard/components/StudentQuickBrief';
import { MonthlyReportPreview } from '../features/dashboard/components/MonthlyReportPreview';
import { LiveSessions } from '../features/dashboard/components/LiveSessions';
import { NextSessionHero } from '../features/dashboard/components/NextSessionHero';
import { QuickActions } from '../features/dashboard/components/QuickActions';
import { SmartNotifications } from '../features/dashboard/components/SmartNotifications';
import { FinancialSnapshot } from '../features/dashboard/components/FinancialSnapshot';
import { AttendanceChart } from '../features/dashboard/components/AttendanceChart';
import type { DashboardStats as DashboardStatsType, LowBalanceStudent, DashboardTask } from '../features/dashboard/types';
import type { User } from '../types/auth';
import { useState } from 'react';


interface TeacherDashboardDesktopProps {
    currentUser: User | null;
    stats: DashboardStatsType;
    rawSessions: unknown[];
    tasks: DashboardTask[];
    lowBalanceStudents: LowBalanceStudent[];
    focusStudents: { id: string; name: string; reason: string; type: string }[];
    timeline: { id: string; studentName: string; time: string; subject: string; status: string }[];
    logout: () => void;
}

const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
});

export const TeacherDashboardDesktop = ({ stats, rawSessions, tasks, lowBalanceStudents, focusStudents, timeline, logout }: TeacherDashboardDesktopProps) => {
    const navigate = useNavigate();
    const [briefingStudent, setBriefingStudent] = useState<{ id?: string; name?: string; grade?: string; notes?: string; totalPoints?: number } | null>(null);
    const [selectedStudentForReport, setSelectedStudentForReport] = useState<{ id: string; name: string; grade: string; subject: string; points: number; attendance: number; sessionsCompleted: number; lastNotes: string[] } | null>(null);

    const nextSession = timeline.find(s => s.status === 'scheduled' || s.status === 'in-progress');

    return (
        <>
            <TeacherDashboardHeader logout={logout} />
            <div className="max-w-page mx-auto px-4 space-y-3 md:space-y-4 pb-28 pt-4">

            <motion.div {...fadeUp(0.04)}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-3 md:space-y-4">
                        {nextSession && (
                            <NextSessionHero timeline={timeline} onStart={(id) => navigate(`/classroom/${id}`)} />
                        )}
                        <div className="rounded-2xl bg-surface dark:bg-card border border-border dark:border-border p-5 transition-all duration-300 shadow-sm hover:shadow-md">
                            <QuickActions onStartSession={() => { if (nextSession) navigate(`/classroom/${nextSession.id}`); }} sessionAvailable={!!nextSession} />
                        </div>
                    </div>
                    <div className="rounded-2xl bg-surface dark:bg-card border border-border dark:border-border p-5 transition-all duration-300 shadow-sm hover:shadow-md">
                        <SmartNotifications lowBalanceStudents={lowBalanceStudents} focusStudents={focusStudents || []} />
                    </div>
                </div>
            </motion.div>

            <motion.div {...fadeUp(0.08)}>
                <DashboardStats stats={stats} isTeacher={true} />
            </motion.div>

            <motion.div {...fadeUp(0.12)}
                className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4"
            >
                <div className="lg:col-span-8 space-y-3 md:space-y-4">
                    <div className="rounded-2xl bg-surface dark:bg-card border border-border dark:border-border p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <LiveSessions />
                    </div>
                    <div className="rounded-2xl bg-surface dark:bg-card border border-border dark:border-border p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <ModernAnnouncements />
                    </div>
                    {timeline.length > 0 && (
                        <div className="rounded-2xl bg-surface dark:bg-card border border-border dark:border-border p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <TeacherSessionTimeline sessions={timeline} onStudentClick={setBriefingStudent} onSessionStart={(id) => navigate(`/classroom/${id}`)} />
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="rounded-2xl bg-surface dark:bg-card border border-border dark:border-border p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <TeacherAchievements stats={stats} lowBalanceStudents={lowBalanceStudents} isTeacher={true} />
                        </div>
                        <div className="rounded-2xl bg-surface dark:bg-card border border-border dark:border-border p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <TasksAndRequests tasks={tasks} />
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-4 space-y-3 md:space-y-4">
                    <div className="rounded-2xl bg-surface dark:bg-card border border-border dark:border-border p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <AttendanceChart rate={stats.attendanceRate} />
                    </div>
                    <div className="rounded-2xl bg-surface dark:bg-card border border-border dark:border-border p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <TopAttendanceStudents sessions={rawSessions} onStudentClick={setBriefingStudent} />
                    </div>
                    <div className="rounded-2xl bg-surface dark:bg-card border border-border dark:border-border p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <FinancialSnapshot monthNetProfit={stats.monthNetProfit} monthRevenue={stats.monthRevenue} expectedCollection={stats.expectedCollection} />
                    </div>
                </div>
            </motion.div>

            {briefingStudent && (
                <StudentQuickBrief isOpen={!!briefingStudent} onClose={() => setBriefingStudent(null)}
                    onGenerateReport={(student) => {
                        const studentSessions = rawSessions.filter((s: Record<string, unknown>) => s.studentId === student.id || s.studentID === student.id);
                        const completed = studentSessions.filter((s: Record<string, unknown>) => s.status === 'completed').length;
                        const total = studentSessions.filter((s: Record<string, unknown>) => s.status === 'completed' || s.status === 'cancelled').length;
                        setSelectedStudentForReport({
                            id: student.id, name: student.name, grade: student.grade,
                            subject: student.curriculum || 'مادة عامة',
                            points: student.totalPoints || 0,
                            attendance: total > 0 ? Math.round((completed / total) * 100) : 0,
                            sessionsCompleted: completed,
                            lastNotes: [student.notes || 'تقدم ممتاز في المادة']
                        });
                        setBriefingStudent(null);
                    }}
                    student={briefingStudent} recentSessions={[]} />
            )}
            {selectedStudentForReport && (
                <MonthlyReportPreview isOpen={!!selectedStudentForReport} onClose={() => setSelectedStudentForReport(null)} student={selectedStudentForReport} onShare={() => {}} />
            )}
            </div>
        </>
    );
};
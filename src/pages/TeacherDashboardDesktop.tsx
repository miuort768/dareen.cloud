import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardHeader } from '../features/dashboard/components/DashboardHeader';
import { DashboardStats } from '../features/dashboard/components/DashboardStats';
import { TeacherAchievements } from '../features/dashboard/components/TeacherAchievements';
import { TasksAndRequests } from '../features/dashboard/components/TasksAndRequests';
import { ModernAnnouncements } from '../features/dashboard/components/ModernAnnouncements';
import { TopAttendanceStudents } from '../features/dashboard/components/TopAttendanceStudents';
import { TeacherSessionTimeline } from '../features/dashboard/components/TeacherSessionTimeline';
import { StudentQuickBrief } from '../features/dashboard/components/StudentQuickBrief';
import { MonthlyReportPreview } from '../features/dashboard/components/MonthlyReportPreview';
import { LiveClasses } from '../components/dashboard/LiveClasses';
import { NextSessionHero } from '../features/dashboard/components/NextSessionHero';
import { QuickActions } from '../features/dashboard/components/QuickActions';
import { SmartNotifications } from '../features/dashboard/components/SmartNotifications';
import { FinancialSnapshot } from '../features/dashboard/components/FinancialSnapshot';
import { AttendanceChart } from '../features/dashboard/components/AttendanceChart';
import type { DashboardStats as DashboardStatsType, LowBalanceStudent, DashboardTask } from '../features/dashboard/types';
import type { User } from '../types/auth';
import { useState } from 'react';

const glass = "bg-white/70 dark:bg-white/[0.07] backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-lg shadow-black/[0.03]";

interface TeacherDashboardDesktopProps {
    currentUser: User | null;
    stats: DashboardStatsType;
    rawSessions: unknown[];
    tasks: DashboardTask[];
    lowBalanceStudents: LowBalanceStudent[];
    focusStudents: { id: string; name: string; reason: string; type: string }[];
    timeline: { id: string; studentName: string; time: string; subject: string; status: string }[];
}

export const TeacherDashboardDesktop = ({ currentUser, stats, rawSessions, tasks, lowBalanceStudents, focusStudents, timeline }: TeacherDashboardDesktopProps) => {
    const navigate = useNavigate();
    const [briefingStudent, setBriefingStudent] = useState<{ id?: string; name?: string; grade?: string; notes?: string; totalPoints?: number } | null>(null);
    const [selectedStudentForReport, setSelectedStudentForReport] = useState<{ id: string; name: string; grade: string; subject: string; points: number; attendance: number; sessionsCompleted: number; lastNotes: string[] } | null>(null);

    const nextSession = timeline.find(s => s.status === 'scheduled' || s.status === 'in-progress');

    return (
        <div className="max-w-page mx-auto px-4 space-y-6 py-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <DashboardHeader isTeacher={true} currentUser={currentUser} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
                <div className={glass + " p-5"}>
                    {nextSession && (
                        <NextSessionHero timeline={timeline} onStart={(id) => navigate(`/classroom/${id}`)} />
                    )}
                    <QuickActions navigate={navigate} onStartSession={() => { if (nextSession) navigate(`/classroom/${nextSession.id}`); }} />
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
                <div className="lg:col-span-8">
                    <div className={glass + " p-5"}>
                        <SmartNotifications lowBalanceStudents={lowBalanceStudents} focusStudents={focusStudents || []} />
                    </div>
                </div>
                <div className="lg:col-span-4">
                    <div className={glass + " p-5"}>
                        <FinancialSnapshot monthNetProfit={stats.monthNetProfit} monthRevenue={stats.monthRevenue} expectedCollection={stats.expectedCollection} />
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <DashboardStats stats={stats} isTeacher={true} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
                <div className="lg:col-span-8 space-y-6">
                    <div className={glass + " p-5"}>
                        <LiveClasses />
                    </div>
                    <div className={glass + " p-5"}>
                        <ModernAnnouncements />
                    </div>
                    {timeline.length > 0 && (
                        <div className={glass + " p-5"}>
                            <TeacherSessionTimeline sessions={timeline} onStudentClick={setBriefingStudent} onSessionStart={(id) => navigate(`/classroom/${id}`)} />
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={glass + " p-5"}>
                            <TeacherAchievements stats={stats} lowBalanceStudents={lowBalanceStudents} isTeacher={true} />
                        </div>
                        <div className={glass + " p-5"}>
                            <TasksAndRequests tasks={tasks} />
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-4 space-y-6">
                    <div className={glass + " p-5"}>
                        <AttendanceChart rate={stats.attendanceRate} />
                    </div>
                    <div className={glass + " p-5"}>
                        <TopAttendanceStudents sessions={rawSessions} onStudentClick={setBriefingStudent} />
                    </div>
                </div>
            </motion.div>
            {briefingStudent && (
                <StudentQuickBrief isOpen={!!briefingStudent} onClose={() => setBriefingStudent(null)}
                    onGenerateReport={(student) => { setSelectedStudentForReport({ id: student.id, name: student.name, grade: student.grade, subject: 'مادة عامة', points: student.totalPoints || 0, attendance: 95, sessionsCompleted: 12, lastNotes: [student.notes || 'تقدم ممتاز في المادة'] }); setBriefingStudent(null); }}
                    student={briefingStudent} recentSessions={[]} />
            )}
            {selectedStudentForReport && (
                <MonthlyReportPreview isOpen={!!selectedStudentForReport} onClose={() => setSelectedStudentForReport(null)} student={selectedStudentForReport} onShare={() => {}} />
            )}
        </div>
    );
};

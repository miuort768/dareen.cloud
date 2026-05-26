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
import { Calendar, Clock, Users, BookOpen, Award, User, LogOut, Bell, ChevronLeft, TrendingUp, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../lib/utils';

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
        <>
            {/* ─── Desktop version ─── */}
            <div className="hidden md:block min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-emerald-950/20 font-sans" dir="rtl">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-violet-400/10 dark:bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 max-w-[1600px] mx-auto px-4 space-y-6">
                    <DashboardHeader isTeacher={true} currentUser={currentUser} />
                    <DashboardStats stats={stats} isTeacher={true} />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8 space-y-6">
                            <LiveClasses />
                            <ModernAnnouncements />
                            
                            {(stats.todayTimeline || []).length > 0 && (
                                <TeacherSessionTimeline sessions={stats.todayTimeline || []} onStudentClick={setBriefingStudent} />
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <TeacherAchievements stats={stats} lowBalanceStudents={lowBalanceStudents} isTeacher={true} />
                                <TasksAndRequests tasks={tasks} />
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            <TopAttendanceStudents sessions={rawSessions} onStudentClick={setBriefingStudent} />
                        </div>
                    </div>

                {briefingStudent && (
                    <StudentQuickBrief
                        isOpen={!!briefingStudent}
                        onClose={() => setBriefingStudent(null)}
                        onGenerateReport={(student) => {
                            setSelectedStudentForReport({
                                id: student.id, name: student.name, grade: student.grade,
                                subject: 'مادة عامة', points: student.totalPoints || 0,
                                attendance: 95, sessionsCompleted: 12,
                                lastNotes: [student.notes || 'تقدم ممتاز في المادة']
                            });
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

            {/* ─── Mobile version ─── */}
            <div className="block md:hidden min-h-full pb-24 overflow-x-hidden relative bg-[#F7F8FC] font-sans" dir="rtl">
                {/* Purple gradient header */}
                <div className="bg-gradient-to-br from-[#6C4BFF] via-[#5A3BFF] to-[#1B1464] px-5 pt-12 pb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400/20 rounded-full blur-[80px] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/15 rounded-full blur-[60px] pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                    <User size={22} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-white font-black text-base">
                                        {(currentUser?.name || currentUser?.username || 'المعلم').split(' ')[0]}
                                    </h1>
                                    <p className="text-white/60 text-[10px] font-medium">معلم • {format(new Date(), 'eeee, d MMMM', { locale: ar })}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {/* logout */}}
                                className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-all"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>

                        {/* Quick stats row */}
                        <div className="grid grid-cols-3 gap-2.5">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl py-3 px-2 text-center border border-white/10">
                                <Clock size={16} className="mx-auto mb-1 text-purple-200" />
                                <span className="text-white font-black text-base block">{stats.todaySessions || 0}</span>
                                <span className="text-white/60 text-[8px] font-medium">حصص اليوم</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl py-3 px-2 text-center border border-white/10">
                                <Users size={16} className="mx-auto mb-1 text-blue-200" />
                                <span className="text-white font-black text-base block">{stats.totalStudents || 0}</span>
                                <span className="text-white/60 text-[8px] font-medium">الطلاب</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl py-3 px-2 text-center border border-white/10">
                                <Award size={16} className="mx-auto mb-1 text-amber-200" />
                                <span className="text-white font-black text-base block">{(stats.attendanceRate || 0)}%</span>
                                <span className="text-white/60 text-[8px] font-medium">حضور</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content cards */}
                <div className="px-4 -mt-4 space-y-4 relative z-20">
                    {/* Live Classes */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
                        <div className="p-4">
                            <LiveClasses />
                        </div>
                    </div>

                    {/* Announcements */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
                        <div className="p-4">
                            <ModernAnnouncements />
                        </div>
                    </div>

                    {/* Sessions Timeline */}
                    {(stats.todayTimeline || []).length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
                            <div className="p-4">
                                <TeacherSessionTimeline sessions={stats.todayTimeline || []} onStudentClick={setBriefingStudent} />
                            </div>
                        </div>
                    )}

                    {/* Stats + Tasks grid */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
                            <div className="p-4">
                                <TeacherAchievements stats={stats} lowBalanceStudents={lowBalanceStudents} isTeacher={true} />
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
                            <div className="p-4">
                                <TasksAndRequests tasks={tasks} />
                            </div>
                        </div>
                    </div>

                    {/* Top Attendance */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
                        <div className="p-4">
                            <TopAttendanceStudents sessions={rawSessions} onStudentClick={setBriefingStudent} />
                        </div>
                    </div>
                </div>

                {briefingStudent && (
                    <StudentQuickBrief
                        isOpen={!!briefingStudent}
                        onClose={() => setBriefingStudent(null)}
                        onGenerateReport={(student) => {
                            setSelectedStudentForReport({
                                id: student.id, name: student.name, grade: student.grade,
                                subject: 'مادة عامة', points: student.totalPoints || 0,
                                attendance: 95, sessionsCompleted: 12,
                                lastNotes: [student.notes || 'تقدم ممتاز في المادة']
                            });
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
        </>
    );
};

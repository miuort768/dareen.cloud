import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Clock, Users, Award, User, Bell, LayoutDashboard, Calendar, BookOpen, ClipboardList, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../lib/utils';

export const TeacherDashboard = () => {
    const currentUser = useCurrentUser();
    const navigate = useNavigate();

    const {
        stats,
        tasks,
        loading,
        rawSessions,
        lowBalanceStudents
    } = useDashboardData(currentUser);

    const [briefingStudent, setBriefingStudent] = useState<Record<string, unknown> | null>(null);
    const [selectedStudentForReport, setSelectedStudentForReport] = useState<Record<string, unknown> | null>(null);
    const [activeTab, setActiveTab] = useState('home');

    const tabs = [
        { id: 'home', label: 'الرئيسية', icon: LayoutDashboard },
        { id: 'schedule', label: 'الجدول', icon: Calendar },
        { id: 'reports', label: 'التقارير', icon: CheckSquare },
    ];

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
                                            <TeacherSessionTimeline sessions={stats.todayTimeline || []} onStudentClick={setBriefingStudent} onSessionStart={(id) => navigate(`/classroom/${id}`)} />
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
                        onShare={() => {}}
                    />
                )}
                </div>
            </div>

            {/* ─── Mobile version (app-style with tabs) ─── */}
            <div className="block md:hidden min-h-full pb-28 relative bg-[#F7F8FC] dark:bg-slate-900 font-sans" dir="rtl">
                {/* Sticky app bar */}
                <div className="sticky top-0 z-30 bg-gradient-to-br from-[#6C4BFF] via-[#5A3BFF] to-[#1B1464] shadow-lg shadow-purple-200/30">
                    <div className="absolute inset-0 bg-purple-400/10 rounded-full blur-[60px] pointer-events-none" />
                    <div className="relative z-10 px-4 pt-12 pb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <User size={18} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-white font-black text-sm leading-tight">
                                        {(currentUser?.name || currentUser?.username || 'المعلم').split(' ')[0]}
                                    </h1>
                                    <p className="text-white/50 text-[8px] font-medium">معلم</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center relative">
                                    <Bell size={15} className="text-white/80" />
                                    <span className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-rose-400 rounded-full border border-[#5A3BFF]" />
                                </div>
                            </div>
                        </div>
                        {/* Stats pills */}
                        <div className="flex items-center gap-2 mt-2.5">
                            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl py-1.5 px-2.5 flex items-center gap-2 border border-white/10">
                                <Clock size={11} className="text-purple-200 shrink-0" />
                                <div className="flex items-baseline gap-1">
                                    <span className="text-white font-black text-sm">{stats.todaySessions || 0}</span>
                                    <span className="text-white/50 text-[7px] font-medium">حصص</span>
                                </div>
                            </div>
                            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl py-1.5 px-2.5 flex items-center gap-2 border border-white/10">
                                <Users size={11} className="text-blue-200 shrink-0" />
                                <div className="flex items-baseline gap-1">
                                    <span className="text-white font-black text-sm">{stats.studentsCount || 0}</span>
                                    <span className="text-white/50 text-[7px] font-medium">طلاب</span>
                                </div>
                            </div>
                            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl py-1.5 px-2.5 flex items-center gap-2 border border-white/10">
                                <Award size={11} className="text-amber-200 shrink-0" />
                                <div className="flex items-baseline gap-1">
                                    <span className="text-white font-black text-sm">{(stats.attendanceRate || 0)}%</span>
                                    <span className="text-white/50 text-[7px] font-medium">حضور</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Tab bar */}
                    <div className="relative z-10 px-4 pb-0.5">
                        <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-2xl p-1">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-white text-[#6C4BFF] shadow-sm'
                                            : 'text-white/70'
                                    }`}>
                                    <tab.icon size={14} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="px-3 pt-3 space-y-3.5">
                    {activeTab === 'home' && (
                        <>
                            <section>
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <div className="w-1 h-4 bg-[#6C4BFF] rounded-full" />
                                    <h2 className="text-[#1E1E2F] dark:text-white text-[13px] font-black">البث المباشر</h2>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-slate-900/50 overflow-hidden">
                                    <div className="p-3.5"><LiveClasses /></div>
                                </div>
                            </section>
                            <section>
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <div className="w-1 h-4 bg-[#F5A623] rounded-full" />
                                    <h2 className="text-[#1E1E2F] dark:text-white text-[13px] font-black">الإعلانات</h2>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-slate-900/50 overflow-hidden">
                                    <div className="p-3.5"><ModernAnnouncements /></div>
                                </div>
                            </section>
                        </>
                    )}

                    {activeTab === 'schedule' && (
                        <>
                            {(stats.todayTimeline || []).length > 0 ? (
                                <section>
                                    <div className="flex items-center gap-2 mb-2 px-1">
                                        <div className="w-1 h-4 bg-[#3478F6] rounded-full" />
                                        <h2 className="text-[#1E1E2F] dark:text-white text-[13px] font-black">حصص اليوم</h2>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-slate-900/50 overflow-hidden">
                                        <div className="p-3.5">
                                <TeacherSessionTimeline sessions={stats.todayTimeline || []} onStudentClick={setBriefingStudent} onSessionStart={(id) => navigate(`/classroom/${id}`)} />
                                        </div>
                                    </div>
                                </section>
                            ) : (
                                <div className="py-12 text-center">
                                    <Calendar size={36} className="mx-auto text-slate-200 dark:text-slate-700 mb-3" />
                                    <p className="text-slate-400 dark:text-slate-500 font-bold text-[13px]">لا توجد حصص اليوم</p>
                                    <p className="text-slate-300 dark:text-slate-600 text-[10px] mt-1">استمتع بيومك!</p>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'reports' && (
                        <>
                            <section>
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <div className="w-1 h-4 bg-[#18C76F] rounded-full" />
                                    <h2 className="text-[#1E1E2F] dark:text-white text-[13px] font-black">الإنجازات</h2>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-slate-900/50 overflow-hidden">
                                    <div className="p-3.5">
                                        <TeacherAchievements stats={stats} lowBalanceStudents={lowBalanceStudents} isTeacher={true} />
                                    </div>
                                </div>
                            </section>
                            <section>
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <div className="w-1 h-4 bg-rose-400 rounded-full" />
                                    <h2 className="text-[#1E1E2F] dark:text-white text-[13px] font-black">المهام والطلبات</h2>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-slate-900/50 overflow-hidden">
                                    <div className="p-3.5">
                                        <TasksAndRequests tasks={tasks} />
                                    </div>
                                </div>
                            </section>
                            <section>
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <div className="w-1 h-4 bg-amber-400 rounded-full" />
                                    <h2 className="text-[#1E1E2F] dark:text-white text-[13px] font-black">أعلى حضور</h2>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-slate-900/50 overflow-hidden">
                                    <div className="p-3.5">
                                        <TopAttendanceStudents sessions={rawSessions} onStudentClick={setBriefingStudent} />
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    <div className="h-4" />
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
                        onShare={() => {}}
                    />
                )}
            </div>
        </>
    );
};

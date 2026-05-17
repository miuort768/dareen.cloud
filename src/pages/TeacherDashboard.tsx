import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
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
import { Sparkles, CalendarDays, Users, BookOpen, CalendarCheck, CheckCircle2 } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) => {
    const colors: any = {
        indigo: "border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/10",
        purple: "border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-900/10",
        slate: "border-slate-500 text-slate-600 bg-slate-50 dark:bg-slate-900/10",
        emerald: "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10",
        amber: "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/10",
    };
    return (
        <div className={cn("bg-white dark:bg-slate-900 border-b-2 md:border-b-4 p-3 md:p-5 flex flex-col items-center justify-center text-center shadow-sm rounded-none transition-all duration-300 hover:shadow-[0_0_12px_rgba(99,102,241,0.15)] dark:hover:shadow-[0_0_12px_rgba(99,102,241,0.1)]", colors[color] || colors.indigo)}>
            <div className="w-6 h-6 md:w-10 md:h-10 flex items-center justify-center mb-1.5 md:mb-3">
                <Icon size={18} className="md:size-24" />
            </div>
            <span className="text-lg md:text-2xl font-heading font-black text-slate-900 dark:text-white leading-none">{value}</span>
            <span className="text-[7px] md:text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase mt-1 tracking-widest leading-none">{label}</span>
        </div>
    );
};

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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 px-3 md:px-12 pt-4 md:pt-6 space-y-6 md:space-y-8 relative overflow-hidden" dir="rtl">
            
            {/* Premium Background Decorations */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[100px]"></div>
            </div>

            {/* ═══════════════ HEADER ═══════════════ */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-none mb-1">
                        <Sparkles size={10} className="text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">لوحة المعلم</span>
                    </div>
                    <h1 className="text-2xl md:text-5xl font-heading font-black text-slate-900 dark:text-white tracking-tighter">
                        أهلاً بكِ، <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">أ. {currentUser?.name?.split(' ')[0]}</span> ✨
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm font-bold flex items-center gap-1.5">
                        <CalendarDays size={12} className="text-indigo-500" />
                        {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
                    </p>
                </div>
            </div>

            {/* ═══════════════ STATS GRID ═══════════════ */}
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={Users} label="إجمالي الطلاب" value={stats.studentsCount} color="indigo" />
                <StatCard icon={BookOpen} label="الاشتراكات النشطة" value={stats.totalEnrollments} color="purple" />
                <StatCard icon={CalendarCheck} label="حصص اليوم" value={stats.todaySessions} color="amber" />
                <StatCard icon={CheckCircle2} label="الحصص المنفذة" value={stats.completedSessions} color="emerald" />
            </div>

            {/* ═══════════════ MAIN CONTENT SECTION ═══════════════ */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-bottom-4 duration-500">
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

export default TeacherDashboard;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, Award, User, Bell, LayoutDashboard, Calendar, CheckSquare, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card } from '@/components/ui/card';
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

interface TeacherDashboardMobileProps {
    currentUser: User | null;
    stats: DashboardStatsType;
    rawSessions: unknown[];
    tasks: DashboardTask[];
    lowBalanceStudents: LowBalanceStudent[];
    focusStudents: { id: string; name: string; reason: string; type: string }[];
    timeline: { id: string; studentName: string; time: string; subject: string; status: string }[];
}

const tabs = [
    { id: 'home' as const, label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'schedule' as const, label: 'الجدول', icon: Calendar },
    { id: 'reports' as const, label: 'التقارير', icon: CheckSquare },
];

const glass = "bg-white/80 dark:bg-black/50 backdrop-blur-xl border-b border-white/20 dark:border-white/10";
const cardGlass = "bg-white/70 dark:bg-white/[0.07] backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-lg shadow-black/[0.03]";

export const TeacherDashboardMobile = ({ currentUser, stats, rawSessions, tasks, lowBalanceStudents, focusStudents, timeline }: TeacherDashboardMobileProps) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'reports'>('home');
    const [briefingStudent, setBriefingStudent] = useState<{ id?: string; name?: string; grade?: string; notes?: string; totalPoints?: number } | null>(null);
    const [selectedStudentForReport, setSelectedStudentForReport] = useState<{ id: string; name: string; grade: string; subject: string; points: number; attendance: number; sessionsCompleted: number; lastNotes: string[] } | null>(null);

    const nextSession = timeline.find(s => s.status === 'scheduled' || s.status === 'in-progress');

    return (
        <div className="min-h-full pb-28 relative bg-gradient-to-b from-sky-50 via-white to-white dark:from-slate-950 dark:via-background dark:to-background font-sans" dir="rtl">

            {/* Frosted Glass Header */}
            <div className={cn("sticky top-0 z-50 transition-all duration-500", glass)}>
                <div className="px-5 pt-5 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20">
                                <User size={18} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-main leading-tight">{(currentUser?.name || currentUser?.username || 'المعلم').split(' ')[0]}</h1>
                                <p className="text-[11px] font-medium text-muted">معلم</p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-white/50 dark:bg-white/10 flex items-center justify-center relative">
                            <Bell size={15} className="text-muted" />
                            <span className="absolute -top-0.5 -end-0.5 w-2 h-2 bg-error rounded-full border-2 border-white dark:border-black" />
                        </div>
                    </div>
                    {/* Stats row */}
                    <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1 bg-white/50 dark:bg-white/5 rounded-xl py-2 px-3 flex items-center gap-2 border border-white/20 dark:border-white/5">
                            <Clock size={12} className="text-primary shrink-0" />
                            <div className="flex items-baseline gap-1"><span className="text-main font-black text-sm">{stats.todaySessions || 0}</span><span className="text-muted text-micro font-medium">حصص</span></div>
                        </div>
                        <div className="flex-1 bg-white/50 dark:bg-white/5 rounded-xl py-2 px-3 flex items-center gap-2 border border-white/20 dark:border-white/5">
                            <Users size={12} className="text-info shrink-0" />
                            <div className="flex items-baseline gap-1"><span className="text-main font-black text-sm">{stats.studentsCount || 0}</span><span className="text-muted text-micro font-medium">طلاب</span></div>
                        </div>
                        <div className="flex-1 bg-white/50 dark:bg-white/5 rounded-xl py-2 px-3 flex items-center gap-2 border border-white/20 dark:border-white/5">
                            <Award size={12} className="text-success shrink-0" />
                            <div className="flex items-baseline gap-1"><span className="text-main font-black text-sm">{(stats.attendanceRate || 0)}%</span><span className="text-muted text-micro font-medium">حضور</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="px-4 pt-4 pb-4">
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                        {activeTab === 'home' && (
                            <div className="space-y-4">
                                {nextSession && (
                                    <div className={cardGlass + " p-4"}>
                                        <NextSessionHero timeline={timeline} onStart={(id) => navigate(`/classroom/${id}`)} />
                                    </div>
                                )}
                                <div className={cardGlass + " p-4"}>
                                    <QuickActions navigate={navigate} onStartSession={() => { if (nextSession) navigate(`/classroom/${nextSession.id}`); }} />
                                </div>
                                <div className={cardGlass + " p-4"}>
                                    <SmartNotifications lowBalanceStudents={lowBalanceStudents} focusStudents={focusStudents || []} />
                                </div>
                                <section>
                                    <div className="flex items-center gap-2 mb-3 px-1">
                                        <Sparkles size={13} className="text-primary" />
                                        <h2 className="text-xs font-bold text-muted">البث المباشر</h2>
                                    </div>
                                    <Card><div className="p-3.5"><LiveClasses /></div></Card>
                                </section>
                                <section>
                                    <div className="flex items-center gap-2 mb-3 px-1">
                                        <Sparkles size={13} className="text-warning" />
                                        <h2 className="text-xs font-bold text-muted">الإعلانات</h2>
                                    </div>
                                    <Card><div className="p-3.5"><ModernAnnouncements /></div></Card>
                                </section>
                            </div>
                        )}
                        {activeTab === 'schedule' && (
                            <div className="space-y-4">
                                {timeline.length > 0 ? (
                                    <section>
                                        <div className="flex items-center gap-2 mb-3 px-1">
                                            <Sparkles size={13} className="text-info" />
                                            <h2 className="text-xs font-bold text-muted">حصص اليوم</h2>
                                        </div>
                                        <div className={cardGlass + " p-4"}>
                                            <TeacherSessionTimeline sessions={timeline} onStudentClick={setBriefingStudent} onSessionStart={(id) => navigate(`/classroom/${id}`)} />
                                        </div>
                                    </section>
                                ) : (
                                    <div className="py-12 text-center"><Calendar size={36} className="mx-auto text-dim mb-3" /><p className="text-muted font-bold text-sm">لا توجد حصص اليوم</p><p className="text-dim text-micro mt-1">استمتع بيومك!</p></div>
                                )}
                            </div>
                        )}
                        {activeTab === 'reports' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className={cardGlass + " p-4"}>
                                        <FinancialSnapshot monthNetProfit={stats.monthNetProfit} monthRevenue={stats.monthRevenue} expectedCollection={stats.expectedCollection} />
                                    </div>
                                    <div className={cardGlass + " p-4"}>
                                        <AttendanceChart rate={stats.attendanceRate} />
                                    </div>
                                </div>
                                <section>
                                    <div className="flex items-center gap-2 mb-3 px-1">
                                        <Sparkles size={13} className="text-success" />
                                        <h2 className="text-xs font-bold text-muted">الإنجازات</h2>
                                    </div>
                                    <Card><div className="p-3.5"><TeacherAchievements stats={stats} lowBalanceStudents={lowBalanceStudents} isTeacher={true} /></div></Card>
                                </section>
                                <section>
                                    <div className="flex items-center gap-2 mb-3 px-1">
                                        <Sparkles size={13} className="text-error" />
                                        <h2 className="text-xs font-bold text-muted">المهام والطلبات</h2>
                                    </div>
                                    <Card><div className="p-3.5"><TasksAndRequests tasks={tasks} /></div></Card>
                                </section>
                                <section>
                                    <div className="flex items-center gap-2 mb-3 px-1">
                                        <Sparkles size={13} className="text-warning" />
                                        <h2 className="text-xs font-bold text-muted">أعلى حضور</h2>
                                    </div>
                                    <Card><div className="p-3.5"><TopAttendanceStudents sessions={rawSessions} onStudentClick={setBriefingStudent} /></div></Card>
                                </section>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* iOS-style Bottom Tab Bar */}
            <div className="fixed bottom-0 inset-x-0 z-50">
                <div className="h-2 bg-white dark:bg-black" />
                <div className="bg-white/90 dark:bg-black/80 backdrop-blur-2xl border-t border-white/20 dark:border-white/10 shadow-2xl shadow-black/5">
                    <div className="flex items-center justify-around px-2 py-1.5">
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <motion.button key={tab.id} whileTap={{ scale: 0.9 }}
                                    onClick={() => setActiveTab(tab.id)}
                                    className="relative flex flex-col items-center gap-0.5 py-1 px-4 min-w-[64px]"
                                >
                                    <div className={cn(
                                        "rounded-xl p-1.5 transition-all duration-300 relative",
                                        isActive && "bg-gradient-to-br from-primary/10 to-purple-500/10"
                                    )}>
                                        <tab.icon size={20} strokeWidth={isActive ? 2 : 1.5}
                                            className={cn("transition-colors duration-300", isActive ? "text-primary" : "text-muted")}
                                        />
                                    </div>
                                    <span className={cn("text-[10px] font-bold transition-all duration-300", isActive ? "text-primary" : "text-muted")}>
                                        {tab.label}
                                    </span>
                                    {isActive && (
                                        <motion.div layoutId="teacher-tab-indicator"
                                            className="absolute -top-1.5 w-8 h-1 rounded-full bg-gradient-to-r from-primary to-purple-500 shadow-lg shadow-primary/30"
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>

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
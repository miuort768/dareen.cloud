import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Award, User, Bell, LayoutDashboard, Calendar, CheckSquare } from 'lucide-react';
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
    { id: 'home', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'schedule', label: 'الجدول', icon: Calendar },
    { id: 'reports', label: 'التقارير', icon: CheckSquare },
];

export const TeacherDashboardMobile = ({ currentUser, stats, rawSessions, tasks, lowBalanceStudents, focusStudents, timeline }: TeacherDashboardMobileProps) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [briefingStudent, setBriefingStudent] = useState<{ id?: string; name?: string; grade?: string; notes?: string; totalPoints?: number } | null>(null);
    const [selectedStudentForReport, setSelectedStudentForReport] = useState<{ id: string; name: string; grade: string; subject: string; points: number; attendance: number; sessionsCompleted: number; lastNotes: string[] } | null>(null);

    const nextSession = timeline.find(s => s.status === 'scheduled' || s.status === 'in-progress');

    return (
        <div className="min-h-full pb-28 relative bg-surface font-sans" dir="rtl">
            <div className="sticky top-0 z-30 bg-primary shadow-sm">
                <div className="px-4 pt-12 pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-primary-soft rounded-card flex items-center justify-center">
                                <User size={18} className="text-on-primary" />
                            </div>
                            <div>
                                <h1 className="text-on-primary font-black text-sm leading-tight">{(currentUser?.name || currentUser?.username || 'المعلم').split(' ')[0]}</h1>
                                <p className="text-on-primary opacity-50 text-micro font-medium">معلم</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-soft rounded-card flex items-center justify-center relative">
                                <Bell size={15} className="text-on-primary opacity-80" />
                                <span className="absolute -top-0.5 -end-0.5 w-2 h-2 bg-error rounded-full border border-primary" />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5">
                        <div className="flex-1 bg-primary-soft rounded-card py-1.5 px-2.5 flex items-center gap-2">
                            <Clock size={11} className="text-on-primary opacity-60 shrink-0" />
                            <div className="flex items-baseline gap-1"><span className="text-on-primary font-black text-sm">{stats.todaySessions || 0}</span><span className="text-on-primary opacity-50 text-micro font-medium">حصص</span></div>
                        </div>
                        <div className="flex-1 bg-primary-soft rounded-card py-1.5 px-2.5 flex items-center gap-2">
                            <Users size={11} className="text-on-primary opacity-60 shrink-0" />
                            <div className="flex items-baseline gap-1"><span className="text-on-primary font-black text-sm">{stats.studentsCount || 0}</span><span className="text-on-primary opacity-50 text-micro font-medium">طلاب</span></div>
                        </div>
                        <div className="flex-1 bg-primary-soft rounded-card py-1.5 px-2.5 flex items-center gap-2">
                            <Award size={11} className="text-on-primary opacity-60 shrink-0" />
                            <div className="flex items-baseline gap-1"><span className="text-on-primary font-black text-sm">{(stats.attendanceRate || 0)}%</span><span className="text-on-primary opacity-50 text-micro font-medium">حضور</span></div>
                        </div>
                    </div>
                </div>
                <div className="px-4 pb-0.5">
                    <div className="flex gap-1 bg-primary-soft rounded-card p-1">
                        {tabs.map(tab => (
                            <button key={tab.id} id={`tab-${tab.id}`} onClick={() => setActiveTab(tab.id)} role="tab" aria-selected={activeTab === tab.id} aria-controls={`tabpanel-${tab.id}`}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-micro font-bold transition-all ${activeTab === tab.id ? 'bg-card text-primary shadow-sm' : 'text-on-primary opacity-70'}`}>
                                <tab.icon size={14} /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-3 pt-3 space-y-3.5">
                {activeTab === 'home' && (
                    <div role="tabpanel" id="tabpanel-home" aria-labelledby="tab-home">
                        {nextSession && <NextSessionHero timeline={timeline} onStart={(id) => navigate(`/classroom/${id}`)} />}
                        <QuickActions navigate={navigate} onStartSession={() => { if (nextSession) navigate(`/classroom/${nextSession.id}`); }} />
                        <SmartNotifications lowBalanceStudents={lowBalanceStudents} focusStudents={focusStudents || []} />
                        <section><div className="flex items-center gap-2 mb-2 px-1"><div className="w-1 h-4 bg-primary rounded-full" /><h2 className="text-main dark:text-main text-sm font-black">البث المباشر</h2></div><Card><div className="p-3.5"><LiveClasses /></div></Card></section>
                        <section><div className="flex items-center gap-2 mb-2 px-1"><div className="w-1 h-4 bg-warning rounded-full" /><h2 className="text-main dark:text-main text-sm font-black">الإعلانات</h2></div><Card><div className="p-3.5"><ModernAnnouncements /></div></Card></section>
                    </div>
                )}
                {activeTab === 'schedule' && (
                    <div role="tabpanel" id="tabpanel-schedule" aria-labelledby="tab-schedule">
                        {timeline.length > 0 ? (
                            <section><div className="flex items-center gap-2 mb-2 px-1"><div className="w-1 h-4 bg-info rounded-full" /><h2 className="text-main dark:text-main text-sm font-black">حصص اليوم</h2></div><Card><div className="p-3.5"><TeacherSessionTimeline sessions={timeline} onStudentClick={setBriefingStudent} onSessionStart={(id) => navigate(`/classroom/${id}`)} /></div></Card></section>
                        ) : (
                            <div className="py-12 text-center"><Calendar size={36} className="mx-auto text-dim mb-3" /><p className="text-muted font-bold text-sm">لا توجد حصص اليوم</p><p className="text-dim text-micro mt-1">استمتع بيومك!</p></div>
                        )}
                    </div>
                )}
                {activeTab === 'reports' && (
                    <div role="tabpanel" id="tabpanel-reports" aria-labelledby="tab-reports">
                        <div className="grid grid-cols-2 gap-3">
                            <FinancialSnapshot monthNetProfit={stats.monthNetProfit} monthRevenue={stats.monthRevenue} expectedCollection={stats.expectedCollection} />
                            <AttendanceChart rate={stats.attendanceRate} />
                        </div>
                        <section><div className="flex items-center gap-2 mb-2 px-1"><div className="w-1 h-4 bg-success rounded-full" /><h2 className="text-main dark:text-main text-sm font-black">الإنجازات</h2></div><Card><div className="p-3.5"><TeacherAchievements stats={stats} lowBalanceStudents={lowBalanceStudents} isTeacher={true} /></div></Card></section>
                        <section><div className="flex items-center gap-2 mb-2 px-1"><div className="w-1 h-4 bg-error rounded-full" /><h2 className="text-main dark:text-main text-sm font-black">المهام والطلبات</h2></div><Card><div className="p-3.5"><TasksAndRequests tasks={tasks} /></div></Card></section>
                        <section><div className="flex items-center gap-2 mb-2 px-1"><div className="w-1 h-4 bg-warning rounded-full" /><h2 className="text-main dark:text-main text-sm font-black">أعلى حضور</h2></div><Card><div className="p-3.5"><TopAttendanceStudents sessions={rawSessions} onStudentClick={setBriefingStudent} /></div></Card></section>
                    </div>
                )}
                <div className="h-4" />
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

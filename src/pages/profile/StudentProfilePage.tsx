import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    GraduationCap, BookOpen, Trophy, Target, Star,
    Phone, User, CalendarDays, TrendingUp,
    CheckCircle2, Play, Flame, XCircle, Calendar
} from 'lucide-react';
import { api } from '../../lib/api';
import { useCurrentUser, useLogout, useAcademyName } from '../../context/AppContext';
import { getRankByPoints, getNextRank, STUDENT_RANKS } from '../../shared/utils/ranks';
import { Skeleton } from '../../shared/components/ui';
import { StudentDashboardHeader } from '../student-dashboard/StudentDashboardHeader';
import { ProfileHero } from './ProfileHero';
import { ProfileAchievements } from './ProfileAchievements';
import { ProfileProgress } from './ProfileProgress';
import { ProfileRecentActivity } from './ProfileRecentActivity';
import { ProfileBottomMotivation } from './ProfileBottomMotivation';

const stagger = (i: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.04, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
});

interface StudentData {
    id?: string;
    name?: string;
    grade?: string;
    curriculum?: string;
    totalPoints?: number;
    parentPhone?: string;
    studentPhone?: string;
    email?: string;
    city?: string;
    enrollments?: {
        id?: string;
        subject?: string;
        teacherName?: string;
        teacher?: string;
        sessionsUsed?: number;
        sessionsTotal?: number;
        schedule?: { day: string; hour: string; period: string }[];
        nextSessionNotes?: string;
    }[];
    [key: string]: unknown;
}

interface Session {
    id?: string;
    status: string;
    subject?: string;
    teacherName?: string;
    date?: string;
}

const StatCard = ({ icon, value, label, trend, color = 'primary' }: {
    icon: React.ReactNode; value: string | number; label: string; trend?: { value: number; isUp: boolean }; color?: string;
}) => {
    const colorMap: Record<string, { bg: string; ring: string; text: string }> = {
        primary: { bg: 'bg-primary/10', ring: 'ring-primary/20', text: 'text-primary' },
        success: { bg: 'bg-success/10', ring: 'ring-success/20', text: 'text-success' },
        warning: { bg: 'bg-warning/10', ring: 'ring-warning/20', text: 'text-warning' },
        info: { bg: 'bg-info/10', ring: 'ring-info/20', text: 'text-info' },
        error: { bg: 'bg-error/10', ring: 'ring-error/20', text: 'text-error' },
    };
    const c = colorMap[color] || colorMap.primary;

    return (
        <div className="group bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-start justify-between mb-2.5">
                <div className={`w-10 h-10 rounded-xl ring-1 ${c.ring} ${c.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${trend.isUp ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        {trend.isUp ? <TrendingUp size={9} /> : <TrendingUp size={9} className="rotate-180" />}
                        <span>{trend.value}%</span>
                    </div>
                )}
            </div>
            <p className="text-xl md:text-[26px] font-bold tabular-nums text-main leading-none mb-0.5">{value}</p>
            <p className="text-[11px] text-muted font-medium">{label}</p>
        </div>
    );
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border/50 group hover:border-border transition-colors">
        <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted font-medium">{label}</p>
            <p className="text-xs font-bold text-main truncate">{value || '—'}</p>
        </div>
    </div>
);

export const StudentProfilePage = () => {
    const academyName = useAcademyName();
    useEffect(() => { document.title = `الملف الشخصي | ${academyName} للتعليم والتدريب`; }, [academyName]);
    const currentUser = useCurrentUser();
    const logout = useLogout();
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const fetchAll = async () => {
            try {
                setIsLoading(true);
                const [meRes, sessionsRes] = await Promise.all([
                    api.get<StudentData>('/student-portal/me'),
                    api.get<Session[]>('/student-portal/me/sessions'),
                ]);
                if (cancelled) return;
                setStudentData(meRes);
                setSessions(sessionsRes);
            } catch (e) {
                console.error('Error fetching profile:', e);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        if (currentUser?.role === 'student') fetchAll();
        return () => { cancelled = true; };
    }, [currentUser]);

    const enrollments = useMemo(() => studentData?.enrollments || [], [studentData?.enrollments]);
    const points = studentData?.totalPoints || 0;
    const rank = getRankByPoints(points, STUDENT_RANKS);
    const nextRank = getNextRank(points, STUDENT_RANKS);

    const stats = useMemo(() => {
        const completed = sessions.filter(s => s.status === 'completed').length;
        const cancelled = sessions.filter(s => s.status === 'cancelled').length;
        const totalRecorded = completed + cancelled;
        let sessionsUsed = 0, sessionsTotal = 0;
        enrollments.forEach((en) => {
            sessionsUsed += Number(en.sessionsUsed || 0);
            sessionsTotal += Number(en.sessionsTotal || 0);
        });
        return {
            attendanceRate: totalRecorded > 0 ? Math.round((completed / totalRecorded) * 100) : 0,
            curriculumProgress: sessionsTotal > 0 ? Math.round((sessionsUsed / sessionsTotal) * 100) : 0,
            totalSessions: totalRecorded,
            completedSessions: completed,
            totalSubjects: enrollments.length,
            sessionsUsed,
            sessionsTotal,
        };
    }, [sessions, enrollments]);

    const achievements = [
        { id: '1', icon: <Trophy size={20} className="text-warning" />, title: 'الطالب الماسي', unlocked: points >= 1000, progress: Math.min(Math.round((points / 1000) * 100), 100) },
        { id: '2', icon: <Star size={20} className="text-warning" />, title: '500 نقطة', unlocked: points >= 500, progress: Math.min(Math.round((points / 500) * 100), 100) },
        { id: '3', icon: <BookOpen size={20} className="text-primary" />, title: '50 حصة مكتملة', unlocked: stats.completedSessions >= 50, progress: Math.min(Math.round((stats.completedSessions / 50) * 100), 100) },
        { id: '4', icon: <Flame size={20} className="text-error" />, title: 'أسبوع مثالي', unlocked: stats.attendanceRate >= 95, progress: Math.min(stats.attendanceRate, 100) },
        { id: '5', icon: <Target size={20} className="text-info" />, title: 'تقدم المنهج', unlocked: stats.curriculumProgress >= 90, progress: Math.min(stats.curriculumProgress, 100) },
    ];

    const progressItems = [
        { label: 'تقدم المنهج', value: stats.curriculumProgress },
        { label: 'الحضور', value: stats.attendanceRate },
        { label: 'إنجاز الحصص', value: stats.sessionsTotal > 0 ? Math.round((stats.sessionsUsed / stats.sessionsTotal) * 100) : 0 },
        { label: 'النقاط', value: Math.min(Math.round((points / 1000) * 100), 100) },
    ];

    const activities = sessions.slice(0, 5).map((s, i) => ({
        id: s.id || `act-${i}`,
        icon: s.status === 'completed' ? <CheckCircle2 size={14} className="text-success" /> : s.status === 'cancelled' ? <XCircle size={14} className="text-error" /> : <Calendar size={14} className="text-info" />,
        title: s.status === 'completed' ? `تم إنهاء حصة ${s.subject || ''}` : s.status === 'cancelled' ? `تم إلغاء حصة ${s.subject || ''}` : `حصة ${s.subject || ''} مجدولة`,
        description: s.teacherName ? `مع ${s.teacherName}` : undefined,
        timestamp: s.date || `منذ ${i + 1} أيام`,
        type: (s.status === 'completed' ? 'success' : s.status === 'cancelled' ? 'warning' : 'info') as 'success' | 'warning' | 'info',
    }));

    const infoFields = [
        { icon: <User size={13} className="text-primary" />, label: 'الاسم', value: studentData?.name || currentUser?.name || 'الطالب' },
        { icon: <GraduationCap size={13} className="text-info" />, label: 'الصف', value: studentData?.grade || '—' },
        { icon: <BookOpen size={13} className="text-success" />, label: 'المنهج', value: studentData?.curriculum || '—' },
        { icon: <Phone size={13} className="text-warning" />, label: 'رقم الطالب', value: studentData?.studentPhone || '—' },
        { icon: <Phone size={13} className="text-muted" />, label: 'رقم ولي الأمر', value: studentData?.parentPhone || '—' },
        { icon: <CalendarDays size={13} className="text-info" />, label: 'المدينة', value: studentData?.city || '—' },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background" dir="rtl">
                <div className="hidden md:block">
                    <StudentDashboardHeader logout={logout} />
                </div>
                <div className="max-w-page mx-auto px-4 pt-4 space-y-4">
                    <Skeleton className="h-52 rounded-3xl" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3"><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Skeleton className="h-56 rounded-2xl" /><Skeleton className="h-56 rounded-2xl" /></div>
                </div>
            </div>
        );
    }

    const name = studentData?.name || currentUser?.name || 'الطالب';

    return (
        <div className="min-h-screen bg-background overflow-x-hidden" dir="rtl">
            <div className="hidden md:block">
                <StudentDashboardHeader logout={logout} />
            </div>
            <div className="max-w-page mx-auto px-4 pt-4 pb-24 space-y-4 md:space-y-6">
                <motion.div {...stagger(0)}>
                    <ProfileHero
                        name={name}
                        role="student"
                        subtitle={`${studentData?.grade || ''} ${studentData?.curriculum ? `• ${studentData.curriculum}` : ''}`}
                        points={points}
                        rank={rank}
                        attendanceRate={stats.attendanceRate}
                    />
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard icon={<BookOpen size={18} className="text-primary" />} value={stats.totalSubjects} label="المواد المسجلة" color="primary" />
                    <StatCard icon={<Play size={18} className="text-success" />} value={stats.completedSessions} label="الحصص المكتملة" color="success" trend={{ value: stats.sessionsTotal > 0 ? Math.round((stats.completedSessions / stats.sessionsTotal) * 100) : 0, isUp: true }} />
                    <StatCard icon={<Target size={18} className="text-info" />} value={`${stats.curriculumProgress}%`} label="تقدم المنهج" color="info" trend={{ value: stats.curriculumProgress, isUp: stats.curriculumProgress >= 50 }} />
                    <StatCard icon={<Star size={18} className="text-warning" />} value={points} label="النقاط" color="warning" trend={{ value: Math.min(Math.round((points / Math.max(points, 1)) * 100), 100), isUp: true }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <motion.div {...stagger(2)} className="space-y-4 md:space-y-6">
                        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
                            <h3 className="text-base font-bold text-main mb-4 flex items-center gap-2">
                                <User size={16} className="text-primary" />
                                المعلومات الشخصية
                            </h3>
                            <div className="space-y-2.5">
                                {infoFields.map((f, i) => <InfoRow key={i} icon={f.icon} label={f.label} value={f.value} />)}
                            </div>
                        </div>

                        {enrollments.length > 0 && (
                            <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-base font-bold text-main flex items-center gap-2">
                                        <BookOpen size={16} className="text-info" />
                                        المواد المسجلة
                                    </h3>
                                    <span className="text-[11px] font-bold text-muted bg-surface px-2.5 py-1 rounded-lg">{enrollments.length} مواد</span>
                                </div>
                                <div className="space-y-2.5">
                                    {enrollments.map((en, idx) => {
                                        const used = Number(en.sessionsUsed || 0);
                                        const total = Number(en.sessionsTotal || 0);
                                        const progress = total > 0 ? Math.round((used / total) * 100) : 0;
                                        return (
                                            <div key={en.id || idx} className="p-3 bg-surface rounded-xl border border-border">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
                                                            <BookOpen size={14} className="text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-main">{en.subject || 'مادة'}</p>
                                                            <p className="text-[10px] text-muted">{en.teacherName || en.teacher || ''}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-lg">{used}/{total}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${Math.min(progress, 100)}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    <motion.div {...stagger(3)} className="space-y-4 md:space-y-6">
                        <ProfileAchievements achievements={achievements} />
                        <ProfileProgress items={progressItems} />
                    </motion.div>
                </div>

                {activities.length > 0 && (
                    <motion.div {...stagger(4)}>
                        <ProfileRecentActivity activities={activities} />
                    </motion.div>
                )}

                <motion.div {...stagger(5)}>
                    <ProfileBottomMotivation
                        icon={<Target size={28} />}
                        title={nextRank.next ? `تبقى ${nextRank.pointsNeeded} نقطة للوصول إلى ${nextRank.next.name}` : 'أحسنت! وصلت لأعلى المراتب'}
                        description={nextRank.next ? `واصل التعلم واجمع النقاط لتصل إلى الرتبة التالية` : `أنت نجم ${academyName}!`}
                        progress={nextRank.next ? Math.min(Math.round((points / (points + (nextRank.pointsNeeded || 1))) * 100), 100) : 100}
                        progressLabel="التقدم نحو الرتبة التالية"
                        targetLabel={nextRank.next ? `${nextRank.pointsNeeded} نقطة متبقية` : 'أحسنت!'}
                        color={nextRank.next ? 'primary' : 'success'}
                    />
                </motion.div>
            </div>
        </div>
    );
};

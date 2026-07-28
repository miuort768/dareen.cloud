import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    GraduationCap, BookOpen, Clock, Trophy, Target, Star,
    ArrowLeft, Phone, User, ChevronLeft
} from 'lucide-react';
import { api } from '../../lib/api';
import { useCurrentUser } from '../../context/AppContext';
import { getRankByPoints, getNextRank, STUDENT_RANKS } from '../../shared/utils/ranks';
import { Skeleton } from '../../shared/components/ui';
import { ProfileHero } from './ProfileHero';

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const stagger = (i: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.04 },
});

interface StudentData {
    id?: string;
    name?: string;
    grade?: string;
    curriculum?: string;
    totalPoints?: number;
    parentPhone?: string;
    studentPhone?: string;
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
}

export const StudentProfilePage = () => {
    useEffect(() => { document.title = 'الملف الشخصي | دارين السابعة للتعليم والتدريب'; }, []);
    const currentUser = useCurrentUser();
    const navigate = useNavigate();
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background" dir="rtl">
                <div className="max-w-page mx-auto px-4 pt-4 space-y-4">
                    <Skeleton className="h-40 rounded-2xl" />
                    <div className="grid grid-cols-2 gap-3"><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /></div>
                    <Skeleton className="h-48 rounded-2xl" />
                </div>
            </div>
        );
    }

    const name = studentData?.name || currentUser?.name || 'الطالب';

    return (
        <div className="min-h-screen bg-background overflow-x-hidden" dir="rtl">
            <div className="max-w-page mx-auto px-4 pt-4 pb-24 space-y-4">
                <motion.div {...stagger(0)}>
                    <ProfileHero
                        name={name}
                        role="student"
                        subtitle={`${studentData?.grade || ''} ${studentData?.curriculum ? '• ' + studentData.curriculum : ''}`}
                        points={points}
                        rank={rank}
                        attendanceRate={stats.attendanceRate}
                    />
                </motion.div>

                <motion.div {...stagger(1)}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <StatCard icon={<GraduationCap size={16} className="text-primary" />} label="المواد" value={stats.totalSubjects} color="bg-primary-soft ring-primary/20" />
                        <StatCard icon={<Clock size={16} className="text-info" />} label="المحاضرات" value={stats.completedSessions} color="bg-info-soft ring-info/20" />
                        <StatCard icon={<Target size={16} className="text-success" />} label="المنهج" value={`${stats.curriculumProgress}%`} color="bg-success-soft ring-success/20" />
                        <StatCard icon={<Trophy size={16} className="text-warning" />} label="النقاط" value={points} color="bg-warning-soft ring-warning/20" />
                    </div>
                </motion.div>

                <motion.div {...stagger(2)}>
                    <div className="bg-card border border-border rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-main mb-4">المعلومات الشخصية</h3>
                        <div className="space-y-3">
                            <InfoRow icon={<User size={14} className="text-primary" />} label="الاسم" value={name} />
                            <InfoRow icon={<GraduationCap size={14} className="text-info" />} label="الصف" value={studentData?.grade || '—'} />
                            <InfoRow icon={<BookOpen size={14} className="text-success" />} label="المنهج" value={studentData?.curriculum || '—'} />
                            {studentData?.studentPhone && (
                                <InfoRow icon={<Phone size={14} className="text-warning" />} label="رقم الطالب" value={studentData.studentPhone} />
                            )}
                            {studentData?.parentPhone && (
                                <InfoRow icon={<Phone size={14} className="text-muted" />} label="رقم ولي الأمر" value={studentData.parentPhone} />
                            )}
                        </div>
                    </div>
                </motion.div>

                {enrollments.length > 0 && (
                    <motion.div {...stagger(3)}>
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-main">المواد المسجلة</h3>
                                <span className="text-micro font-bold text-muted bg-surface px-2 py-0.5 rounded-lg">{enrollments.length} مواد</span>
                            </div>
                            <div className="space-y-3">
                                {enrollments.map((en, idx) => {
                                    const used = Number(en.sessionsUsed || 0);
                                    const total = Number(en.sessionsTotal || 0);
                                    const progress = total > 0 ? Math.round((used / total) * 100) : 0;
                                    return (
                                        <div key={en.id || idx} className="p-3 bg-surface rounded-xl border border-border">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center">
                                                        <BookOpen size={14} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-main">{en.subject || 'مادة'}</p>
                                                        <p className="text-micro text-muted">{en.teacherName || en.teacher || ''}</p>
                                                    </div>
                                                </div>
                                                <span className="text-micro font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-lg">{used}/{total}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                                                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                <motion.div {...stagger(4)}>
                    <div className="bg-card border border-border rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-main">التقدم والإنجازات</h3>
                            <span className="text-lg">{rank.icon}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="p-3 bg-surface rounded-xl text-center">
                                <p className="text-lg font-bold text-main">{stats.attendanceRate}%</p>
                                <p className="text-micro text-muted font-medium">نسبة الحضور</p>
                            </div>
                            <div className="p-3 bg-surface rounded-xl text-center">
                                <p className="text-lg font-bold text-main">{stats.curriculumProgress}%</p>
                                <p className="text-micro text-muted font-medium">تقدم المنهج</p>
                            </div>
                        </div>
                        <div className="p-3 bg-surface rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-main">{rank.name}</p>
                                {nextRank.next && (
                                    <p className="text-micro text-muted">{nextRank.pointsNeeded} نقطة للرتبة التالية</p>
                                )}
                            </div>
                            <span className="text-xs font-bold text-primary bg-primary-soft px-2.5 py-1 rounded-lg">{points} نقطة</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) => (
    <div className="bg-card border border-border rounded-2xl p-3 flex flex-col items-center gap-1.5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ring-1 ${color}`}>
            {icon}
        </div>
        <span className="text-sm font-bold text-main">{value}</span>
        <span className="text-micro text-muted font-medium">{label}</span>
    </div>
);

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-center gap-3 p-2.5 bg-surface rounded-xl">
        <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-micro text-muted font-medium">{label}</p>
            <p className="text-xs font-bold text-main truncate">{value}</p>
        </div>
    </div>
);

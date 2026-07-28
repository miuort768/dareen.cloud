import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Phone, Mail, Users, BookOpen, Clock, Star,
    ChevronLeft, User
} from 'lucide-react';
import { api } from '../../lib/api';
import { useCurrentUser } from '../../context/AppContext';
import { getRankByPoints, STUDENT_RANKS } from '../../shared/utils/ranks';
import { Skeleton } from '../../shared/components/ui';
import { ProfileHero } from './ProfileHero';
import type { Student } from '../../types';

const stagger = (i: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.04 },
});

export const ParentProfilePage = () => {
    useEffect(() => { document.title = 'الملف الشخصي | دارين السابعة للتعليم والتدريب'; }, []);
    const currentUser = useCurrentUser();
    const navigate = useNavigate();
    const [children, setChildren] = useState<Student[]>([]);
    const [allPointLogs, setAllPointLogs] = useState<{ id: string; points?: number; studentName?: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const fetchAll = async () => {
            try {
                setIsLoading(true);
                const students = await api.get<Student[]>('/parents/my-children');
                if (cancelled) return;
                setChildren(students);

                const logsPromises = students.map(async s => {
                    try {
                        return await api.get<unknown[]>(`/student-portal/me/points-log?studentId=${s.id}`) || [];
                    } catch { return []; }
                });
                const allLogsResults = await Promise.all(logsPromises);
                if (cancelled) return;

                const flattenedLogs = allLogsResults.map((logs, idx) =>
                    (Array.isArray(logs) ? logs : []).map((l: { id: string; points?: number }) => ({ ...l, studentName: students[idx].name }))
                ).flat();
                setAllPointLogs(flattenedLogs);
            } catch (e) {
                console.error('Error fetching parent profile:', e);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        if (currentUser?.role === 'parent') fetchAll();
        return () => { cancelled = true; };
    }, [currentUser]);

    const totalPoints = useMemo(() => {
        return allPointLogs.reduce((sum, l) => sum + (l.points || 0), 0);
    }, [allPointLogs]);

    const rank = getRankByPoints(totalPoints, STUDENT_RANKS);

    const childrenStats = useMemo(() => {
        return children.map(child => {
            const enrollments = child.enrollments || [];
            const totalUsed = enrollments.reduce((s, en) => s + Number(en.sessionsUsed || 0), 0);
            const totalSessions = enrollments.reduce((s, en) => s + Number(en.sessionsTotal || 0), 0);
            const progress = totalSessions > 0 ? Math.round((totalUsed / totalSessions) * 100) : 0;
            return { ...child, progress, subjectCount: enrollments.length };
        });
    }, [children]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background" dir="rtl">
                <div className="max-w-page mx-auto px-4 pt-4 space-y-4">
                    <Skeleton className="h-40 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-48 rounded-2xl" />
                </div>
            </div>
        );
    }

    const name = currentUser?.name || currentUser?.username || 'ولي الأمر';

    return (
        <div className="min-h-screen bg-background overflow-x-hidden" dir="rtl">
            <div className="max-w-page mx-auto px-4 pt-4 pb-24 space-y-4">
                <motion.div {...stagger(0)}>
                    <ProfileHero
                        name={name}
                        role="parent"
                        subtitle={`${children.length} ${children.length === 1 ? 'ابن' : 'أبناء'} مسجلين`}
                        points={totalPoints}
                        rank={rank}
                    />
                </motion.div>

                <motion.div {...stagger(1)}>
                    <div className="grid grid-cols-2 gap-2">
                        <StatCard icon={<Users size={16} className="text-primary" />} label="الأبناء" value={children.length} color="bg-primary-soft ring-primary/20" />
                        <StatCard icon={<BookOpen size={16} className="text-info" />} label="المواد" value={children.reduce((s, c) => s + (c.enrollments?.length || 0), 0)} color="bg-info-soft ring-info/20" />
                    </div>
                </motion.div>

                <motion.div {...stagger(2)}>
                    <div className="bg-card border border-border rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-main mb-4">المعلومات الشخصية</h3>
                        <div className="space-y-3">
                            <InfoRow icon={<User size={14} className="text-primary" />} label="الاسم" value={name} />
                            {currentUser?.username && (
                                <InfoRow icon={<Mail size={14} className="text-muted" />} label="اسم المستخدم" value={currentUser.username} />
                            )}
                            <InfoRow icon={<Users size={14} className="text-info" />} label="عدد الأبناء" value={`${children.length}`} />
                        </div>
                    </div>
                </motion.div>

                {childrenStats.length > 0 && (
                    <motion.div {...stagger(3)}>
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-main">الأبناء</h3>
                                <button
                                    onClick={() => navigate('/parent-students')}
                                    className="text-micro font-bold text-primary flex items-center gap-1 hover:underline"
                                >
                                    عرض الكل <ChevronLeft size={12} />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {childrenStats.map((child) => (
                                    <div key={child.id} className="p-3 bg-surface rounded-xl border border-border">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                                                <span className="text-sm font-bold text-primary">{(child.name || 'ط').charAt(0)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-main truncate">{child.name}</p>
                                                <div className="flex items-center gap-2 text-micro text-muted">
                                                    {child.grade && <span>{child.grade}</span>}
                                                    <span>• {child.subjectCount} مواد</span>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-lg">{child.progress}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(child.progress, 100)}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                <motion.div {...stagger(4)}>
                    <div className="bg-card border border-border rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-main mb-3">الإنجازات</h3>
                        <div className="p-3 bg-surface rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{rank.icon}</span>
                                <div>
                                    <p className="text-xs font-bold text-main">{rank.name}</p>
                                    <p className="text-micro text-muted">{totalPoints} نقطة</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-primary bg-primary-soft px-2.5 py-1 rounded-lg">{totalPoints} نقطة</span>
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

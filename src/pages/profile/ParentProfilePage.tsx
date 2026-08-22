import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Phone, Mail, Users, BookOpen, Star, User,
    TrendingUp, ChevronLeft, Heart,
    Trophy, Flame
} from 'lucide-react';
import { api } from '../../lib/api';
import { useCurrentUser, useLogout, useAcademyName } from '../../context/AppContext';
import { getRankByPoints, STUDENT_RANKS } from '../../shared/utils/ranks';
import { Skeleton } from '../../shared/components/ui';
import { ParentDashboardHeader } from '../parent-dashboard/ParentDashboardHeader';
import { ProfileHero } from './ProfileHero';
import { ProfileAchievements } from './ProfileAchievements';
import { ProfileRecentActivity } from './ProfileRecentActivity';
import { ProfileBottomMotivation } from './ProfileBottomMotivation';
import type { Student } from '../../types';

const stagger = (i: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.04, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
});

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

interface PointLog {
    id: string;
    points?: number;
    studentName?: string;
    reason?: string;
    createdAt?: string;
}

export const ParentProfilePage = () => {
    const academyName = useAcademyName();
    useEffect(() => { document.title = `الملف الشخصي | ${academyName}`; }, [academyName]);
    const currentUser = useCurrentUser();
    const logout = useLogout();
    const navigate = useNavigate();
    const [children, setChildren] = useState<Student[]>([]);
    const [pointLogs, setPointLogs] = useState<PointLog[]>([]);
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
                        const logs = await api.get<PointLog[]>(`/student-portal/me/points-log?studentId=${s.id}`);
                        return (logs || []).map(l => ({ ...l, studentName: s.name }));
                    } catch { return []; }
                });
                const allLogsResults = await Promise.all(logsPromises);
                if (cancelled) return;
                setPointLogs(allLogsResults.flat());
            } catch (e) {
                console.error('Error fetching parent profile:', e);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        if (currentUser?.role === 'parent') fetchAll();
        return () => { cancelled = true; };
    }, [currentUser]);

    const totalPoints = useMemo(() => pointLogs.reduce((s, l) => s + (l.points || 0), 0), [pointLogs]);
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

    const totalSubjects = children.reduce((s, c) => s + (c.enrollments?.length || 0), 0);

    const achievements = [
        { id: '1', icon: <Users size={20} className="text-primary" />, title: 'أب/أم مثالي', unlocked: children.length >= 2, progress: Math.min(Math.round((children.length / 2) * 100), 100) },
        { id: '2', icon: <Star size={20} className="text-warning" />, title: '500 نقطة عائلية', unlocked: totalPoints >= 500, progress: Math.min(Math.round((totalPoints / 500) * 100), 100) },
        { id: '3', icon: <BookOpen size={20} className="text-info" />, title: 'متابع مميز', unlocked: totalSubjects >= 5, progress: Math.min(Math.round((totalSubjects / 5) * 100), 100) },
        { id: '4', icon: <Flame size={20} className="text-error" />, title: 'متابعة يومية', unlocked: pointLogs.length >= 30, progress: Math.min(Math.round((pointLogs.length / 30) * 100), 100) },
        { id: '5', icon: <Trophy size={20} className="text-warning" />, title: 'عائلة ذهبية', unlocked: totalPoints >= 1000, progress: Math.min(Math.round((totalPoints / 1000) * 100), 100) },
    ];

    const activities: { id: string; icon: string; title: string; description?: string; timestamp: string; type: 'success' | 'info' | 'default' | 'warning' }[] = useMemo(() => {
        return pointLogs.slice(0, 5).map((l, i) => ({
            id: l.id || `log-${i}`,
            icon: <Star size={14} className="text-warning" />,
            title: `${l.studentName || 'طالب'} حصل على ${l.points || 0} نقطة`,
            description: l.reason || 'تقدم في التعلم',
            timestamp: l.createdAt ? new Date(l.createdAt).toLocaleDateString('ar-EG') : `منذ ${i + 1} أيام`,
            type: (l.points && l.points > 0 ? 'success' : 'info') as 'success' | 'info',
        }));
    }, [pointLogs]);

    const infoFields = [
        { icon: <User size={13} className="text-primary" />, label: 'الاسم', value: currentUser?.name || currentUser?.username || 'ولي الأمر' },
        { icon: <Phone size={13} className="text-success" />, label: 'رقم الهاتف', value: currentUser?.username || '—' },
        { icon: <Users size={13} className="text-warning" />, label: 'عدد الأبناء', value: `${children.length}` },
    ];

    const [editingName, setEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);
    const [nameOverride, setNameOverride] = useState<string | null>(null);

    const handleSaveName = async () => {
        const trimmed = nameDraft.trim();
        if (!trimmed || isSavingName) return;
        setIsSavingName(true);
        try {
            await api.put('/parents/me', { name: trimmed });
            setNameOverride(trimmed);
            setEditingName(false);
        } catch (e) {
            console.error('Error updating name:', e);
        } finally {
            setIsSavingName(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background" dir="rtl">
                <div className="hidden md:block">
                    <ParentDashboardHeader logout={logout} />
                </div>
                <div className="max-w-page mx-auto px-4 pt-4 space-y-4">
                    <Skeleton className="h-52 rounded-3xl" />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3"><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /></div>
                    <Skeleton className="h-48 rounded-2xl" />
                </div>
            </div>
        );
    }

    const name = nameOverride || currentUser?.name || currentUser?.username || 'ولي الأمر';

    return (
        <div className="min-h-screen bg-background overflow-x-hidden" dir="rtl">
            <div className="hidden md:block">
                <ParentDashboardHeader logout={logout} />
            </div>
            <div className="max-w-page mx-auto px-4 pt-4 pb-24 space-y-4 md:space-y-6">
                <motion.div {...stagger(0)}>
                    <ProfileHero
                        name={name}
                        role="parent"
                        subtitle={`${children.length} ${children.length === 1 ? 'ابن' : 'أبناء'} مسجلين`}
                        points={totalPoints}
                        rank={rank}
                        hideNavButtons
                        onEditName={() => {
                            setNameDraft(name);
                            setEditingName(true);
                        }}
                    />
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <StatCard icon={<Users size={18} className="text-primary" />} value={children.length} label="الأبناء" color="primary" trend={{ value: 100, isUp: true }} />
                    <StatCard icon={<BookOpen size={18} className="text-success" />} value={totalSubjects} label="المواد المسجلة" color="success" />
                    <StatCard icon={<Star size={18} className="text-warning" />} value={totalPoints} label="النقاط العائلية" color="warning" trend={{ value: Math.min(Math.round((totalPoints / Math.max(totalPoints, 10)) * 100), 100), isUp: true }} />
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

                        {childrenStats.length > 0 && (
                            <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-base font-bold text-main flex items-center gap-2">
                                        <Heart size={16} className="text-error" />
                                        الأبناء
                                    </h3>
                                    <button
                                        onClick={() => navigate('/parent-students')}
                                        className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline"
                                    >
                                        عرض الكل <ChevronLeft size={12} />
                                    </button>
                                </div>
                                <div className="space-y-2.5">
                                    {childrenStats.map((child) => (
                                        <div key={child.id} className="p-3 bg-surface rounded-xl border border-border">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                                                    <span className="text-sm font-bold text-primary">{(child.name || 'ط').charAt(0)}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-main truncate">{child.name}</p>
                                                    <div className="flex items-center gap-2 text-[10px] text-muted">
                                                        {child.grade && <span>{child.grade}</span>}
                                                        <span>• {child.subjectCount} {child.subjectCount === 1 ? 'مادة' : 'مواد'}</span>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-lg">{child.progress}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                                                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(child.progress, 100)}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    <motion.div {...stagger(3)} className="space-y-4 md:space-y-6">
                        <ProfileAchievements achievements={achievements} title="إنجازات العائلة" />

                        {activities.length > 0 && (
                            <ProfileRecentActivity activities={activities} title="آخر النشاطات" />
                        )}
                    </motion.div>
                </div>

                <motion.div {...stagger(4)}>
                    <ProfileBottomMotivation
                        icon={<Users size={28} />}
                        title="أنت عائلة ملهمة!"
                        description={`${children.length > 1 ? 'أبناؤك' : 'ابنك'} يتقدمون بفضل متابعتك المستمرة — استمر في دعمهم لتحقيق المزيد`}
                        progress={Math.min(Math.round((totalPoints / 1000) * 100), 100)}
                        progressLabel="النقاط العائلية"
                        targetLabel={totalPoints < 1000 ? `${1000 - totalPoints} نقطة للوصول إلى العائلة الذهبية` : 'أحسنتم!'}
                        color="primary"
                    />
                </motion.div>
            </div>

            {/* Edit name modal */}
            {editingName && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setEditingName(false)}>
                    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-elevation-2" onClick={(e) => e.stopPropagation()}>
                        <h3 className="mb-4 text-sm font-bold text-main">تعديل الاسم</h3>
                        <input
                            type="text"
                            value={nameDraft}
                            onChange={(e) => setNameDraft(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); }}
                            placeholder="أدخل الاسم الجديد"
                            aria-label="الاسم"
                            autoFocus
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold text-main outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => setEditingName(false)}
                                className="flex-1 rounded-xl bg-surface py-2.5 text-xs font-bold text-muted transition-all hover:bg-hover active:scale-95"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSaveName}
                                disabled={!nameDraft.trim() || isSavingName}
                                className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-on-primary transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-50"
                            >
                                {isSavingName ? 'جاري الحفظ...' : 'حفظ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

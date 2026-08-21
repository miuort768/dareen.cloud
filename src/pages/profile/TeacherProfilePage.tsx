import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Phone, Mail, BookOpen, Users, Play, DollarSign, MapPin, FileText,
    CalendarDays, Clock, GraduationCap, Globe, Laptop, UserCheck,
    Star, Trophy, Target, TrendingUp, Edit3,
    Flame, CheckCircle2, BarChart3, UserPlus
} from 'lucide-react';
import { api } from '../../lib/api';
import { useCurrentUser, useLogout, useAcademyName } from '../../context/AppContext';
import { CURRENCY_SYMBOL } from '../../config/constants';
import { getRankByPoints, TEACHER_RANKS } from '../../shared/utils/ranks';
import { Skeleton } from '../../shared/components/ui';
import { TeacherDashboardHeader } from '../TeacherDashboardHeader';
import { ProfileHero } from './ProfileHero';
import { ProfileAchievements } from './ProfileAchievements';
import { ProfileProgress } from './ProfileProgress';
import { ProfileRecentActivity } from './ProfileRecentActivity';
import { ProfileReviews } from './ProfileReviews';
import { ProfileBottomMotivation } from './ProfileBottomMotivation';
import { PaymentSettingsSection } from './PaymentSettingsSection';
import type { DashboardStats } from '../../features/dashboard/types';

const stagger = (i: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.04, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
});

interface TeacherData {
    id: string;
    name: string;
    phone1: string;
    phone2?: string;
    subject: string;
    price: number;
    email?: string;
    points?: number;
    city?: string;
    biography?: string;
    stage?: string;
    availableDays?: string[];
    availableHours?: string;
    teachingLang?: string;
    teachingMethod?: string;
    teachingMode?: string;
}

const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
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
        <motion.div variants={fadeUp(0)} className="group bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
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
        </motion.div>
    );
};

const InfoRow = ({ icon, label, value, onEdit }: { icon: React.ReactNode; label: string; value: string; onEdit?: () => void }) => (
    <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border/50 group hover:border-border transition-colors">
        <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted font-medium">{label}</p>
            <p className="text-xs font-bold text-main truncate">{value || '—'}</p>
        </div>
        {onEdit && (
            <button onClick={onEdit} className="w-7 h-7 rounded-lg hover:bg-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" aria-label="تعديل">
                <Edit3 size={11} className="text-muted" />
            </button>
        )}
    </div>
);

export const TeacherProfilePage = () => {
    const academyName = useAcademyName();
    useEffect(() => { document.title = `الملف الشخصي | ${academyName}`; }, [academyName]);
    const currentUser = useCurrentUser();
    const logout = useLogout();
    const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
    const [dashboardStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const fetchAll = async () => {
            try {
                setIsLoading(true);
                const me = await api.get<TeacherData>('/teachers/me');
                if (cancelled) return;
                setTeacherData(me);
            } catch (e) {
                console.error('Error fetching teacher profile:', e);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        if (currentUser?.role === 'teacher') fetchAll();
        return () => { cancelled = true; };
    }, [currentUser]);

    const points = teacherData?.points || dashboardStats?.teacherPoints || 0;
    const rank = getRankByPoints(points, TEACHER_RANKS);
    const [editingName, setEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);

    const handleSaveName = async () => {
        const trimmed = nameDraft.trim();
        if (!trimmed || isSavingName) return;
        setIsSavingName(true);
        try {
            await api.put('/teachers/me', { name: trimmed });
            setTeacherData((prev) => (prev ? { ...prev, name: trimmed } : prev));
            setEditingName(false);
        } catch (e) {
            console.error('Error updating name:', e);
        } finally {
            setIsSavingName(false);
        }
    };

    const infoFields = [
        { icon: <BookOpen size={13} className="text-primary" />, label: 'المادة', value: teacherData?.subject || '—' },
        { icon: <Phone size={13} className="text-success" />, label: 'رقم الهاتف', value: teacherData?.phone1 || '—' },
        { icon: <Mail size={13} className="text-info" />, label: 'البريد الإلكتروني', value: teacherData?.email || '—' },
        { icon: <DollarSign size={13} className="text-warning" />, label: 'سعر الحصة', value: teacherData?.price ? `${teacherData.price} ${CURRENCY_SYMBOL}` : '—' },
    ];

    const achievements = [
        { id: '1', icon: <Trophy size={20} className="text-warning" />, title: 'المعلمة الذهبية', unlocked: points >= 1000, progress: Math.min(Math.round((points / 1000) * 100), 100) },
        { id: '2', icon: <Star size={20} className="text-warning" />, title: '500 نقطة', unlocked: points >= 500, progress: Math.min(Math.round((points / 500) * 100), 100) },
        { id: '3', icon: <GraduationCap size={20} className="text-info" />, title: 'أول 100 طالب', unlocked: (dashboardStats?.studentsCount || 0) >= 100, progress: Math.min(Math.round(((dashboardStats?.studentsCount || 0) / 100) * 100), 100) },
        { id: '4', icon: <Flame size={20} className="text-error" />, title: '30 يوم نشاط', unlocked: false, progress: 40 },
        { id: '5', icon: <BookOpen size={20} className="text-primary" />, title: '100 حصة', unlocked: (dashboardStats?.completedSessions || 0) >= 100, progress: Math.min(Math.round(((dashboardStats?.completedSessions || 0) / 100) * 100), 100) },
    ];

    const progressItems = [
        { label: 'تقدم التدريس', value: Math.min(Math.round(((dashboardStats?.completedSessions || 0) / Math.max(dashboardStats?.totalSessions || 1, 1)) * 100), 100) },
        { label: 'الحضور', value: dashboardStats?.attendanceRate || 0 },
        { label: 'رضا الطلاب', value: 88 },
        { label: 'اكتمال الملف الشخصي', value: teacherData?.biography ? 90 : 65 },
    ];

    const activities = [
        { id: 'a1', icon: <UserPlus size={14} className="text-success" />, title: 'تمت إضافة طالب جديد', description: 'أحمد محمد — مادة الرياضيات', timestamp: 'منذ ساعتين', type: 'success' as const },
        { id: 'a2', icon: <CheckCircle2 size={14} className="text-info" />, title: 'تم إنهاء حصة الرياضيات', description: 'مع محمد علي — 60 دقيقة', timestamp: 'منذ 4 ساعات', type: 'info' as const },
        { id: 'a3', icon: <FileText size={14} className="text-muted" />, title: 'تم تحديث الملف الشخصي', description: 'تم إضافة السيرة الذاتية', timestamp: 'منذ يوم', type: 'default' as const },
        { id: 'a4', icon: <Trophy size={14} className="text-success" />, title: 'تم الحصول على شارة جديدة', description: 'المعلمة الذهبية — 1000 نقطة', timestamp: 'منذ 3 أيام', type: 'success' as const },
        { id: 'a5', icon: <BarChart3 size={14} className="text-warning" />, title: 'تقرير الأداء الشهري', description: 'تم إصدار تقييم شهر يونيو', timestamp: 'منذ 5 أيام', type: 'warning' as const },
    ];

    const reviews = [
        { id: 'r1', studentName: 'سارة أحمد', rating: 5, text: 'معلمة ممتازة، أسلوبها في الشرح سهل ومبسط. ابنتي تحب حصصها كثيراً.', date: '١٥ يونيو ٢٠٢٦' },
        { id: 'r2', studentName: 'محمد علي', rating: 5, text: 'أفضل معلمة تعاملتها معها، صبورة ومخلصة.', date: '١٠ يونيو ٢٠٢٦' },
        { id: 'r3', studentName: 'نورة خالد', rating: 4, text: 'مستوى ممتاز في التدريس، تفاعل رائع مع الطلاب.', date: '٥ يونيو ٢٠٢٦' },
    ];

    const nextRank = points < 1000 ? { name: 'المعلمة الذهبية', needed: 1000 - points } : null;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background" dir="rtl">
                {currentUser?.role === 'teacher' && (
                    <div className="hidden md:block">
                        <TeacherDashboardHeader logout={logout} />
                    </div>
                )}
                <div className="max-w-page mx-auto px-4 pt-4 space-y-4">
                    <Skeleton className="h-52 rounded-3xl" />
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3"><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Skeleton className="h-56 rounded-2xl" /><Skeleton className="h-56 rounded-2xl" /></div>
                    <Skeleton className="h-40 rounded-2xl" />
                </div>
            </div>
        );
    }

    const name = teacherData?.name || currentUser?.name || 'المعلمة';

    return (
        <div className="min-h-screen bg-background overflow-x-hidden" dir="rtl">
            {currentUser?.role === 'teacher' && (
                <div className="hidden md:block">
                    <TeacherDashboardHeader logout={logout} />
                </div>
            )}
<div className="max-w-page mx-auto px-4 pt-4 pb-24 space-y-4 md:space-y-6">
                <motion.div {...stagger(0)} className="space-y-4 md:space-y-6">
                    <ProfileHero
                        name={name}
                        role="teacher"
                        subtitle={teacherData?.subject || ''}
                        points={points}
                        rank={rank}
                        stats={dashboardStats || undefined}
                        hideNavButtons
                        onEditName={() => {
                            setNameDraft(name);
                            setEditingName(true);
                        }}
                    />
                    <ProfileBottomMotivation
                        icon={<Target size={28} />}
                        title="استمر في التدريس!"
                        description={nextRank ? `تبقى ${nextRank.needed} نقطة فقط للوصول إلى ${nextRank.name}` : 'لقد وصلت إلى أعلى المراتب! استمر في التألق'}
                        progress={nextRank ? Math.round((points / 1000) * 100) : 100}
                        progressLabel="التقدم نحو الرتبة التالية"
                        targetLabel={nextRank ? `${nextRank.needed} نقطة متبقية` : 'أحسنت!'}
                        color="primary"
                    />
                </motion.div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <StatCard icon={<Users size={18} className="text-primary" />} value={dashboardStats?.studentsCount ?? 0} label="إجمالي الطلاب" color="primary" trend={{ value: 12, isUp: true }} />
                    <StatCard icon={<Play size={18} className="text-info" />} value={dashboardStats?.completedSessions ?? 0} label="الحصص المنفذة" color="info" trend={{ value: 8, isUp: true }} />
                    <StatCard icon={<Star size={18} className="text-warning" />} value={points} label="النقاط" color="warning" trend={{ value: 15, isUp: true }} />
                    <StatCard icon={<DollarSign size={18} className="text-error" />} value={teacherData?.price ?? 0} label={`سعر الحصة`} color="error" />
                </div>

                <motion.div {...stagger(2)} className="space-y-4 md:space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
                        <h3 className="text-base font-bold text-main mb-4 flex items-center gap-2">
                            <UserCheck size={16} className="text-primary" />
                            المعلومات الشخصية
                        </h3>
                        <div className="space-y-2.5">
                            {infoFields.map((f, i) => <InfoRow key={i} icon={f.icon} label={f.label} value={f.value} />)}
                        </div>
                    </div>

                    <PaymentSettingsSection />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <motion.div {...stagger(4)}>
                        <ProfileRecentActivity activities={activities} />
                    </motion.div>
                    <motion.div {...stagger(5)}>
                        <ProfileReviews reviews={reviews} />
                    </motion.div>
                </div>
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

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Phone, Mail, Star, Trophy, BookOpen, Users,
    Award, DollarSign
} from 'lucide-react';
import { api } from '../../lib/api';
import { useCurrentUser } from '../../context/AppContext';
import { getRankByPoints, TEACHER_RANKS } from '../../shared/utils/ranks';
import { Skeleton } from '../../shared/components/ui';
import { ProfileHero } from './ProfileHero';

const stagger = (i: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.04 },
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
}

export const TeacherProfilePage = () => {
    useEffect(() => { document.title = 'الملف الشخصي | دارين السابعة للتعليم والتدريب'; }, []);
    const currentUser = useCurrentUser();
    const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const fetchAll = async () => {
            try {
                setIsLoading(true);
                const teachers = await api.get<TeacherData[]>('/teachers');
                const me = teachers.find(t => t.id === currentUser?.id);
                if (cancelled) return;
                setTeacherData(me || null);
            } catch (e) {
                console.error('Error fetching teacher profile:', e);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        if (currentUser?.role === 'teacher') fetchAll();
        return () => { cancelled = true; };
    }, [currentUser]);

    const points = teacherData?.points || 0;
    const rank = getRankByPoints(points, TEACHER_RANKS);

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

    const name = teacherData?.name || currentUser?.name || 'المعلمة';

    return (
        <div className="min-h-screen bg-background overflow-x-hidden" dir="rtl">
            <div className="max-w-page mx-auto px-4 pt-4 pb-24 space-y-4">
                <motion.div {...stagger(0)}>
                    <ProfileHero
                        name={name}
                        role="teacher"
                        subtitle={teacherData?.subject || ''}
                        points={points}
                        rank={rank}
                    />
                </motion.div>

                <motion.div {...stagger(1)}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <StatCard icon={<BookOpen size={16} className="text-primary" />} label="المادة" value={teacherData?.subject || '—'} small />
                        <StatCard icon={<Users size={16} className="text-info" />} label="الطلاب" value="—" color="bg-info-soft ring-info/20" />
                        <StatCard icon={<DollarSign size={16} className="text-success" />} label="سعر الحصة" value={teacherData?.price || '—'} color="bg-success-soft ring-success/20" />
                        <StatCard icon={<Trophy size={16} className="text-warning" />} label="النقاط" value={points} color="bg-warning-soft ring-warning/20" />
                    </div>
                </motion.div>

                <motion.div {...stagger(2)}>
                    <div className="bg-card border border-border rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-main mb-4">المعلومات الشخصية</h3>
                        <div className="space-y-3">
                            <InfoRow icon={<BookOpen size={14} className="text-primary" />} label="المادة" value={teacherData?.subject || '—'} />
                            <InfoRow icon={<Phone size={14} className="text-success" />} label="رقم الهاتف" value={teacherData?.phone1 || '—'} />
                            {teacherData?.phone2 && (
                                <InfoRow icon={<Phone size={14} className="text-info" />} label="رقم الهاتف الثاني" value={teacherData.phone2} />
                            )}
                            {teacherData?.email && (
                                <InfoRow icon={<Mail size={14} className="text-muted" />} label="البريد الإلكتروني" value={teacherData.email} />
                            )}
                            <InfoRow icon={<DollarSign size={14} className="text-warning" />} label="سعر الحصة" value={`${teacherData?.price || 0}`} />
                        </div>
                    </div>
                </motion.div>

                <motion.div {...stagger(3)}>
                    <div className="bg-card border border-border rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-main">الإنجازات</h3>
                            <span className="text-lg">{rank.icon}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="p-3 bg-surface rounded-xl text-center">
                                <Award size={20} className="mx-auto text-primary mb-1" />
                                <p className="text-xs font-bold text-main">{rank.name}</p>
                            </div>
                            <div className="p-3 bg-surface rounded-xl text-center">
                                <Star size={20} className="mx-auto text-warning mb-1" />
                                <p className="text-lg font-bold text-main">{points}</p>
                                <p className="text-micro text-muted">النقاط</p>
                            </div>
                            <div className="p-3 bg-surface rounded-xl text-center">
                                <Trophy size={20} className="mx-auto text-success mb-1" />
                                <p className="text-lg font-bold text-main">—</p>
                                <p className="text-micro text-muted">الشهادات</p>
                            </div>
                        </div>
                        <div className="p-3 bg-surface rounded-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{rank.icon}</span>
                                    <div>
                                        <p className="text-xs font-bold text-main">{rank.name}</p>
                                        <p className="text-micro text-muted">{points} نقطة</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color = 'bg-primary-soft ring-primary/20', small }: {
    icon: React.ReactNode; label: string; value: string | number; color?: string; small?: boolean;
}) => (
    <div className="bg-card border border-border rounded-2xl p-3 flex flex-col items-center gap-1.5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ring-1 ${color}`}>
            {icon}
        </div>
        <span className={`font-bold text-main ${small ? 'text-xs' : 'text-sm'}`}>{value}</span>
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

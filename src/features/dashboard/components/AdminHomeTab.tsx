import { UserPlus, FilePlus, Calendar, Megaphone, Users, BookOpen, TrendingUp, Award, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StatCard } from '../../../shared/components/ui';
import { cn } from '../../../lib/utils';
import { QuickLink } from './AdminQuickLink';

const glass = "bg-white/70 dark:bg-white/[0.07] backdrop-blur-xl border border-white/20 dark:border-white/10";

interface AdminHomeTabProps {
    stats: Record<string, unknown>;
    completionRate: number;
    completedSessions: number;
    todaySessions: number;
    onTabChange: (tab: 'home' | 'quick' | 'finance' | 'alerts') => void;
}

export const AdminHomeTab = ({ stats, completionRate, completedSessions, todaySessions }: AdminHomeTabProps) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-4 px-1">
            {/* Stats Row */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-3">
                {[
                    { title: 'الطلاب', value: stats.studentsCount, icon: Users, variant: 'info' as const, onClick: () => navigate('/students') },
                    { title: 'الاشتراكات', value: stats.totalEnrollments, icon: BookOpen, variant: 'success' as const, onClick: () => navigate('/schedule') },
                    { title: 'صافي الربح', value: `${(stats.totalNetProfit || 0).toLocaleString()}`, icon: TrendingUp, variant: 'primary' as const, onClick: () => {} },
                ].map((card, i) => (
                    <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
                        <div onClick={card.onClick} role="button" tabIndex={0} className="cursor-pointer">
                            <div className={cn("rounded-2xl p-4 shadow-lg shadow-black/[0.03]", glass)}>
                                <StatCard title={card.title} value={card.value} icon={card.icon} variant={card.variant} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Progress Card */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                className={cn("rounded-2xl p-5 shadow-lg shadow-black/[0.03]", glass)}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-emerald-500 flex items-center justify-center shadow-lg shadow-success/20">
                            <Award size={16} className="text-white" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-success tracking-wider">اليوم</span>
                            <h3 className="text-sm font-bold text-main">معدل تنفيذ الحصص</h3>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-success tabular-nums">{completionRate}%</span>
                </div>
                <div className="w-full h-3 bg-white/50 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(completionRate, 100)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-l from-success to-emerald-400 shadow-lg shadow-success/30"
                    />
                </div>
                <p className="text-xs text-muted mt-3 flex items-center gap-1">
                    <Sparkles size={11} className="text-success" />
                    تم تنفيذ {completedSessions} من {todaySessions} حصة
                </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                <div className="flex items-center gap-2 px-1 mb-3">
                    <Sparkles size={13} className="text-primary" />
                    <h3 className="text-xs font-bold text-muted">روابط سريعة</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { icon: UserPlus, label: 'طالب جديد', variant: 'info' as const, onClick: () => navigate('/students?action=new') },
                        { icon: FilePlus, label: 'فاتورة', variant: 'success' as const, onClick: () => navigate('/student-invoices?action=new') },
                        { icon: Calendar, label: 'الجدول', variant: 'primary' as const, onClick: () => navigate('/schedule') },
                        { icon: Megaphone, label: 'لوحة الإعلانات', variant: 'warning' as const, onClick: () => navigate('/announcements') },
                    ].map((item) => (
                        <QuickLink key={item.label} {...item} />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

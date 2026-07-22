import { Users, BookOpen, TrendingUp, Award, UserPlus, FilePlus, Calendar, Megaphone, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

interface AdminHomeTabProps {
    stats: Record<string, unknown>;
    completionRate: number;
    completedSessions: number;
    todaySessions: number;
    onTabChange: (tab: 'home' | 'quick' | 'finance' | 'alerts') => void;
}

const StatCardMobile = ({ icon: Icon, label, value, variant, onClick }: {
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
    label: string;
    value: string | number;
    variant: 'info' | 'success' | 'primary';
    onClick?: () => void;
}) => {
    const colors = {
        info: { bg: 'bg-info-soft', text: 'text-info', ring: 'ring-info/20' },
        success: { bg: 'bg-success-soft', text: 'text-success', ring: 'ring-success/20' },
        primary: { bg: 'bg-primary-soft', text: 'text-primary', ring: 'ring-primary/20' },
    };
    const c = colors[variant];
    return (
        <button onClick={onClick} className={cn("flex items-center gap-3 p-4 bg-card border border-border/50 rounded-2xl text-start active:scale-[0.98] transition-transform w-full", onClick && "cursor-pointer")}>
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ring-1", c.bg, c.ring)}>
                <Icon size={18} strokeWidth={1.5} className={c.text} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-dim truncate">{label}</p>
                <p className="text-base font-bold text-main tabular-nums mt-0.5">{value}</p>
            </div>
            {onClick && <ChevronLeft size={14} className="text-dim shrink-0" />}
        </button>
    );
};

export const AdminHomeTab = ({ stats, completionRate, completedSessions, todaySessions }: AdminHomeTabProps) => {
    const navigate = useNavigate();

    const quickActions = [
        { icon: UserPlus, label: 'طالب جديد', onClick: () => navigate('/students?action=new') },
        { icon: FilePlus, label: 'فاتورة', onClick: () => navigate('/student-invoices?action=new') },
        { icon: Calendar, label: 'الجدول', onClick: () => navigate('/schedule') },
        { icon: Megaphone, label: 'الإعلانات', onClick: () => navigate('/announcements') },
    ];

    return (
        <div className="space-y-3">
            {/* Stats — 2-col grid */}
            <div className="grid grid-cols-2 gap-3">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 }}>
                    <StatCardMobile icon={Users} label="الطلاب" value={stats.studentsCount || 0} variant="info" onClick={() => navigate('/students')} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
                    <StatCardMobile icon={BookOpen} label="الاشتراكات" value={stats.totalEnrollments || 0} variant="success" onClick={() => navigate('/schedule')} />
                </motion.div>
            </div>

            {/* Net Profit — full width */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <StatCardMobile icon={TrendingUp} label="صافي الربح" value={`${(stats.totalNetProfit || 0).toLocaleString()} ج.م`} variant="primary" />
            </motion.div>

            {/* Progress Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
                className="bg-card border border-border/50 rounded-2xl p-4"
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-success-soft ring-1 ring-success/20 flex items-center justify-center">
                            <Award size={15} className="text-success" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-success">اليوم</p>
                            <p className="text-xs font-bold text-main">معدل تنفيذ الحصص</p>
                        </div>
                    </div>
                    <span className="text-lg font-bold text-success tabular-nums">{completionRate}%</span>
                </div>
                <div className="w-full h-2 bg-hover rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(completionRate, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full bg-success"
                    />
                </div>
                <p className="text-[10px] text-dim mt-2">
                    تم تنفيذ {completedSessions} من {todaySessions} حصة
                </p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                <p className="text-[10px] font-bold text-dim mb-2 px-1">إجراءات سريعة</p>
                <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, i) => (
                        <motion.button key={action.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.03 }}
                            onClick={action.onClick}
                            className="flex items-center gap-2.5 p-3 bg-card border border-border/50 rounded-xl active:scale-[0.97] transition-transform text-start"
                        >
                            <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
                                <action.icon size={14} className="text-primary" />
                            </div>
                            <span className="text-[11px] font-bold text-main truncate">{action.label}</span>
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

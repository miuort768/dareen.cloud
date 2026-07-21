import { TrendingUp, CheckCircle, Star, Clock, Calendar, BookOpen, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { PointLogEntry } from './types';

const glass = "bg-white/70 dark:bg-white/[0.07] backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-lg shadow-black/[0.03]";

interface StatsStripProps {
    points: number;
    attendanceRate: number;
    rankName: string;
}

const variantGradient: Record<string, string> = {
    success: 'from-success to-emerald-500 shadow-success/20',
    info: 'from-info to-blue-500 shadow-info/20',
    primary: 'from-primary to-purple-500 shadow-primary/20',
    warning: 'from-warning to-orange-500 shadow-warning/20',
};

export const ParentStatsStrip = ({ points, attendanceRate, rankName }: StatsStripProps) => {
    const items = [
        { icon: TrendingUp, label: 'اللقب', value: rankName, variant: 'primary' as string },
        { icon: CheckCircle, label: 'الحضور', value: `${attendanceRate}%`, variant: 'success' as string },
        { icon: Star, label: 'النقاط', value: points, variant: 'warning' as string },
    ];
    return (
        <div className="flex flex-row gap-2 md:gap-4">
            {items.map((item) => {
                const Icon = item.icon;
                return (
                    <div key={item.label}
                        className={cn("flex-1 p-3 flex flex-col items-center text-center gap-1", glass)}
                    >
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg ${variantGradient[item.variant]}`}>
                            <Icon size={16} className="text-white" />
                        </div>
                        <span className="text-sm font-black text-main">{item.value}</span>
                        <span className="text-micro text-muted font-medium">{item.label}</span>
                    </div>
                );
            })}
        </div>
    );
};

interface ActiveTimerSession {
    id: string;
    studentName: string;
    teacherName: string;
    subject: string;
    studentId?: string;
    startedAt?: string;
}

interface ActiveTimersProps {
    activeTimers: ActiveTimerSession[];
    children: { id: string; name: string }[];
    formatTime: (startedAt: string | null | undefined) => string;
    variant?: 'desktop' | 'mobile';
}

export const ParentActiveTimers = ({ activeTimers, children, formatTime, variant = 'desktop' }: ActiveTimersProps) => (
    <div className="space-y-3">
        {activeTimers.map((session) => {
            const child = children.find(c => c.id === session.studentId);
            return (
                <div key={session.id}
                    className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-warning to-orange-600 p-4 shadow-lg shadow-warning/20"
                >
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
                                <Clock size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-white">حصة جارية الآن!</h3>
                                <p className="text-micro font-medium text-white/80">
                                    {child?.name || session.studentId} — {session.subject}
                                </p>
                            </div>
                        </div>
                        <div className="text-2xl font-bold font-mono tracking-widest text-white">
                            {formatTime(session.startedAt)}
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
);

interface TodayScheduleProps {
    todayTasks: { studentName: string; subject: string; teacher: string; time: string; period: string }[];
    variant?: 'desktop' | 'mobile';
}

export const ParentTodaySchedule = ({ todayTasks, variant = 'desktop' }: TodayScheduleProps) => (
    <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
            <Calendar className="text-warning" size={16} />
            <h3 className="text-xs font-medium text-main">جدول حصص اليوم</h3>
        </div>
        <div className="space-y-2">
            {todayTasks.map((task, idx) => (
                <motion.div key={`tsk-${idx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    className={cn(glass, "p-3 flex items-center justify-between")}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-warning to-orange-500 flex items-center justify-center shadow-lg shadow-warning/20"><BookOpen size={16} className="text-white" /></div>
                        <div>
                            <h4 className="text-xs font-bold text-main">{task.subject}</h4>
                            <p className="text-micro font-medium text-muted">{task.studentName}</p>
                        </div>
                    </div>
                    <div className="text-end font-bold text-micro text-dim">{task.time}</div>
                </motion.div>
            ))}
            {todayTasks.length === 0 && (
                variant === 'desktop' ? (
                    <div className={cn("py-6 text-center border-2 border-dashed", glass)}>
                        <p className="text-muted font-medium text-micro">لا توجد مهام اليوم</p>
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <Calendar size={36} className="mx-auto text-muted mb-3" />
                        <p className="text-muted font-bold text-sm">لا توجد حصص اليوم</p>
                        <p className="text-dim text-micro mt-1">يوم هادئ بلا حصص!</p>
                    </div>
                )
            )}
        </div>
    </div>
);

interface RecentActivityProps {
    allPointLogs: PointLogEntry[];
}

const formatDate = (timestamp: string) => {
    try {
        const d = new Date(timestamp);
        if (isNaN(d.getTime())) return '';
        return format(d, 'eeee, d MMMM HH:mm', { locale: ar });
    } catch (e) {
        console.warn(e);
        return '';
    }
};

export const ParentRecentActivity = ({ allPointLogs }: RecentActivityProps) => (
    <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
            <Star className="text-warning" size={16} />
            <h3 className="text-xs font-medium text-main">آخر النشاطات</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {allPointLogs.slice(0, 4).map((log, i) => (
                <motion.div key={`pd-item-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className={cn(glass, "p-3 flex items-start gap-3")}
                >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-warning to-orange-500 flex items-center justify-center shadow-lg shadow-warning/20 shrink-0"><Star size={14} fill="currentColor" className="text-white" /></div>
                    <div className="min-w-0 flex-1">
                        <p className="text-micro font-bold text-warning mb-0.5 truncate">{log.studentName}</p>
                        <h4 className="text-micro font-medium text-main leading-snug">
                            تلقى {log.amount} نقطة: {log.action}
                        </h4>
                        <p className="text-micro font-medium text-muted mt-1 flex items-center gap-1">
                            <Clock size={8} />
                            {log.timestamp ? formatDate(log.timestamp) : ''}
                        </p>
                    </div>
                </motion.div>
            ))}
            {allPointLogs.length === 0 && (
                <div className={cn("col-span-full py-8 text-center border-2 border-dashed", glass)}>
                    <p className="text-muted font-medium text-micro">لا توجد نشاطات حديثة للأبناء</p>
                </div>
            )}
        </div>
    </div>
);

interface SupportCardProps {
    adminPhone: string | undefined;
    variant?: 'desktop' | 'mobile';
}

export const ParentSupportCard = ({ adminPhone, variant = 'desktop' }: SupportCardProps) => {
    const whatsappUrl = `https://wa.me/${(adminPhone?.replace(/\D/g, '') || '').replace(/^0/, '20') || '200000000000'}`;
    if (variant === 'desktop') {
        return (
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-purple-600 p-5 shadow-lg shadow-primary/20">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-start">
                        <h4 className="text-sm md:text-lg font-black text-white mb-0.5">هل تحتاج لمساعدة؟</h4>
                        <p className="text-xs font-medium text-white/80">فريق الدعم متاح دائماً لخدمة ولي الأمر</p>
                    </div>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                        className="bg-white text-primary px-5 py-3 rounded-xl font-bold text-micro flex items-center gap-2.5 transition-all active:scale-95 shadow-lg w-full md:w-auto justify-center">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-purple-500 text-white flex items-center justify-center"><MessageSquare size={12} /></div>
                        تواصل معنا
                    </a>
                </div>
            </div>
        );
    }
    return (
        <section>
            <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-1 h-4 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
                <h2 className="text-main text-sm font-black">الدعم الفني</h2>
            </div>
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-purple-600 p-4 shadow-lg shadow-primary/20">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-black text-white mb-0.5">هل تحتاج لمساعدة؟</h4>
                        <p className="text-micro text-white/70 font-medium">فريق الدعم متاح 24 ساعة</p>
                    </div>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                        className="bg-white text-primary px-3.5 py-2.5 rounded-xl font-bold text-micro flex items-center gap-2 active:scale-95 transition-transform shadow-lg shrink-0">
                        <MessageSquare size={13} />تواصل
                    </a>
                </div>
            </div>
        </section>
    );
};
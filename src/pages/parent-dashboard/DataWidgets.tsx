import { TrendingUp, CheckCircle, Star, Clock, Calendar, BookOpen, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { PointLogEntry } from './types';

interface StatsStripProps {
    points: number;
    attendanceRate: number;
    rankName: string;
}

export const ParentStatsStrip = ({ points, attendanceRate, rankName }: StatsStripProps) => {
    const items = [
        { icon: TrendingUp, label: 'اللقب', value: rankName, textClass: 'text-primary', bgClass: 'bg-primary-soft' },
        { icon: CheckCircle, label: 'الحضور', value: `${attendanceRate}%`, textClass: 'text-success', bgClass: 'bg-success-soft' },
        { icon: Star, label: 'النقاط', value: points, textClass: 'text-warning', bgClass: 'bg-warning-soft' },
    ];
    return (
        <div className="flex flex-row gap-2 md:gap-4">
            {items.map((item) => {
                const Icon = item.icon;
                return (
                    <div key={item.label}
                        className="flex-1 bg-card rounded-card p-3 shadow-soft border border-border flex flex-col items-center text-center gap-1">
                        <div className={`w-9 h-9 rounded-card flex items-center justify-center ${item.bgClass}`}>
                            <Icon size={18} className={item.textClass} />
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

export const ParentActiveTimers = ({ activeTimers, children, formatTime, variant = 'desktop' }: ActiveTimersProps) => {
    const bgClass = variant === 'desktop' ? 'bg-warning text-on-warning' : 'bg-primary text-on-primary';
    const iconBg = variant === 'desktop' ? 'bg-warning-soft' : 'bg-primary-soft';
    return (
        <div className="space-y-3">
            {activeTimers.map((session) => {
                const child = children.find(c => c.id === session.studentId);
                return (
                    <div key={session.id} className={`${bgClass} p-4 rounded-card shadow-soft flex items-center justify-between ${variant === 'mobile' ? 'active:scale-[0.99] transition-transform' : ''}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${iconBg} rounded-card flex items-center justify-center animate-pulse`}>
                                <Clock size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">حصة جارية الآن!</h3>
                                <p className="text-micro font-medium opacity-90">
                                    {child?.name || session.studentId} — {session.subject}
                                </p>
                            </div>
                        </div>
                        <div className="text-2xl font-bold font-mono tracking-widest">
                            {formatTime(session.startedAt)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

interface TodayScheduleProps {
    todayTasks: { studentName: string; subject: string; teacher: string; time: string; period: string }[];
    variant?: 'desktop' | 'mobile';
}

export const ParentTodaySchedule = ({ todayTasks, variant = 'desktop' }: TodayScheduleProps) => (
    <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
            <Calendar className="text-warning-dark dark:text-warning" size={16} />
            <h3 className="text-xs font-medium text-main uppercase tracking-widest italic">جدول حصص اليوم</h3>
        </div>
        <div className="space-y-2">
            {todayTasks.map((task, idx) => (
                <div key={`tsk-${idx}`} className={`bg-card border border-border rounded-card p-3 shadow-soft flex items-center justify-between ${variant === 'mobile' ? 'bg-background dark:bg-primary-active/50 active:scale-[0.99] transition-transform' : ''}`}>
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-warning rounded-card flex items-center justify-center text-on-warning shadow-soft"><BookOpen size={16} /></div>
                        <div>
                            <h4 className="text-xs font-bold text-main">{task.subject}</h4>
                            <p className="text-micro font-medium text-muted">{task.studentName}</p>
                        </div>
                    </div>
                    <div className="text-end font-bold text-micro text-dim">{task.time}</div>
                </div>
            ))}
            {todayTasks.length === 0 && (
                variant === 'desktop' ? (
                    <div className="py-6 text-center bg-card border-2 border-dashed border-border rounded-card">
                        <p className="text-muted font-medium text-micro">لا توجد مهام اليوم</p>
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <Calendar size={36} className="mx-auto text-muted mb-3" />
                        <p className="text-muted font-bold text-sm">لا توجد حصص اليوم</p>
                        <p className="text-dim dark:text-dim text-micro mt-1">يوم هادئ بلا حصص!</p>
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
            <h3 className="text-xs font-medium text-main uppercase tracking-widest italic">آخر النشاطات</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {allPointLogs.slice(0, 4).map((log, i) => (
                <div key={`pd-item-${i}`} className="bg-card border border-border rounded-card p-3 shadow-soft flex items-start gap-3">
                    <div className="w-8 h-8 bg-warning rounded-card flex items-center justify-center text-on-warning shadow-soft shrink-0"><Star size={14} fill="currentColor" /></div>
                    <div className="min-w-0 flex-1">
                        <p className="text-micro font-bold text-warning-dark dark:text-warning mb-0.5 truncate">{log.studentName}</p>
                        <h4 className="text-micro font-medium text-main dark:text-main leading-snug">
                            تلقى {log.amount} نقطة: {log.action}
                        </h4>
                        <p className="text-micro font-medium text-muted mt-1 flex items-center gap-1">
                            <Clock size={8} />
                            {log.timestamp ? formatDate(log.timestamp) : ''}
                        </p>
                    </div>
                </div>
            ))}
            {allPointLogs.length === 0 && (
                <div className="col-span-full py-8 text-center bg-card border-2 border-dashed border-border rounded-card">
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
            <div className="bg-warning rounded-card p-5 text-on-warning flex flex-col md:flex-row items-center justify-between gap-6 shadow-soft">
                <div className="text-center md:text-start">
                    <h4 className="text-sm md:text-lg font-black mb-0.5">هل تحتاج لمساعدة؟</h4>
                    <p className="text-xs font-medium opacity-80">فريق الدعم متاح دائماً لخدمة ولي الأمر</p>
                </div>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="bg-card text-warning-dark px-5 py-3 rounded-card font-bold text-micro flex items-center gap-2.5 transition-all active:scale-95 shadow-soft w-full md:w-auto justify-center">
                    <div className="w-6 h-6 bg-warning-soft text-on-warning rounded-card flex items-center justify-center"><MessageSquare size={12} /></div>
                    تواصل معنا
                </a>
            </div>
        );
    }
    return (
        <section>
            <div className="flex items-center gap-2 mb-2 px-1">
                <div className="w-1 h-4 bg-error rounded-full" />
                <h2 className="text-main text-sm font-black">الدعم الفني</h2>
            </div>
            <div className="bg-primary rounded-card p-4 text-on-primary shadow-soft">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-black mb-0.5">هل تحتاج لمساعدة؟</h4>
                        <p className="text-micro text-on-primary/70 font-medium">فريق الدعم متاح 24 ساعة</p>
                    </div>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                        className="bg-card text-primary px-3.5 py-2.5 rounded-card font-bold text-micro flex items-center gap-2 active:scale-95 transition-transform shadow-soft shrink-0">
                        <MessageSquare size={13} />تواصل
                    </a>
                </div>
            </div>
        </section>
    );
};

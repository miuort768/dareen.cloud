import { Calendar, Clock, User, ShieldCheck, CheckCircle2, BookOpen, PartyPopper } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface AppointmentEvent {
    id: string;
    studentName: string;
    studentGrade: string;
    teacherName: string;
    subject: string;
    curriculum: string;
    day: string;
    hour: string;
    period: string;
    time: string;
    isPM: boolean;
}

interface AppointmentScheduleGridProps {
    appointmentsByDay: { day: string; appointments: AppointmentEvent[] }[];
    onSelectAppointment: (appointment: AppointmentEvent) => void;
    onCompleteSession: (id: string, e: React.MouseEvent) => void;
    isPending?: boolean;
    canComplete?: boolean;
}

const todayName = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });

export const AppointmentScheduleGrid = ({
    appointmentsByDay,
    onSelectAppointment,
    onCompleteSession,
    isPending = false,
    canComplete = true,
}: AppointmentScheduleGridProps) => {
    const total = appointmentsByDay.reduce((s, d) => s + d.appointments.length, 0);

    if (total === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center bg-card border border-dashed border-border rounded-2xl"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 bg-success-soft"
                >
                    <PartyPopper size={40} className="text-success" />
                </motion.div>
                <h3 className="font-bold text-main text-xl mb-2">أحسنت! 🎉</h3>
                <p className="text-muted text-sm font-bold max-w-xs">
                    لقد أتممت جميع المواعيد. عمل رائع!
                </p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary bar */}
            <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-muted">جدول الأسبوع الكامل</span>
                <span className="text-xs font-bold text-primary bg-primary-soft px-2.5 py-0.5 rounded-lg tabular-nums">
                    {total} موعد
                </span>
            </div>

            {appointmentsByDay.map(({ day, appointments }) => {
                const isToday = day === todayName;
                return (
                    <motion.div
                        key={day}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={cn(
                            'bg-card border rounded-2xl overflow-hidden',
                            isToday ? 'border-primary shadow-md shadow-primary/10' : 'border-border',
                        )}
                    >
                        {/* Day header */}
                        <div className={cn(
                            'px-4 py-2.5 border-b flex items-center justify-between',
                            isToday ? 'bg-gradient-to-l from-primary to-primary-deep border-primary' : 'bg-surface border-border',
                        )}>
                            <div className="flex items-center gap-2">
                                <Calendar size={13} className={isToday ? 'text-on-primary' : 'text-muted'} />
                                <h3 className={cn('text-xs font-bold', isToday ? 'text-on-primary' : 'text-main')}>
                                    {day}
                                </h3>
                                {isToday && (
                                    <span className="rounded-lg bg-white/20 px-1.5 py-0.5 text-[9px] font-bold text-on-primary">
                                        اليوم
                                    </span>
                                )}
                            </div>
                            <span className={cn(
                                'text-micro font-bold px-2 py-0.5 rounded-lg tabular-nums',
                                isToday ? 'bg-white/15 text-on-primary' : appointments.length > 0 ? 'bg-primary-soft text-primary' : 'bg-border text-muted',
                            )}>
                                {appointments.length} موعد
                            </span>
                        </div>

                        {/* Day appointments */}
                        {appointments.length > 0 ? (
                            <div className="divide-y divide-border">
                                {appointments.map((app) => (
                                    <div
                                        key={app.id}
                                        onClick={() => onSelectAppointment(app)}
                                        className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-hover"
                                    >
                                        {/* Time chip */}
                                        <div className="flex h-11 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-soft">
                                            <Clock size={10} className="mb-0.5 text-primary" />
                                            <span className="text-[10px] font-black tabular-nums text-primary">{app.time}</span>
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-bold text-main">{app.studentName}</p>
                                            <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-medium text-muted">
                                                <BookOpen size={9} className="shrink-0" />
                                                {app.subject}
                                                {app.curriculum ? ` · ${app.curriculum}` : ''}
                                            </p>
                                            <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] font-bold text-info">
                                                <ShieldCheck size={9} className="shrink-0" />
                                                {app.teacherName || 'غير محددة'}
                                            </p>
                                        </div>

                                        {/* Grade + complete */}
                                        <div className="flex shrink-0 items-center gap-2">
                                            {app.studentGrade && (
                                                <span className="hidden rounded-lg bg-surface px-2 py-0.5 text-[9px] font-bold text-muted lg:inline-block">
                                                    {app.studentGrade}
                                                </span>
                                            )}
                                            {canComplete && (
                                                <button
                                                    onClick={(e) => onCompleteSession(app.id, e)}
                                                    disabled={isPending}
                                                    aria-label={`إتمام موعد ${app.studentName}`}
                                                    className="flex items-center gap-1 rounded-xl bg-success px-2.5 py-1.5 text-micro font-bold text-on-success transition-all active:scale-95 hover:brightness-90 disabled:opacity-50"
                                                >
                                                    <CheckCircle2 size={12} />
                                                    إتمام
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 py-5 text-micro font-bold text-muted">
                                <User size={12} className="opacity-40" />
                                لا توجد مواعيد في هذا اليوم
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
};

import { Calendar, Clock, User, ShieldCheck, CheckCircle2, BookOpen, PartyPopper, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
}

// Flatten all appointments from all days in order
function flattenAppointments(appointmentsByDay: { day: string; appointments: AppointmentEvent[] }[]): AppointmentEvent[] {
    return appointmentsByDay.flatMap(d => d.appointments);
}

export const AppointmentScheduleGrid = ({
    appointmentsByDay,
    onSelectAppointment,
    onCompleteSession,
    isPending = false,
}: AppointmentScheduleGridProps) => {
    const allApps = flattenAppointments(appointmentsByDay);
    const total = allApps.length;

    // All done — show thank-you card
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
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 bg-success/10"
                >
                    <PartyPopper size={40} className="text-success" />
                </motion.div>
                <h3 className="font-bold text-main text-xl mb-2">أحسنت! 🎉</h3>
                <p className="text-muted text-sm font-bold max-w-xs">
                    لقد أتممت جميع المواعيد لهذا اليوم. عمل رائع!
                </p>
            </motion.div>
        );
    }

    const current = allApps[0];
    const remaining = total;
    // We don't have a "totalOriginal" here so we show remaining count

    return (
        <div className="flex flex-col gap-4">
            {/* Progress info */}
            <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-muted">
                    المواعيد المتبقية
                </span>
                <span className="text-xs font-bold text-primary bg-primary-soft px-2.5 py-0.5 rounded-lg">
                    {remaining} موعد
                </span>
            </div>

            {/* Single appointment card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={current.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden"
                >
                    {/* Card header with day + time */}
                    <div className="px-5 py-3 bg-primary flex items-center justify-between">
                        <div>
                            <p className="text-on-primary/60 text-xs font-bold mb-0.5">الموعد الحالي</p>
                            <h3 className="text-on-primary font-bold text-base">{current.day}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15">
                                <Clock size={14} className="text-on-primary/80" />
                                <span className="font-bold text-on-primary tabular-nums">{current.time}</span>
                            </div>
                        </div>
                    </div>

                    {/* Card body */}
                    <div className="p-5 space-y-3">
                        {/* Student */}
                        <div
                            className="flex items-center justify-between p-3.5 rounded-xl bg-primary-soft border-s-[3px] border-s-primary cursor-pointer hover:bg-primary/10 transition-colors"
                            onClick={() => onSelectAppointment(current)}
                        >
                            <div>
                                <label className="block text-micro font-bold text-muted mb-0.5">الطالب</label>
                                <h4 className="text-sm font-bold text-main">{current.studentName}</h4>
                                <span className="text-micro font-bold text-primary">{current.studentGrade}</span>
                            </div>
                            <User size={20} className="text-primary/50" />
                        </div>

                        {/* Teacher */}
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-success-soft border-s-[3px] border-s-success">
                            <div>
                                <label className="block text-micro font-bold text-muted mb-0.5">المعلمة</label>
                                <h4 className="text-sm font-bold text-main">{current.teacherName}</h4>
                            </div>
                            <ShieldCheck size={20} className="text-success/50" />
                        </div>

                        {/* Subject */}
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-warning-soft border-s-[3px] border-s-warning">
                            <div>
                                <label className="block text-micro font-bold text-muted mb-0.5">المادة</label>
                                <h4 className="text-sm font-bold text-main">{current.subject}</h4>
                                {current.curriculum && (
                                    <span className="text-micro font-bold px-1.5 py-0.5 mt-1 inline-block rounded-lg bg-warning-soft text-warning">
                                        {current.curriculum}
                                    </span>
                                )}
                            </div>
                            <BookOpen size={20} className="text-warning/50" />
                        </div>

                        {/* Complete button */}
                        <button
                            onClick={(e) => onCompleteSession(current.id, e)}
                            disabled={isPending}
                            className={cn(
                                'w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                                isPending
                                    ? 'bg-success/60 text-on-success cursor-not-allowed'
                                    : 'bg-success hover:brightness-90 text-on-success'
                            )}
                        >
                            <CheckCircle2 size={18} />
                            {isPending ? 'جاري التسجيل...' : 'إتمام الحصة'}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Upcoming appointments preview */}
            {allApps.length > 1 && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-border flex items-center gap-2 bg-surface">
                        <Calendar size={13} className="text-muted" />
                        <span className="text-xs font-bold text-muted">المواعيد القادمة ({allApps.length - 1})</span>
                    </div>
                    <div className="p-3 flex flex-col gap-2 max-h-64 overflow-y-auto">
                        {allApps.slice(1).map((app, i) => (
                            <div
                                key={app.id}
                                className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-surface"
                            >
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-primary tabular-nums">{i + 2}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-main truncate">{app.studentName}</p>
                                    <p className="text-micro font-bold text-muted truncate">{app.subject} • {app.day} {app.time}</p>
                                </div>
                                <span className="text-micro font-bold text-muted shrink-0">{app.teacherName}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

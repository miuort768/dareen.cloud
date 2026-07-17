import { Calendar, Clock, User, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
}

export const AppointmentScheduleGrid = ({ appointmentsByDay, onSelectAppointment, onCompleteSession }: AppointmentScheduleGridProps) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointmentsByDay.map(({ day, appointments }) => (
            <motion.div layout key={day} className="bg-card border border-border shadow-sm rounded-2xl flex flex-col">
                <div className="px-4 py-2.5 border-b border-border flex items-center justify-between bg-background">
                    <h3 className="font-bold text-sm text-main">{day}</h3>
                    <span className={cn(
                        "text-micro font-bold px-2 py-0.5 tabular-nums rounded-lg",
                        appointments.length > 0 ? "text-on-primary" : "text-dim"
                    )} style={appointments.length > 0 ? { backgroundColor: 'var(--bg-primary)' } : { backgroundColor: 'var(--bg-background)' }}>
                        {appointments.length} موعد
                    </span>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-start min-h-[140px]">
                    {appointments.length > 0 ? (() => {
                        const nextSession = appointments[0];
                        return (
                            <div key={nextSession.id}
                                onClick={() => { onSelectAppointment(nextSession); }}
                                className="flex flex-col gap-2 cursor-pointer group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={12} className="text-primary" />
                                        <span className="font-bold text-sm tabular-nums text-primary">{nextSession.time}</span>
                                    </div>
                                    <span className="text-micro font-bold px-1.5 py-0.5 rounded-lg bg-primary-soft text-primary">التالي</span>
                                </div>
                                <div className="p-2 rounded-xl border border-primary-soft transition-all bg-primary-soft/50">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <User size={11} className="shrink-0 text-primary" />
                                        <span className="text-xs font-bold text-main truncate">{nextSession.studentName}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <ShieldCheck size={10} className="shrink-0 text-success" />
                                        <span className="text-micro font-bold text-muted truncate">{nextSession.teacherName}</span>
                                    </div>
                                </div>
                                <button onClick={(e) => onCompleteSession(nextSession.id, e)}
                                    className="w-full bg-success hover:brightness-90 text-on-success py-2.5 font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5">
                                    <CheckCircle2 size={14} /> إتمام الحصة
                                </button>
                            </div>
                        );
                    })() : (
                        <div className="flex-1 flex flex-col items-center justify-center py-6">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 bg-primary-soft">
                                <Calendar size={18} className="text-primary" />
                            </div>
                            <p className="text-micro font-bold text-primary">لا توجد مواعيد</p>
                        </div>
                    )}
                </div>
            </motion.div>
        ))}
        {appointmentsByDay.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center text-center bg-card border border-dashed border-border rounded-2xl">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-primary-soft">
                    <Calendar size={28} className="text-primary" />
                </div>
                <h3 className="font-bold text-muted text-base mb-1">لا توجد مواعيد</h3>
                <p className="text-dim text-xs font-bold max-w-xs">لا توجد مواعيد متطابقة مع معايير البحث</p>
            </div>
        )}
    </div>
);

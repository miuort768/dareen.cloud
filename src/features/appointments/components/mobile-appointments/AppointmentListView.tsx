import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { triggerHaptic } from '../../../../lib/haptics';
import type { AppointmentEvent } from './types';

interface DayGroup {
    day: string;
    appointments: AppointmentEvent[];
}

interface AppointmentListViewProps {
    activeTab: 'upcoming' | 'completed';
    appointmentsByDay: DayGroup[];
    onComplete: (id: string, e: React.MouseEvent) => void;
    onSelect: (app: AppointmentEvent) => void;
}

export const AppointmentListView = ({ activeTab, appointmentsByDay, onComplete, onSelect }: AppointmentListViewProps) => (
    <div className="px-4 space-y-3">
        <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' }} className="space-y-3">
                {appointmentsByDay.length > 0 ? appointmentsByDay.map(({ day, appointments }) => (
                    <div key={day} className="bg-card rounded-card shadow-soft border border-border/50 overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-border/50 flex items-center justify-between">
                            <h3 className="font-bold text-xs text-main">{day}</h3>
                            <span className={cn("text-micro font-bold px-2 py-0.5 rounded-lg",
                                appointments.length > 0 ? "bg-primary text-on-primary" : "bg-surface text-muted"
                            )}>{appointments.length} موعد</span>
                        </div>
                        <div className="p-2 space-y-1.5">
                            {appointments.map(app => (
                                <motion.div key={app.id} whileTap={{ scale: 0.97 }}
                                    onClick={() => { triggerHaptic('light'); onSelect(app); }}
                                    className="p-3 rounded-xl border border-border/50 cursor-pointer active:scale-[0.97] transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={11} className="text-primary" strokeWidth={1.5} />
                                            <span className="font-bold text-xs text-primary tabular-nums">{app.time}</span>
                                        </div>
                                        {activeTab === 'upcoming' ? (
                                            <motion.button whileTap={{ scale: 0.93 }}
                                                onClick={(e) => onComplete(app.id, e)}
                                                className="px-2.5 py-1 bg-success text-on-primary text-micro font-bold rounded-xl flex items-center gap-1 shadow-soft">
                                                <CheckCircle2 size={10} strokeWidth={1.5} /> إتمام
                                            </motion.button>
                                        ) : (
                                            <span className="text-micro font-bold px-2 py-0.5 rounded-lg bg-success-soft text-success">تم</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-xl flex items-center justify-center text-micro font-black shrink-0 bg-primary/10 text-primary">
                                            {app.studentName.charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-main leading-tight truncate">{app.studentName}</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-micro font-bold text-muted">{app.subject}</span>
                                                <span className="text-micro font-bold text-dim">·</span>
                                                <span className="text-micro font-bold text-muted truncate">{app.teacherName}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )) : (
                    <div className="py-16 text-center bg-card rounded-card border border-dashed border-border/50">
                        <Calendar size={28} className="mx-auto mb-2 text-dim" strokeWidth={1.5} />
                        <p className="text-xs font-bold text-muted">
                            {activeTab === 'upcoming' ? 'لا توجد مواعيد متبقية' : 'لا توجد مواعيد مكتملة'}
                        </p>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    </div>
);

import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { MobileListItem } from '../../../../shared/components/mobile';
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
    canComplete?: boolean;
}

export const AppointmentListView = ({ activeTab, appointmentsByDay, onComplete, onSelect, canComplete = true }: AppointmentListViewProps) => (
    <div className="px-4 space-y-3">
        <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' }} className="space-y-3">
                {appointmentsByDay.length > 0 ? appointmentsByDay.map(({ day, appointments }) => (
                    <div key={day} className="bg-card rounded-2xl border border-border overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                            <h3 className="font-bold text-xs text-main">{day}</h3>
                            <span className={cn("text-micro font-bold px-2 py-0.5 rounded-lg",
                                appointments.length > 0 ? "bg-primary text-on-primary" : "bg-surface text-muted"
                            )}>{appointments.length} موعد</span>
                        </div>
                        <div className="p-2 space-y-1.5">
                            {appointments.map(app => (
                                <MobileListItem
                                    key={app.id}
                                    leading={
                                        <div className="w-7 h-7 rounded-xl flex items-center justify-center text-micro font-semibold bg-primary/10 text-primary">
                                            {app.studentName.charAt(0)}
                                        </div>
                                    }
                                    title={app.studentName}
                                    subtitle={
                                        <span className="flex items-center gap-1.5">
                                            <span className="text-primary tabular-nums font-bold">{app.time}</span>
                                            <span className="text-muted">·</span>
                                            <span>{app.subject}</span>
                                            <span className="text-muted">·</span>
                                            <span>{app.teacherName}</span>
                                        </span>
                                    }
                                    trailing={activeTab === 'upcoming' ? (
                                        canComplete ? (
                                            <button
                                                onClick={(e) => onComplete(app.id, e)}
                                                className="px-2.5 py-1 bg-success text-on-success text-micro font-bold rounded-xl flex items-center gap-1 transition-transform active:scale-95"
                                            >
                                                <CheckCircle2 size={10} strokeWidth={1.5} /> إتمام
                                            </button>
                                        ) : null
                                    ) : (
                                        <span className="text-micro font-bold px-2 py-0.5 rounded-lg bg-success-soft text-success">تم</span>
                                    )}
                                    showChevron
                                    onClick={() => onSelect(app)}
                                />
                            ))}
                        </div>
                    </div>
                )) : (
                    <div className="py-16 text-center bg-card rounded-2xl border border-dashed border-border">
                        <Calendar size={28} className="mx-auto mb-2 text-muted" strokeWidth={1.5} />
                        <p className="text-xs font-bold text-muted">
                            {activeTab === 'upcoming' ? 'لا توجد مواعيد متبقية' : 'لا توجد مواعيد مكتملة'}
                        </p>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    </div>
);

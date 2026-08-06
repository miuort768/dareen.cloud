import { X, ArrowRight, User, ShieldCheck, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface AppointmentDetailPanelProps {
    appointment: AppointmentEvent | null;
    showDetails: boolean;
    onClose: () => void;
}

export const AppointmentDetailPanel = ({ appointment, showDetails, onClose }: AppointmentDetailPanelProps) => (
    <AnimatePresence>
        {showDetails && appointment && (
            <motion.div
                initial={window.innerWidth >= 768 ? { opacity: 0, x: 30 } : { opacity: 1, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={window.innerWidth >= 768 ? { opacity: 0, x: 30 } : { opacity: 0, x: 0 }}
                className="bg-card border border-border h-fit sticky top-4 overflow-hidden rounded-2xl"
            >
                <div className="px-4 py-3 bg-primary text-on-primary flex items-center justify-between rounded-t-2xl">
                    <div>
                        <p className="text-micro font-bold text-on-primary/60">تفاصيل الموعد</p>
                        <h3 className="font-bold text-base">{appointment.day}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 text-center rounded-xl bg-white/15">
                            <p className="font-bold text-lg tabular-nums leading-none text-on-primary">{appointment.time}</p>
                        </div>
                        <button onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center text-on-primary/60 hover:text-on-primary hover:bg-white/15 transition-all rounded-xl"
                            aria-label="إغلاق">
                            <X size={14} />
                        </button>
                    </div>
                </div>
                <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-primary-soft border-e-[3px] border-e-primary">
                        <div>
                            <label className="block text-micro font-bold text-muted mb-0.5">الطالب</label>
                            <h4 className="text-sm font-bold text-main">{appointment.studentName}</h4>
                            <span className="text-micro font-bold text-primary">{appointment.studentGrade}</span>
                        </div>
                        <User size={18} className="text-muted" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-success-soft border-e-[3px] border-e-success">
                        <div>
                            <label className="block text-micro font-bold text-muted mb-0.5">المعلمة</label>
                            <h4 className="text-sm font-bold text-main">{appointment.teacherName}</h4>
                        </div>
                        <ShieldCheck size={18} className="text-muted" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-warning-soft border-e-[3px] border-e-warning">
                        <div>
                            <label className="block text-micro font-bold text-muted mb-0.5">المادة</label>
                            <h4 className="text-sm font-bold text-main">{appointment.subject}</h4>
                            <span className="text-micro font-bold px-1.5 py-0.5 mt-1 inline-block rounded-lg bg-warning-soft text-warning">{appointment.curriculum}</span>
                        </div>
                        <BookOpen size={18} className="text-muted" />
                    </div>
                    <button onClick={onClose}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary-hover transition-all active:scale-95">
                        عودة <ArrowRight size={13} />
                    </button>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

import { motion, AnimatePresence } from 'framer-motion';
import { User, BookOpen, Clock, Video } from 'lucide-react';
import { triggerHaptic } from '../../../../lib/haptics';

interface ScheduleEvent {
    id: string;
    studentId: string;
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

interface MobileScheduleDetailsModalProps {
    showDetails: boolean;
    event: ScheduleEvent | null;
    onClose: () => void;
    onStartSession: () => void;
    onViewStudent: () => void;
}

export const MobileScheduleDetailsModal = ({ showDetails, event, onClose, onStartSession, onViewStudent }: MobileScheduleDetailsModalProps) => (
    <AnimatePresence>
        {showDetails && event && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end"
                onClick={() => { triggerHaptic('light'); onClose(); }}>
                <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full bg-card rounded-t-3xl shadow-2xl overflow-hidden max-h-[85vh]">
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 bg-muted/40 rounded-full" />
                    </div>
                    <div className="px-5 pb-6 space-y-4">
                        <div className="text-center">
                            <p className="text-micro font-bold text-muted">تفاصيل الحصة</p>
                            <h3 className="text-sm font-semibold text-main mt-0.5">{event.day}</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3.5 rounded-card bg-primary-soft border-e-[3px] border-e-primary">
                                <div>
                                    <span className="text-micro font-bold text-muted">الطالب</span>
                                    <p className="text-sm font-bold text-main">{event.studentName}</p>
                                    <span className="text-micro font-bold text-primary">{event.studentGrade} · {event.subject}</span>
                                </div>
                                <User size={18} className="text-dim" strokeWidth={1.5} />
                            </div>
                            <div className="flex items-center justify-between p-3.5 rounded-card bg-success-soft border-e-[3px] border-e-success">
                                <div>
                                    <span className="text-micro font-bold text-muted">المعلمة</span>
                                    <p className="text-sm font-bold text-main">{event.teacherName}</p>
                                </div>
                                <BookOpen size={18} className="text-dim" strokeWidth={1.5} />
                            </div>
                            <div className="flex items-center justify-between p-3.5 rounded-card bg-warning-soft border-e-[3px] border-e-warning">
                                <div>
                                    <span className="text-micro font-bold text-muted">الوقت</span>
                                    <p className="text-sm font-bold text-main">{event.time}</p>
                                </div>
                                <Clock size={18} className="text-dim" strokeWidth={1.5} />
                            </div>
                        </div>
                        <div className="flex gap-2.5">
                            <motion.button whileTap={{ scale: 0.95 }}
                                onClick={() => { triggerHaptic('medium'); onStartSession(); }}
                                className="flex-1 py-3 rounded-card bg-primary text-on-primary text-micro font-bold flex items-center justify-center gap-2 shadow-soft shadow-primary/30">
                                <Video size={14} strokeWidth={1.5} />
                                بدء بث مباشر
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.95 }}
                                onClick={() => { triggerHaptic('light'); onViewStudent(); }}
                                className="flex-1 py-3 rounded-card bg-surface text-muted text-micro font-bold border border-border/50">
                                عرض الطالب
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

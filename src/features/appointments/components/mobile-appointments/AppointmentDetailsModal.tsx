import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, BookOpen, CheckCircle2 } from 'lucide-react';
import { triggerHaptic } from '../../../../lib/haptics';
import type { AppointmentEvent } from './types';

interface AppointmentDetailsModalProps {
    show: boolean;
    appointment: AppointmentEvent | null;
    activeTab: 'upcoming' | 'completed';
    onClose: () => void;
    onComplete: (id: string, e: React.MouseEvent) => void;
}

export const AppointmentDetailsModal = ({ show, appointment, activeTab, onClose, onComplete }: AppointmentDetailsModalProps) => (
    <AnimatePresence>
        {show && appointment && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end"
                onClick={() => { triggerHaptic('light'); onClose(); }}>
                <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full bg-card rounded-t-3xl shadow-2xl overflow-hidden max-h-[85vh]">
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 bg-border rounded-full" />
                    </div>
                    <div className="px-5 pb-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-micro font-bold text-muted">تفاصيل الموعد</p>
                                <h3 className="text-sm font-black text-main">{appointment.day}</h3>
                            </div>
                            <div className="px-3 py-1.5 rounded-xl bg-primary/10">
                                <p className="font-black text-lg tabular-nums text-primary leading-none">{appointment.time}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3.5 rounded-card bg-primary/[0.03] border-e-[3px] border-primary">
                                <div>
                                    <span className="text-micro font-bold text-muted">الطالب</span>
                                    <p className="text-sm font-bold text-main">{appointment.studentName}</p>
                                    <span className="text-micro font-bold text-primary">{appointment.studentGrade}</span>
                                </div>
                                <User size={18} className="text-dim" strokeWidth={1.5} />
                            </div>
                            <div className="flex items-center justify-between p-3.5 rounded-card bg-success/[0.03] border-e-[3px] border-success">
                                <div>
                                    <span className="text-micro font-bold text-muted">المعلمة</span>
                                    <p className="text-sm font-bold text-main">{appointment.teacherName}</p>
                                </div>
                                <ShieldCheck size={18} className="text-dim" strokeWidth={1.5} />
                            </div>
                            <div className="flex items-center justify-between p-3.5 rounded-card bg-warning/[0.03] border-e-[3px] border-warning">
                                <div>
                                    <span className="text-micro font-bold text-muted">المادة</span>
                                    <p className="text-sm font-bold text-main">{appointment.subject}</p>
                                    <span className="text-micro font-bold px-1.5 py-0.5 mt-1 inline-block rounded-lg bg-warning/10 text-warning">{appointment.curriculum}</span>
                                </div>
                                <BookOpen size={18} className="text-dim" strokeWidth={1.5} />
                            </div>
                        </div>

                        {activeTab === 'upcoming' && (
                            <motion.button whileTap={{ scale: 0.95 }}
                                onClick={(e) => { onComplete(appointment.id, e); onClose(); }}
                                className="w-full py-3 rounded-card bg-success text-on-success text-micro font-bold flex items-center justify-center gap-2 shadow-soft shadow-success/30">
                                <CheckCircle2 size={14} strokeWidth={1.5} /> إتمام الحصة
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

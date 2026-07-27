import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Session } from '../types';

interface TeacherActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherName: string;
    sessions: Session[];
    isTeacherView: boolean;
    onDeleteSession: (sessionId: string) => void;
}

export const TeacherActivityModal = ({ isOpen, onClose, teacherName, sessions, isTeacherView, onDeleteSession }: TeacherActivityModalProps) => {
    return (
        <AnimatePresence>
        {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-12" dir="rtl" role="dialog" aria-modal="true" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-card border border-border shadow-elevation-2 w-full max-w-4xl h-full max-h-[85vh] flex flex-col overflow-hidden rounded-2xl">
                <div className="bg-primary px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/15">
                            <Clock size={20} className="text-on-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-on-primary">سجل نشاطات المعلمة</h3>
                            <p className="text-xs text-on-primary/70">{teacherName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white/15 hover:bg-white/25 rounded-xl transition-all" aria-label="إغلاق">
                        <X size={18} className="text-on-primary" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {sessions.map(session => (
                            <div key={session.id} className="bg-surface border border-border p-3 rounded-2xl hover:-translate-y-0.5 transition-all relative overflow-hidden">
                                <div className={cn(
                                    "absolute top-0 start-0 w-1 h-full rounded-s-full",
                                    session.status === 'completed' ? "bg-success" : "bg-error"
                                )} />

                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary-soft text-primary">
                                            <Calendar size={12} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-main truncate">{session.studentName}</p>
                                            <p className="text-[10px] text-muted">{session.date}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-border">
                                    <div className="flex items-center gap-1.5 text-xs text-muted">
                                        <Clock size={8} /> {session.time}
                                    </div>
                                    {!isTeacherView && (
                                        <button onClick={() => onDeleteSession(session.id)} className="min-w-[24px] min-h-[24px] w-6 h-6 flex items-center justify-center text-muted hover:text-error rounded transition-colors" aria-label="حذف">
                                            <Trash2 size={10} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {sessions.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                            <Clock size={48} className="mb-4" />
                            <p className="text-xs">لا توجد نشاطات مسجلة</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
        )}
        </AnimatePresence>
    );
};

import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, ExternalLink, CalendarDays, BookOpen, GraduationCap, User, Clock, Star } from 'lucide-react';

interface ScheduleEvent {
    id: string; studentId: string; studentName: string; studentGrade: string;
    teacherName: string; subject: string; curriculum: string; day: string;
    hour: string; period: string; time: string; studentPoints?: number;
}

const SUBJECT_COLORS: Record<string, { bg: string; text: string; chip: string }> = {
    'رياضيات': { bg: 'bg-primary', text: 'text-primary', chip: 'bg-primary/[12%]' },
    'علوم': { bg: 'bg-success', text: 'text-success', chip: 'bg-success/[12%]' },
    'عربي': { bg: 'bg-warning', text: 'text-warning', chip: 'bg-warning/[12%]' },
    'انجليزي': { bg: 'bg-info', text: 'text-info', chip: 'bg-info/[12%]' },
    'دين': { bg: 'bg-accent', text: 'text-accent', chip: 'bg-accent/[12%]' },
    'تاريخ': { bg: 'bg-error', text: 'text-error', chip: 'bg-error/[12%]' },
    'قرآن': { bg: 'bg-accent', text: 'text-accent', chip: 'bg-accent/[12%]' },
    'قواعد': { bg: 'bg-primary', text: 'text-primary', chip: 'bg-primary/[12%]' },
    'بلاغة': { bg: 'bg-info', text: 'text-info', chip: 'bg-info/[12%]' },
    'فقه': { bg: 'bg-success', text: 'text-success', chip: 'bg-success/[12%]' },
    'توحيد': { bg: 'bg-accent', text: 'text-accent', chip: 'bg-accent/[12%]' },
    'تفسير': { bg: 'bg-warning', text: 'text-warning', chip: 'bg-warning/[12%]' },
    'نحو': { bg: 'bg-error', text: 'text-error', chip: 'bg-error/[12%]' },
};

const FALLBACKS = [
    { bg: 'bg-primary', text: 'text-primary', chip: 'bg-primary/[12%]' },
    { bg: 'bg-success', text: 'text-success', chip: 'bg-success/[12%]' },
    { bg: 'bg-warning', text: 'text-warning', chip: 'bg-warning/[12%]' },
    { bg: 'bg-info', text: 'text-info', chip: 'bg-info/[12%]' },
    { bg: 'bg-accent', text: 'text-accent', chip: 'bg-accent/[12%]' },
    { bg: 'bg-error', text: 'text-error', chip: 'bg-error/[12%]' },
];

const getSC = (subject: string) => SUBJECT_COLORS[subject?.trim() || ''] || FALLBACKS[Math.abs((subject?.trim() || '').length) % FALLBACKS.length];

interface SchedulePopoverProps {
    event: ScheduleEvent | null;
    onClose: () => void;
    onStartLiveSession: () => void;
    onViewStudent: () => void;
}

export const SchedulePopover = ({ event, onClose, onStartLiveSession, onViewStudent }: SchedulePopoverProps) => {
    if (!event) return null;
    const c = getSC(event.subject);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
                onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 10 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="absolute bottom-4 left-4 right-4 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
                        {/* Header gradient */}
                        <div className={`relative p-4 pb-5 ${c.bg}`}>
                            <div className="absolute inset-0 opacity-10">
                                <svg width="100%" height="100%"><defs><pattern id="popover-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="white" /></pattern></defs><rect width="100%" height="100%" fill="url(#popover-grid)" /></svg>
                            </div>
                            <div className="relative z-10 flex items-start justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center ring-2 ring-white/30">
                                        <BookOpen size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">{event.subject}</h3>
                                        <p className="text-[10px] text-white/70 mt-0.5">{event.curriculum || 'المنهج العام'}</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors rounded-lg" aria-label="إغلاق">
                                    <X size={14} />
                                </button>
                            </div>
                            {event.studentPoints != null && event.studentPoints > 0 && (
                                <div className="relative z-10 mt-2 flex items-center gap-1.5">
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/15">
                                        <Star size={8} className="text-warning" fill="currentColor" />
                                        <span className="text-[9px] font-bold text-white">{event.studentPoints} نقطة</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-surface rounded-xl p-3">
                                    <User size={12} className="text-muted mb-1" />
                                    <p className="text-[9px] font-bold text-muted">الطالب</p>
                                    <p className="text-xs font-bold text-main mt-0.5">{event.studentName}</p>
                                </div>
                                <div className="bg-surface rounded-xl p-3">
                                    <GraduationCap size={12} className="text-muted mb-1" />
                                    <p className="text-[9px] font-bold text-muted">المعلمة</p>
                                    <p className="text-xs font-bold text-main mt-0.5">{event.teacherName}</p>
                                </div>
                            </div>
                            <div className="bg-surface rounded-xl p-3 flex items-center gap-2">
                                <CalendarDays size={12} className="text-muted shrink-0" />
                                <div>
                                    <p className="text-[9px] font-bold text-muted">الموعد</p>
                                    <p className="text-xs font-bold text-main mt-0.5">{event.day} — {event.time}</p>
                                </div>
                            </div>
                            {event.studentGrade && (
                                <div className="bg-surface rounded-xl p-3 flex items-center gap-2">
                                    <Star size={12} className="text-muted shrink-0" />
                                    <div>
                                        <p className="text-[9px] font-bold text-muted">الصف</p>
                                        <p className="text-xs font-bold text-main mt-0.5">{event.studentGrade}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 p-4 pt-0">
                            <button onClick={onStartLiveSession}
                                className="flex-1 h-10 text-white text-[10px] font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover">
                                <Video size={13} />
                                بدء بث مباشر
                            </button>
                            <button onClick={onViewStudent}
                                className="flex-1 h-10 text-main text-[10px] font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-surface border border-border hover:bg-background">
                                <ExternalLink size={13} />
                                الملف الشخصي
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
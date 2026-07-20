import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, History } from 'lucide-react';
import { ProgressBar } from '../../../../shared/components/ui';
import type { Student, Enrollment } from '../../types';

interface StudentAttendanceCardProps {
    student: Student;
    enrollment: Enrollment;
    onAttend: () => void;
    onHistory: () => void;
    onDeleteSlot: (slotIndex: number) => void;
    onReschedule: () => void;
}

export const StudentAttendanceCard = ({ student, enrollment, onAttend, onHistory }: StudentAttendanceCardProps) => {
    const todayName = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
    const todaySlot = enrollment.schedule?.find(s => s.day === todayName);
    const used = enrollment.sessionsUsed || 0;
    const total = enrollment.sessionsTotal || 1;
    const progressPct = Math.min(100, Math.round((used / total) * 100));

    return (
        <motion.div whileTap={{ scale: 0.98 }}
            className="bg-card rounded-card p-3.5 shadow-soft border border-border/50 space-y-2.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 bg-primary-soft text-primary">
                        {student.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-main leading-tight">{student.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {student.grade && (
                                <span className="text-micro font-bold text-muted px-1.5 py-0.5 rounded border border-border">{student.grade}</span>
                            )}
                            <span className="text-micro font-bold text-primary flex items-center gap-1">
                                <BookOpen size={9} strokeWidth={1.5} />{enrollment.subject}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-end">
                    {todaySlot ? (
                        <span className="text-micro font-bold px-2 py-1 rounded-lg bg-primary-soft text-primary">
                            {todaySlot.hour}:00 {todaySlot.period === 'am' ? 'ص' : 'م'}
                        </span>
                    ) : (
                        <span className="text-micro font-bold text-muted bg-surface px-2 py-1 rounded-lg">بدون موعد</span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <ProgressBar value={progressPct} variant="attendance" />
                <span className="text-micro font-bold text-muted tabular-nums">{used}/{total}</span>
            </div>

            <div className="flex gap-1.5">
                <motion.button whileTap={{ scale: 0.93 }} onClick={onAttend}
                    className="flex-1 py-2.5 bg-success text-on-success text-micro font-bold rounded-xl flex items-center justify-center gap-1 shadow-soft">
                    <CheckCircle2 size={12} strokeWidth={1.5} /> حضور
                </motion.button>
                <motion.button whileTap={{ scale: 0.93 }} onClick={onHistory}
                    className="flex-1 py-2.5 bg-primary text-on-primary text-micro font-bold rounded-xl flex items-center justify-center gap-1 shadow-soft">
                    <History size={12} strokeWidth={1.5} /> السجل
                </motion.button>
            </div>
        </motion.div>
    );
};

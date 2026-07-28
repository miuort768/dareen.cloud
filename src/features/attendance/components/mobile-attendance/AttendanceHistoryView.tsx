import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, History } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { triggerHaptic } from '../../../../lib/haptics';
import type { PeriodFilter } from '../AttendanceFilters';
import type { Session } from '../../types';

interface AttendanceHistoryViewProps {
    periodFilter: PeriodFilter;
    setPeriodFilter: (v: PeriodFilter) => void;
    filteredSessions: Session[];
    periodLabel: string;
    onViewHistory: (studentId: string, studentName: string, subject?: string) => void;
}

export const AttendanceHistoryView = ({
    periodFilter, setPeriodFilter, filteredSessions, periodLabel, onViewHistory
}: AttendanceHistoryViewProps) => (
    <motion.div key="history"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="space-y-3">
        <div className="bg-card rounded-2xl p-2 border border-border">
            <div className="flex items-center gap-1.5">
                {(['today', 'week', 'month'] as PeriodFilter[]).map(p => (
                    <motion.button key={p} whileTap={{ scale: 0.95 }}
                        onClick={() => { triggerHaptic('light'); setPeriodFilter(p); }}
                        className={cn("flex-1 py-2 rounded-xl text-micro font-bold transition-all",
                            periodFilter === p ? "bg-primary text-on-primary shadow-elevation-1" : "text-muted"
                        )}>
                        {p === 'today' ? 'اليوم' : p === 'week' ? 'الأسبوع' : 'الشهر'}
                    </motion.button>
                ))}
            </div>
        </div>

        <div className="space-y-1.5">
            {filteredSessions.length > 0 ? filteredSessions.map(session => (
                <motion.div key={session.id} whileTap={{ scale: 0.98 }}
                    className="bg-card rounded-2xl p-3.5 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center",
                            session.status === 'completed' ? 'bg-success-soft' :
                            session.status === 'cancelled' ? 'bg-error-soft' : 'bg-warning-soft'
                        )}>
                            {session.status === 'completed' ? <CheckCircle2 size={14} className="text-success" /> :
                             session.status === 'cancelled' ? <XCircle size={14} className="text-error" /> :
                             <Clock size={14} className="text-warning" />}
                        </div>
                        <div>
                            <p className="text-micro font-bold text-main">{session.studentName}</p>
                            <p className="text-micro font-bold text-muted">{session.subject} · {session.teacherName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-micro font-bold text-muted tabular-nums">{session.time}</span>
                        <motion.button whileTap={{ scale: 0.93 }}
                            onClick={() => onViewHistory(session.studentId, session.studentName, session.subject)}
                            className="px-2 py-1 rounded-xl bg-surface text-muted text-micro font-bold">
                            <History size={10} />
                        </motion.button>
                    </div>
                </motion.div>
            )) : (
                <div className="py-12 text-center bg-card rounded-2xl border border-dashed border-border">
                    <History className="mx-auto mb-2 text-muted" size={28} strokeWidth={1.5} />
                    <p className="text-xs font-bold text-muted">لا توجد جلسات مسجلة</p>
                    <p className="text-micro font-medium text-muted mt-1">لـ {periodLabel}</p>
                </div>
            )}
        </div>
    </motion.div>
);

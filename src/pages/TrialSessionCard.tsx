import { motion } from 'framer-motion';
import { Phone, BookOpen, GraduationCap, Calendar, Clock, ArrowLeftRight, X, Trash } from 'lucide-react';
import { cn } from '../lib/utils';
import type { TrialSession } from './TrialSessions';

interface TrialSessionCardProps {
    session: TrialSession;
    onConvert: (id: string) => void;
    onEdit: (session: TrialSession) => void;
    onDelete: (id: string) => void;
    isConverting: boolean;
}

const statusTextColor: Record<string, string> = {
    pending: 'text-warning',
    completed: 'text-success',
    cancelled: 'text-error',
    converted: 'text-info',
};

const statusBg: Record<string, string> = {
    pending: 'bg-warning-soft',
    completed: 'bg-success-soft',
    cancelled: 'bg-error-soft',
    converted: 'bg-info-soft',
};

const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    completed: 'تم',
    cancelled: 'ملغي',
    converted: 'تم التحويل'
};

export const TrialSessionCard = ({ session: t, onConvert, onEdit, onDelete, isConverting }: TrialSessionCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl overflow-hidden font-dash"
    >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 bg-primary-soft text-primary ring-1 ring-primary/20">
                    {t.studentName?.charAt(0) || 'ط'}
                </div>
                <div>
                    <h3 className="text-xs font-bold text-main leading-tight">{t.studentName}</h3>
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", statusBg[t.status], statusTextColor[t.status])}>{statusLabels[t.status]}</span>
                </div>
            </div>
            <div className="flex items-center gap-1">
                {t.status === 'pending' && (
                    <button onClick={() => onConvert(t.id)} disabled={isConverting} className="w-8 h-8 flex items-center justify-center bg-info-soft text-info hover:bg-info/10 transition-all rounded-xl disabled:opacity-40 disabled:cursor-not-allowed" title="تحويل إلى طالب" aria-label="تحويل إلى طالب"><ArrowLeftRight size={14} /></button>
                )}
                <button onClick={() => onEdit(t)} className="w-8 h-8 flex items-center justify-center bg-surface text-muted hover:bg-hover transition-all rounded-xl" aria-label="تعديل"><X size={14} className="rotate-45" /></button>
                <button onClick={() => onDelete(t.id)} className="w-8 h-8 flex items-center justify-center bg-error-soft text-error hover:bg-error/10 transition-all rounded-xl" aria-label="حذف"><Trash size={14} /></button>
            </div>
        </div>
        <div className="px-4 py-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                    <Phone size={11} className="text-success shrink-0" />
                    <span className="truncate font-mono">{t.parentPhone}</span>
                </div>
                {t.subject && (
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                        <BookOpen size={11} className="text-info shrink-0" />
                        <span className="truncate">{t.subject}</span>
                    </div>
                )}
                {t.teacherName && (
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                        <GraduationCap size={11} className="text-warning shrink-0" />
                        <span className="truncate">{t.teacherName}</span>
                    </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-muted">
                    <Calendar size={11} className="text-primary shrink-0" />
                    <span>{t.date}</span>
                </div>
                {t.time && (
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                        <Clock size={11} className="text-info shrink-0" />
                        <span>{t.time}</span>
                    </div>
                )}
            </div>
            {t.notes && (
                <div className="mt-3 bg-warning-soft border border-warning/20 px-3 py-2 rounded-xl">
                    <span className="text-xs font-bold text-warning me-1.5">ملاحظات</span>
                    <span className="text-xs text-muted">{t.notes}</span>
                </div>
            )}
        </div>
    </motion.div>
);

import React from 'react';
import { CheckCircle2, XCircle, BookOpen, Clock, Activity, History } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Session } from '../types';
import { ProgressBar } from '../../../shared/components/ui';

interface AdminSessionCardProps {
    session: Session;
    stats: {
        used: number;
        total: number;
    };
    onUpdateStatus: (id: string, status: Session['status']) => void;
    onViewHistory?: (studentId: string, studentName: string, grade?: string, subject?: string) => void;
    studentGrade?: string;
}

export const AdminSessionCard: React.FC<AdminSessionCardProps> = ({ session, stats, onUpdateStatus, onViewHistory, studentGrade }) => {
    const { used, total } = stats;
    const progress = total > 0 ? (used / total) * 100 : 0;

    return (
        <div className="bg-card border border-border/50 shadow-soft rounded-card overflow-hidden flex flex-col group transition-all hover:shadow-soft h-full">
            <div className={cn(
                "h-1.5 w-full transition-all",
                session.status === 'completed' ? 'bg-success' : session.status === 'cancelled' ? 'bg-error' : 'bg-surface'
            )}></div>
            
            <div className="p-5 flex-1 flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-micro font-black bg-primary-soft text-primary">
                            {studentGrade?.charAt(0) || session.studentName.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-normal text-main text-sm leading-tight">{session.studentName}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-micro font-normal text-muted uppercase">{studentGrade}</span>
                                <span className="w-1 h-1 bg-card"></span>
                                <div className="flex items-center gap-1">
                                    <BookOpen size={10} className="text-primary" />
                                    <span className="text-micro font-normal text-muted">{session.subject}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {session.status !== 'scheduled' && (
                        <div className={`px-2 py-0.5 text-micro font-bold rounded-lg ${session.status === 'completed' ? 'bg-success-soft text-success' : 'bg-error-soft text-error'}`}>
                            {session.status === 'completed' ? 'منفذة' : 'ملغاة'}
                        </div>
                    )}
                </div>

                <div className="bg-card p-3 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Clock size={12} className="text-primary" />
                        <span className="text-micro font-bold text-muted uppercase tracking-wide">موعد الحصة</span>
                    </div>
                    <div className="text-sm font-black font-mono text-main tabular-nums">
                        {session.time}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-micro font-normal uppercase text-muted">
                        <div className="flex items-center gap-1.5">
                            <Activity size={12} className="text-primary" />
                            <span>تغطية الرصيد</span>
                        </div>
                            <div className="flex items-baseline gap-1 text-main">
                            <span className="text-xs font-medium text-primary">{used}</span>
                            <span className="opacity-50">/ {total}</span>
                        </div>
                    </div>
                    <ProgressBar value={Math.min(100, progress)} variant="attendance" />
                </div>
            </div>

            <div className="flex gap-2 p-5 pt-0 mt-auto">
                <button
                    onClick={() => onUpdateStatus(session.id, 'completed')}
                    disabled={session.status === 'completed'}
                    className={cn(
                        "flex-1 py-2.5 font-bold text-micro rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-soft active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                        session.status === 'completed'
                            ? 'bg-success text-on-primary'
                            : 'bg-primary hover:bg-primary-hover text-on-primary'
                    )}
                >
                    <CheckCircle2 size={14} /> إثبات
                </button>
                <button
                    onClick={() => onUpdateStatus(session.id, 'cancelled')}
                    disabled={session.status === 'cancelled'}
                    className={cn(
                        "flex-1 py-2.5 font-bold text-micro rounded-xl transition-all flex items-center justify-center gap-1.5 border shadow-soft active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                        session.status === 'cancelled'
                            ? 'bg-error border-error text-on-primary'
                            : 'bg-card border-border/50 text-muted hover:text-error'
                    )}
                >
                    <XCircle size={14} /> إلغاء
                </button>
            </div>
            {onViewHistory && (
                <div className="px-5 pb-5 pt-0">
                    <button
                        onClick={() => onViewHistory(session.studentId, session.studentName, studentGrade, session.subject)}
                        className="w-full py-2.5 bg-primary hover:bg-primary-hover text-on-primary font-bold text-micro rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-soft active:scale-95"
                    >
                        <History size={14} /> سجل الطالب
                    </button>
                </div>
            )}
        </div>
    );
};

import React from 'react';
import { CheckCircle2, XCircle, BookOpen, Clock, Activity, History } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Session } from '../types';

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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-sm h-full">
            <div className={cn(
                "h-1.5 w-full transition-all",
                session.status === 'completed' ? 'bg-emerald-500' : session.status === 'cancelled' ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-700'
            )}></div>
            
            <div className="p-5 flex-1 flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-none flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: '#8B5CF612', color: '#8B5CF6' }}>
                            {studentGrade?.charAt(0) || session.studentName.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-normal text-slate-800 dark:text-white text-sm leading-tight">{session.studentName}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-normal text-slate-400 uppercase">{studentGrade}</span>
                                <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600"></span>
                                <div className="flex items-center gap-1">
                                    <BookOpen size={10} style={{ color: '#8B5CF6' }} />
                                    <span className="text-[9px] font-normal text-slate-400">{session.subject}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {session.status !== 'scheduled' && (
                        <div className="px-2 py-0.5 text-[9px] font-bold rounded-none" style={{ backgroundColor: session.status === 'completed' ? '#10B98112' : '#F43F5E12', color: session.status === 'completed' ? '#10B981' : '#F43F5E' }}>
                            {session.status === 'completed' ? 'منفذة' : 'ملغاة'}
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-none border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Clock size={12} style={{ color: '#8B5CF6' }} />
                        <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wide">موعد الحصة</span>
                    </div>
                    <div className="text-sm font-black font-mono text-slate-800 dark:text-white tabular-nums">
                        {session.time}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-normal uppercase text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <Activity size={12} style={{ color: '#8B5CF6' }} />
                            <span>تغطية الرصيد</span>
                        </div>
                        <div className="flex items-baseline gap-1 text-slate-800 dark:text-white">
                            <span className="text-xs font-medium" style={{ color: '#8B5CF6' }}>{used}</span>
                            <span className="opacity-50">/ {total}</span>
                        </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all duration-1000 ease-out",
                                progress > 85 ? 'bg-rose-500' : progress > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                            )}
                            style={{ width: `${Math.min(100, progress)}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-2 p-5 pt-0 mt-auto">
                <button
                    onClick={() => onUpdateStatus(session.id, 'completed')}
                    disabled={session.status === 'completed'}
                    className={cn(
                        "flex-1 py-2.5 font-bold text-[10px] rounded-none transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                        session.status === 'completed'
                            ? 'bg-[#10B981] text-white'
                            : 'bg-[#0F172A] dark:bg-slate-800 text-white hover:bg-black'
                    )}
                >
                    <CheckCircle2 size={14} /> إثبات
                </button>
                <button
                    onClick={() => onUpdateStatus(session.id, 'cancelled')}
                    disabled={session.status === 'cancelled'}
                    className={cn(
                        "flex-1 py-2.5 font-bold text-[10px] rounded-none transition-all flex items-center justify-center gap-1.5 border shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                        session.status === 'cancelled'
                            ? 'bg-[#F43F5E] border-[#F43F5E] text-white'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600'
                    )}
                >
                    <XCircle size={14} /> إلغاء
                </button>
            </div>
            {onViewHistory && (
                <div className="px-5 pb-5 pt-0">
                    <button
                        onClick={() => onViewHistory(session.studentId, session.studentName, studentGrade, session.subject)}
                        className="w-full py-2.5 bg-[#8B5CF6] hover:bg-violet-700 text-white font-bold text-[10px] rounded-none transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                    >
                        <History size={14} /> سجل الطالب
                    </button>
                </div>
            )}
        </div>
    );
};

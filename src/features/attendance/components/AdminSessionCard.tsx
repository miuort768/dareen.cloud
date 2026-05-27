import React from 'react';
import { CheckCircle2, XCircle, BookOpen, Clock, Activity } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Session } from '../types';

interface AdminSessionCardProps {
    session: Session;
    stats: {
        used: number;
        total: number;
    };
    onUpdateStatus: (id: string, status: Session['status']) => void;
    studentGrade?: string;
}

export const AdminSessionCard: React.FC<AdminSessionCardProps> = ({ session, stats, onUpdateStatus, studentGrade }) => {
    const { used, total } = stats;
    const progress = total > 0 ? (used / total) * 100 : 0;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-sm h-full">
            <div className={cn(
                "h-1.5 w-full transition-all",
                session.status === 'completed' ? 'bg-emerald-500' : session.status === 'cancelled' ? 'bg-rose-500' : 'bg-slate-100 dark:bg-slate-800'
            )}></div>
            
            <div className="p-5 flex-1 flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-[10px] font-normal text-blue-600">
                            {studentGrade?.charAt(0) || session.studentName.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-normal text-slate-800 dark:text-white text-sm leading-tight">{session.studentName}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-normal text-slate-400 uppercase">{studentGrade}</span>
                                <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></span>
                                <div className="flex items-center gap-1">
                                    <BookOpen size={10} className="text-blue-600" />
                                    <span className="text-[9px] font-normal text-slate-400">{session.subject}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {session.status !== 'scheduled' && (
                        <div className={cn(
                            "px-2 py-0.5 text-[9px] font-normal rounded-lg transition-all",
                            session.status === 'completed' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "bg-rose-50 text-rose-600 dark:bg-rose-900/20"
                        )}>
                            {session.status === 'completed' ? 'منفذة' : 'ملغاة'}
                        </div>
                    )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Clock size={12} className="text-blue-600" />
                        <span className="text-[9px] font-normal text-slate-400 uppercase tracking-wide">موعد الحصة</span>
                    </div>
                    <div className="text-sm font-medium font-mono text-slate-800 dark:text-white tabular-nums">
                        {session.time}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-normal uppercase text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <Activity size={12} className="text-blue-600" />
                            <span>تغطية الرصيد</span>
                        </div>
                        <div className="flex items-baseline gap-1 text-slate-800 dark:text-white">
                            <span className="text-xs font-medium text-blue-600">{used}</span>
                            <span className="opacity-50">/ {total}</span>
                        </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
                    className={cn(
                        "flex-1 py-2 font-normal text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5",
                        session.status === 'completed'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-black'
                    )}
                >
                    <CheckCircle2 size={14} /> <span>إثبات</span>
                </button>
                <button
                    onClick={() => onUpdateStatus(session.id, 'cancelled')}
                    className={cn(
                        "flex-1 py-2 font-normal text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 border",
                        session.status === 'cancelled'
                            ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600'
                    )}
                >
                    <XCircle size={14} /> <span>إلغاء</span>
                </button>
            </div>
        </div>
    );
};

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

    const getGradeDisplay = (grade?: string) => {
        if (!grade) return session.studentName.charAt(0);
        const mapping: Record<string, string> = {
            'الأول': '1', 'الثاني': '2', 'الثالث': '3', 'الرابع': '4', 'الخامس': '5', 'السادس': '6',
            'سابع': '7', 'ثامن': '8', 'تاسع': '9', 'عاشر': '10'
        };
        const numMatch = grade.match(/\d+/);
        if (numMatch) return numMatch[0];
        for (const [key, val] of Object.entries(mapping)) {
            if (grade.includes(key)) return val;
        }
        return session.studentName.charAt(0);
    };

    return (
        <div className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm transition-all hover:shadow-2xl rounded-none overflow-hidden h-full flex flex-col justify-between" dir="rtl">
            {/* Action Bar Accent */}
            <div className={cn(
                "absolute top-0 right-0 w-1.5 h-full transition-colors duration-500",
                session.status === 'completed' ? 'bg-emerald-500' : session.status === 'cancelled' ? 'bg-rose-500' : 'bg-indigo-600'
            )}></div>
            
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-black text-xl italic shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                            {getGradeDisplay(studentGrade)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-black text-slate-800 dark:text-white text-base leading-none uppercase italic tracking-tighter">{session.studentName}</h4>
                                <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen size={12} className="text-indigo-600" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{session.subject}</p>
                            </div>
                        </div>
                    </div>
                    {session.status !== 'scheduled' && (
                        <div className={cn(
                            "px-3 py-1 text-[9px] font-black uppercase italic tracking-widest border",
                            session.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                        )}>
                            {session.status === 'completed' ? 'منفذة' : 'ملغاة'}
                        </div>
                    )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800 relative overflow-hidden group/box">
                    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-slate-900/5 rotate-12 transition-transform group-hover/box:rotate-45"></div>
                    <div className="flex items-center gap-2 mb-3">
                        <Clock size={14} className="text-indigo-600" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">الموعد الزمني</span>
                    </div>
                    <div className="text-lg font-black font-mono text-slate-800 dark:text-white tabular-nums leading-none tracking-tight">
                        {session.time}
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase italic tracking-widest text-slate-400">
                        <div className="flex items-center gap-2">
                            <Activity size={14} className="text-indigo-600" />
                            <span>مستوى تغطية الرصيد</span>
                        </div>
                        <div className="flex items-baseline gap-1 text-slate-900 dark:text-white font-mono">
                            <span className="text-base">{used}</span>
                            <span>/ {total}</span>
                        </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden relative">
                        <div
                            className={cn(
                                "h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]",
                                progress > 85 ? 'bg-rose-500' : progress > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                            )}
                            style={{ width: `${Math.min(100, progress)}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-8">
                <button
                    onClick={() => onUpdateStatus(session.id, 'completed')}
                    className={cn(
                        "flex-1 py-3.5 font-black text-[10px] uppercase tracking-[2px] transition-all italic flex items-center justify-center gap-2",
                        session.status === 'completed'
                            ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20'
                            : 'bg-slate-900 border border-slate-800 text-white hover:bg-black'
                    )}
                >
                    <CheckCircle2 size={16} /> <span>إثبات</span>
                </button>
                <button
                    onClick={() => onUpdateStatus(session.id, 'cancelled')}
                    className={cn(
                        "flex-1 py-3.5 font-black text-[10px] uppercase tracking-[2px] transition-all italic flex items-center justify-center gap-2",
                        session.status === 'cancelled'
                            ? 'bg-rose-600 text-white shadow-xl shadow-rose-500/20'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600'
                    )}
                >
                    <XCircle size={16} /> <span>إلغاء</span>
                </button>
            </div>
        </div>
    );
};

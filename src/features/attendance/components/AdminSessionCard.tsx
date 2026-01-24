
import React from 'react';
import { CheckCircle2, XCircle, BookOpen, TrendingUp } from 'lucide-react';
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
        <div className="group relative bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all rounded-none overflow-hidden shadow-sm hover:shadow-lg">
            <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-black text-lg rounded-none">
                            {getGradeDisplay(studentGrade)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="font-black text-gray-900 dark:text-white text-base leading-tight">{session.studentName}</h4>
                                {studentGrade && (
                                    <span className="text-[8px] font-black bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300 px-1.5 py-0.5 rounded-none uppercase">
                                        {studentGrade}
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                <BookOpen size={10} className="text-primary-500" />
                                {session.subject}
                            </p>
                        </div>
                    </div>
                    <div className="text-xs font-black bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300 font-mono">
                        {session.time}
                    </div>
                </div>

                <div className="p-0 space-y-2 rounded-none">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={14} className="text-primary-500" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">تغطية المنهج</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-base font-black text-gray-900 dark:text-white">{used}</span>
                            <span className="text-[10px] font-bold text-gray-400">/ {total}</span>
                        </div>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-inner relative rounded-none">
                        <div
                            className={cn(
                                "h-full transition-all duration-1000 ease-out shadow-lg rounded-none relative",
                                progress > 85 ? 'bg-rose-500' : progress > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                            )}
                            style={{ width: `${Math.min(100, progress)}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        onClick={() => onUpdateStatus(session.id, 'completed')}
                        className={`flex-1 py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1 transition-colors ${session.status === 'completed'
                            ? 'bg-emerald-600 text-white shadow-emerald-500/20 shadow-lg'
                            : 'bg-white border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50'
                            }`}
                    >
                        <CheckCircle2 size={14} /> حاضر
                    </button>
                    <button
                        onClick={() => onUpdateStatus(session.id, 'cancelled')}
                        className={`flex-1 py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1 transition-colors ${session.status === 'cancelled'
                            ? 'bg-rose-600 text-white shadow-rose-500/20 shadow-lg'
                            : 'bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-50'
                            }`}
                    >
                        <XCircle size={14} /> غائب
                    </button>
                </div>
            </div>
        </div>
    );
};

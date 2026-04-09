import React from 'react';
import { CheckCircle2, XCircle, BookOpen, Clock, GraduationCap } from 'lucide-react';
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
        <div className="group relative bg-white border-4 border-gray-950 p-6 shadow-[8px_8px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-none overflow-hidden h-full flex flex-col justify-between">
            {/* Design accents */}
            <div className="absolute top-0 right-0 w-2 h-full bg-primary-600"></div>
            
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-950 text-white flex items-center justify-center border-2 border-gray-950 shadow-[3px_3px_0px_0px_black] transform -rotate-3 text-xl font-black">
                            {getGradeDisplay(studentGrade)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-black text-gray-950 text-xl tracking-tighter uppercase leading-none">{session.studentName}</h4>
                                {studentGrade && (
                                    <span className="text-[10px] font-black bg-gray-950 text-white px-2 py-0.5 border-2 border-gray-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                                        {studentGrade}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen size={14} className="text-primary-600" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{session.subject}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-4">
                     <div className="flex items-center gap-2 mb-3">
                        <Clock size={16} className="text-gray-950" />
                        <span className="text-[10px] font-black text-gray-950 uppercase tracking-widest italic">موعد الحصة المجدول</span>
                    </div>
                    <div className="text-lg font-black font-mono text-gray-950 bg-white border-2 border-gray-950 px-4 py-1 inline-block shadow-[2px_2px_0px_0px_black] tracking-tight">
                        {session.time}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <div className="flex items-center gap-2">
                            <GraduationCap size={16} className="text-primary-600" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">معدل التقدم</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-gray-950">{used}</span>
                            <span className="text-[10px] font-black text-gray-400">/ {total} حواجز</span>
                        </div>
                    </div>
                    <div className="h-4 bg-white border-2 border-gray-950 p-0.5 shadow-inner">
                        <div
                            className={cn(
                                "h-full transition-all duration-1000 ease-out",
                                progress > 85 ? 'bg-rose-500' : progress > 60 ? 'bg-amber-400' : 'bg-emerald-500'
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
                        "flex-1 py-4 border-4 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[4px_4px_0px_0px_black] active:shadow-none",
                        session.status === 'completed'
                            ? 'bg-emerald-500 text-white border-gray-950'
                            : 'bg-white border-gray-950 text-emerald-600 hover:bg-emerald-50'
                    )}
                >
                    <CheckCircle2 size={18} strokeWidth={3} /> حاضر
                </button>
                <button
                    onClick={() => onUpdateStatus(session.id, 'cancelled')}
                    className={cn(
                        "flex-1 py-4 border-4 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[4px_4px_0px_0px_black] active:shadow-none",
                        session.status === 'cancelled'
                            ? 'bg-rose-600 text-white border-gray-950'
                            : 'bg-white border-gray-950 text-rose-600 hover:bg-rose-50'
                    )}
                >
                    <XCircle size={18} strokeWidth={3} /> غائب
                </button>
            </div>
        </div>
    );
};

import { useState } from 'react';
import { X, Trash, RefreshCw, MessageCircle, BookOpen, Snowflake, Play, UserCircle2, CheckCircle2, GraduationCap } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Student, Enrollment } from '../types';
import type { Teacher } from '../../teachers/types';
import { EnrollmentForm } from './EnrollmentForm';
import { StudentHistoryModal } from './StudentHistoryModal';
import { StudentCard } from './StudentCard';
import { getRankByPoints, STUDENT_RANKS } from '../../../shared/utils/ranks';

interface StudentDetailsProps {
    student: Student;
    onClose: () => void;
    onAddEnrollment: (data: any) => void;
    onDeleteEnrollment: (index: number) => void;
    onRenewEnrollment: (index: number) => void;
    onSendReminder: (enrollment: Enrollment) => void;
    onAddSessions: (index: number, amount: number) => void;
    onFreezeEnrollment?: (enrollmentId: string, isFrozen: boolean, reason?: string) => void;
    teachers: Teacher[];
}

export const StudentDetails = ({
    student,
    onClose,
    onAddEnrollment,
    onDeleteEnrollment,
    onRenewEnrollment,
    onSendReminder,
    onAddSessions,
    onFreezeEnrollment,
    teachers
}: StudentDetailsProps) => {
    const [addingSessionsIndex, setAddingSessionsIndex] = useState<number | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showCard, setShowCard] = useState(false);

    const rank = getRankByPoints(student.totalPoints || 0, STUDENT_RANKS);

    return (
        <div className={cn(
            "bg-white dark:bg-gray-950 shadow-[10px_10px_0px_0px_black] overflow-hidden flex flex-col rounded-none",
            "fixed inset-0 z-[100] lg:static lg:h-[750px] lg:border-4 lg:border-gray-950"
        )}>
            <div className="p-6 border-b-4 border-gray-950 flex justify-between items-center bg-gray-50 dark:bg-gray-950/50 dark:border-gray-800">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary-600 text-white flex items-center justify-center border-4 border-gray-950 transform rotate-2 shadow-[4px_4px_0px_0px_black] relative overflow-hidden group">
                        <GraduationCap size={32} />
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                    </div>
                    <div className="text-right" dir="rtl">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-black text-gray-950 dark:text-white text-xl uppercase tracking-tighter leading-none">{student.name}</h3>
                            <div className={cn(
                                "flex items-center gap-1.5 px-3 py-1 border-2 border-gray-950 shadow-[3px_3px_0px_0px_black] text-[9px] font-black uppercase text-white",
                                rank.badgeColor
                            )}>
                                <span>{rank.icon}</span>
                                <span>{rank.name}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="bg-gray-950 text-white text-[10px] font-black px-2 py-0.5 border-2 border-gray-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                                {student.grade}
                            </span>
                            <div className="bg-yellow-400 text-gray-950 border-2 border-gray-950 px-2 py-0.5 text-[10px] font-black shadow-[2px_2px_0px_0px_black]">
                                {student.totalPoints || 0} نقطة
                            </div>
                            <button 
                                onClick={() => setShowCard(true)}
                                className="bg-emerald-50 text-emerald-700 border-2 border-emerald-600 px-2 py-0.5 text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all shadow-[2px_2px_0px_0px_black]"
                            >
                                <UserCircle2 size={12} className="inline ml-1" />
                                بوشاقة الطالب
                            </button>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="w-10 h-10 bg-white border-2 border-gray-950 flex items-center justify-center text-gray-950 hover:bg-gray-950 hover:text-white transition-all shadow-[4px_4px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-white dark:bg-gray-950">
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b-4 border-gray-950 pb-3 mb-6">
                         <h4 className="text-xs font-black text-gray-950 uppercase tracking-widest italic">
                            الاشتراكات والبرامج التعليمية ({student.enrollments.length})
                        </h4>
                        <div className="w-4 h-4 bg-primary-600 border-2 border-gray-950"></div>
                    </div>

                    <div className="space-y-8">
                        {student.enrollments.map((en, i) => {
                            const actualUsed = en.sessionsUsed;
                            const remaining = en.sessionsTotal - actualUsed;
                            const isLow = remaining <= 2;

                            return (
                                <div key={i} className={cn(
                                    "p-6 border-4 border-gray-950 relative shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]",
                                    en.isFrozen ? "bg-blue-50/50 border-blue-600" : isLow ? "bg-rose-50 border-rose-600" : "bg-gray-50 dark:bg-gray-900"
                                )}>
                                    {en.isFrozen && (
                                        <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-black bg-blue-600 text-white px-3 py-1 border-2 border-gray-950 shadow-[4px_4px_0px_0px_black]">
                                            <Snowflake size={14} />
                                            حساب مجمٍّد
                                        </div>
                                    )}
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 text-right" dir="rtl">
                                        <div className="flex-1">
                                            <h5 className="font-black text-gray-950 dark:text-white text-xl tracking-tighter uppercase mb-2">{en.subject}</h5>
                                            <div className="flex items-center gap-2 text-xs font-black text-gray-600 uppercase italic">
                                                <div className="w-2 h-2 bg-primary-600 border border-gray-950"></div>
                                                <span>المعلمة: {en.teacher}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {onFreezeEnrollment && en.id && (
                                                <button
                                                    onClick={() => en.isFrozen ? onFreezeEnrollment(en.id!, false) : onFreezeEnrollment(en.id!, true)}
                                                    className="p-3 bg-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] hover:bg-blue-500 hover:text-white transition-all active:shadow-none translate-y-0"
                                                >
                                                    {en.isFrozen ? <Play size={18} /> : <Snowflake size={18} />}
                                                </button>
                                            )}
                                            <button onClick={() => onSendReminder(en)} className="p-3 bg-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"><MessageCircle size={18} /></button>
                                            <button onClick={() => onRenewEnrollment(i)} className="p-3 bg-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><RefreshCw size={18} /></button>
                                            <button onClick={() => onDeleteEnrollment(i)} className="p-3 bg-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] text-rose-600 hover:bg-rose-600 hover:text-white transition-all"><Trash size={18} /></button>
                                        </div>
                                    </div>

                                    {/* Advanced Attendance Grid */}
                                    <div className="mb-6">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 text-right italic">خارطة تقدم الجلسات</label>
                                        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                                            {[...Array(en.sessionsTotal)].map((_, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className={cn(
                                                        "aspect-square border-2 flex items-center justify-center transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]",
                                                        idx < actualUsed 
                                                            ? "bg-emerald-500 border-gray-950 text-white" 
                                                            : idx === actualUsed 
                                                                ? "bg-amber-400 border-gray-950 border-4 animate-pulse pt-0.5" 
                                                                : "bg-white border-gray-200"
                                                    )}
                                                >
                                                    {idx < actualUsed ? <CheckCircle2 size={12} strokeWidth={3} /> : idx === actualUsed ? <Play size={14} fill="currentColor" /> : <div className="w-1 h-1 bg-gray-200"></div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t-4 border-gray-100 pt-6 mt-4">
                                        <div className="flex justify-between items-end mb-4" dir="rtl">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">معدل الإنجاز</p>
                                                <p className="text-2xl font-black text-gray-950">%{Math.round((actualUsed / en.sessionsTotal) * 100)}</p>
                                            </div>
                                            <div className="text-left">
                                                <div className={cn("px-4 py-2 border-4 border-gray-950 font-black text-sm uppercase shadow-[4px_4px_0px_0px_black]", isLow ? "bg-rose-600 text-white" : "bg-emerald-500 text-white")}>
                                                    المتبقي: {remaining} حصة
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="h-4 bg-white border-2 border-gray-950 p-0.5">
                                            <div
                                                className={cn("h-full transition-all duration-1000", isLow ? "bg-rose-600" : "bg-primary-600")}
                                                style={{ width: `${(actualUsed / en.sessionsTotal) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center gap-4 pt-8">
                                        <button
                                            onClick={() => setAddingSessionsIndex(addingSessionsIndex === i ? null : i)}
                                            className={cn("px-6 py-4 border-4 text-xs font-black flex-1 w-full text-center transition-all uppercase tracking-widest shadow-[4px_4px_0px_0px_black]", 
                                                addingSessionsIndex === i 
                                                ? "bg-gray-950 text-white border-gray-950" 
                                                : "border-gray-950 text-gray-950 bg-white hover:bg-gray-950 hover:text-white"
                                            )}
                                        >
                                            {addingSessionsIndex === i ? 'إغلاق نافذة الإضافة' : 'إضافة رصيد حصص'}
                                        </button>

                                        <button
                                            onClick={() => setShowHistory(true)}
                                            className="px-6 py-4 border-4 border-gray-950 bg-amber-400 text-gray-950 text-xs font-black flex-1 w-full text-center hover:bg-gray-950 hover:text-white transition-all uppercase tracking-widest shadow-[4px_4px_0px_0px_black]"
                                        >
                                            سجل المتابعة بالكامل
                                        </button>
                                    </div>

                                    {addingSessionsIndex === i && (
                                        <div className="grid grid-cols-4 gap-3 mt-6 p-6 bg-gray-950 border-4 border-gray-950 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)]">
                                            {[1, 4, 8, 12].map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => { onAddSessions(i, num); setAddingSessionsIndex(null); }}
                                                    className="aspect-square bg-white border-2 border-gray-950 flex flex-col items-center justify-center hover:bg-primary-600 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                                                >
                                                    <span className="text-lg font-black">{num}</span>
                                                    <span className="text-[10px] font-black uppercase">حصة</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-10 border-t-8 border-gray-100 mt-12 bg-gray-50 -mx-6 px-6 pb-12">
                     <div className="flex items-center gap-3 mb-6 bg-gray-950 text-white p-4 border-2 border-gray-950 shadow-[4px_4px_0px_0px_#444]">
                        <BookOpen size={20} />
                        <h4 className="font-black text-sm uppercase tracking-widest">إضافة اشتراك جديد للطالب</h4>
                    </div>
                    <EnrollmentForm teachers={teachers} onSubmit={onAddEnrollment} />
                </div>
            </div>

            {showHistory && (
                <StudentHistoryModal
                    student={student}
                    onClose={() => setShowHistory(false)}
                />
            )}

            {showCard && (
                <StudentCard
                    student={student}
                    onClose={() => setShowCard(false)}
                />
            )}
        </div>
    );
};

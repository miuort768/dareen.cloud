import { useState } from 'react';
import { X, Trash, RefreshCw, MessageCircle, BookOpen, Snowflake, Play, UserCircle2, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Student, Enrollment } from '../types';
import type { Teacher } from '../../teachers/types';
import { EnrollmentForm } from './EnrollmentForm';
import { StudentHistoryModal } from './StudentHistoryModal';
import { StudentCard } from './StudentCard';

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

    return (
        <div className={cn(
            "bg-white dark:bg-gray-950 shadow-xl overflow-hidden flex flex-col rounded-none",
            "fixed inset-0 z-[100] lg:static lg:h-[700px] lg:shadow-sm lg:border-2 lg:border-gray-900 lg:dark:border-gray-800"
        )}>
            <div className="p-4 border-b-4 border-gray-900 flex justify-between items-start dark:bg-gray-950/50 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-600 text-white flex items-center justify-center rounded-none text-lg font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] border-2 border-gray-950">
                        {student.name.charAt(0)}
                    </div>
                    <div className="text-right" dir="rtl">
                        <h3 className="font-black text-gray-900 dark:text-white leading-none tracking-tighter uppercase">{student.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="inline-block px-1.5 py-0.5 bg-gray-950 text-white text-[9px] font-black uppercase tracking-widest rounded-none">
                                {student.grade}
                            </span>
                            <button 
                                onClick={() => setShowCard(true)}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-800 hover:bg-emerald-600 hover:text-white transition-colors"
                            >
                                <UserCircle2 size={10} />
                                عرض الكارت
                            </button>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-none bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-gray-50/30 dark:bg-gray-950/30">
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                        الاشتراكات النشطة ({student.enrollments.length})
                    </h4>

                    <div className="space-y-6">
                        {student.enrollments.map((en, i) => {
                            const actualUsed = en.sessionsUsed;
                            const remaining = en.sessionsTotal - actualUsed;
                            const isLow = remaining <= 2;

                            return (
                                <div key={i} className={cn(
                                    "p-5 border-2 border-gray-900 rounded-none relative shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)]",
                                    en.isFrozen ? "bg-blue-50/40 border-blue-600 dark:bg-blue-900/10" : isLow ? "bg-rose-50/50 border-rose-600" : "bg-white dark:bg-gray-900"
                                )}>
                                    {en.isFrozen && (
                                        <div className="absolute top-2 left-2 flex items-center gap-1 text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_black]">
                                            <Snowflake size={10} />
                                            مجمٍّد
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start mb-4 text-right" dir="rtl">
                                        <div>
                                            <h5 className="font-black text-gray-900 dark:text-white text-base tracking-tighter">{en.subject}</h5>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">
                                                <BookOpen size={12} className="text-primary-500" />
                                                <span>{en.teacher}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {onFreezeEnrollment && en.id && (
                                                <button
                                                    onClick={() => en.isFrozen ? onFreezeEnrollment(en.id!, false) : onFreezeEnrollment(en.id!, true)}
                                                    className={cn("p-1.5 border border-gray-200 hover:border-black transition-colors", en.isFrozen ? "text-emerald-600" : "text-blue-500")}
                                                >
                                                    {en.isFrozen ? <Play size={14} /> : <Snowflake size={14} />}
                                                </button>
                                            )}
                                            <button onClick={() => onSendReminder(en)} className="p-1.5 border border-gray-200 text-emerald-600 hover:border-emerald-600 transition-colors"><MessageCircle size={14} /></button>
                                            <button onClick={() => onRenewEnrollment(i)} className="p-1.5 border border-gray-200 text-blue-600 hover:border-blue-600 transition-colors"><RefreshCw size={14} /></button>
                                            <button onClick={() => onDeleteEnrollment(i)} className="p-1.5 border border-gray-200 text-red-600 hover:border-red-600 transition-colors"><Trash size={14} /></button>
                                        </div>
                                    </div>

                                    {/* Advanced Attendance Grid */}
                                    <div className="mb-4">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 text-right">شبكة الحضور والمتابعة</label>
                                        <div className="grid grid-cols-8 gap-1">
                                            {[...Array(en.sessionsTotal)].map((_, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className={cn(
                                                        "aspect-square border-2 flex items-center justify-center transition-all duration-300",
                                                        idx < actualUsed 
                                                            ? "bg-emerald-500 border-gray-900 text-white shadow-[2px_2px_0px_0px_black]" 
                                                            : idx === actualUsed 
                                                                ? "bg-amber-400 border-gray-900 animate-pulse" 
                                                                : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                                    )}
                                                    title={idx < actualUsed ? 'تم الحضور' : idx === actualUsed ? 'الجلسة القادمة' : 'مخطط لها'}
                                                >
                                                    {idx < actualUsed ? <CheckCircle2 size={10} /> : idx === actualUsed ? <Play size={10} /> : <Circle size={8} className="opacity-10" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter" dir="rtl">
                                            <span className="text-gray-500 flex items-center gap-1">
                                                حضور: <strong className="text-gray-900 dark:text-gray-200 text-lg">{actualUsed}</strong> / {en.sessionsTotal}
                                            </span>
                                            <span className={cn("px-2 py-0.5 border-2", isLow ? "bg-rose-600 text-white border-black shadow-[2px_2px_0px_0px_black]" : "bg-emerald-50 text-emerald-700 border-emerald-200")}>
                                                الباقي: {remaining}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                            <div
                                                className={cn("h-full transition-all duration-1000", isLow ? "bg-rose-600" : "bg-emerald-500")}
                                                style={{ width: `${(actualUsed / en.sessionsTotal) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4">
                                        <button
                                            onClick={() => setAddingSessionsIndex(addingSessionsIndex === i ? null : i)}
                                            className={cn("px-2 py-2 border-2 text-[9px] font-black flex-1 text-center bg-gray-50 rounded-none transition-all", addingSessionsIndex === i ? "bg-gray-950 text-white border-black" : "border-gray-950 text-gray-950 hover:bg-gray-950 hover:text-white")}
                                        >
                                            {addingSessionsIndex === i ? 'إغلاق' : 'إضافة حصص'}
                                        </button>

                                        <button
                                            onClick={() => setShowHistory(true)}
                                            className="px-2 py-2 border-2 border-primary-600 text-primary-700 bg-primary-50 text-[9px] font-black hover:bg-primary-600 hover:text-white transition-all rounded-none"
                                        >
                                            عرض السجل بالكامل
                                        </button>
                                    </div>

                                    {addingSessionsIndex === i && (
                                        <div className="flex justify-center gap-2 mt-4 p-3 bg-gray-950 border-2 border-black rounded-none animate-in slide-in-from-top-2 duration-300">
                                            {[2, 5, 8, 10, 12, 16].map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => { onAddSessions(i, num); setAddingSessionsIndex(null); }}
                                                    className="w-10 h-10 bg-white border-2 border-black text-xs font-black hover:bg-emerald-500 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]"
                                                >
                                                    +{num}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-6 border-t-4 border-gray-900 mt-8">
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

import { useState } from 'react';
import { X, Trash, RefreshCw, MessageCircle, BookOpen, Snowflake, Play } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Student, Enrollment } from '../types';
import type { Teacher } from '../../teachers/types';
import { EnrollmentForm } from './EnrollmentForm';
import { StudentHistoryModal } from './StudentHistoryModal';

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

    return (
        <div className={cn(
            "bg-white dark:bg-gray-900 shadow-xl overflow-hidden flex flex-col rounded-none",
            // Mobile: Full screen overlay
            "fixed inset-0 z-[100] lg:static lg:h-[700px] lg:shadow-sm lg:border lg:border-gray-200 lg:dark:border-gray-800"
        )}>
            <div className="p-4 border-b border-gray-100 flex justify-between items-start dark:bg-gray-800/50 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-600 text-white flex items-center justify-center rounded-none text-lg font-black shadow-md">
                        {student.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white leading-none">{student.name}</h3>
                        <span className="inline-block px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-bold rounded-none mt-1 dark:bg-primary-900/20 dark:text-primary-300">
                            {student.grade}
                        </span>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-none">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        الاشتراكات الحالية ({student.enrollments.length})
                    </h4>

                    <div className="space-y-4">
                        {student.enrollments.map((en, i) => {
                            const actualUsed = en.sessionsUsed;
                            const isLow = (en.sessionsTotal - actualUsed) <= 2;

                            return (
                                <div key={i} className={cn(
                                    "p-4 border border-gray-100 rounded-none relative",
                                    en.isFrozen ? "bg-blue-50/40 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800/30" : isLow ? "bg-rose-50/30 border-rose-100" : "bg-white dark:bg-gray-800/50 dark:border-gray-700"
                                )}>
                                    {en.isFrozen && (
                                        <div className="absolute top-2 left-2 flex items-center gap-1 text-[9px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 border border-blue-200">
                                            <Snowflake size={10} />
                                            مجمٍّد
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h5 className="font-black text-gray-900 dark:text-white text-sm">{en.subject}</h5>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mt-1">
                                                <BookOpen size={12} className="text-primary-400" />
                                                <span>{en.teacher}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {/* Freeze / Unfreeze */}
                                            {onFreezeEnrollment && en.id && (
                                                <button
                                                    onClick={() => {
                                                        if (en.isFrozen) {
                                                            onFreezeEnrollment(en.id!, false);
                                                        } else {
                                                            const reason = prompt('سبب التجميد (اختياري):');
                                                            if (reason !== null) onFreezeEnrollment(en.id!, true, reason);
                                                        }
                                                    }}
                                                    className={cn("p-1", en.isFrozen ? "text-emerald-600" : "text-blue-500")}
                                                    title={en.isFrozen ? 'إلغاء التجميد' : 'تجميد الاشتراك'}
                                                >
                                                    {en.isFrozen ? <Play size={14} /> : <Snowflake size={14} />}
                                                </button>
                                            )}
                                            <button onClick={() => onSendReminder(en)} className="p-1 text-emerald-600" title="إرسال تذكير"><MessageCircle size={14} /></button>
                                            <button onClick={() => onRenewEnrollment(i)} className="p-1 text-blue-600" title="تجديد"><RefreshCw size={14} /></button>
                                            <button onClick={() => onDeleteEnrollment(i)} className="p-1 text-red-600" title="حذف"><Trash size={14} /></button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                            <span className="text-gray-400">
                                                حضور: <strong className="text-gray-900 dark:text-gray-200">{actualUsed}</strong> / {en.sessionsTotal}
                                            </span>
                                            <span className={isLow ? "text-rose-600" : "text-primary-600"}>
                                                الباقي: {en.sessionsTotal - actualUsed}
                                            </span>
                                        </div>
                                        <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-none overflow-hidden">
                                            <div
                                                className={cn("h-full", isLow ? "bg-rose-600" : "bg-primary-600")}
                                                style={{ width: `${(actualUsed / en.sessionsTotal) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4">
                                        <button
                                            onClick={() => setAddingSessionsIndex(addingSessionsIndex === i ? null : i)}
                                            className={cn("px-2 py-1.5 border text-[9px] font-black flex-1 text-center bg-gray-50 rounded-none", addingSessionsIndex === i ? "bg-primary-600 text-white border-primary-600" : "border-gray-200 text-gray-600 hover:bg-white")}
                                        >
                                            {addingSessionsIndex === i ? 'إغلاق' : 'إضافة حصص'}
                                        </button>

                                        <button
                                            onClick={() => setShowHistory(true)}
                                            className="px-2 py-1.5 border border-primary-200 text-primary-700 bg-primary-50 text-[9px] font-black hover:bg-primary-100 flex-1 text-center rounded-none"
                                        >
                                            عرض السجل
                                        </button>
                                    </div>

                                    {addingSessionsIndex === i && (
                                        <div className="flex justify-center gap-2 mt-2 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-none">
                                            {[2, 5, 8, 10, 12].map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => { onAddSessions(i, num); setAddingSessionsIndex(null); }}
                                                    className="px-3 py-1 bg-white border border-gray-200 text-[10px] font-black hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 rounded-none"
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

                <div className="pt-4 border-t border-gray-50 dark:border-gray-800">
                    <EnrollmentForm teachers={teachers} onSubmit={onAddEnrollment} />
                </div>
            </div>

            {showHistory && (
                <StudentHistoryModal
                    student={student}
                    onClose={() => setShowHistory(false)}
                />
            )}
        </div>
    );
};

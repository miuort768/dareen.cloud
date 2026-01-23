import { useState } from 'react';
import { X, Trash, RefreshCw, MessageCircle, BookOpen } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Student, Enrollment } from '../types';
import type { Teacher } from '../../teachers/types';
import { EnrollmentForm } from './EnrollmentForm';

interface StudentDetailsProps {
    student: Student;
    onClose: () => void;
    onAddEnrollment: (data: any) => void;
    onDeleteEnrollment: (index: number) => void;
    onRenewEnrollment: (index: number) => void;
    onSendReminder: (enrollment: Enrollment) => void;
    onAddSessions: (index: number, amount: number) => void;
    teachers: Teacher[];
}

import { StudentHistoryModal } from './StudentHistoryModal';

export const StudentDetails = ({
    student,
    onClose,
    onAddEnrollment,
    onDeleteEnrollment,
    onRenewEnrollment,
    onSendReminder,
    onAddSessions,
    teachers
}: StudentDetailsProps) => {
    const [addingSessionsIndex, setAddingSessionsIndex] = useState<number | null>(null);
    const [showHistory, setShowHistory] = useState(false);

    return (
        <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 flex flex-col shadow-2xl overflow-hidden rounded-none animate-in slide-in-from-left-4 h-[700px]">
            <div className="p-6 bg-primary-50/30 border-b border-gray-100 dark:bg-primary-900/10 dark:border-gray-800 relative">
                <button onClick={onClose} className="absolute left-4 top-4 text-gray-400 hover:text-red-500"><X size={20} /></button>
                <div className="text-center pt-2">
                    <h3 className="font-black text-xl text-gray-900 dark:text-white">{student.name}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{student.grade}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-8 h-[1px] bg-primary-200"></div>
                        الاشتراكات الحالية ({student.enrollments.length})
                    </h4>

                    <div className="space-y-4">
                        {student.enrollments.map((en, i) => {
                            // Use pre-calculated sessionsUsed from backend
                            const actualUsed = en.sessionsUsed;

                            const isLow = (en.sessionsTotal - actualUsed) <= 2;

                            return (
                                <div key={i} className={cn(
                                    "p-4 border border-gray-100 group hover:border-primary-500 transition-all rounded-none",
                                    isLow ? "bg-rose-50/30 border-rose-100" : "bg-white dark:bg-gray-800/50 dark:border-gray-700"
                                )}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h5 className="font-black text-gray-900 dark:text-white text-sm">{en.subject}</h5>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mt-1">
                                                <BookOpen size={12} className="text-primary-400" />
                                                <span>{en.teacher}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => onSendReminder(en)} className="text-emerald-600" title="إرسال تذكير"><MessageCircle size={14} /></button>
                                            <button onClick={() => onRenewEnrollment(i)} className="text-blue-600" title="تجديد"><RefreshCw size={14} /></button>
                                            <button onClick={() => onDeleteEnrollment(i)} className="text-red-600" title="حذف"><Trash size={14} /></button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                            <span className="text-gray-400">
                                                تم حضور: <strong className="text-gray-900 dark:text-gray-200">{actualUsed}</strong> من أصل {en.sessionsTotal} حصة
                                            </span>
                                            <span className={isLow ? "text-rose-600 animate-pulse" : "text-primary-600"}>
                                                المتبقي: {en.sessionsTotal - actualUsed}
                                            </span>
                                        </div>
                                        <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-none overflow-hidden">
                                            <div
                                                className={cn("h-full transition-all duration-500", isLow ? "bg-rose-600" : "bg-primary-600")}
                                                style={{ width: `${(actualUsed / en.sessionsTotal) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2">
                                        <button
                                            onClick={() => setAddingSessionsIndex(addingSessionsIndex === i ? null : i)}
                                            className={cn("px-2 py-1.5 border text-[9px] font-black transition-colors flex-1 text-center bg-gray-50", addingSessionsIndex === i ? "bg-primary-600 text-white border-primary-600" : "border-gray-200 text-gray-600 hover:bg-white")}
                                        >
                                            {addingSessionsIndex === i ? 'إغلاق' : 'إضافة حصص'}
                                        </button>

                                        <button
                                            onClick={() => setShowHistory(true)}
                                            className="px-2 py-1.5 border border-primary-200 text-primary-700 bg-primary-50 text-[9px] font-black hover:bg-primary-100 transition-colors flex-1 text-center"
                                        >
                                            عرض السجل بالكامل
                                        </button>

                                        {addingSessionsIndex === i && (
                                            <div className="flex items-center gap-1 animate-in slide-in-from-right-2 absolute left-4 bg-white shadow-lg p-1 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                                                {[2, 5, 8].map(num => (
                                                    <button
                                                        key={num}
                                                        onClick={() => onAddSessions(i, num)}
                                                        className="px-2 py-1 bg-emerald-50 border border-emerald-100 text-[8px] font-black text-emerald-700 hover:bg-emerald-100 transition-colors"
                                                    >
                                                        +{num}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <EnrollmentForm teachers={teachers} onSubmit={onAddEnrollment} />
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

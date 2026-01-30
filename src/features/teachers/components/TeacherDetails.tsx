import { useNavigate } from 'react-router-dom';
import { X, Bell, CheckCircle2, Trash2, MessageCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Teacher, Session } from '../types';
import type { Student, Enrollment } from '../../../types';

interface TeacherDetailsProps {
    teacher: Teacher;
    onClose: () => void;
    students: Student[];
    sessions: Session[];
    onLogAttendance: (student: Student, enrollment: Enrollment) => void;
    onUnenroll: (student: Student, teacherName: string) => void;
    onDeleteSession: (sessionId: string) => void;
    onSendNotification: (teacher: Teacher) => void;
    isTeacherView: boolean;
}

export const TeacherDetails = ({
    teacher,
    onClose,
    students,
    sessions,
    onLogAttendance,
    onUnenroll,
    onDeleteSession,
    onSendNotification,
    isTeacherView
}: TeacherDetailsProps) => {
    const navigate = useNavigate();
    // Filter students enrolled with this teacher
    const enrolledStudents = students.filter(s =>
        s.enrollments?.some((e: Enrollment) => e.teacher === teacher.name)
    );

    // Filter sessions for this teacher
    const teacherSessions = sessions
        .filter(s => s.teacherName === teacher.name)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 20);



    return (
        <div className={cn(
            "bg-white dark:bg-gray-900 shadow-xl overflow-hidden flex flex-col",
            // Mobile: Full screen overlay
            "fixed inset-0 z-[100] lg:h-fit lg:sticky lg:top-6 lg:rounded-2xl lg:animate-in lg:slide-in-from-left-4 lg:shadow-sm lg:border lg:border-gray-200 lg:dark:border-gray-800"
        )}>
            <div className="p-4 border-b border-gray-100 flex justify-between items-start dark:bg-gray-800/50 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-600 text-white flex items-center justify-center rounded-lg text-lg font-black shadow-md">
                        {teacher.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{teacher.name}</h3>
                        <span className="inline-block px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-bold rounded mt-1 dark:bg-primary-900/20 dark:text-primary-300">
                            {teacher.subject}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isTeacherView && (
                        <>
                            <button
                                onClick={() => navigate('/chat', { state: { startChatWith: teacher.id } })}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                                title="مراسلة المعلمة"
                            >
                                <MessageCircle size={18} />
                            </button>
                            <button
                                onClick={() => onSendNotification(teacher)}
                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                                title="إرسال تنبيه"
                            >
                                <Bell size={18} />
                            </button>
                        </>
                    )}
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Statistics Simplified */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                        <p className="text-[10px] font-bold text-gray-500 mb-1">عدد الطلاب</p>
                        <p className="text-xl font-black text-primary-600">{enrolledStudents.length}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                        <p className="text-[10px] font-bold text-gray-500 mb-1">سعر الحصة</p>
                        <p className="text-xl font-black text-emerald-600">{teacher.price} <span className="text-[10px] text-gray-400">ج.م</span></p>
                    </div>
                </div>

                {/* Enrollment Section */}
                <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        الطلاب المسجلون ({enrolledStudents.length})
                    </h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {enrolledStudents.map(student => {
                            const enrollment = student.enrollments.find((e: Enrollment) => e.teacher === teacher.name)!;
                            return (
                                <div key={student.id} className="group bg-white border border-gray-100 p-3 rounded-lg dark:bg-gray-900 dark:border-gray-800 hover:border-primary-200 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{student.name}</p>
                                            <p className="text-[10px] text-gray-500">{enrollment?.subject} - {student.grade}</p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onLogAttendance(student, enrollment)}
                                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => onUnenroll(student, teacher.name)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Sessions - Visible only for teachers */}
                {isTeacherView && (
                    <div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">آخر الجلسات</h4>
                        <div className="space-y-2">
                            {teacherSessions.map(session => (
                                <div key={session.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-gray-800/30 rounded border border-gray-100 dark:border-gray-700">
                                    <div>
                                        <p className="font-bold">{session.studentName}</p>
                                        <p className="text-[10px] text-gray-500">{session.date}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${session.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {session.status === 'completed' ? 'تمت' : 'ملغاة'}
                                        </span>
                                        {!isTeacherView && (
                                            <button onClick={() => onDeleteSession(session.id)} className="text-gray-400 hover:text-red-500">
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

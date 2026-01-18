import { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../../lib/api';
import { Skeleton } from '../../../shared/components/Skeleton';
import { cn } from '../../../lib/utils';
import type { Session } from '../types';

interface AttendanceHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentName: string;
    studentId: string;
    teacherName: string;
    studentGrade?: string;
    studentSubject?: string;
    studentCurriculum?: string;
}

export const AttendanceHistoryModal = ({ isOpen, onClose, studentName, studentId, teacherName, studentGrade, studentSubject, studentCurriculum }: AttendanceHistoryModalProps) => {
    const [history, setHistory] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen, studentId, teacherName]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await api.get<Session[]>('/sessions');
            const sessions = Array.isArray(data) ? data : [];

            // Filter by student and teacher
            const studentHistory = sessions.filter(s =>
                s.studentId === studentId &&
                s.teacherName === teacherName &&
                (s.status === 'completed' || s.status === 'cancelled')
            ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setHistory(studentHistory);
        } catch (error) {
            console.error("Error fetching attendance history:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl shadow-2xl border-t-8 border-primary-600 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock size={24} className="text-primary-600" />
                            سجل حضور الطالب
                        </h3>
                        <div className="mt-2 text-right">
                            <p className="text-lg font-black text-gray-800 dark:text-gray-100">{studentName}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {studentGrade && (
                                    <span className="text-[10px] bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-2 py-0.5 rounded border border-primary-100 dark:border-primary-800 font-bold">
                                        الصف {studentGrade}
                                    </span>
                                )}
                                {studentCurriculum && (
                                    <span className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-800 font-bold">
                                        {studentCurriculum}
                                    </span>
                                )}
                                {studentSubject && (
                                    <span className="text-[10px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-bold">
                                        منهج {studentSubject}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : history.length > 0 ? (
                        <div className="space-y-3">
                            {history.map((session) => (
                                <div
                                    key={session.id}
                                    className={cn(
                                        "p-4 border-r-4 flex items-center justify-between transition-all hover:translate-x-1",
                                        session.status === 'completed'
                                            ? "bg-emerald-50 border-emerald-500 dark:bg-emerald-900/10"
                                            : "bg-rose-50 border-rose-500 dark:bg-rose-900/10"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 flex items-center justify-center",
                                            session.status === 'completed' ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {session.status === 'completed' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                <p className="text-sm font-black text-gray-900 dark:text-white">{session.date}</p>
                                                <p className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 font-bold text-gray-500">{session.day}</p>
                                            </div>
                                            <p className="text-xs font-bold text-gray-500 mt-0.5">{session.subject} - {session.time}</p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase px-2 py-1",
                                            session.status === 'completed'
                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                                                : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                                        )}>
                                            {session.status === 'completed' ? 'حضور' : 'غياب'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-gray-400 flex flex-col items-center gap-4">
                            <AlertCircle size={48} className="opacity-20" />
                            <p className="text-sm font-bold">لا يوجد سجلات حضور أو غياب سابقة لهذا الطالب</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/20">
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-900 text-white font-black py-4 uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

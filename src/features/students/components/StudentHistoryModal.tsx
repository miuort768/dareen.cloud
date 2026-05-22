import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { api } from '../../../lib/api';
import { cn } from '../../../lib/utils';
import { Skeleton } from '../../../components/ui/Skeleton';

interface StudentHistoryModalProps {
    student: {
        id: string;
        name: string;
        grade: string;
    };
    onClose: () => void;
}

interface Session {
    id: string;
    date: string;
    day: string;
    subject: string;
    status: string;
    teacherName: string;
    time: string;
}

export const StudentHistoryModal = ({ student, onClose }: StudentHistoryModalProps) => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch sessions for this student
                // Note: Assuming endpoint supports filter by studentId
                const data = await api.get<Session[]>(`/sessions?studentId=${student.id}`);
                const sessionsData = Array.isArray(data) ? data : [];

                // Only show sessions that the teacher has actually recorded (Status not pending/scheduled)
                const recordedSessions = sessionsData.filter(s => s.status === 'completed' || s.status === 'cancelled' || s.status === 'absent');
                setSessions(recordedSessions);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [student.id]);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 ">
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-sm animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-xl text-gray-900 dark:text-white">سجل الدوام الكامل</h3>
                        <p className="text-xs font-normal text-gray-500 mt-1">للطالب: {student.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50 custom-scrollbar">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-none" />)}
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Calendar size={48} className="mb-4 opacity-50" />
                            <p className="font-normal">لا يوجد سجل حصص لهذا الطالب</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-normal">
                                    <tr>
                                        <th className="p-4">التاريخ</th>
                                        <th className="p-4">اليوم</th>
                                        <th className="p-4">المادة</th>
                                        <th className="p-4">المعلم</th>
                                        <th className="p-4">الوقت</th>
                                        <th className="p-4">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {sessions.map(session => (
                                        <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="p-4 font-mono font-normal">{new Date(session.date).toLocaleDateString('ar-EG')}</td>
                                            <td className="p-4 font-normal">{session.day}</td>
                                            <td className="p-4 font-normal text-gray-900 dark:text-white">{session.subject}</td>
                                            <td className="p-4 text-gray-600 dark:text-gray-400">{session.teacherName}</td>
                                            <td className="p-4 font-mono">{session.time}</td>
                                            <td className="p-4">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-sm text-[10px] font-medium uppercase tracking-widest",
                                                    session.status === 'completed' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                        "bg-rose-50 text-rose-600 border border-rose-100"
                                                )}>
                                                    {session.status === 'completed' ? 'حضور' : 'غياب'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


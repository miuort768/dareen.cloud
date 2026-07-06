import { useState, useEffect } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
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
            <div className="bg-card w-full max-w-4xl max-h-[90vh] flex flex-col shadow-sm animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between" dir="rtl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-info-soft text-info flex items-center justify-center shadow-sm">
                            <Clock size={18} />
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface dark:hover:bg-hover transition-colors">
                        <X size={24} className="text-dim" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-surface custom-scrollbar">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-dim">
                            <Calendar size={48} className="mb-4 opacity-50" />
                            <p className="font-normal">لا يوجد سجل حصص لهذا الطالب</p>
                        </div>
                    ) : (
                        <div className="bg-card border border-border overflow-hidden">
                            <table className="w-full text-sm text-start">
                                <thead className="bg-surface dark:bg-hover text-dim font-normal">
                                    <tr>
                                        <th className="p-4">التاريخ</th>
                                        <th className="p-4">اليوم</th>
                                        <th className="p-4">المادة</th>
                                        <th className="p-4">المعلم</th>
                                        <th className="p-4">الوقت</th>
                                        <th className="p-4">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {sessions.map(session => (
                                        <tr key={session.id} className="hover:bg-surface dark:hover:bg-hover transition-colors">
                                            <td className="p-4 font-mono font-normal">{new Date(session.date).toLocaleDateString('ar-EG')}</td>
                                            <td className="p-4 font-normal">{session.day}</td>
                                            <td className="p-4 font-normal text-main">{session.subject}</td>
                                            <td className="p-4 text-muted">{session.teacherName}</td>
                                            <td className="p-4 font-mono">{session.time}</td>
                                            <td className="p-4">
                                                <span className={cn(
                                                    "px-2 py-1 text-micro font-medium uppercase tracking-widest",
                                                    session.status === 'completed' ? "bg-success-soft text-success border border-success-soft" :
                                                        "bg-error-soft text-error border border-error-soft"
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


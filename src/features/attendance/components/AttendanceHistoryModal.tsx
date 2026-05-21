import { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle2, XCircle, Clock, AlertCircle, Trash2, Edit2, Save, XSquare } from 'lucide-react';
import { api } from '../../../lib/api';
import { Skeleton } from '../../../components/ui/Skeleton';
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
    onSessionChange?: () => void;
}

export const AttendanceHistoryModal = ({ isOpen, onClose, studentName, studentId, teacherName, studentGrade, studentSubject, studentCurriculum, onSessionChange }: AttendanceHistoryModalProps) => {
    const [history, setHistory] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
            setEditingSession(null);
            setDeletingId(null);
        }
    }, [isOpen, studentId, teacherName]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await api.get<Session[]>(`/sessions?studentId=${studentId}&q=${encodeURIComponent(teacherName)}`);
            const sessions = Array.isArray(data) ? data : [];

            // Filter and sort
            const studentHistory = sessions.filter(s =>
                s.studentId === studentId &&
                s.teacherName === teacherName &&
                (studentSubject ? s.subject === studentSubject : true) &&
                (s.status === 'completed' || s.status === 'cancelled')
            ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setHistory(studentHistory);
        } catch (error) {
            console.error("Error fetching attendance history:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.')) return;

        setDeletingId(id);
        try {
            await api.delete(`/sessions/${id}`);
            setHistory(prev => prev.filter(s => s.id !== id));
            onSessionChange?.();
        } catch (error) {
            console.error("Error deleting session:", error);
            alert('حدث خطأ أثناء الحذف');
        } finally {
            setDeletingId(null);
        }
    };

    const handleUpdate = async () => {
        if (!editingSession) return;

        try {
            await api.patch(`/sessions/${editingSession.id}`, {
                date: editingSession.date,
                status: editingSession.status,
                day: new Date(editingSession.date).toLocaleDateString('ar-EG', { weekday: 'long' })
            });

            const updatedSession = {
                ...editingSession,
                day: new Date(editingSession.date).toLocaleDateString('ar-EG', { weekday: 'long' })
            };
            setHistory(prev => prev.map(s => s.id === editingSession.id ? updatedSession : s));
            setEditingSession(null);
            onSessionChange?.();
        } catch (error) {
            console.error("Error updating session:", error);
            alert('حدث خطأ أثناء التحديث');
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
                                        "p-4 border-r-4 flex items-center justify-between transition-all hover:translate-x-1 group",
                                        session.status === 'completed'
                                            ? "bg-emerald-50 border-emerald-500 dark:bg-emerald-900/10"
                                            : "bg-rose-50 border-rose-500 dark:bg-rose-900/10"
                                    )}
                                >
                                    {editingSession?.id === session.id ? (
                                        <div className="flex-1 flex items-center gap-4">
                                            <input
                                                type="date"
                                                value={editingSession.date}
                                                onChange={e => setEditingSession({ ...editingSession, date: e.target.value })}
                                                className="px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800"
                                            />
                                            <select
                                                value={editingSession.status}
                                                onChange={e => setEditingSession({ ...editingSession, status: e.target.value as 'completed' | 'cancelled' })}
                                                className="px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800"
                                            >
                                                <option value="completed">حضور</option>
                                                <option value="cancelled">غياب</option>
                                            </select>
                                            <div className="flex gap-2 mr-auto">
                                                <button
                                                    onClick={handleUpdate}
                                                    className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                    title="حفظ"
                                                >
                                                    <Save size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingSession(null)}
                                                    className="p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                                    title="إلغاء"
                                                >
                                                    <XSquare size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
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
                                                    
                                                    {(session.topics || session.homework) && (
                                                        <div className="mt-3 space-y-2 pb-1">
                                                            {session.topics && (
                                                                <div className="flex gap-2">
                                                                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 h-fit whitespace-nowrap uppercase">المنجز</span>
                                                                    <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 leading-relaxed border-r-2 border-emerald-100 dark:border-emerald-900/50 pr-2">{session.topics}</p>
                                                                </div>
                                                            )}
                                                            {session.homework && (
                                                                <div className="flex gap-2">
                                                                    <span className="text-[9px] font-black text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 h-fit whitespace-nowrap uppercase">الواجب</span>
                                                                    <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 leading-relaxed border-r-2 border-amber-100 dark:border-amber-900/50 pr-2">{session.homework}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase px-2 py-1",
                                                    session.status === 'completed'
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                                                        : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                                                )}>
                                                    {session.status === 'completed' ? 'حضور' : 'غياب'}
                                                </span>

                                                <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setEditingSession(session)}
                                                        className="p-1.5 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                                                        title="تعديل"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(session.id)}
                                                        className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-colors"
                                                        title="حذف"
                                                        disabled={deletingId === session.id}
                                                    >
                                                        {deletingId === session.id ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div> : <Trash2 size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
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

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
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const data = await api.get<Session[]>(`/sessions?studentId=${studentId}&q=${encodeURIComponent(teacherName)}`);
                const sessions = Array.isArray(data) ? data : [];

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

        if (isOpen) {
            fetchHistory();
            setEditingSession(null);
            setDeletingId(null);
        }
    }, [isOpen, studentId, teacherName, studentSubject]);

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
            <div className="bg-white dark:bg-primary-active w-full max-w-2xl rounded-2xl shadow-sm border border-border/50 dark:border-border/50 animate-in zoom-in-95 max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-5 border-b border-border dark:border-border flex justify-between items-center bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary)] text-on-primary">
                    <div>
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <Clock size={18} />
                            سجل حضور الطالب
                        </h3>
                        <div className="mt-2">
                            <p className="text-base font-bold text-on-primary">{studentName}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {studentGrade && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'var(--text-on-primary)' }}>
                                        الصف {studentGrade}
                                    </span>
                                )}
                                {studentCurriculum && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'var(--text-on-primary)' }}>
                                        {studentCurriculum}
                                    </span>
                                )}
                                {studentSubject && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'var(--text-on-primary)' }}>
                                        منهج {studentSubject}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-on-primary/60 hover:text-on-primary hover:bg-white/10 transition-colors rounded-xl">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="space-y-3 px-5">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 rounded-xl" />
                            ))}
                        </div>
                    ) : history.length > 0 ? (
                        <div className="space-y-3 p-5">
                            {history.map((session) => (
                                <div
                                    key={session.id}
                                    className={cn(
                                        "flex items-center justify-between transition-all group bg-white dark:bg-primary-active border rounded-xl shadow-sm",
                                        session.status === 'completed'
                                            ? "border-success/20"
                                            : "border-error/20"
                                    )}
                                    style={{ backgroundColor: session.status === 'completed' ? 'rgba(16,185,129,0.03)' : 'rgba(244,63,94,0.03)', borderRightWidth: '4px', borderRightColor: session.status === 'completed' ? 'var(--bg-success)' : 'var(--bg-error)' }}
                                >
                                    {editingSession?.id === session.id ? (
                                        <div className="flex-1 flex items-center gap-4 p-4">
                                            <input
                                                type="date"
                                                value={editingSession.date}
                                                onChange={e => setEditingSession({ ...editingSession, date: e.target.value })}
                                                className="px-3 py-2 text-[10px] font-bold border border-border dark:border-border rounded-xl bg-white dark:bg-primary-active outline-none focus:border-primary transition-all"
                                            />
                                            <select
                                                value={editingSession.status}
                                                onChange={e => setEditingSession({ ...editingSession, status: e.target.value as 'completed' | 'cancelled' })}
                                                className="px-3 py-2 text-[10px] font-bold border border-border dark:border-border rounded-xl bg-white dark:bg-primary-active outline-none focus:border-primary transition-all"
                                            >
                                                <option value="completed">حضور</option>
                                                <option value="cancelled">غياب</option>
                                            </select>
                                            <div className="flex gap-2 mr-auto">
                                                <button
                                                    onClick={handleUpdate}
                                                    className="p-2 rounded-xl transition-all shadow-sm active:scale-95" style={{ backgroundColor: 'rgba(16,185,129,0.07)', color: 'var(--bg-success)' }}
                                                    title="حفظ"
                                                >
                                                    <Save size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingSession(null)}
                                                    className="p-2 rounded-xl transition-all" style={{ backgroundColor: 'rgba(100,116,139,0.07)', color: 'var(--text-muted)' }}
                                                    title="إلغاء"
                                                >
                                                    <XSquare size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-4 p-4">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: session.status === 'completed' ? 'rgba(16,185,129,0.07)' : 'rgba(244,63,94,0.07)' }}>
                                                    {session.status === 'completed' ? <CheckCircle2 size={20} style={{ color: 'var(--bg-success)' }} /> : <XCircle size={20} style={{ color: 'var(--bg-error)' }} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={14} className="text-muted" />
                                                        <p className="text-sm font-bold text-main dark:text-on-primary">{session.date}</p>
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ backgroundColor: 'rgba(100,116,139,0.07)', color: 'var(--text-muted)' }}>{session.day}</span>
                                                    </div>
                                                    <p className="text-xs font-bold text-muted mt-0.5">{session.subject} - {session.time}</p>
                                                    
                                                    {(session.topics || session.homework) && (
                                                        <div className="mt-3 space-y-2 pb-1">
                                                            {session.topics && (
                                                                <div className="flex gap-2">
                                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 h-fit whitespace-nowrap rounded-lg" style={{ backgroundColor: 'rgba(16,185,129,0.07)', color: 'var(--bg-success)' }}>المنجز</span>
                                                                    <p className="text-[11px] font-bold text-main dark:text-dim leading-relaxed" style={{ borderRight: '2px solid', borderRightColor: 'rgba(16,185,129,0.13)', paddingRight: '8px' }}>{session.topics}</p>
                                                                </div>
                                                            )}
                                                            {session.homework && (
                                                                <div className="flex gap-2">
                                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 h-fit whitespace-nowrap rounded-lg" style={{ backgroundColor: 'rgba(245,158,11,0.07)', color: 'var(--bg-warning)' }}>الواجب</span>
                                                                    <p className="text-[11px] font-bold text-muted dark:text-muted leading-relaxed" style={{ borderRight: '2px solid', borderRightColor: 'rgba(245,158,11,0.13)', paddingRight: '8px' }}>{session.homework}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 ps-0 p-4">
                                                <span className="text-[10px] font-bold px-2 py-1 rounded-xl" style={{ backgroundColor: session.status === 'completed' ? 'rgba(16,185,129,0.07)' : 'rgba(244,63,94,0.07)', color: session.status === 'completed' ? 'var(--bg-success)' : 'var(--bg-error)' }}>
                                                    {session.status === 'completed' ? 'حضور' : 'غياب'}
                                                </span>

                                                <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setEditingSession(session)}
                                                        className="p-2 rounded-xl transition-all shadow-sm active:scale-95" style={{ backgroundColor: 'rgba(108,75,255,0.07)', color: 'var(--bg-primary)' }}
                                                        title="تعديل"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(session.id)}
                                                        className="p-2 rounded-xl transition-all shadow-sm active:scale-95" style={{ backgroundColor: 'rgba(244,63,94,0.07)', color: 'var(--bg-error)' }}
                                                        title="حذف"
                                                        disabled={deletingId === session.id}
                                                    >
                                                        {deletingId === session.id ? <div className="w-4 h-4 border-2 border-error border-t-transparent rounded-full animate-spin"></div> : <Trash2 size={14} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center flex flex-col items-center gap-4 mx-5 mb-5 bg-white dark:bg-primary-active border border-dashed border-border dark:border-border rounded-2xl">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(100,116,139,0.07)' }}>
                                <AlertCircle size={24} className="text-muted" />
                            </div>
                            <p className="text-sm font-bold text-muted">لا يوجد سجلات حضور أو غياب سابقة لهذا الطالب</p>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-border dark:border-border">
                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary)] text-on-primary font-bold py-3 text-sm rounded-xl shadow-sm hover:from-[var(--bg-primary-hover)] hover:to-[var(--bg-primary)] transition-all active:scale-95"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Calendar, CheckCircle2, XCircle, Clock, AlertCircle, Trash2, Edit2, Save, XSquare } from 'lucide-react';
import { api } from '../../../lib/api';
import { Skeleton } from '../../../shared/components/ui';
import { cn } from '../../../lib/utils';
import { useShowNotification } from '../../../context/AppContext';
import { confirm } from '../../../lib/confirmDialog';
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
    canDelete?: boolean;
    onSessionChange?: () => void;
}

export const AttendanceHistoryModal = ({ isOpen, onClose, studentName, studentId, teacherName, studentGrade, studentSubject, studentCurriculum, canDelete = true, onSessionChange }: AttendanceHistoryModalProps) => {
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const showNotification = useShowNotification();
    const containerRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const { data: history = [], isLoading: loading } = useQuery({
        queryKey: ['attendance-history', studentId, teacherName, studentSubject],
        queryFn: async () => {
            const data = await api.get<Session[]>(`/sessions?studentId=${studentId}&q=${encodeURIComponent(teacherName)}`);
            const sessions = Array.isArray(data) ? data : [];
            return sessions
                .filter(
                    s =>
                        s.studentId === studentId &&
                        s.teacherName === teacherName &&
                        (studentSubject ? s.subject === studentSubject : true) &&
                        (s.status === 'completed' || s.status === 'cancelled')
                )
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        },
        enabled: isOpen && !!studentId,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/sessions/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
            onSessionChange?.();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { date: string; status: string; day: string } }) => api.patch(`/sessions/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
            onSessionChange?.();
            setEditingSession(null);
        },
    });

    const handleDelete = async (id: string) => {
        if (!(await confirm({ title: 'حذف السجل', description: 'هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.', confirmText: 'حذف', cancelText: 'إلغاء' }))) return;

        setDeletingId(id);
        try {
            await deleteMutation.mutateAsync(id);
        } catch (error) {
            console.error("Error deleting session:", error);
            showNotification('حدث خطأ أثناء الحذف', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const handleUpdate = async () => {
        if (!editingSession) return;

        try {
            await updateMutation.mutateAsync({
                id: editingSession.id,
                data: {
                    date: editingSession.date,
                    status: editingSession.status,
                    day: new Date(editingSession.date).toLocaleDateString('ar-EG', { weekday: 'long' }),
                },
            });
        } catch (error) {
            console.error("Error updating session:", error);
            showNotification('حدث خطأ أثناء التحديث', 'error');
        }
    };

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div ref={containerRef} className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in" role="dialog" aria-modal="true" aria-label={studentName} onKeyDown={handleKeyDown}>
            <div className="bg-card w-full max-w-2xl rounded-2xl shadow-elevation-2 border border-border animate-in zoom-in-95 max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-5 border-b border-border flex justify-between items-center bg-primary text-on-primary rounded-t-2xl">
                    <div>
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <Clock size={18} />
                            سجل حضور الطالب
                        </h3>
                        <div className="mt-2">
                            <p className="text-base font-bold text-on-primary">{studentName}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {studentGrade && (
                                    <span className="text-micro font-bold px-2 py-0.5 rounded-lg bg-white/15 text-on-primary">
                                        الصف {studentGrade}
                                    </span>
                                )}
                                {studentCurriculum && (
                                    <span className="text-micro font-bold px-2 py-0.5 rounded-lg bg-white/15 text-on-primary">
                                        {studentCurriculum}
                                    </span>
                                )}
                                {studentSubject && (
                                    <span className="text-micro font-bold px-2 py-0.5 rounded-lg bg-white/15 text-on-primary">
                                        منهج {studentSubject}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-on-primary/60 hover:text-on-primary hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus transition-colors rounded-xl" aria-label="إغلاق">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="space-y-3 px-5">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={`skel-${i}`} className="h-16 rounded-xl" />
                            ))}
                        </div>
                    ) : history.length > 0 ? (
                        <div className="space-y-3 p-5">
                            {history.map((session) => (
                                <div
                                    key={session.id}
                                    className={cn(
                                        "flex items-center justify-between transition-all group bg-card border border-e-[4px]",
                                        session.status === 'completed'
                                            ? "border-success/20 bg-success-soft/30 border-e-success"
                                            : "border-error/20 bg-error-soft/30 border-e-error"
                                    )}
                                >
                                    {editingSession?.id === session.id ? (
                                        <div className="flex-1 flex items-center gap-4 p-4">
                                            <input
                                                type="date" aria-label="تاريخ الجلسة"
                                                value={editingSession.date}
                                                onChange={e => setEditingSession({ ...editingSession, date: e.target.value })}
                                                className="px-3 py-2 text-micro font-bold border border-border rounded-xl bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/10 transition-all"
                                            />
                                            <select
                                                value={editingSession.status}
                                                onChange={e => setEditingSession({ ...editingSession, status: e.target.value as 'completed' | 'cancelled' })}
                                                aria-label="حالة الحضور"
                                                className="px-3 py-2 text-micro font-bold border border-border rounded-xl bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/10 transition-all"
                                            >
                                                <option value="completed">حضور</option>
                                                <option value="cancelled">غياب</option>
                                            </select>
                                            <div className="flex gap-2 ms-auto">
                                                    <button
                                                        onClick={handleUpdate}
                                                        className="p-2 rounded-xl transition-all active:scale-95 bg-success-soft text-success focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                                                        aria-label="حفظ"
                                                    >
                                                        <Save size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingSession(null)}
                                                        className="p-2 rounded-xl transition-all bg-surface text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                                                        aria-label="إلغاء"
                                                    >
                                                    <XSquare size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-4 p-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${session.status === 'completed' ? 'bg-success-soft' : 'bg-error-soft'}`}>
                                                    {session.status === 'completed' ? <CheckCircle2 size={20} className="text-success" /> : <XCircle size={20} className="text-error" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={14} className="text-muted" />
                                                        <p className="text-sm font-bold text-main">{session.date}</p>
                                                        <span className="text-micro font-bold px-2 py-0.5 rounded-lg bg-surface text-muted">{session.day}</span>
                                                    </div>
                                                    <p className="text-xs font-bold text-muted mt-0.5">{session.subject} - {session.time}</p>
                                                    
                                                    {(session.topics || session.homework) && (
                                                        <div className="mt-3 space-y-2 pb-1">
                                                            {session.topics && (
                                                                <div className="flex gap-2">
                                                                    <span className="text-micro font-bold px-1.5 py-0.5 h-fit whitespace-nowrap rounded-lg bg-success-soft text-success">المنجز</span>
                                                                    <p className="text-xs font-bold text-main leading-relaxed border-e-[2px] border-e-success-soft pe-2">{session.topics}</p>
                                                                </div>
                                                            )}
                                                            {session.homework && (
                                                                <div className="flex gap-2">
                                                                    <span className="text-micro font-bold px-1.5 py-0.5 h-fit whitespace-nowrap rounded-lg bg-warning-soft text-warning">الواجب</span>
                                                                    <p className="text-xs font-bold text-muted leading-relaxed border-e-[2px] border-e-warning-soft pe-2">{session.homework}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 ps-0 p-4">
                                                <span className={`text-micro font-bold px-2 py-1 rounded-xl ${session.status === 'completed' ? 'bg-success-soft text-success' : 'bg-error-soft text-error'}`}>
                                                    {session.status === 'completed' ? 'حضور' : 'غياب'}
                                                </span>

                                                <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setEditingSession(session)}
                                                        className="p-2 rounded-xl transition-all active:scale-95 bg-primary-soft text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                                                        aria-label="تعديل"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => handleDelete(session.id)}
                                                            className="p-2 rounded-xl transition-all active:scale-95 bg-error-soft text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                                                            aria-label="حذف"
                                                            disabled={deletingId === session.id}
                                                        >
                                                            {deletingId === session.id ? <div className="w-4 h-4 border-2 border-error border-t-transparent rounded-full animate-spin"></div> : <Trash2 size={14} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center flex flex-col items-center gap-4 mx-5 mb-5 bg-card border border-dashed border-border rounded-2xl">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-surface text-muted">
                                <AlertCircle size={24} />
                            </div>
                            <p className="text-sm font-bold text-muted">لا يوجد سجلات حضور أو غياب سابقة لهذا الطالب</p>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-border">
                    <button
                        onClick={onClose}
                        className="w-full bg-primary hover:bg-primary-hover text-on-primary font-bold py-3 text-sm rounded-xl transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

import { useEffect, useRef, useCallback } from 'react';
import { TrendingUp, X, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ProgressBar } from '../../../shared/components/ui';

interface ParentStudent {
    id: string;
    name: string;
    grade?: string;
    enrollments?: { teacherName: string; sessionsTotal?: number; sessionsUsed?: number; subject?: string; teacher?: string }[];
    [key: string]: unknown;
}

interface ChildSession {
    id: string;
    date: string;
    subject: string;
    status: string;
    [key: string]: unknown;
}

interface AttendanceModalProps {
    viewingAttendanceStudent: ParentStudent | null;
    onClose: () => void;
    childSessions: ChildSession[];
    isSessionsLoading: boolean;
}

export const AttendanceModal = ({
    viewingAttendanceStudent,
    onClose,
    childSessions,
    isSessionsLoading,
}: AttendanceModalProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (!viewingAttendanceStudent) return;
        const first = containerRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        first?.focus();
    }, [viewingAttendanceStudent]);

    if (!viewingAttendanceStudent) return null;

    const name = viewingAttendanceStudent.name || '';
    const enrollments = (viewingAttendanceStudent.enrollments || []) as { teacherName: string; sessionsTotal?: number; sessionsUsed?: number; subject?: string; teacher?: string }[];

    return (
        <div ref={containerRef} className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8" role="dialog" aria-modal="true" aria-label="تقرير الحضور" onKeyDown={handleKeyDown}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-card shadow-elevation-2 rounded-2xl overflow-hidden border border-border flex flex-col max-h-[90vh] md:animate-in md:slide-in-from-bottom-8 md:duration-300">
                <div className="p-5 bg-success text-on-success flex items-center justify-between shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 end-0 w-24 h-24 bg-white/10 -me-12 -mt-12 blur-2xl rounded-full" />
                    <div className="absolute bottom-0 start-0 w-16 h-16 bg-white/5 translate-y-8 translate-x-8 blur-lg rounded-full"></div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                            <TrendingUp size={20} className="text-on-success" />
                        </div>
                        <div className="text-start">
                            <h2 className="text-lg font-medium leading-none">{name}</h2>
                            <p className="text-micro text-success font-normal mt-1 uppercase tracking-widest">تقرير نسب الحضور والانصراف لكل المواد</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 w-8 h-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all" aria-label="إغلاق"><X size={18} /></button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
                    {isSessionsLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) =>                                 <div key={`skel-${i}`} className="h-28 bg-surface rounded-xl animate-pulse border border-border" />)}
                        </div>
                    ) : (
                        <>
                            {enrollments.map((en, idx: number) => {
                                const subjectSessions = childSessions.filter(s => s.subject === en.subject);
                                const attended = subjectSessions.filter(s => s.status === 'completed').length;
                                const totalRecorded = subjectSessions.length;
                                const absent = subjectSessions.filter(s => s.status === 'absent' || s.status === 'cancelled').length;
                                const percentage = totalRecorded > 0 ? Math.round((attended / totalRecorded) * 100) : 0;
                                return (
                                    <div key={idx} className="p-5 border border-border bg-surface rounded-xl relative overflow-hidden group hover:border-success/30 hover:shadow-elevation-1 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                            <h4 className="font-medium text-main mb-1 text-sm">{en.subject}</h4>
                                            <p className="text-micro text-muted font-normal uppercase tracking-tight">المعلم: {en.teacher}</p>
                                            </div>
                                            <div className="text-end">
                                                <span className={cn("text-xl font-medium tracking-tighter", percentage >= 75 ? "text-success" : percentage >= 50 ? "text-warning" : "text-error")}>{percentage}%</span>
                                                <p className="text-micro text-muted font-medium uppercase tracking-widest leading-none">نسبة الالتزام</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-success-soft p-3 rounded-xl flex items-center gap-3 border border-success/20">
                                                <CheckCircle2 size={18} className="text-success shrink-0" />
                                                <div>
                                                    <p className="text-micro text-success font-medium uppercase">حضر</p>
                                                    <p className="text-sm font-medium text-success">{attended} حصة</p>
                                                </div>
                                            </div>
                                            <div className="bg-error-soft p-3 rounded-xl flex items-center gap-3 border border-error/20">
                                                <XCircle size={18} className="text-error shrink-0" />
                                                <div>
                                                    <p className="text-micro text-error font-medium uppercase">غاب</p>
                                                    <p className="text-sm font-medium text-error">{absent} حصة</p>
                                                </div>
                                            </div>
                                        </div>
                                        <ProgressBar value={percentage} variant={percentage >= 75 ? 'success' : percentage >= 50 ? 'warning' : 'error'} />
                                        <p className="text-micro text-muted font-normal mt-2 text-start">إجمالي الجلسات المسجلة من المعلم: {totalRecorded}</p>
                                    </div>
                                );
                            })}
                            {enrollments.length === 0 && (
                                        <div className="py-20 text-center">
                                            <AlertCircle size={32} className="mx-auto text-muted mb-4" />
                                    <p className="text-micro text-muted font-medium uppercase tracking-widest">لا توجد اشتراكات مسجلة لهذا الابن بعد</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="p-5 border-t border-border bg-surface flex justify-end shrink-0">
                    <button onClick={onClose} className="px-6 py-2 bg-success hover:bg-success-hover text-on-success text-micro font-medium rounded-xl transition-all active:scale-[0.98]">إغلاق</button>
                </div>
            </div>
        </div>
    );
};

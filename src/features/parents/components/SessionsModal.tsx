import { BookOpen, ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SessionsModalProps {
    viewingStudent: Record<string, unknown> | null;
    onClose: () => void;
    viewingSubject: Record<string, unknown> | null;
    onSelectSubject: (subject: Record<string, unknown> | null) => void;
    sessionsPage: number;
    onPageChange: (page: number) => void;
    childSessions: Record<string, unknown>[];
    isSessionsLoading: boolean;
    sessionsStartDate: string;
    onStartDateChange: (date: string) => void;
    sessionsEndDate: string;
    onEndDateChange: (date: string) => void;
}

export const SessionsModal = ({
    viewingStudent,
    onClose,
    viewingSubject,
    onSelectSubject,
    sessionsPage,
    onPageChange,
    childSessions,
    isSessionsLoading,
    sessionsStartDate,
    onStartDateChange,
    sessionsEndDate,
    onEndDateChange,
}: SessionsModalProps) => {
    if (!viewingStudent) return null;

    const enrollments = (viewingStudent.enrollments || []) as { teacherName: string; date?: string; sessionsTotal?: number; sessionsUsed?: number; subject?: string; teacher?: string }[];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white dark:bg-primary-active shadow-xl rounded-2xl overflow-hidden border border-border dark:border-border flex flex-col max-h-[80vh] md:animate-in md:slide-in-from-bottom-8 md:duration-300">
                <div className="p-4 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary)] text-on-primary flex items-center justify-between shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 -ms-12 -mt-12 blur-2xl rounded-full" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 translate-y-8 -translate-x-8 blur-lg rounded-full"></div>
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10 shadow-sm">
                            <Calendar size={20} className="text-on-primary" />
                        </div>
                        <div className="text-right">
                            <h2 className="text-base font-medium leading-tight tracking-tight">{(viewingStudent as { name: string }).name}</h2>
                            <p className="text-micro text-primary font-normal mt-0.5 uppercase tracking-widest opacity-80">
                                {viewingSubject ? `مواعيد حصص: ${(viewingSubject as { subject: string }).subject}` : 'سجل مواعيد الحصص'}
                            </p>
                        </div>
                    </div>
                    <div className="relative z-10 flex items-center gap-2 ms-4">
                        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-xl border border-white/10">
                            <input type="date" className="bg-transparent border-none p-0 text-micro font-normal text-on-primary outline-none cursor-pointer [color-scheme:dark]" value={sessionsStartDate} onChange={(e) => onStartDateChange(e.target.value)} />
                            <span className="text-micro text-white/60">→</span>
                            <input type="date" className="bg-transparent border-none p-0 text-micro font-normal text-on-primary outline-none cursor-pointer [color-scheme:dark]" value={sessionsEndDate} onChange={(e) => onEndDateChange(e.target.value)} />
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 w-7 h-7 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all"><X size={14} /></button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                    {!viewingSubject ? (
                        <div className="grid grid-cols-1 gap-3">
                            {enrollments.map((en, idx: number) => (
                                <button key={idx} onClick={() => onSelectSubject(en)} className="p-4 bg-background dark:bg-primary-active/50 border border-border dark:border-border rounded-xl hover:border-primary/30 hover:shadow-sm hover:bg-white dark:hover:bg-primary-active transition-all text-right group flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-primary-soft dark:bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all"><BookOpen size={16} /></div>
                                        <div>
                                            <h4 className="font-medium text-main dark:text-on-primary text-xs mb-0.5">{en.subject}</h4>
                                            <p className="text-micro text-muted dark:text-muted font-normal uppercase tracking-tight">المعلمة: {en.teacher}</p>
                                        </div>
                                    </div>
                                    <ChevronLeft size={16} className="text-dim dark:text-muted group-hover:text-primary transform group-hover:-translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-2">
                                <button onClick={() => { onSelectSubject(null); onPageChange(1); }} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-primary-active border border-border dark:border-border rounded-xl text-micro font-medium text-primary uppercase tracking-widest hover:bg-primary-soft dark:hover:bg-primary-soft0/10 transition-all shadow-sm">
                                    <ChevronRight size={12} /> العودة للمواد
                                </button>
                                {(() => {
                                    const subj = viewingSubject as { subject: string };
                                    const filtered = childSessions.filter(s =>
                                        s.subject === subj.subject &&
                                        (s.status === 'completed' || s.status === 'absent' || s.status === 'cancelled') &&
                                        s.date >= sessionsStartDate && s.date <= sessionsEndDate
                                    );
                                    const totalPages = Math.ceil(filtered.length / 7);
                                    if (totalPages <= 1) return null;
                                    return (
                                        <div className="flex items-center gap-2">
                                            <button disabled={sessionsPage === 1} onClick={() => onPageChange(Math.max(1, sessionsPage - 1))} className="w-6 h-6 flex items-center justify-center rounded-lg border border-border dark:border-border disabled:opacity-30 text-muted hover:bg-surface dark:hover:bg-primary-active transition-all"><ChevronRight size={14} /></button>
                                            <span className="text-micro font-medium text-muted uppercase tracking-widest">{sessionsPage} / {totalPages}</span>
                                            <button disabled={sessionsPage === totalPages} onClick={() => onPageChange(Math.min(totalPages, sessionsPage + 1))} className="w-6 h-6 flex items-center justify-center rounded-lg border border-border dark:border-border disabled:opacity-30 text-muted hover:bg-surface dark:hover:bg-primary-active transition-all"><ChevronLeft size={14} /></button>
                                        </div>
                                    );
                                })()}
                            </div>

                            {isSessionsLoading ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-background dark:bg-primary-active/50 border border-border dark:border-border rounded-xl animate-pulse" />)}
                                </div>
                            ) : (
                                <div className="relative border-e-2 border-primary/10 pr-5 ms-2 space-y-4">
                                    {(() => {
                                        const subj = viewingSubject as { subject: string };
                                        const filtered = childSessions
                                            .filter(s =>
                                                s.subject === subj.subject &&
                                                (s.status === 'completed' || s.status === 'absent' || s.status === 'cancelled') &&
                                                s.date >= sessionsStartDate && s.date <= sessionsEndDate
                                            )
                                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                                        return filtered
                                            .slice((sessionsPage - 1) * 7, sessionsPage * 7)
                                            .map((session, sIdx) => (
                                                <div key={sIdx} className="relative">
                                                    <div className={cn("absolute -right-[27px] top-1 w-3 h-3 rounded-full bg-white dark:bg-primary-active border-[3px]", session.status === 'completed' ? "border-success shadow-sm" : "border-error shadow-sm")}></div>
                                                    <div className="bg-white dark:bg-primary-active p-3 rounded-xl border border-border dark:border-border group hover:border-primary/30 hover:shadow-sm transition-all shadow-sm">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs font-medium text-main dark:text-on-primary">{format(new Date(session.date), 'eeee, d MMMM', { locale: ar })}</p>
                                                            </div>
                                                            <div className={cn("px-2 py-0.5 rounded-full text-micro font-medium uppercase tracking-widest", session.status === 'completed' ? "bg-success text-on-primary" : "bg-error text-on-primary")}>
                                                                {session.status === 'completed' ? 'حضر' : 'غائب'}
                                                            </div>
                                                        </div>
                                                        {session.notes && (
                                                            <div className="mt-2 pt-2 border-t border-border dark:border-border">
                                                                <div className="flex gap-1.5">
                                                                    <div className="w-0.5 bg-primary rounded-full shrink-0" />
                                                                    <p className="text-micro text-muted dark:text-muted font-normal italic leading-relaxed">{session.notes}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ));
                                    })()}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 md:animate-in md:fade-in md:duration-300">
            <div className="absolute inset-0 bg-slate-950/40 " onClick={onClose} />
            <div className="relative w-full max-w-lg bg-[#f8faff] dark:bg-slate-950 shadow-sm rounded-none overflow-hidden border border-white dark:border-slate-800 flex flex-col max-h-[80vh] md:animate-in md:slide-in-from-bottom-8">
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20  rounded-none flex items-center justify-center border border-white/10 shadow-sm">
                            <Calendar size={20} className="text-white" />
                        </div>
                        <div className="text-right">
                            <h2 className="text-base font-medium leading-tight tracking-tight">{(viewingStudent as { name: string }).name}</h2>
                            <p className="text-[9px] text-indigo-100 font-normal mt-0.5 uppercase tracking-widest opacity-80">
                                {viewingSubject ? `مواعيد حصص: ${(viewingSubject as { subject: string }).subject}` : 'سجل مواعيد الحصص'}
                            </p>
                        </div>
                    </div>
                    <div className="relative z-10 flex items-center gap-2 mr-4">
                        <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg border border-white/10">
                            <input type="date" className="bg-transparent border-none p-0 text-[10px] font-normal text-white outline-none cursor-pointer [color-scheme:dark]" value={sessionsStartDate} onChange={(e) => onStartDateChange(e.target.value)} />
                            <span className="text-[10px] text-white/60">→</span>
                            <input type="date" className="bg-transparent border-none p-0 text-[10px] font-normal text-white outline-none cursor-pointer [color-scheme:dark]" value={sessionsEndDate} onChange={(e) => onEndDateChange(e.target.value)} />
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"><X size={14} /></button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                    {!viewingSubject ? (
                        <div className="grid grid-cols-1 gap-3">
                            {enrollments.map((en, idx: number) => (
                                <button key={idx} onClick={() => onSelectSubject(en)} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-sm transition-all text-right group flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 rounded-none flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all"><BookOpen size={16} /></div>
                                        <div>
                                            <h4 className="font-medium text-slate-900 dark:text-white text-xs mb-0.5">{en.subject}</h4>
                                            <p className="text-[8px] text-slate-400 font-normal uppercase tracking-tight">المعلمة: {en.teacher}</p>
                                        </div>
                                    </div>
                                    <ChevronLeft size={16} className="text-slate-300 group-hover:text-indigo-600 transform group-hover:-translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-2">
                                <button onClick={() => { onSelectSubject(null); onPageChange(1); }} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full text-[8px] font-medium text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all shadow-sm">
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
                                            <button disabled={sessionsPage === 1} onClick={() => onPageChange(Math.max(1, sessionsPage - 1))} className="w-6 h-6 flex items-center justify-center rounded-lg border border-slate-100 dark:border-slate-800 disabled:opacity-30 text-slate-400"><ChevronRight size={14} /></button>
                                            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{sessionsPage} / {totalPages}</span>
                                            <button disabled={sessionsPage === totalPages} onClick={() => onPageChange(Math.min(totalPages, sessionsPage + 1))} className="w-6 h-6 flex items-center justify-center rounded-lg border border-slate-100 dark:border-slate-800 disabled:opacity-30 text-slate-400"><ChevronLeft size={14} /></button>
                                        </div>
                                    );
                                })()}
                            </div>

                            {isSessionsLoading ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 rounded-none animate-pulse" />)}
                                </div>
                            ) : (
                                <div className="relative border-r-2 border-indigo-500/10 pr-5 mr-2 space-y-4">
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
                                                    <div className={cn("absolute -right-[27px] top-1 w-3 h-3 rounded-full bg-white dark:bg-slate-950 border-[3px]", session.status === 'completed' ? "border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]" : "border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.2)]")}></div>
                                                    <div className="bg-white dark:bg-slate-900 p-3 rounded-none border border-slate-100 dark:border-slate-800 group hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-sm">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs font-medium text-slate-900 dark:text-white">{format(new Date(session.date), 'eeee, d MMMM', { locale: ar })}</p>
                                                            </div>
                                                            <div className={cn("px-2 py-0.5 rounded-full text-[8px] font-medium uppercase tracking-widest", session.status === 'completed' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white")}>
                                                                {session.status === 'completed' ? 'حضر' : 'غائب'}
                                                            </div>
                                                        </div>
                                                        {session.notes && (
                                                            <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                                                                <div className="flex gap-1.5">
                                                                    <div className="w-0.5 bg-indigo-500 rounded-full shrink-0" />
                                                                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-normal italic leading-relaxed">{session.notes}</p>
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

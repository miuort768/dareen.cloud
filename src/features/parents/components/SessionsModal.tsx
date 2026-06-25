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
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 flex flex-col max-h-[80vh] md:animate-in md:slide-in-from-bottom-8 md:duration-300">
                <div className="p-4 bg-gradient-to-br from-[#6C4BFF] to-[#8B5CF6] text-white flex items-center justify-between shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 -mr-12 -mt-12 blur-2xl rounded-full" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 translate-y-8 -translate-x-8 blur-lg rounded-full"></div>
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10 shadow-sm">
                            <Calendar size={20} className="text-white" />
                        </div>
                        <div className="text-right">
                            <h2 className="text-base font-medium leading-tight tracking-tight">{(viewingStudent as { name: string }).name}</h2>
                            <p className="text-[9px] text-purple-200 font-normal mt-0.5 uppercase tracking-widest opacity-80">
                                {viewingSubject ? `مواعيد حصص: ${(viewingSubject as { subject: string }).subject}` : 'سجل مواعيد الحصص'}
                            </p>
                        </div>
                    </div>
                    <div className="relative z-10 flex items-center gap-2 mr-4">
                        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-xl border border-white/10">
                            <input type="date" className="bg-transparent border-none p-0 text-[10px] font-normal text-white outline-none cursor-pointer [color-scheme:dark]" value={sessionsStartDate} onChange={(e) => onStartDateChange(e.target.value)} />
                            <span className="text-[10px] text-white/60">→</span>
                            <input type="date" className="bg-transparent border-none p-0 text-[10px] font-normal text-white outline-none cursor-pointer [color-scheme:dark]" value={sessionsEndDate} onChange={(e) => onEndDateChange(e.target.value)} />
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 w-7 h-7 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all"><X size={14} /></button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                    {!viewingSubject ? (
                        <div className="grid grid-cols-1 gap-3">
                            {enrollments.map((en, idx: number) => (
                                <button key={idx} onClick={() => onSelectSubject(en)} className="p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-xl hover:border-[#6C4BFF]/30 hover:shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-all text-right group flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-purple-50 dark:bg-purple-500/10 text-[#6C4BFF] rounded-xl flex items-center justify-center group-hover:bg-[#6C4BFF] group-hover:text-white transition-all"><BookOpen size={16} /></div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white text-xs mb-0.5">{en.subject}</h4>
                                            <p className="text-[8px] text-gray-500 dark:text-slate-400 font-normal uppercase tracking-tight">المعلمة: {en.teacher}</p>
                                        </div>
                                    </div>
                                    <ChevronLeft size={16} className="text-gray-300 dark:text-slate-600 group-hover:text-[#6C4BFF] transform group-hover:-translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-2">
                                <button onClick={() => { onSelectSubject(null); onPageChange(1); }} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-[8px] font-medium text-[#6C4BFF] uppercase tracking-widest hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all shadow-sm">
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
                                            <button disabled={sessionsPage === 1} onClick={() => onPageChange(Math.max(1, sessionsPage - 1))} className="w-6 h-6 flex items-center justify-center rounded-lg border border-gray-100 dark:border-slate-700 disabled:opacity-30 text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"><ChevronRight size={14} /></button>
                                            <span className="text-[9px] font-medium text-gray-400 uppercase tracking-widest">{sessionsPage} / {totalPages}</span>
                                            <button disabled={sessionsPage === totalPages} onClick={() => onPageChange(Math.min(totalPages, sessionsPage + 1))} className="w-6 h-6 flex items-center justify-center rounded-lg border border-gray-100 dark:border-slate-700 disabled:opacity-30 text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"><ChevronLeft size={14} /></button>
                                        </div>
                                    );
                                })()}
                            </div>

                            {isSessionsLoading ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-xl animate-pulse" />)}
                                </div>
                            ) : (
                                <div className="relative border-r-2 border-[#6C4BFF]/10 pr-5 mr-2 space-y-4">
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
                                                    <div className={cn("absolute -right-[27px] top-1 w-3 h-3 rounded-full bg-white dark:bg-slate-900 border-[3px]", session.status === 'completed' ? "border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]" : "border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.2)]")}></div>
                                                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-100 dark:border-slate-800 group hover:border-[#6C4BFF]/30 hover:shadow-sm transition-all shadow-sm">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs font-medium text-gray-900 dark:text-white">{format(new Date(session.date), 'eeee, d MMMM', { locale: ar })}</p>
                                                            </div>
                                                            <div className={cn("px-2 py-0.5 rounded-full text-[8px] font-medium uppercase tracking-widest", session.status === 'completed' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white")}>
                                                                {session.status === 'completed' ? 'حضر' : 'غائب'}
                                                            </div>
                                                        </div>
                                                        {session.notes && (
                                                            <div className="mt-2 pt-2 border-t border-gray-50 dark:border-slate-800">
                                                                <div className="flex gap-1.5">
                                                                    <div className="w-0.5 bg-[#6C4BFF] rounded-full shrink-0" />
                                                                    <p className="text-[9px] text-gray-500 dark:text-slate-400 font-normal italic leading-relaxed">{session.notes}</p>
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

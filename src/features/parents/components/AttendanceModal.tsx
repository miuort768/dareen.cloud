import { TrendingUp, X, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface AttendanceModalProps {
    viewingAttendanceStudent: Record<string, unknown> | null;
    onClose: () => void;
    childSessions: Record<string, unknown>[];
    isSessionsLoading: boolean;
}

export const AttendanceModal = ({
    viewingAttendanceStudent,
    onClose,
    childSessions,
    isSessionsLoading,
}: AttendanceModalProps) => {
    if (!viewingAttendanceStudent) return null;

    const name = (viewingAttendanceStudent as { name: string }).name || '';
    const enrollments = (viewingAttendanceStudent.enrollments || []) as { teacherName: string; sessionsTotal?: number; sessionsUsed?: number; subject?: string; teacher?: string }[];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 flex flex-col max-h-[90vh] md:animate-in md:slide-in-from-bottom-8 md:duration-300">
                <div className="p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 -ml-12 -mt-12 blur-2xl rounded-full" />
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/5 translate-y-8 translate-x-8 blur-lg rounded-full"></div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10 shadow-sm">
                            <TrendingUp size={20} className="text-white" />
                        </div>
                        <div className="text-right">
                            <h2 className="text-lg font-medium leading-none">{name}</h2>
                            <p className="text-[10px] text-emerald-100 font-normal mt-1 uppercase tracking-widest">تقرير نسب الحضور والانصراف لكل المواد</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 w-8 h-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all"><X size={18} /></button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
                    {isSessionsLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-50 dark:bg-slate-800/50 rounded-xl animate-pulse border border-gray-100 dark:border-slate-800" />)}
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
                                    <div key={idx} className="p-5 border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30 rounded-xl relative overflow-hidden group hover:border-emerald-500/30 hover:shadow-sm transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">{en.subject}</h4>
                                                <p className="text-[10px] text-gray-500 dark:text-slate-400 font-normal uppercase tracking-tight">المعلم: {en.teacher}</p>
                                            </div>
                                            <div className="text-left">
                                                <span className={cn("text-xl font-medium tracking-tighter", percentage >= 75 ? "text-emerald-600 dark:text-emerald-400" : percentage >= 50 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400")}>{percentage}%</span>
                                                <p className="text-[9px] text-gray-400 font-medium uppercase tracking-widest leading-none">نسبة الالتزام</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl flex items-center gap-3 border border-emerald-100 dark:border-emerald-900/20">
                                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                                <div>
                                                    <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium uppercase">حضر</p>
                                                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{attended} حصة</p>
                                                </div>
                                            </div>
                                            <div className="bg-rose-50 dark:bg-rose-500/10 p-3 rounded-xl flex items-center gap-3 border border-rose-100 dark:border-rose-900/20">
                                                <XCircle size={18} className="text-rose-500 shrink-0" />
                                                <div>
                                                    <p className="text-[9px] text-rose-600 dark:text-rose-400 font-medium uppercase">غاب</p>
                                                    <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{absent} حصة</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div className={cn("h-full transition-all duration-1000 ease-out rounded-full", percentage >= 75 ? "bg-emerald-500" : percentage >= 50 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                        <p className="text-[9px] text-gray-400 dark:text-slate-500 font-normal mt-2 text-right">إجمالي الجلسات المسجلة من المعلم: {totalRecorded}</p>
                                    </div>
                                );
                            })}
                            {enrollments.length === 0 && (
                                <div className="py-20 text-center">
                                    <AlertCircle size={32} className="mx-auto text-gray-200 dark:text-slate-700 mb-4" />
                                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium uppercase tracking-widest">لا توجد اشتراكات مسجلة لهذا الابن بعد</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="p-5 border-t border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900 flex justify-end shrink-0">
                    <button onClick={onClose} className="px-6 py-2 bg-gradient-to-l from-emerald-500 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/25 text-white text-[10px] font-medium uppercase tracking-widest rounded-xl transition-all active:scale-[0.98]">إغلاق</button>
                </div>
            </div>
        </div>
    );
};

import { TrendingUp, X, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 md:animate-in md:fade-in md:duration-300">
            <div className="absolute inset-0 bg-gray-950/60 " onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
                <div className="p-6 bg-emerald-600 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/10"><TrendingUp size={20} className="text-white" /></div>
                        <div className="text-right">
                            <h2 className="text-lg font-medium leading-none">{name}</h2>
                            <p className="text-[10px] text-white/80 font-normal mt-1 uppercase tracking-widest">تقرير نسب الحضور والانصراف لكل المواد</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 transition-colors"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                    {isSessionsLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
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
                                    <div key={idx} className="p-5 border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 relative overflow-hidden group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">{en.subject}</h4>
                                                <p className="text-[10px] text-gray-400 font-normal uppercase tracking-tight">المعلم: {en.teacher}</p>
                                            </div>
                                            <div className="text-left">
                                                <span className="text-xl font-medium text-emerald-600 tracking-tighter">{percentage}%</span>
                                                <p className="text-[9px] text-gray-400 font-medium uppercase tracking-widest leading-none">نسبة الالتزام</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-2 flex items-center gap-3">
                                                <CheckCircle2 size={16} className="text-emerald-500" />
                                                <div>
                                                    <p className="text-[9px] text-emerald-600 font-medium uppercase">حضر</p>
                                                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{attended} حصة</p>
                                                </div>
                                            </div>
                                            <div className="bg-rose-50 dark:bg-rose-900/10 p-2 flex items-center gap-3">
                                                <XCircle size={16} className="text-rose-500" />
                                                <div>
                                                    <p className="text-[9px] text-rose-600 font-medium uppercase">غاب</p>
                                                    <p className="text-sm font-medium text-rose-700 dark:text-rose-400">{absent} حصة</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                            <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                        <p className="text-[9px] text-gray-400 font-normal mt-2 text-right">إجمالي الجلسات المسجلة من المعلم: {totalRecorded}</p>
                                    </div>
                                );
                            })}
                            {enrollments.length === 0 && (
                                <div className="py-20 text-center">
                                    <AlertCircle size={32} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">لا توجد اشتراكات مسجلة لهذا الابن بعد</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="p-6 border-t border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex justify-end shrink-0">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-medium uppercase tracking-widest transition-all">إغلاق</button>
                </div>
            </div>
        </div>
    );
};

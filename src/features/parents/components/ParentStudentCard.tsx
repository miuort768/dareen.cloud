import { User, BookOpen, TrendingUp, CheckCircle2, Star, Trophy, Calendar } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { GamificationCard } from '../../students/components/GamificationCard';

interface ParentStudentCardProps {
    student: Record<string, unknown>;
    viewingAchievements: Record<string, unknown> | null;
    onViewDates: (student: Record<string, unknown>) => void;
    onViewAttendance: (student: Record<string, unknown>) => void;
    onViewAchievements: (student: Record<string, unknown>) => void;
    onCloseAchievements: () => void;
    pointLogs: Record<string, unknown>[];
}

export const ParentStudentCard = ({
    student,
    viewingAchievements,
    onViewDates,
    onViewAttendance,
    onViewAchievements,
    onCloseAchievements,
    pointLogs,
}: ParentStudentCardProps) => {
    const enrollments = (student.enrollments || []) as { teacherName: string; sessionsTotal?: number; sessionsUsed?: number; subject?: string; teacher?: string }[];
    const totalPoints = Number(student.totalPoints) || 0;
    const hasAchievements = viewingAchievements?.id === student.id;

    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden group hover:border-[#6C4BFF]/30 hover:shadow-md transition-all duration-300 flex flex-col">
            <div className="bg-gradient-to-br from-[#6C4BFF] to-[#8B5CF6] p-4 md:p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 -translate-y-12 translate-x-12 rotate-45 group-hover:scale-110 transition-transform rounded-full blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 translate-y-8 -translate-x-8 rounded-full blur-lg"></div>
                <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/20 rounded-xl shrink-0 shadow-lg shadow-black/10">
                            <User size={20} className="md:size-[28px]" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base md:text-lg font-medium text-white leading-tight truncate">{(student as { name: string }).name}</h3>
                            <p className="text-purple-200 text-[9px] md:text-[10px] font-medium uppercase tracking-widest mt-0.5">{student.grade || 'غير محدد'}</p>
                        </div>
                    </div>
                    {totalPoints > 0 && (
                        <div className="flex flex-col items-center gap-0.5 bg-yellow-400 text-black px-1.5 py-1 shadow-md transform rotate-2 shrink-0 rounded-lg">
                            <Star size={12} className="fill-current md:size-[16px]" />
                            <span className="text-[9px] font-medium">{totalPoints}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 border-b border-gray-100 dark:border-slate-800">
                <div className="p-3 md:p-4 flex flex-col items-center justify-center border-l border-gray-100 dark:border-slate-800">
                    <div className="w-8 h-8 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center mb-1">
                        <BookOpen size={14} className="text-[#6C4BFF] md:size-[16px]" />
                    </div>
                    <span className="text-[8px] md:text-[10px] font-medium text-gray-400 uppercase">المواد</span>
                    <span className="text-base md:text-lg font-medium text-gray-900 dark:text-white">{enrollments.length}</span>
                </div>
                <div className="p-3 md:p-4 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center mb-1">
                        <TrendingUp size={14} className="text-emerald-500 md:size-[16px]" />
                    </div>
                    <span className="text-[8px] md:text-[10px] font-medium text-gray-400 uppercase">الالتزام</span>
                    <span className="text-base md:text-lg font-medium text-emerald-600 dark:text-emerald-400">
                        {(() => {
                            if (enrollments.length === 0) return '0%';
                            const total = enrollments.reduce((sum: number, en) => sum + Number(en.sessionsTotal || 0), 0);
                            const used = enrollments.reduce((sum: number, en) => sum + Number(en.sessionsUsed || 0), 0);
                            return total > 0 ? `${Math.round((used / total) * 100)}%` : '0%';
                        })()}
                    </span>
                </div>
            </div>

            <div className="p-4 md:p-5 space-y-3 flex-1">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                    تفاصيل المواد الدراسية
                    <CheckCircle2 size={12} className="text-gray-300" />
                </p>
                <div className="space-y-3">
                    {enrollments.map((en, idx: number) => (
                        <div key={idx} className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl relative overflow-hidden group/item border border-transparent hover:border-[#6C4BFF]/20 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{en.subject}</h4>
                                    <p className="text-[9px] text-gray-500 dark:text-slate-400 font-normal italic">المعلم: {en.teacher}</p>
                                </div>
                                <div className="text-left">
                                    <span className="text-[10px] font-medium text-[#6C4BFF] dark:text-purple-400">حضر {en.sessionsUsed} من {en.sessionsTotal}</span>
                                </div>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-1000 rounded-full",
                                        (en.sessionsTotal > 0 ? (en.sessionsUsed / en.sessionsTotal) * 100 : 0) > 80 ? "bg-emerald-500" : (en.sessionsTotal > 0 ? (en.sessionsUsed / en.sessionsTotal) * 100 : 0) > 50 ? "bg-amber-500" : "bg-[#6C4BFF]"
                                    )}
                                    style={{ width: `${Math.min(100, en.sessionsTotal > 0 ? (en.sessionsUsed / en.sessionsTotal) * 100 : 0)}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                    {enrollments.length === 0 && (
                        <div className="py-6 text-center">
                            <p className="text-[10px] text-gray-400 font-normal italic">لا توجد مواد مسجلة حالياً لهذا الابن</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 md:p-5 pt-0 mt-auto space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => onViewDates(student)} className="py-2.5 bg-gradient-to-l from-[#6C4BFF] to-[#8B5CF6] text-white text-[9px] md:text-[10px] font-medium uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-1.5 md:gap-2 shadow-sm active:scale-[0.98]">
                        <Calendar size={13} className="md:size-[14px]" />
                        حصص الطالب
                    </button>
                    <button onClick={() => onViewAttendance(student)} className="py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-[9px] md:text-[10px] font-medium uppercase tracking-wider rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-[#6C4BFF]/30 transition-all flex items-center justify-center gap-1.5 md:gap-2 shadow-sm active:scale-[0.98]">
                        <TrendingUp size={13} className="md:size-[14px]" />
                        نسبة الحضور
                    </button>
                </div>
                <button onClick={() => onViewAchievements(student)} className={cn("w-full py-2.5 text-[9px] md:text-[10px] font-medium uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]", hasAchievements ? "bg-gray-100 dark:bg-slate-800 text-[#6C4BFF] border border-[#6C4BFF]/30" : "bg-gradient-to-l from-[#6C4BFF] to-[#8B5CF6] text-white hover:shadow-lg hover:shadow-purple-500/25")}>
                    <Trophy size={14} />
                    {hasAchievements ? 'إغلاق سجل الإنجازات' : 'عرض حصاد الإنجازات والأوسمة'}
                </button>
            </div>

            <AnimatePresence>
                {hasAchievements && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-gray-50/50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800">
                        <div className="p-4 md:p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Trophy size={16} className="text-amber-500" />
                                <h4 className="text-[10px] font-medium text-gray-900 dark:text-white uppercase tracking-widest">حصاد إنجازات الطالب</h4>
                            </div>
                            <GamificationCard totalPoints={totalPoints} badges={student.badges} pointLogs={pointLogs} />
                            <button onClick={onCloseAchievements} className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white text-[8px] font-medium uppercase tracking-widest rounded-xl shadow-sm shadow-rose-500/20 transition-all mt-2 active:scale-95">إغلاق السجل</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

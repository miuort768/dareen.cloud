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
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden group hover:border-primary-500 transition-all duration-300 flex flex-col">
            <div className="bg-gray-900 p-4 md:p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-600/10 -translate-y-12 translate-x-12 rotate-45 group-hover:scale-110 transition-transform"></div>
                <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-white/10 flex items-center justify-center text-white border border-white/20 shrink-0">
                            <User size={20} className="md:size-[28px]" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base md:text-lg font-black text-white leading-tight truncate">{(student as { name: string }).name}</h3>
                            <p className="text-primary-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-0.5">{student.grade || 'غير محدد'}</p>
                        </div>
                    </div>
                    {totalPoints > 0 && (
                        <div className="flex flex-col items-center gap-0.5 bg-yellow-400 text-black px-1.5 py-1 shadow-lg transform rotate-2 shrink-0">
                            <Star size={12} className="fill-current md:size-[16px]" />
                            <span className="text-[9px] font-black">{totalPoints}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 border-b border-gray-50 dark:border-gray-800">
                <div className="p-3 md:p-4 flex flex-col items-center justify-center border-l border-gray-50 dark:border-gray-800">
                    <BookOpen size={14} className="text-primary-500 mb-0.5 md:mb-1 md:size-[16px]" />
                    <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase">المواد</span>
                    <span className="text-base md:text-lg font-black text-gray-900 dark:text-white">{enrollments.length}</span>
                </div>
                <div className="p-3 md:p-4 flex flex-col items-center justify-center">
                    <TrendingUp size={14} className="text-emerald-500 mb-0.5 md:mb-1 md:size-[16px]" />
                    <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase">الالتزام</span>
                    <span className="text-base md:text-lg font-black text-emerald-600">
                        {(() => {
                            if (enrollments.length === 0) return '0%';
                            const total = enrollments.reduce((sum: number, en) => sum + Number(en.sessionsTotal || 0), 0);
                            const used = enrollments.reduce((sum: number, en) => sum + Number(en.sessionsUsed || 0), 0);
                            return total > 0 ? `${Math.round((used / total) * 100)}%` : '0%';
                        })()}
                    </span>
                </div>
            </div>

            <div className="p-6 space-y-4 flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-1 flex items-center justify-between">
                    تفاصيل المواد الدراسية
                    <CheckCircle2 size={12} className="text-gray-300" />
                </p>
                <div className="space-y-4">
                    {enrollments.map((en, idx: number) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-3 relative overflow-hidden group/item">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white">{en.subject}</h4>
                                    <p className="text-[9px] text-gray-500 font-bold italic">المعلم: {en.teacher}</p>
                                </div>
                                <div className="text-left">
                                    <span className="text-[10px] font-black text-primary-600">حضر {en.sessionsUsed} من {en.sessionsTotal}</span>
                                </div>
                            </div>
                            <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-1000",
                                        (en.sessionsTotal > 0 ? (en.sessionsUsed / en.sessionsTotal) * 100 : 0) > 80 ? "bg-rose-500" : (en.sessionsTotal > 0 ? (en.sessionsUsed / en.sessionsTotal) * 100 : 0) > 50 ? "bg-amber-500" : "bg-primary-600"
                                    )}
                                    style={{ width: `${Math.min(100, en.sessionsTotal > 0 ? (en.sessionsUsed / en.sessionsTotal) * 100 : 0)}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                    {enrollments.length === 0 && (
                        <div className="py-6 text-center">
                            <p className="text-[10px] text-gray-400 font-bold italic">لا توجد مواد مسجلة حالياً لهذا الابن</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 md:p-6 pt-0 mt-auto space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => onViewDates(student)} className="py-2.5 bg-slate-900 dark:bg-slate-800 text-white text-[9px] md:text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-black transition-all flex items-center justify-center gap-1.5 md:gap-2 shadow-sm">
                        <Calendar size={13} className="md:size-[14px]" />
                        حصص الطالب
                    </button>
                    <button onClick={() => onViewAttendance(student)} className="py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-[9px] md:text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 md:gap-2 shadow-sm">
                        <TrendingUp size={13} className="md:size-[14px]" />
                        نسبة الحضور
                    </button>
                </div>
                <button onClick={() => onViewAchievements(student)} className={cn("w-full py-2.5 text-[9px] md:text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10", hasAchievements ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 border border-indigo-200 dark:border-indigo-900" : "bg-indigo-600 text-white hover:bg-indigo-700")}>
                    <Trophy size={14} />
                    {hasAchievements ? 'إغلاق سجل الإنجازات' : 'عرض حصاد الإنجازات والأوسمة'}
                </button>
            </div>

            <AnimatePresence>
                {hasAchievements && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                        <div className="p-4 md:p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Trophy size={16} className="text-amber-500" />
                                <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">حصاد إنجازات الطالب</h4>
                            </div>
                            <GamificationCard totalPoints={totalPoints} badges={student.badges} pointLogs={pointLogs} />
                            <button onClick={onCloseAchievements} className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-rose-500/20 transition-all mt-2 active:scale-95">إغلاق السجل</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

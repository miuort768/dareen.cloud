import { User, BookOpen, TrendingUp, CheckCircle2, Star, Trophy, Calendar } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { GamificationCard } from '../../students/components/GamificationCard';
import { ProgressBar } from '../../../shared/components/ui';

interface ParentEnrollment {
    teacherName?: string;
    sessionsTotal?: number;
    sessionsUsed?: number;
    subject?: string;
    teacher?: string;
    [key: string]: unknown;
}

interface ParentStudent {
    id: string;
    name: string;
    grade?: string;
    enrollments?: ParentEnrollment[];
    totalPoints?: number;
    [key: string]: unknown;
}

interface ParentPointLog {
    id?: string;
    amount?: number;
    action?: string;
    [key: string]: unknown;
}

interface ParentStudentCardProps {
    student: ParentStudent;
    viewingAchievements: ParentStudent | null;
    onViewDates: (student: ParentStudent) => void;
    onViewAttendance: (student: ParentStudent) => void;
    onViewAchievements: (student: ParentStudent) => void;
    onCloseAchievements: () => void;
    pointLogs: ParentPointLog[];
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
        <div className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary/30 hover:shadow-elevation-1 transition-all duration-300 flex flex-col">
            <div className="bg-primary p-4 md:p-6 relative overflow-hidden">
                <div className="absolute top-0 start-0 w-24 h-24 bg-white/10 -translate-y-12 translate-x-12 rotate-45 group-hover:scale-110 transition-transform rounded-full blur-xl"></div>
                <div className="absolute bottom-0 end-0 w-16 h-16 bg-white/5 translate-y-8 -translate-x-8 rounded-full blur-lg"></div>
                <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm flex items-center justify-center text-on-primary border border-white/20 rounded-xl shrink-0">
                            <User size={20} className="md:size-[28px]" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base md:text-lg font-medium text-on-primary leading-tight truncate">{(student as { name: string }).name}</h3>
                            <p className="text-primary text-micro md:text-micro font-medium uppercase tracking-widest mt-0.5">{student.grade || 'غير محدد'}</p>
                        </div>
                    </div>
                    {totalPoints > 0 && (
                        <div className="flex flex-col items-center gap-0.5 bg-warning text-main px-1.5 py-1 shrink-0 rounded-xl">
                            <Star size={12} className="fill-current md:size-[16px]" />
                            <span className="text-micro font-medium">{totalPoints}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 border-b border-border">
                <div className="p-3 md:p-4 flex flex-col items-center justify-center border-e border-border">
                    <div className="w-8 h-8 bg-primary-soft rounded-xl flex items-center justify-center mb-1">
                        <BookOpen size={14} className="text-primary md:size-[16px]" />
                    </div>
                    <span className="text-micro md:text-micro font-medium text-muted uppercase">المواد</span>
                    <span className="text-base md:text-lg font-medium text-main">{enrollments.length}</span>
                </div>
                <div className="p-3 md:p-4 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 bg-success-soft rounded-xl flex items-center justify-center mb-1">
                        <TrendingUp size={14} className="text-success md:size-[16px]" />
                    </div>
                    <span className="text-micro md:text-micro font-medium text-muted uppercase">الالتزام</span>
                    <span className="text-base md:text-lg font-medium text-success">
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
                <p className="text-micro font-medium text-muted border-b border-border pb-2 flex items-center justify-between">
                    تفاصيل المواد الدراسية
                    <CheckCircle2 size={12} className="text-muted" />
                </p>
                <div className="space-y-3">
                    {enrollments.map((en, idx: number) => (
                        <div key={idx} className="bg-surface p-3 rounded-xl relative overflow-hidden group/item border border-transparent hover:border-primary/20 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="text-sm font-medium text-main">{en.subject}</h4>
                                    <p className="text-micro text-muted font-normal italic">المعلم: {en.teacher}</p>
                                </div>
                                <div className="text-end">
                                    <span className="text-micro font-medium text-primary">حضر {en.sessionsUsed} من {en.sessionsTotal}</span>
                                </div>
                            </div>
                            <ProgressBar value={Math.min(100, en.sessionsTotal > 0 ? (en.sessionsUsed / en.sessionsTotal) * 100 : 0)} variant="primary" />
                        </div>
                    ))}
                    {enrollments.length === 0 && (
                        <div className="py-6 text-center">
                            <p className="text-micro text-muted font-normal italic">لا توجد مواد مسجلة حالياً لهذا الابن</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 md:p-5 pt-0 mt-auto space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => onViewDates(student)} className="py-2.5 bg-primary text-on-primary text-micro md:text-micro font-medium rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-1.5 md:gap-2 active:scale-[0.98]">
                        <Calendar size={13} className="md:size-[14px]" />
                        حصص الطالب
                    </button>
                    <button onClick={() => onViewAttendance(student)} className="py-2.5 bg-surface border border-border text-main text-micro md:text-micro font-medium rounded-xl hover:bg-surface hover:border-primary/30 transition-all flex items-center justify-center gap-1.5 md:gap-2 active:scale-[0.98]">
                        <TrendingUp size={13} className="md:size-[14px]" />
                        نسبة الحضور
                    </button>
                </div>
                <button onClick={() => onViewAchievements(student)} className={cn("w-full py-2.5 text-micro md:text-micro font-medium rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]", hasAchievements ? "bg-surface text-primary border border-primary/30" : "bg-primary text-on-primary hover:bg-primary-hover")}>
                    <Trophy size={14} />
                    {hasAchievements ? 'إغلاق سجل الإنجازات' : 'عرض حصاد الإنجازات والأوسمة'}
                </button>
            </div>

            <AnimatePresence>
                {hasAchievements && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-surface border-t border-border">
                        <div className="p-4 md:p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Trophy size={16} className="text-warning" />
                                <h4 className="text-micro font-medium text-main uppercase tracking-widest">حصاد إنجازات الطالب</h4>
                            </div>
                            <GamificationCard totalPoints={totalPoints} badges={student.badges} pointLogs={pointLogs} />
                            <button onClick={onCloseAchievements} className="w-full py-2 bg-error hover:bg-error-hover text-on-error text-micro font-medium rounded-xl transition-all mt-2 active:scale-95">إغلاق السجل</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

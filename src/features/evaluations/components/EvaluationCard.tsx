import { Award, Plus, History, Star, Calendar, TrendingUp, User } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';
import { RATING_OPTIONS } from '../types/constants';
import type { Student, Evaluation } from '../../../types';

interface EvaluationCardProps {
    student: Student;
    evaluations: Evaluation[];
    isParent: boolean;
    onAddEvaluation: (studentId: string) => void;
    onViewHistory: (student: Student) => void;
    onViewProfile: (student: Student) => void;
}

const avatarGradients = [
    { g: 'from-primary to-primary-hover', on: 'text-on-primary' },
    { g: 'from-success to-success-hover', on: 'text-on-success' },
    { g: 'from-info to-info-hover', on: 'text-on-info' },
    { g: 'from-warning to-warning-hover', on: 'text-on-warning' },
    { g: 'from-error to-error-hover', on: 'text-on-error' },
    { g: 'from-accent to-accent-hover', on: 'text-on-accent' },
];

const getAvatarGradient = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarGradients[Math.abs(hash) % avatarGradients.length];
};

const getAvgRating = (studentEvals: Evaluation[]) => {
    if (studentEvals.length === 0) return null;
    const rMap: Record<string, number> = { 'ممتاز': 5, 'جيد جدًا': 4, 'جيد': 3, 'يحتاج تحسين': 2 };
    const avg = studentEvals.reduce((s, ev) => s + (rMap[ev.rating] || 3), 0) / studentEvals.length;
    return Math.round(avg * 10) / 10;
};

export const EvaluationCard = ({ student, evaluations, isParent, onAddEvaluation, onViewHistory, onViewProfile }: EvaluationCardProps) => {
    const studentEvals = evaluations
        .filter(ev => ev.studentId === student.id)
        .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());
    const lastEval = studentEvals[0];
    const lastRating = lastEval ? RATING_OPTIONS.find(r => r.value === lastEval.rating) || RATING_OPTIONS[0] : null;
    const totalStudentXP = studentEvals.reduce((s, ev) => s + (ev.points || 0), 0);
    const avgRating = getAvgRating(studentEvals);
    const totalEnrollments = (student.enrollments || []).length;
    const totalSessions = (student.enrollments || []).reduce((s, en) => s + en.sessionsTotal, 0);
    const usedSessions = (student.enrollments || []).reduce((s, en) => s + en.sessionsUsed, 0);
    const progress = totalSessions > 0 ? Math.round((usedSessions / totalSessions) * 100) : 0;
    const gradient = getAvatarGradient(student.name);

    return (
        <div className="group bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-2 hover:ring-1 hover:ring-primary/20 flex flex-col">
            {/* Gradient Top Bar */}
            <div className={cn("h-10 bg-gradient-to-r relative overflow-hidden shrink-0", gradient.g)}>
                <div className="absolute inset-0 bg-white/10" />
                <div className="absolute -top-4 -end-4 w-12 h-12 bg-white/20 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -start-4 w-8 h-8 bg-black/10 rounded-full blur-lg" />
            </div>

            {/* Avatar + Name Row */}
            <div className="px-4 -mt-5 relative z-10">
                <div className="flex items-end justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-sm font-bold ring-2 ring-white shadow-lg shrink-0", gradient.g, gradient.on)}>
                            {(student.name || '?').charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-xs text-main truncate">{student.name}</h4>
                            <p className="text-[9px] text-muted truncate">{student.grade || '—'}</p>
                        </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 px-2 py-1 bg-warning-soft/60 border border-warning/10 rounded-lg">
                        <Award size={10} className="text-warning" />
                        <span className="text-[9px] font-bold text-warning tabular-nums">{totalStudentXP}</span>
                        <span className="text-[7px] text-warning/60">XP</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pt-3 pb-2 flex-1 flex flex-col gap-2">
                {lastEval ? (
                    <>
                        {/* Last Evaluation */}
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-muted flex items-center gap-1">
                                <Star size={9} /> آخر تقييم
                            </span>
                            <div className="flex items-center gap-2">
                                {lastRating && (
                                    <span className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold", lastRating.pill)}>
                                        <lastRating.icon size={8} />
                                        {lastEval.rating}
                                    </span>
                                )}
                                <span className="text-[8px] text-muted">{format(new Date(lastEval.created_at || lastEval.date), 'dd/MM')}</span>
                            </div>
                        </div>
                        <div className="bg-surface border border-border rounded-xl p-2.5 min-h-[44px]">
                            <p className="text-[9px] text-muted italic line-clamp-2 leading-relaxed">
                                &ldquo;{(lastEval.notes) || 'بدون ملاحظات'}&rdquo;
                            </p>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-1.5">
                            <div className="p-2 bg-primary-soft/30 rounded-lg text-center">
                                <p className="text-[8px] text-muted">المعدل</p>
                                <p className="text-[10px] font-bold text-primary tabular-nums">{avgRating || '—'}</p>
                            </div>
                            <div className="p-2 bg-success-soft/30 rounded-lg text-center">
                                <p className="text-[8px] text-muted">الحضور</p>
                                <p className="text-[10px] font-bold text-success tabular-nums">{progress}%</p>
                            </div>
                            <div className="p-2 bg-warning-soft/30 rounded-lg text-center">
                                <p className="text-[8px] text-muted">التقييمات</p>
                                <p className="text-[10px] font-bold text-warning tabular-nums">{studentEvals.length}</p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        {progress > 0 && (
                            <div className="h-1 w-full bg-surface rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full transition-all", progress >= 75 ? 'bg-success' : progress >= 50 ? 'bg-warning' : 'bg-error')} style={{ width: `${progress}%` }} />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-4 text-center gap-2">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-soft/50 border border-dashed border-primary/20">
                            <Award size={16} className="text-primary/30" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted">ابدأ أول تقييم</p>
                            <p className="text-[8px] text-muted/60 mt-0.5">كل تقييم يزيد XP ويسجل في السجل</p>
                        </div>
                        {totalEnrollments > 0 && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[8px] text-muted flex items-center gap-1"><Calendar size={7} />{totalEnrollments} مواد</span>
                                <span className="text-[8px] text-muted flex items-center gap-1"><TrendingUp size={7} />{progress}% حضور</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className={cn("grid gap-1.5 p-3 pt-2 border-t border-border", isParent ? 'grid-cols-1' : 'grid-cols-3')}>
                {!isParent && (
                    <button onClick={() => onAddEvaluation(student.id)} className="flex items-center justify-center gap-1 py-2 bg-primary text-on-primary text-[9px] font-bold rounded-lg hover:bg-primary-hover transition-all active:scale-95 shadow-sm">
                        <Plus size={10} /> تقييم
                    </button>
                )}
                <button onClick={() => onViewHistory(student)} className={cn(
                    "flex items-center justify-center gap-1 py-2 text-[9px] font-bold rounded-lg transition-all active:scale-95 border",
                    isParent ? 'bg-primary text-on-primary border-primary hover:bg-primary-hover' : 'bg-surface text-main border-border hover:bg-background'
                )}>
                    <History size={10} /> السجل
                    <span className="px-1 py-0.5 bg-primary-soft text-primary text-[7px] font-bold rounded ml-0.5">{studentEvals.length}</span>
                </button>
                {!isParent && (
                    <button onClick={() => onViewProfile(student)} className="flex items-center justify-center gap-1 py-2 bg-surface text-main text-[9px] font-bold rounded-lg border border-border hover:bg-background hover:border-primary/30 transition-all active:scale-95">
                        <User size={10} /> الملف
                    </button>
                )}
            </div>
        </div>
    );
};
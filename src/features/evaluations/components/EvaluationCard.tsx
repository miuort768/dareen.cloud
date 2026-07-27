import { User, BookOpen, Award, TrendingUp, Plus, History } from 'lucide-react';
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
}

export const EvaluationCard = ({ student, evaluations, isParent, onAddEvaluation, onViewHistory }: EvaluationCardProps) => {
    const studentEvals = evaluations
        .filter(ev => ev.studentId === student.id)
        .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());
    const lastEval = studentEvals[0];
    const lastRating = lastEval ? RATING_OPTIONS.find(r => r.value === lastEval.rating) || RATING_OPTIONS[0] : null;
    const totalStudentXP = studentEvals.reduce((s, ev) => s + (ev.points || 0), 0);

    return (
        <div className="bg-card border border-border shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-300 flex flex-col overflow-hidden group rounded-2xl">
            <div className={cn("h-1.5 w-full", lastRating ? lastRating.bg : 'bg-border')}>
                <div className={cn("h-full w-full", lastRating?.bg ?? 'bg-surface')} />
            </div>

            <div className="p-4 flex items-center gap-3 border-b border-border">
                <div className="w-11 h-11 flex items-center justify-center shrink-0 bg-primary-soft rounded-xl ring-1 ring-primary/20">
                    <User size={18} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm text-main truncate">{student.name}</h4>
                    <p className="text-micro font-normal text-muted truncate flex items-center gap-1">
                        <BookOpen size={8} className="shrink-0" />{student.grade}</p>
                </div>
                <div className="shrink-0 text-center">
                    <span className="text-micro font-bold px-2 py-0.5 bg-warning-soft text-warning rounded-lg">{totalStudentXP} XP</span>
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-3">
                {lastEval ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-micro font-bold text-muted">آخر تقييم</span>
                            {lastRating && (
                                <span className={cn("flex items-center gap-1 text-micro font-bold px-2 py-0.5", lastRating.pill)}>
                                    <lastRating.icon size={9} />
                                    {lastEval.rating}
                                </span>
                            )}
                        </div>
                        <div className="bg-surface p-3 border border-border rounded-xl">
                            <p className="text-micro font-normal text-muted italic line-clamp-2 leading-relaxed">
                                &ldquo;{(lastEval.notes) || 'بدون ملاحظات'}&rdquo;
                            </p>
                            <p className="text-micro text-muted mt-1.5">{format(new Date(lastEval.created_at || lastEval.date), 'dd/MM/yyyy')}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp size={10} className="text-primary" />
                            <span className="text-micro text-muted font-normal">{studentEvals.length} تقييم مسجل</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-12 h-12 flex items-center justify-center mb-2 rounded-2xl bg-primary-soft border border-dashed border-primary/30">
                            <Award size={20} className="text-primary/40" />
                        </div>
                        <p className="text-micro font-bold text-muted">لم يتم التقييم بعد</p>
                    </div>
                )}
            </div>

            {!isParent && (
                <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                    <button onClick={() => onAddEvaluation(student.id)} className="bg-primary hover:bg-primary-hover text-on-primary py-2.5 text-micro font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 rounded-xl">
                        <Plus size={12} /> أضف تقييم
                    </button>
                    <button onClick={() => onViewHistory(student)} className="bg-surface hover:bg-background text-main py-2.5 text-micro font-bold transition-all flex items-center justify-center gap-1.5 rounded-xl border border-border">
                        <History size={12} /> السجل ({studentEvals.length})
                    </button>
                </div>
            )}
            {isParent && (
                <div className="px-4 pb-4">
                    <button onClick={() => onViewHistory(student)} className="w-full bg-surface hover:bg-background text-main py-2.5 text-micro font-bold transition-all flex items-center justify-center gap-1.5 rounded-xl border border-border">
                        <History size={12} /> عرض السجل الكامل ({studentEvals.length})
                    </button>
                </div>
            )}
        </div>
    );
};

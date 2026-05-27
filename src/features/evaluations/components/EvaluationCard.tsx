import { User, BookOpen, Award, TrendingUp, Plus, History } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';
import { RATING_OPTIONS } from '../types/constants';

interface EvaluationCardProps {
    student: Record<string, unknown>;
    evaluations: Record<string, unknown>[];
    isParent: boolean;
    onAddEvaluation: (studentId: string) => void;
    onViewHistory: (student: Record<string, unknown>) => void;
}

export const EvaluationCard = ({ student, evaluations, isParent, onAddEvaluation, onViewHistory }: EvaluationCardProps) => {
    const studentEvals = evaluations
        .filter(ev => ev.studentId === student.id)
        .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());
    const lastEval = studentEvals[0];
    const lastRating = lastEval ? RATING_OPTIONS.find(r => r.value === lastEval.rating) || RATING_OPTIONS[0] : null;
    const totalStudentXP = studentEvals.reduce((s, ev) => s + (ev.points || 0), 0);

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-sm transition-all duration-300 flex flex-col overflow-hidden group rounded-2xl">
            <div className={cn("h-1.5 w-full", lastRating ? lastRating.bg.replace('bg-', 'bg-') : 'bg-slate-100')} style={{ background: lastRating ? undefined : '#e2e8f0' }}>
                <div className={cn("h-full w-full", lastRating?.bg ?? 'bg-slate-200')} />
            </div>

            <div className="p-4 flex items-center gap-3 border-b border-slate-50 dark:border-slate-800">
                <div className="w-11 h-11 bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900 rounded-xl">
                    <User size={18} className="text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm text-slate-900 dark:text-white truncate">{student.name as string}</h4>
                    <p className="text-[9px] font-normal text-slate-400 uppercase tracking-widest truncate flex items-center gap-1">
                        <BookOpen size={8} className="shrink-0" />{student.grade as string}</p>
                </div>
                <div className="shrink-0 text-center">
                    <span className="bg-amber-400/20 text-amber-700 dark:text-amber-400 text-[9px] font-medium px-2 py-0.5 border border-amber-200/50 rounded-lg">{totalStudentXP} XP</span>
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-3">
                {lastEval ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">آخر تقييم</span>
                            {lastRating && (
                                <span className={cn("flex items-center gap-1 text-[9px] font-normal px-2 py-0.5", lastRating.pill)}>
                                    <lastRating.icon size={9} />
                                    {lastEval.rating as string}
                                </span>
                            )}
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-700 rounded-xl">
                            <p className="text-[10px] font-normal text-slate-600 dark:text-slate-300 italic line-clamp-2 leading-relaxed">
                                &ldquo;{(lastEval.notes as string) || 'بدون ملاحظات'}&rdquo;
                            </p>
                            <p className="text-[8px] text-slate-400 mt-1.5">{format(new Date(lastEval.created_at || lastEval.date), 'dd/MM/yyyy')}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp size={10} className="text-blue-400" />
                            <span className="text-[9px] text-slate-400 font-normal">{studentEvals.length} تقييم مسجل</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-2 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                            <Award size={20} className="text-slate-300" />
                        </div>
                        <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">لم يتم التقييم بعد</p>
                    </div>
                )}
            </div>

            {!isParent && (
                <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                    <button onClick={() => onAddEvaluation(student.id as string)} className="bg-blue-600 dark:bg-rose-500 hover:bg-blue-700 dark:hover:bg-rose-600 text-white py-2 text-[10px] font-medium transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 rounded-lg">
                        <Plus size={12} strokeWidth={3} /> أضف تقييم
                    </button>
                    <button onClick={() => onViewHistory(student)} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 text-[10px] font-medium transition-all flex items-center justify-center gap-1.5 rounded-lg">
                        <History size={12} /> السجل ({studentEvals.length})
                    </button>
                </div>
            )}
            {isParent && (
                <div className="px-4 pb-4">
                    <button onClick={() => onViewHistory(student)} className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 py-2 text-[10px] font-medium transition-all flex items-center justify-center gap-1.5">
                        <History size={12} /> عرض السجل الكامل ({studentEvals.length})
                    </button>
                </div>
            )}
        </div>
    );
};

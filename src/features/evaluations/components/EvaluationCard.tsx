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
        <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm hover:shadow-sm transition-all duration-300 flex flex-col overflow-hidden group rounded-none">
            <div className={cn("h-1.5 w-full", lastRating ? lastRating.bg.replace('bg-', 'bg-') : 'bg-slate-100')} style={{ background: lastRating ? undefined : '#e2e8f0' }}>
                <div className={cn("h-full w-full", lastRating?.bg ?? 'bg-slate-200')} />
            </div>

            <div className="p-4 flex items-center gap-3 border-b border-slate-50 dark:border-slate-800">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#2563EB12' }}>
                    <User size={18} style={{ color: '#2563EB' }} />
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm text-slate-900 dark:text-white truncate">{student.name}</h4>
                    <p className="text-[9px] font-normal text-slate-400 uppercase tracking-widest truncate flex items-center gap-1">
                        <BookOpen size={8} className="shrink-0" />{student.grade}</p>
                </div>
                <div className="shrink-0 text-center">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-none" style={{ backgroundColor: '#F59E0B12', color: '#D97706' }}>{totalStudentXP} XP</span>
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
                                    {lastEval.rating}
                                </span>
                            )}
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100/50 dark:border-slate-700/50 rounded-none">
                            <p className="text-[10px] font-normal text-slate-600 dark:text-slate-300 italic line-clamp-2 leading-relaxed">
                                &ldquo;{(lastEval.notes) || 'بدون ملاحظات'}&rdquo;
                            </p>
                            <p className="text-[8px] text-slate-400 mt-1.5">{format(new Date(lastEval.created_at || lastEval.date), 'dd/MM/yyyy')}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp size={10} style={{ color: '#2563EB' }} />
                            <span className="text-[9px] text-slate-400 font-normal">{studentEvals.length} تقييم مسجل</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-12 h-12 flex items-center justify-center mb-2 rounded-none" style={{ backgroundColor: '#00542F08', border: '1px dashed', borderColor: '#00542F30' }}>
                            <Award size={20} style={{ color: '#00542F' }} />
                        </div>
                        <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">لم يتم التقييم بعد</p>
                    </div>
                )}
            </div>

            {!isParent && (
                <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                    <button onClick={() => onAddEvaluation(student.id)} className="bg-[#00542F] hover:bg-[#004028] text-white py-2.5 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 rounded-none">
                        <Plus size={12} /> أضف تقييم
                    </button>
                    <button onClick={() => onViewHistory(student)} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 rounded-none">
                        <History size={12} /> السجل ({studentEvals.length})
                    </button>
                </div>
            )}
            {isParent && (
                <div className="px-4 pb-4">
                    <button onClick={() => onViewHistory(student)} className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 py-2.5 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 rounded-none">
                        <History size={12} /> عرض السجل الكامل ({studentEvals.length})
                    </button>
                </div>
            )}
        </div>
    );
};

import { User, X, Trash2, History } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';
import { RATING_OPTIONS } from '../types/constants';
import type { Student, Evaluation } from '../../../types';

interface HistoryModalProps {
    student: Student | null;
    evaluations: Evaluation[];
    canDelete: (evaluation: Evaluation) => boolean;
    onDelete: (id: string) => void;
    onClose: () => void;
}

export const HistoryModal = ({ student, evaluations, canDelete, onDelete, onClose }: HistoryModalProps) => {
    if (!student) return null;

    const studentEvals = evaluations
        .filter(ev => ev.studentId === student.id)
        .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[10001]">
            <div className="bg-card shadow-elevation-2 w-full max-w-xl flex flex-col max-h-[85vh] overflow-hidden border border-border mt-20 md:mt-0 rounded-2xl">
                <div className="p-5 border-b border-border flex justify-between items-center bg-primary text-on-primary rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-white/15 rounded-xl">
                            <User size={18} className="text-on-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold">سجل التقييمات الكامل</h3>
                            <p className="text-on-primary/70 text-micro font-medium">{student.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="إغلاق" className="w-8 h-8 bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors rounded-xl"><X size={16} /></button>
                </div>

                <div className="p-4 overflow-y-auto space-y-3 bg-surface">
                    {studentEvals.map((ev) => {
                        const r = RATING_OPTIONS.find(ro => ro.value === ev.rating) || RATING_OPTIONS[0];
                        return (
                            <div key={ev.id} className="bg-card border border-border p-4 shadow-elevation-1 hover:border-primary/20 transition-all group rounded-2xl">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("flex items-center gap-1.5 text-micro font-bold px-2 py-1", r.pill)}>
                                            <r.icon size={10} strokeWidth={3} />
                                            {ev.rating}
                                        </span>
                                        {ev.points > 0 && (
                                            <span className="text-micro font-bold px-2 py-0.5 bg-warning-soft text-warning rounded-lg">+{ev.points} XP</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-micro font-normal text-muted tabular-nums">{format(new Date(ev.created_at || ev.date), 'dd/MM/yyyy')}</span>
                                        {canDelete(ev) && (
                                            <button aria-label="حذف التقييم" onClick={() => onDelete(ev.id)} className="text-muted hover:text-error transition-colors p-1 hover:bg-error-soft rounded-xl"><Trash2 size={12} /></button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-micro font-normal text-muted italic leading-relaxed border-s-2 border-primary/30 ps-3">
                                    &ldquo;{ev.notes || 'لا يوجد ملاحظات'}&rdquo;
                                </p>
                                <div className="mt-2 pt-2 border-t border-border flex items-center gap-1.5">
                                    <User size={8} className="text-muted" />
                                    <span className="text-micro font-normal text-muted">بواسطة: {ev.teacherName || 'نظام آلي'}</span>
                                </div>
                            </div>
                        );
                    })}
                    {studentEvals.length === 0 && (
                        <div className="py-12 text-center bg-card rounded-2xl border-2 border-dashed border-primary/30">
                            <History size={28} className="text-primary/30 mb-3 mx-auto" />
                            <p className="text-micro font-bold text-muted">لا يوجد سجل تقييمات حالياً</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border flex justify-center bg-card rounded-b-2xl">
                    <button onClick={onClose} className="px-8 py-2.5 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs transition-all rounded-xl active:scale-95">إغلاق</button>
                </div>
            </div>
        </div>
    );
};

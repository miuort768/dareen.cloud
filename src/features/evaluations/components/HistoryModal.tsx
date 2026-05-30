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
        <div className="fixed inset-0 bg-slate-900/50  flex items-center justify-center p-4 z-[10001] md:animate-in md:fade-in">
            <div className="bg-white dark:bg-slate-900 shadow-sm w-full max-w-xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-100/50 dark:border-slate-800/50 mt-20 md:mt-0 rounded-none">
                <div className="p-5 border-b border-slate-100/50 dark:border-slate-800/50 flex justify-between items-center bg-[#172554] text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-none" style={{ backgroundColor: '#ffffff15' }}>
                            <User size={18} style={{ color: '#ffffff' }} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold">سجل التقييمات الكامل</h3>
                            <p className="text-white/70 text-[10px] font-medium">{student.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="إغلاق" className="w-8 h-8 bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors rounded-none"><X size={16} /></button>
                </div>

                <div className="p-4 overflow-y-auto space-y-3" style={{ backgroundColor: '#00542F02' }}>
                    {studentEvals.map((ev) => {
                        const r = RATING_OPTIONS.find(ro => ro.value === ev.rating) || RATING_OPTIONS[0];
                        return (
                            <div key={ev.id} className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 p-4 shadow-sm hover:border-blue-200 transition-all group rounded-none">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("flex items-center gap-1.5 text-[9px] font-medium px-2 py-1", r.pill)}>
                                            <r.icon size={10} strokeWidth={3} />
                                            {ev.rating}
                                        </span>
                                        {ev.points > 0 && (
                                            <span className="text-[8px] font-bold px-2 py-0.5 rounded-none" style={{ backgroundColor: '#F59E0B12', color: '#D97706' }}>+{ev.points} XP</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-normal text-slate-400 tabular-nums">{format(new Date(ev.created_at || ev.date), 'dd/MM/yyyy')}</span>
                                        {canDelete(ev) && (
                                            <button onClick={() => onDelete(ev.id)} className="text-slate-300 hover:text-[#00542F] transition-colors p-1 hover:bg-[#00542F08]"><Trash2 size={12} /></button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[10px] font-normal text-slate-600 dark:text-slate-400 italic leading-relaxed border-r-2 border-blue-200 pr-3">
                                    &ldquo;{ev.notes || 'لا يوجد ملاحظات'}&rdquo;
                                </p>
                                <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-800 flex items-center gap-1.5">
                                    <User size={8} className="text-slate-300" />
                                    <span className="text-[8px] font-normal text-slate-400">بواسطة: {ev.teacherName || 'نظام آلي'}</span>
                                </div>
                            </div>
                        );
                    })}
                    {studentEvals.length === 0 && (
                        <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-none" style={{ border: '2px dashed', borderColor: '#00542F30' }}>
                            <History size={28} style={{ color: '#00542F30' }} className="mb-3" />
                            <p className="text-[10px] font-bold text-slate-400">لا يوجد سجل تقييمات حالياً</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100/50 dark:border-slate-800/50 flex justify-center bg-white dark:bg-slate-900">
                    <button onClick={onClose} className="px-8 py-2.5 bg-[#172554] hover:bg-[#0f1d3d] text-white font-bold text-xs transition-all shadow-sm rounded-none">إغلاق</button>
                </div>
            </div>
        </div>
    );
};

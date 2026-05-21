import { Award, X, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { RATING_OPTIONS } from '../types/constants';

interface EvaluationFormModalProps {
    isOpen: boolean;
    formData: { studentId: string; rating: string; points: number; notes: string };
    students: Record<string, unknown>[];
    teacherStudents: Record<string, unknown>[];
    onClose: () => void;
    onChange: (data: { studentId: string; rating: string; points: number; notes: string }) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const EvaluationFormModal = ({ isOpen, formData, students, teacherStudents, onClose, onChange, onSubmit }: EvaluationFormModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[10001] md:animate-in md:fade-in">
            <div className="bg-white dark:bg-slate-900 shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden border border-slate-100 dark:border-slate-800 mt-20 md:mt-0">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-rose-500 dark:to-rose-600 text-white">
                    <h3 className="text-sm font-black flex items-center gap-2">
                        <Award size={16} />
                        {formData.studentId ? `تقييم: ${students.find(s => s.id === formData.studentId)?.name || ''}` : 'إضافة تقييم جديد'}
                    </h3>
                    <button onClick={onClose} className="w-7 h-7 bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"><X size={14} /></button>
                </div>

                <div className="p-4 overflow-y-auto space-y-4">
                    <form id="evaluation-form" onSubmit={onSubmit} className="space-y-4">
                        {!formData.studentId && (
                            <div>
                                <label className="block text-[9px] md:text-xs font-black text-slate-500 mb-1.5 uppercase tracking-widest">اختر الطالب</label>
                                <select value={formData.studentId} onChange={(e) => onChange({ ...formData, studentId: e.target.value })} required
                                    className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 md:px-4 md:py-3 font-bold text-xs md:text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/30 outline-none">
                                    <option value="">-- اختر من قائمة طلابك --</option>
                                    {teacherStudents.map(s => (
                                        <option key={s.id as string} value={s.id as string}>{s.name as string} ({s.grade as string})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-[9px] md:text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">مستوى التميز</label>
                            <div className="grid grid-cols-4 gap-1.5 md:gap-3">
                                {RATING_OPTIONS.map((opt) => {
                                    const isSelected = formData.rating === opt.value;
                                    const OptIcon = opt.icon;
                                    return (
                                        <button type="button" key={opt.value} onClick={() => onChange({ ...formData, rating: opt.value })}
                                            className={cn("p-2 border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1",
                                                isSelected ? cn(opt.bg, opt.border, opt.color, "shadow-md scale-105") : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:border-slate-300")}>
                                            <OptIcon size={14} strokeWidth={isSelected ? 3 : 2} className={cn(isSelected && "animate-bounce")} />
                                            <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest leading-none">{opt.value}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[9px] md:text-xs font-black text-slate-500 uppercase tracking-widest">نقاط المكافأة (XP)</label>
                                <div className="flex gap-1.5">
                                    {[5, 10, 20, 50].map(p => (
                                        <button key={p} type="button" onClick={() => onChange({ ...formData, points: p })}
                                            className="bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200 px-2 py-0.5 font-bold text-[9px] transition-colors">+{p}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                                    <Zap size={16} className="text-amber-500 fill-current" />
                                </div>
                                <input type="number" value={formData.points || ''} onChange={(e) => onChange({ ...formData, points: Number(e.target.value) })}
                                    placeholder="0" min="0"
                                    className="flex-1 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 font-black text-base text-amber-600 text-center outline-none focus:ring-2 focus:ring-amber-400/30" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[9px] md:text-xs font-black text-slate-500 mb-1.5 uppercase tracking-widest">رسالة الإشادة (تظهر لولي الأمر)</label>
                            <textarea value={formData.notes} onChange={(e) => onChange({ ...formData, notes: e.target.value })} rows={2}
                                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none placeholder:text-slate-300 transition-all"
                                placeholder="مثال: أداء ممتاز اليوم..." />
                        </div>
                    </form>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white text-xs font-black hover:bg-slate-200 transition-all">إلغاء</button>
                    <button type="submit" form="evaluation-form" className="px-6 py-2.5 bg-indigo-600 dark:bg-rose-500 hover:bg-indigo-700 dark:hover:bg-rose-600 text-white text-xs font-black transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                        <CheckCircle2 size={14} /> إرسال التقييم
                    </button>
                </div>
            </div>
        </div>
    );
};

import { Award, X, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { RATING_OPTIONS } from '../types/constants';
import type { Student } from '../../../types';

interface EvaluationFormModalProps {
    isOpen: boolean;
    formData: { studentId: string; rating: string; points: number; notes: string };
    students: Student[];
    teacherStudents: Student[];
    onClose: () => void;
    onChange: (data: { studentId: string; rating: string; points: number; notes: string }) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const EvaluationFormModal = ({ isOpen, formData, students, teacherStudents, onClose, onChange, onSubmit }: EvaluationFormModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50  flex items-center justify-center p-4 z-[10001] md:animate-in md:fade-in">
            <div className="bg-white dark:bg-slate-900 shadow-sm w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden border border-slate-100/50 dark:border-slate-800/50 mt-20 md:mt-0 rounded-none">
                <div className="p-4 border-b border-slate-100/50 dark:border-slate-800/50 flex justify-between items-center bg-[#172554] text-white">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <Award size={16} />
                        {formData.studentId ? `تقييم: ${students.find(s => s.id === formData.studentId)?.name || ''}` : 'إضافة تقييم جديد'}
                    </h3>
                    <button onClick={onClose} aria-label="إغلاق" className="w-7 h-7 bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors rounded-none"><X size={14} /></button>
                </div>

                <div className="p-4 overflow-y-auto space-y-4">
                    <form id="evaluation-form" onSubmit={onSubmit} className="space-y-4">
                        {!formData.studentId && (
                            <div>
                                <label className="block text-[9px] md:text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-widest">اختر الطالب</label>
                                <select value={formData.studentId} onChange={(e) => onChange({ ...formData, studentId: e.target.value })} required
                                    className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 md:px-4 md:py-3 font-normal text-xs md:text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/30 outline-none rounded-none">
                                    <option value="">-- اختر من قائمة طلابك --</option>
                                    {teacherStudents.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-[9px] md:text-xs font-medium text-slate-500 mb-2 uppercase tracking-widest">مستوى التميز</label>
                            <div className="grid grid-cols-4 gap-1.5 md:gap-3">
                                {RATING_OPTIONS.map((opt) => {
                                    const isSelected = formData.rating === opt.value;
                                    const OptIcon = opt.icon;
                                    return (
                                        <button type="button" key={opt.value} onClick={() => onChange({ ...formData, rating: opt.value })}
                                            className={cn("p-2 border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1 rounded-none",
                                                isSelected ? cn(opt.bg, opt.border, opt.color, "shadow-sm scale-105") : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:border-slate-300")}>
                                            <OptIcon size={14} strokeWidth={isSelected ? 3 : 2} className={cn(isSelected && "animate-bounce")} />
                                            <span className="text-[7px] md:text-[9px] font-medium uppercase tracking-widest leading-none">{opt.value}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[9px] md:text-xs font-medium text-slate-500 uppercase tracking-widest">نقاط المكافأة (XP)</label>
                                <div className="flex gap-1.5">
                                    {[5, 10, 20, 50].map(p => (
                                        <button key={p} type="button" onClick={() => onChange({ ...formData, points: p })}
                                            className="px-2 py-0.5 font-bold text-[9px] transition-colors rounded-none" style={{ backgroundColor: '#F59E0B12', color: '#D97706', border: '1px solid #F59E0B30' }}>+{p}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shrink-0 rounded-none" style={{ backgroundColor: '#F59E0B12' }}>
                                    <Zap size={16} style={{ color: '#D97706' }} />
                                </div>
                                <input type="number" value={formData.points || ''} onChange={(e) => onChange({ ...formData, points: Number(e.target.value) })}
                                    placeholder="0" min="0"
                                    className="flex-1 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 font-medium text-base text-amber-600 text-center outline-none focus:ring-2 focus:ring-amber-400/30 rounded-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[9px] md:text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-widest">رسالة الإشادة (تظهر لولي الأمر)</label>
                            <textarea value={formData.notes} onChange={(e) => onChange({ ...formData, notes: e.target.value })} rows={2}
                                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-blue-500/30 resize-none placeholder:text-slate-300 transition-all rounded-none"
                                placeholder="مثال: أداء ممتاز اليوم..." />
                        </div>
                    </form>
                </div>

                <div className="p-4 border-t border-slate-100/50 dark:border-slate-800/50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white text-xs font-bold hover:bg-slate-200 transition-all rounded-none">إلغاء</button>
                    <button type="submit" form="evaluation-form" className="px-6 py-2.5 bg-[#172554] hover:bg-[#0f1d3d] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 rounded-none">
                        <CheckCircle2 size={14} /> إرسال التقييم
                    </button>
                </div>
            </div>
        </div>
    );
};

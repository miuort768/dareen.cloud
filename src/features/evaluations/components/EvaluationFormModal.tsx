import { Award, X, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { RATING_OPTIONS } from '../types/constants';
import type { Student } from '../../../types';

interface EvaluationFormModalProps {
    isOpen: boolean;
    formData: { studentId: string; rating: string; points: number; notes: string };
    students: Student[];
    teacherStudents: Student[];
    isSubmitting?: boolean;
    onClose: () => void;
    onChange: (data: { studentId: string; rating: string; points: number; notes: string }) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const EvaluationFormModal = ({ isOpen, formData, students, teacherStudents, isSubmitting, onClose, onChange, onSubmit }: EvaluationFormModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[10001]">
            <div className="bg-card shadow-elevation-2 w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden border border-border mt-20 md:mt-0 rounded-2xl">
                <div className="p-4 border-b border-border flex justify-between items-center bg-primary text-on-primary rounded-t-2xl">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <Award size={16} />
                        {formData.studentId ? `تقييم: ${students.find(s => s.id === formData.studentId)?.name || ''}` : 'إضافة تقييم جديد'}
                    </h3>
                    <button onClick={onClose} aria-label="إغلاق" className="w-7 h-7 bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors rounded-xl"><X size={14} /></button>
                </div>

                <div className="p-4 overflow-y-auto space-y-4">
                    <form id="evaluation-form" onSubmit={onSubmit} className="space-y-4">
                        {!formData.studentId && (
                            <div>
                                <label className="block text-micro md:text-xs font-bold text-muted mb-1.5">اختر الطالب</label>
                                <select value={formData.studentId} onChange={(e) => onChange({ ...formData, studentId: e.target.value })} required aria-label="اختر الطالب"
                                    className="w-full border border-border bg-surface px-3 py-2 md:px-4 md:py-3 font-normal text-xs md:text-sm text-main rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all">
                                    <option value="">-- اختر من قائمة طلابك --</option>
                                    {teacherStudents.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-micro md:text-xs font-bold text-muted mb-2">مستوى التميز</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 md:gap-3">
                                {RATING_OPTIONS.map((opt) => {
                                    const isSelected = formData.rating === opt.value;
                                    const OptIcon = opt.icon;
                                    return (
                                        <button type="button" key={opt.value} onClick={() => onChange({ ...formData, rating: opt.value })}
                                            className={cn("p-2 border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1 rounded-xl",
                                                isSelected ? cn(opt.bg, opt.border, opt.color, "scale-105") : "border-border bg-surface text-muted hover:border-primary/30")}>
                                            <OptIcon size={14} strokeWidth={isSelected ? 3 : 2} className={cn(isSelected && "animate-bounce")} />
                                            <span className="text-micro font-bold uppercase leading-none">{opt.value}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-micro md:text-xs font-bold text-muted">نقاط المكافأة (XP)</label>
                                <div className="flex gap-1.5">
                                    {[5, 10, 20, 50].map(p => (
                                        <button key={p} type="button" onClick={() => onChange({ ...formData, points: p })}
                                            className="px-2 py-0.5 font-bold text-micro transition-colors rounded-xl bg-warning-soft text-warning border border-warning/20">+{p}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shrink-0 rounded-xl bg-warning-soft border border-warning/20">
                                    <Zap size={16} className="text-warning" />
                                </div>
                                <input type="number" value={formData.points || ''} onChange={(e) => onChange({ ...formData, points: Number(e.target.value) })}
                                    placeholder="0" min="0"
                                    className="flex-1 border border-border bg-surface px-3 py-2 font-medium text-base text-warning text-center rounded-xl focus:outline-none focus:ring-2 focus:ring-warning/10 transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-micro md:text-xs font-bold text-muted mb-1.5">رسالة الإشادة (تظهر لولي الأمر)</label>
                            <textarea value={formData.notes} onChange={(e) => onChange({ ...formData, notes: e.target.value })} rows={2}
                                className="w-full border border-border bg-surface px-3 py-2 text-sm font-normal rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none placeholder:text-muted transition-all"
                                placeholder="مثال: أداء ممتاز اليوم..." />
                        </div>
                    </form>
                </div>

                <div className="p-4 border-t border-border flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface text-main text-xs font-bold hover:bg-background border border-border transition-all rounded-xl">إلغاء</button>
                    <button type="submit" form="evaluation-form" disabled={isSubmitting} className="px-6 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-on-primary text-xs font-bold transition-all flex items-center gap-2 rounded-xl active:scale-95">
                        <CheckCircle2 size={14} /> {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
                    </button>
                </div>
            </div>
        </div>
    );
};

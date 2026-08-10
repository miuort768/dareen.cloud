import { motion } from 'framer-motion';
import { X, CalendarDays, ChevronDown } from 'lucide-react';

interface TrialSessionForm {
    studentName: string;
    parentPhone: string;
    subject: string;
    teacherId: string;
    teacherName: string;
    date: string;
    time: string;
    notes: string;
}

interface TrialSessionFormModalProps {
    editingId: string | null;
    form: TrialSessionForm;
    teachers: Record<string, unknown>[];
    isSaving: boolean;
    onChange: (form: TrialSessionForm) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}

const inputClass = "w-full bg-surface dark:bg-white/[0.04] border border-border dark:border-white/[0.08] px-3.5 py-3 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-main dark:text-main rounded-xl transition-all duration-200 placeholder:text-muted/40 dark:placeholder:text-white/20 font-bold";
const labelClass = "text-[11px] font-bold text-muted dark:text-main/40 mb-1.5 block";
const selectWrapperClass = "relative";

export const TrialSessionFormModal = ({ editingId, form, teachers, isSaving, onChange, onSubmit, onClose }: TrialSessionFormModalProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="p-2.5 sm:p-4"
    >
        <div className="bg-card dark:bg-card/80 border border-border dark:border-white/[0.04] rounded-2xl overflow-hidden" dir="rtl">
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between relative overflow-hidden border-b border-border/50 dark:border-white/[0.04]">
                <div className="absolute inset-0 bg-primary/5 dark:bg-gradient-to-l dark:from-primary/10 dark:to-accent/5" />
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-primary/10 dark:bg-primary/15">
                        <CalendarDays size={18} className="text-primary dark:text-primary" />
                    </div>
                    <div>
                        <h2 className="text-[13px] font-bold text-main dark:text-main">{editingId ? 'تعديل الحصة' : 'إضافة حصة جديدة'}</h2>
                        <p className="text-[10px] text-muted/60 dark:text-main/30 mt-0.5">أدخل بيانات الحصة التجريبية</p>
                    </div>
                </div>
                <button onClick={onClose} className="relative z-10 w-8 h-8 flex items-center justify-center bg-surface dark:bg-white/5 hover:bg-hover dark:hover:bg-white/10 rounded-xl transition-all" aria-label="إغلاق">
                    <X size={14} className="text-muted dark:text-main/50" />
                </button>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className={labelClass}>اسم الطالب</label>
                        <input required value={form.studentName} onChange={e => onChange({ ...form, studentName: e.target.value })} className={inputClass} placeholder="مثال: أم أحمد" />
                    </div>
                    <div className="space-y-1">
                        <label className={labelClass}>رقم ولي الأمر</label>
                        <input required value={form.parentPhone} onChange={e => onChange({ ...form, parentPhone: e.target.value })} className={inputClass} placeholder="05XXXXXXXX" dir="ltr" style={{ textAlign: 'right' }} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className={labelClass}>المادة</label>
                        <input value={form.subject} onChange={e => onChange({ ...form, subject: e.target.value })} className={inputClass} placeholder="مثال: رياضيات" />
                    </div>
                    <div className="space-y-1">
                        <label className={labelClass}>المعلمة</label>
                        <div className={selectWrapperClass}>
                            <select value={form.teacherName} onChange={e => {
                                const t = (Array.isArray(teachers) ? teachers : []).find((t: { id: string; name: string }) => t.name === e.target.value);
                                onChange({ ...form, teacherName: e.target.value, teacherId: t?.id || '' });
                            }} aria-label="اختيار المعلمة" className={inputClass + " appearance-none"}>
                                <option value="">اختر معلمة</option>
                                {(Array.isArray(teachers) ? teachers : []).map((t: { id: string; name: string }) => (
                                    <option key={t.id} value={t.name}>{t.name}</option>
                                ))}
                            </select>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted dark:text-main/40">
                                <ChevronDown size={14} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className={labelClass}>التاريخ</label>
                        <input type="date" required value={form.date} onChange={e => onChange({ ...form, date: e.target.value })} className={inputClass} />
                    </div>
                    <div className="space-y-1">
                        <label className={labelClass}>الوقت</label>
                        <input type="time" value={form.time} onChange={e => onChange({ ...form, time: e.target.value })} className={inputClass} />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className={labelClass}>ملاحظات</label>
                    <textarea value={form.notes} onChange={e => onChange({ ...form, notes: e.target.value })} rows={2} className={inputClass + " resize-none"} placeholder="اكتب أي تفاصيل..." />
                </div>
                <div className="flex gap-3 pt-2 pb-4">
                    <button type="submit" disabled={isSaving} className="flex-1 py-3.5 bg-gradient-to-l from-primary to-primary-deep text-white text-[13px] font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-primary/15 dark:shadow-primary/20">
                        {isSaving ? 'جاري الحفظ...' : editingId ? 'تحديث' : 'إتمام الإضافة'}
                    </button>
                    <button type="button" onClick={onClose} className="flex-1 py-3.5 text-[11px] font-bold text-muted dark:text-main/40 bg-surface dark:bg-white/5 hover:bg-hover dark:hover:bg-white/10 rounded-xl transition-all active:scale-[0.98]">إلغاء</button>
                </div>
            </form>
        </div>
    </motion.div>
);

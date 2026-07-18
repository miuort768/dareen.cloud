import { motion } from 'framer-motion';
import { X } from 'lucide-react';

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

export const TrialSessionFormModal = ({ editingId, form, teachers, isSaving, onChange, onSubmit, onClose }: TrialSessionFormModalProps) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card shadow-soft w-full max-w-lg border border-border/50 rounded-card overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-primary px-5 py-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-on-primary">{editingId ? 'تعديل الحصة' : 'إضافة حصة جديدة'}</h3>
                <button onClick={onClose} className="w-7 h-7 flex items-center justify-center bg-white/10 hover:bg-white/20 text-on-primary rounded-xl transition-all" aria-label="إغلاق"><X size={16} /></button>
            </div>
            <form onSubmit={onSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="text-xs text-muted mb-1 block">اسم الطالب</label><input required value={form.studentName} onChange={e => onChange({ ...form, studentName: e.target.value })} className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-xs text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all" /></div>
                    <div><label className="text-xs text-muted mb-1 block">رقم ولي الأمر</label><input required value={form.parentPhone} onChange={e => onChange({ ...form, parentPhone: e.target.value })} className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-xs text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all" /></div>
                    <div><label className="text-xs text-muted mb-1 block">المادة</label><input value={form.subject} onChange={e => onChange({ ...form, subject: e.target.value })} className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-xs text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all" /></div>
                    <div><label className="text-xs text-muted mb-1 block">المعلمة</label>
                        <select value={form.teacherName} onChange={e => {
                            const t = (Array.isArray(teachers) ? teachers : []).find((t: { id: string; name: string }) => t.name === e.target.value);
                            onChange({ ...form, teacherName: e.target.value, teacherId: t?.id || '' });
                        }} aria-label="اختيار المعلمة" className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-xs text-main focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none">
                            <option value="">اختر معلمة</option>
                            {(Array.isArray(teachers) ? teachers : []).map((t: { id: string; name: string }) => (
                                <option key={t.id} value={t.name}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div><label className="text-xs text-muted mb-1 block">التاريخ</label><input type="date" required value={form.date} onChange={e => onChange({ ...form, date: e.target.value })} className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-xs text-main focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all" /></div>
                    <div><label className="text-xs text-muted mb-1 block">الوقت</label><input type="time" value={form.time} onChange={e => onChange({ ...form, time: e.target.value })} className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-xs text-main focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all" /></div>
                </div>
                <div><label className="text-xs text-muted mb-1 block">ملاحظات</label><textarea value={form.notes} onChange={e => onChange({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-xs text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all" /></div>
                <button type="submit" disabled={isSaving} className="w-full py-3 bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">{isSaving ? 'جاري الحفظ...' : editingId ? 'تحديث' : 'إتمام الإضافة'}</button>
            </form>
        </motion.div>
    </motion.div>
);

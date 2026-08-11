import React from 'react';
import { X, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryBtn } from './LeadsUI';

interface LeadFormData {
    studentName: string; phone: string; subject: string; curriculum: string; status: string; priority: string; notes: string;
}

interface AddLeadModalProps {
    isAddModalOpen: boolean; setIsAddModalOpen: (v: boolean) => void;
    addMutation: { mutate: (data: LeadFormData) => void; isPending: boolean };
    formRef: React.RefObject<HTMLFormElement | null>;
}

const inputClass = "w-full bg-surface border border-border px-3.5 py-3 text-[13px] outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10 text-main rounded-xl transition-all duration-200 placeholder:text-muted/60 font-bold";
const labelClass = "text-[11px] font-bold text-muted mb-1.5 block";

export const AddLeadModal = ({ isAddModalOpen, setIsAddModalOpen, addMutation, formRef }: AddLeadModalProps) => {
    return (
        <AnimatePresence>
            {isAddModalOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
                    <motion.div
                        initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[210] md:w-full md:max-w-lg max-h-[90vh] md:max-h-[85vh] bg-card flex flex-col overflow-hidden border border-border md:shadow-2xl md:rounded-2xl"
                        dir="rtl"
                    >
                        {/* Drag handle — mobile only */}
                        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
                            <div className="w-10 h-1 bg-border rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="shrink-0 px-5 py-4 flex items-center justify-between border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-soft">
                                    <UserPlus size={18} className="text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-main">إضافة عميل جديد</h2>
                                    <p className="text-[10px] text-muted mt-0.5">أدخل بيانات العميل الجديد</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-surface hover:bg-hover rounded-xl transition-all" aria-label="إغلاق">
                                <X size={14} className="text-muted" />
                            </button>
                        </div>

                        {/* Form */}
                        <form ref={formRef} className="flex-1 overflow-y-auto p-5 space-y-4" onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const getStr = (name: string) => (formData.get(name) as string) || '';
                            addMutation.mutate({
                                studentName: getStr('name'), phone: getStr('phone'), subject: getStr('subject'),
                                curriculum: getStr('curriculum'), status: 'new', priority: getStr('priority'), notes: getStr('notes')
                            });
                        }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1"><label className={labelClass}>اسم الطالب</label><input name="name" className={inputClass} placeholder="مثال: أم أحمد" /></div>
                                <div className="space-y-1"><label className={labelClass}>المنهج</label><input name="curriculum" required className={inputClass} placeholder="مثال: مصري" /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1"><label className={labelClass}>رقم الهاتف</label><input name="phone" required className={inputClass} placeholder="05XXXXXXXX" dir="ltr" style={{ textAlign: 'right' }} /></div>
                                <div className="space-y-1"><label className={labelClass}>المادة المهتم بها</label><input name="subject" required className={inputClass} placeholder="مثال: رياضيات" /></div>
                            </div>
                            <div className="space-y-1">
                                <label className={labelClass}>الأولوية</label>
                                <select name="priority" aria-label="الأولوية" className={inputClass}>
                                    <option value="low">منخفضة</option>
                                    <option value="medium">متوسطة</option>
                                    <option value="high">عالية</option>
                                </select>
                            </div>
                            <div className="space-y-1"><label className={labelClass}>ملاحظات</label><textarea name="notes" rows={2} className={inputClass + " resize-none"} placeholder="اكتب أي تفاصيل..." /></div>
                            <div className="flex gap-3 pt-2 pb-4">
                                <PrimaryBtn type="submit" disabled={addMutation.isPending} className="flex-1 py-3.5">
                                    {addMutation.isPending ? 'جاري الحفظ...' : 'إضافة العميل'}
                                </PrimaryBtn>
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3.5 text-[11px] font-bold text-muted bg-surface hover:bg-hover rounded-xl transition-all active:scale-[0.98]">إلغاء</button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

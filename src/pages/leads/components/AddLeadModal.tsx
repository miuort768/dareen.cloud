import React from 'react';
import { X, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryBtn } from './LeadsUI';

interface LeadFormData {
    studentName: string;
    phone: string;
    subject: string;
    curriculum: string;
    status: string;
    priority: string;
    notes: string;
}

interface AddLeadModalProps {
    isAddModalOpen: boolean;
    setIsAddModalOpen: (v: boolean) => void;
    addMutation: { mutate: (data: LeadFormData) => void; isPending: boolean };
    formRef: React.RefObject<HTMLFormElement | null>;
}

export const AddLeadModal = ({ isAddModalOpen, setIsAddModalOpen, addMutation, formRef }: AddLeadModalProps) => {
    return (
        <AnimatePresence>
            {isAddModalOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsAddModalOpen(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-[210] flex items-center justify-center p-4"
                        dir="rtl"
                    >
                        <div className="bg-card w-full max-w-lg shadow-elevation-2 rounded-2xl overflow-hidden border border-border">
                            {/* Header */}
                            <div className="bg-gradient-to-l from-primary to-primary-deep px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/15">
                                        <UserPlus size={16} className="text-on-primary" />
                                    </div>
                                    <h2 className="text-sm font-bold text-on-primary">إضافة عميل محتمل</h2>
                                </div>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="w-7 h-7 flex items-center justify-center hover:bg-white/10 text-on-primary/70 rounded-xl transition-all"
                                    aria-label="إغلاق"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Form */}
                            <form ref={formRef} className="p-5 space-y-4" onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const getStr = (name: string) => (formData.get(name) as string) || '';
                                addMutation.mutate({
                                    studentName: getStr('name'),
                                    phone: getStr('phone'),
                                    subject: getStr('subject'),
                                    curriculum: getStr('curriculum'),
                                    status: 'new',
                                    priority: getStr('priority'),
                                    notes: getStr('notes')
                                });
                            }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted ms-1">اسم الطالب (اختياري)</label>
                                        <input name="name" className="w-full bg-surface border border-border px-3 py-2.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-main rounded-xl transition-all" placeholder="مثال: أم أحمد" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted ms-1">المنهج</label>
                                        <input name="curriculum" required className="w-full bg-surface border border-border px-3 py-2.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-main rounded-xl transition-all" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted ms-1">رقم الهاتف</label>
                                        <input name="phone" required className="w-full bg-surface border border-border px-3 py-2.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-main rounded-xl transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted ms-1">المادة المهتم بها</label>
                                        <input name="subject" required className="w-full bg-surface border border-border px-3 py-2.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-main rounded-xl transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted ms-1">الأولوية</label>
                                    <select name="priority" aria-label="الأولوية" className="w-full bg-surface border border-border px-3 py-2.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-main rounded-xl transition-all">
                                        <option value="low">منخفضة</option>
                                        <option value="medium">متوسطة</option>
                                        <option value="high">عالية</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted ms-1">ملاحظات</label>
                                    <textarea name="notes" rows={2} className="w-full bg-surface border border-border px-3 py-2.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-main rounded-xl transition-all resize-none" placeholder="اكتب أي تفاصيل..." />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <PrimaryBtn type="submit" disabled={addMutation.isPending} className="flex-1 py-2.5">
                                        {addMutation.isPending ? 'جاري الحفظ...' : 'حفظ العميل'}
                                    </PrimaryBtn>
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 text-xs font-bold text-muted bg-surface hover:bg-hover rounded-xl transition-all active:scale-[0.98]">
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

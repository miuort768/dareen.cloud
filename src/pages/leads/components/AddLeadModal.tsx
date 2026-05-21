import React from 'react';
import { X, UserPlus } from 'lucide-react';
import { PrimaryBtn } from './LeadsUI';

interface AddLeadModalProps {
    isAddModalOpen: boolean;
    setIsAddModalOpen: (v: boolean) => void;
    addMutation: { mutate: (data: any) => void; isPending: boolean };
    formRef: React.RefObject<HTMLFormElement | null>;
}

export const AddLeadModal = ({ isAddModalOpen, setIsAddModalOpen, addMutation, formRef }: AddLeadModalProps) => {
    if (!isAddModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
                            <UserPlus size={18} className="text-white" />
                        </div>
                        <h2 className="text-xs md:text-sm font-bold text-white dark:text-white">إضافة عميل محتمل جديد</h2>
                    </div>
                    <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-800 rounded-lg text-white"><X size={18} /></button>
                </div>
                <form ref={formRef} className="p-6 space-y-4" onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    addMutation.mutate({
                        studentName: formData.get('name') as string,
                        phone: formData.get('phone') as string,
                        subject: formData.get('subject') as string,
                        curriculum: formData.get('curriculum') as string,
                        status: 'new',
                        priority: formData.get('priority') as any,
                        notes: formData.get('notes') as string
                    });
                }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1 md:space-y-1.5">
                            <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mr-1">اسم الطالب / العميل (اختياري)</label>
                            <input name="name" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-[11px] md:text-xs font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-white" placeholder="مثال: أم أحمد (أو اتركه فارغاً)" />
                        </div>
                        <div className="space-y-1 md:space-y-1.5">
                            <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mr-1">المنهج</label>
                            <input name="curriculum" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-[11px] md:text-xs font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-white" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1 md:space-y-1.5">
                            <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mr-1">رقم الهاتف</label>
                            <input name="phone" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-[11px] md:text-xs font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-white" />
                        </div>
                        <div className="space-y-1 md:space-y-1.5">
                            <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mr-1">المادة المهتم بها</label>
                            <input name="subject" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-[11px] md:text-xs font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-white" />
                        </div>
                    </div>
                    <div className="space-y-1 md:space-y-1.5">
                        <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mr-1">الأولوية</label>
                        <select name="priority" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-[11px] md:text-xs font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-white">
                            <option value="low">منخفضة</option>
                            <option value="medium">متوسطة</option>
                            <option value="high">عالية جداً 🔥</option>
                        </select>
                    </div>
                    <div className="space-y-1 md:space-y-1.5">
                        <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mr-1">ملاحظات</label>
                        <textarea name="notes" rows={2} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-[11px] md:text-xs font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-white resize-none" placeholder="اكتب أي تفاصيل أو ملاحظات عن العميل هنا..." />
                    </div>
                    <PrimaryBtn type="submit" disabled={addMutation.isPending} className="w-full py-2 md:py-3 mt-4 text-[11px] md:text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10 disabled:opacity-60 disabled:cursor-not-allowed">
                        {addMutation.isPending ? '⏳ جاري الحفظ...' : 'حفظ العميل وبدء المتابعة'}
                    </PrimaryBtn>
                </form>
            </div>
        </div>
    );
};

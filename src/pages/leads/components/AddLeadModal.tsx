import React from 'react';
import { X, UserPlus } from 'lucide-react';
import { PrimaryBtn } from './LeadsUI';

interface AddLeadModalProps {
    isAddModalOpen: boolean;
    setIsAddModalOpen: (v: boolean) => void;
    addMutation: { mutate: (data: Record<string, unknown>) => void; isPending: boolean };
    formRef: React.RefObject<HTMLFormElement | null>;
}

export const AddLeadModal = ({ isAddModalOpen, setIsAddModalOpen, addMutation, formRef }: AddLeadModalProps) => {
    if (!isAddModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-[#172554] px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-600 flex items-center justify-center">
                            <UserPlus size={16} className="text-white" />
                        </div>
                        <h2 className="text-sm font-bold text-white">إضافة عميل محتمل</h2>
                    </div>
                    <button onClick={() => setIsAddModalOpen(false)} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 text-white/70"><X size={16} /></button>
                </div>
                <form ref={formRef} className="p-5 space-y-4" onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    addMutation.mutate({
                        studentName: formData.get('name') as string,
                        phone: formData.get('phone') as string,
                        subject: formData.get('subject') as string,
                        curriculum: formData.get('curriculum') as string,
                        status: 'new',
                        priority: formData.get('priority') as string,
                        notes: formData.get('notes') as string
                    });
                }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase mr-1">اسم الطالب (اختياري)</label>
                            <input name="name" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-white" placeholder="مثال: أم أحمد" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase mr-1">المنهج</label>
                            <input name="curriculum" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-white" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase mr-1">رقم الهاتف</label>
                            <input name="phone" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase mr-1">المادة المهتم بها</label>
                            <input name="subject" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-white" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase mr-1">الأولوية</label>
                        <select name="priority" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-white">
                            <option value="low">منخفضة</option>
                            <option value="medium">متوسطة</option>
                            <option value="high">عالية</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase mr-1">ملاحظات</label>
                        <textarea name="notes" rows={2} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-white resize-none" placeholder="اكتب أي تفاصيل..." />
                    </div>
                    <PrimaryBtn type="submit" disabled={addMutation.isPending} className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed">
                        {addMutation.isPending ? 'جاري الحفظ...' : 'حفظ العميل'}
                    </PrimaryBtn>
                </form>
            </div>
        </div>
    );
};

import React from 'react';
import { UserPlus } from 'lucide-react';
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
    if (!isAddModalOpen) return null;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
            <div className="bg-[#172554] px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-none flex items-center justify-center" style={{ backgroundColor: '#22C55E12' }}>
                        <UserPlus size={16} style={{ color: '#22C55E' }} />
                    </div>
                    <h2 className="text-sm font-bold text-white">إضافة عميل محتمل</h2>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="text-[10px] font-bold text-white/70 hover:text-white transition-colors">إلغاء</button>
            </div>
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
                <div className="flex gap-3">
                    <PrimaryBtn type="submit" disabled={addMutation.isPending} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed">
                        {addMutation.isPending ? 'جاري الحفظ...' : 'حفظ العميل'}
                    </PrimaryBtn>
                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                        إلغاء
                    </button>
                </div>
            </form>
        </div>
    );
};

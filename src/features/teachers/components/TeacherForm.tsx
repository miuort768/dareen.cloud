import { useState, useEffect } from 'react';
import { Plus, Edit } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Teacher } from '../types';

interface TeacherFormProps {
    onSubmit: (data: Omit<Teacher, 'id'>) => void;
    initialData?: Teacher | null;
    onCancel: () => void;
}

export const TeacherForm = ({ onSubmit, initialData, onCancel }: TeacherFormProps) => {
    const [formData, setFormData] = useState({
        name: '',
        phone1: '',
        phone2: '',
        subject: '',
        price: '',
        username: '',
        password: ''
    });
    const [enableLogin, setEnableLogin] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                phone1: initialData.phone1,
                phone2: initialData.phone2 || '',
                subject: initialData.subject,
                price: String(initialData.price),
                username: initialData.username || '',
                password: initialData.password || ''
            });
            setEnableLogin(!!initialData.username);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            price: Number(formData.price),
            username: enableLogin ? formData.username : '',
            password: enableLogin ? formData.password : ''
        });
    };

    const generatePassword = () => {
        const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
        let pass = '';
        for (let i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
        setFormData(prev => ({ ...prev, password: pass }));
    };

    const generateUsername = () => {
        if (!formData.name) return;
        const firstName = formData.name.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        setFormData(prev => ({
            ...prev,
            username: `${firstName || 'teacher'}_${Math.floor(Math.random() * 1000)}`
        }));
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-xl relative overflow-hidden" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#5c59f2] text-white flex items-center justify-center font-black rounded-none shadow-sm shadow-indigo-100 dark:shadow-none">
                        {initialData ? <Edit size={24} /> : <Plus size={24} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white leading-none">
                            {initialData ? 'تعديل البيانات' : 'إضافة كادر جديد'}
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tight">يرجى استكمال البيانات الأكاديمية والمهنية</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">الاسم الثلاثي *</label>
                        <input
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-r-2 border-r-slate-200 dark:border-r-slate-700 focus:outline-none focus:border-[#5c59f2] dark:text-white font-bold text-sm transition-all"
                            placeholder="اسم المعلمة الثنائي أو الثلاثي"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">رقم الهاتف الأساسي *</label>
                        <input
                            required
                            type="tel"
                            value={formData.phone1}
                            onChange={e => setFormData({ ...formData, phone1: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-r-2 border-r-slate-200 dark:border-r-slate-700 focus:outline-none focus:border-[#5c59f2] dark:text-white font-bold text-sm transition-all"
                            dir="ltr"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">التخصص الأكاديمي *</label>
                        <input
                            required
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-r-2 border-r-slate-200 dark:border-r-slate-700 focus:outline-none focus:border-[#5c59f2] dark:text-white font-bold text-sm transition-all"
                            placeholder="المادة التي تدرسها"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">سعر الحصة للمكتبة *</label>
                        <div className="relative">
                            <input
                                required
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-r-2 border-r-emerald-400 focus:outline-none focus:border-emerald-500 dark:text-white font-bold text-sm transition-all"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-500">ج.م</span>
                        </div>
                    </div>
                </div>

                {/* Login Fields Section */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <label 
                        onClick={() => setEnableLogin(!enableLogin)}
                        className="inline-flex items-center gap-3 cursor-pointer group mb-6"
                    >
                        <div className={cn(
                            "w-5 h-5 flex items-center justify-center border-2 transition-all",
                            enableLogin ? "bg-[#5c59f2] border-[#5c59f2]" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        )}>
                            {enableLogin && <div className="w-1.5 h-1.5 bg-white shadow-[0_0_8px_white]" />}
                        </div>
                        <span className="text-[12px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">تفعيل دخول النظام لهذه المعلمة</span>
                    </label>

                    {enableLogin && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/20 p-6 border border-slate-100 dark:border-slate-800">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">اسم المستخدم</label>
                                    <button type="button" onClick={generateUsername} className="text-[9px] text-[#5c59f2] font-black hover:underline uppercase">توليد ذكي</button>
                                </div>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 font-mono text-sm dark:text-white focus:border-[#5c59f2] outline-none"
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">كلمة السر</label>
                                    <button type="button" onClick={generatePassword} className="text-[9px] text-[#5c59f2] font-black hover:underline uppercase">توليد ذكي</button>
                                </div>
                                <input
                                    type="text"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 font-mono text-sm dark:text-white focus:border-[#5c59f2] outline-none"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                    >
                        إلغاء
                    </button>
                    <button
                        type="submit"
                        className="px-10 py-3 bg-[#5c59f2] text-white text-xs font-black shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-600 transition-all uppercase tracking-widest"
                    >
                        {initialData ? 'تحديث البيانات' : 'حفظ المعلمة في النظام'}
                    </button>
                </div>
            </form>
        </div>
    );
};

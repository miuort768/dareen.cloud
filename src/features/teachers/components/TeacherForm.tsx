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
        <div className="bg-white p-6 border border-gray-100 rounded-none shadow-xl dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-none bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                    {initialData ? <Edit size={20} /> : <Plus size={20} />}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-none">{initialData ? 'تعديل بيانات المعلمة' : 'إضافة معلمة جديدة'}</h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium italic">يرجى ملء البيانات المطلوبة للبدء</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">الاسم الكامل *</label>
                        <input
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-none focus:outline-none focus:ring-0 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium text-sm"
                            placeholder="اسم المعلمة"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">رقم الهاتف الأساسي *</label>
                        <input
                            required
                            type="tel"
                            value={formData.phone1}
                            onChange={e => setFormData({ ...formData, phone1: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-none focus:outline-none focus:ring-0 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium text-sm"
                            dir="ltr"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">رقم إضافي (اختياري)</label>
                        <input
                            type="tel"
                            value={formData.phone2}
                            onChange={e => setFormData({ ...formData, phone2: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-none focus:outline-none focus:ring-0 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium text-sm"
                            dir="ltr"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">التخصص / المادة *</label>
                        <input
                            required
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-none focus:outline-none focus:ring-0 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium text-sm"
                            placeholder="مثال: لغة عربية"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">سعر الحصة (ج.م) *</label>
                        <input
                            required
                            type="number"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-none focus:outline-none focus:ring-0 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium text-sm"
                        />
                    </div>
                </div>

                {/* Login fields section */}
                <div className="pt-4 border-t border-gray-50 dark:border-gray-800">
                    <div
                        onClick={() => setEnableLogin(!enableLogin)}
                        className="flex items-center gap-3 mb-4 cursor-pointer group w-fit"
                    >
                        <div className={cn(
                            "w-5 h-5 rounded-none border flex items-center justify-center",
                            enableLogin ? "bg-primary-600 border-primary-600 shadow-lg shadow-primary-600/20" : "bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-700"
                        )}>
                            {enableLogin && <div className="w-2 h-2 rounded-none bg-white" />}
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 select-none">
                            تفعيل حساب للنظام (دخول المعلمة)
                        </span>
                    </div>

                    {enableLogin && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-primary-50/30 p-4 rounded-none border border-primary-100/50 dark:bg-primary-900/5 dark:border-primary-900/20">
                            <div className="space-y-1.5">
                                <div className="flex justify-between px-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">اسم المستخدم</label>
                                    <button type="button" onClick={generateUsername} className="text-[10px] text-primary-600 font-black hover:opacity-70">توليد تلقائي ✨</button>
                                </div>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-none focus:border-primary-500 outline-none text-sm font-mono dark:bg-gray-900 dark:border-gray-600 dark:text-white shadow-sm"
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between px-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">كلمة المرور</label>
                                    <button type="button" onClick={generatePassword} className="text-[10px] text-primary-600 font-black hover:opacity-70">توليد تلقائي ✨</button>
                                </div>
                                <input
                                    type="text"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-none focus:border-primary-500 outline-none text-sm font-mono dark:bg-gray-900 dark:border-gray-600 dark:text-white shadow-sm"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-none"
                    >
                        إلغاء
                    </button>
                    <button
                        type="submit"
                        className="px-10 py-3 bg-primary-600 text-white text-sm font-black rounded-none hover:bg-primary-700 shadow-lg shadow-primary-600/20 underline-offset-4"
                    >
                        {initialData ? 'حفظ التعديلات' : 'إضافة المعلمة الآن'}
                    </button>
                </div>
            </form>
        </div>
    );
};

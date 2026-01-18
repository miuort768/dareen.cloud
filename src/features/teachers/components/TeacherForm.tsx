import { useState, useEffect } from 'react';
import { Plus, Edit } from 'lucide-react';
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
        <div className="bg-white mx-1 p-6 border border-primary-200 shadow-lg dark:bg-gray-900 dark:border-gray-800 animate-in slide-in-from-top-4">
            <div className="flex items-center gap-2 mb-4 text-primary-700 font-bold border-b border-gray-200 pb-3 dark:border-gray-700 dark:text-primary-400">
                {initialData ? <Edit size={20} /> : <Plus size={20} />}
                <h3 className="text-lg">{initialData ? 'تعديل بيانات المعلمة' : 'إضافة معلمة جديدة'}</h3>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">الاسم الكامل *</label>
                    <input
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        placeholder="اسم المعلمة"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">رقم الهاتف الأساسي *</label>
                    <input
                        required
                        type="tel"
                        value={formData.phone1}
                        onChange={e => setFormData({ ...formData, phone1: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        dir="ltr"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">رقم إضافي (اختياري)</label>
                    <input
                        type="tel"
                        value={formData.phone2}
                        onChange={e => setFormData({ ...formData, phone2: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        dir="ltr"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">التخصص / المادة *</label>
                    <input
                        required
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        placeholder="مثال: لغة عربية"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">سعر الحصة (ج.م) *</label>
                    <input
                        required
                        type="number"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">رقم الهاتف الأساسي *</label>
                    <input
                        required
                        type="tel"
                        value={formData.phone1}
                        onChange={e => setFormData({ ...formData, phone1: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        dir="ltr"
                    />
                </div>
                {/* Add login fields section */}
                <div className="md:col-span-2 lg:col-span-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-4">
                        <input
                            type="checkbox"
                            id="enableLogin"
                            checked={enableLogin}
                            onChange={() => setEnableLogin(!enableLogin)}
                            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        />
                        <label htmlFor="enableLogin" className="text-sm font-bold text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                            تفعيل حساب للنظام (اسم مستخدم وكلمة مرور)
                        </label>
                    </div>

                    {enableLogin && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                            <div className="space-y-1.5">
                                <div className="flex justify-between">
                                    <label className="text-xs font-bold text-gray-500">اسم المستخدم</label>
                                    <button type="button" onClick={generateUsername} className="text-[10px] text-primary-600 font-bold hover:underline">توليد تلقائي</button>
                                </div>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:border-primary-500 outline-none text-sm font-mono dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between">
                                    <label className="text-xs font-bold text-gray-500">كلمة المرور</label>
                                    <button type="button" onClick={generatePassword} className="text-[10px] text-primary-600 font-bold hover:underline">توليد تلقائي</button>
                                </div>
                                <input
                                    type="text"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:border-primary-500 outline-none text-sm font-mono dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-2">
                    <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">إلغاء</button>
                    <button type="submit" className="px-8 py-2 bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 shadow-sm transition-all active:scale-95">
                        {initialData ? 'حفظ التعديلات' : 'حفظ البيانات'}
                    </button>
                </div>
            </form>
        </div>
    );
};

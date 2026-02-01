import { useState, useEffect } from 'react';
import { UserPlus, Edit, Save } from 'lucide-react';
import type { Student } from '../types';

interface StudentFormProps {
    onSubmit: (data: Omit<Student, 'id' | 'enrollments'>) => void;
    initialData?: Student | null;
}

export const StudentForm = ({ onSubmit, initialData }: StudentFormProps) => {
    const [formData, setFormData] = useState({
        name: '',
        grade: '',
        parentPhone: '',
        studentPhone: '',
        curriculum: '',
        notes: '',
        sessionPrice: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                grade: initialData.grade,
                parentPhone: initialData.parentPhone,
                studentPhone: initialData.studentPhone || '',
                curriculum: initialData.curriculum || '',
                notes: initialData.notes || '',
                sessionPrice: String(initialData.sessionPrice || 0)
            });
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            sessionPrice: Number(formData.sessionPrice) || 0
        });
    };

    return (
        <div className="bg-white p-6 border border-gray-100 rounded-none shadow-xl dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-none bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                    {initialData ? <Edit size={20} /> : <UserPlus size={20} />}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-none">{initialData ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium italic">يرجى ملء البيانات المطلوبة للبدء</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">اسم الطالب *</label>
                        <input
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-none focus:outline-none focus:ring-0 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium text-sm"
                            placeholder="الاسم الثلاثي"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">الصف الدراسي *</label>
                        <input
                            required
                            value={formData.grade}
                            onChange={e => setFormData({ ...formData, grade: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-none focus:outline-none focus:ring-0 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium text-sm"
                            placeholder="مثال: الخامس"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">رقم ولي الأمر *</label>
                        <input
                            required
                            type="tel"
                            value={formData.parentPhone}
                            onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-none focus:outline-none focus:ring-0 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium text-sm"
                            dir="ltr"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">رقم الطالب</label>
                        <input
                            type="tel"
                            value={formData.studentPhone}
                            onChange={e => setFormData({ ...formData, studentPhone: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-none focus:outline-none focus:ring-0 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium text-sm"
                            dir="ltr"
                            placeholder="اختياري"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">المنهج</label>
                        <input
                            value={formData.curriculum}
                            onChange={e => setFormData({ ...formData, curriculum: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-none focus:outline-none focus:ring-0 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium text-sm"
                            placeholder="مثال: سعودي، مصري..."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">سعر الحصة (ج.م) *</label>
                        <input
                            required
                            type="number"
                            value={formData.sessionPrice}
                            onChange={e => setFormData({ ...formData, sessionPrice: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-none focus:outline-none focus:ring-0 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium text-sm"
                        />
                    </div>
                    <div className="lg:col-span-4 space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">ملاحظات إضافية</label>
                        <textarea
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-none focus:outline-none focus:ring-0 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium text-sm min-h-[80px]"
                            placeholder="أي تفاصيل أخرى عن الطالب..."
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="submit"
                        className="px-10 py-3 bg-primary-600 text-white text-sm font-black rounded-none hover:bg-primary-700 shadow-lg shadow-primary-600/20 underline-offset-4"
                    >
                        <Save size={18} className="inline-block ml-2" />
                        {initialData ? 'حفظ التعديلات' : 'إضافة الطالب الآن'}
                    </button>
                </div>
            </form>
        </div>
    );
};

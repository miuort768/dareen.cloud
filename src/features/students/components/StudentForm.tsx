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
        sessionPrice: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                grade: initialData.grade,
                parentPhone: initialData.parentPhone,
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
        <div className="bg-white p-6 border border-primary-200 shadow-lg dark:bg-gray-900 dark:border-gray-800 animate-in slide-in-from-top-4 rounded-none">
            <div className="flex items-center gap-2 mb-4 text-primary-700 font-bold border-b border-gray-200 pb-3 dark:border-gray-700 dark:text-primary-400">
                {initialData ? <Edit size={20} /> : <UserPlus size={20} />}
                <h3 className="text-lg">{initialData ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-400">اسم الطالب *</label>
                    <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-none focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        placeholder="الاسم الثلاثي"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-400">الصف الدراسي *</label>
                    <input
                        required
                        type="text"
                        value={formData.grade}
                        onChange={e => setFormData({ ...formData, grade: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-none focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        placeholder="مثال: الخامس"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-400">رقم ولي الأمر *</label>
                    <input
                        required
                        type="tel"
                        value={formData.parentPhone}
                        onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-none focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono"
                        placeholder="01xxxxxxxxx"
                        dir="ltr"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-400">سعر الحصة (ج.م)</label>
                    <input
                        type="number"
                        value={formData.sessionPrice}
                        onChange={e => setFormData({ ...formData, sessionPrice: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-none focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        placeholder="0"
                    />
                </div>
                <button type="submit" className="bg-primary-600 text-white px-6 py-2 font-bold hover:bg-primary-700 transition-all rounded-none flex items-center justify-center gap-2 h-10 mt-auto shadow-md">
                    <Save size={18} />
                    {initialData ? 'حفظ التعديلات' : 'حفظ'}
                </button>
            </form>
        </div>
    );
};

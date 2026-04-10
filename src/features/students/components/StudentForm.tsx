import { useState, useEffect } from 'react';
import { UserPlus, Edit, Save, Shield, Key } from 'lucide-react';
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
        sessionPrice: '',
        username: '',
        password: ''
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
                sessionPrice: String(initialData.sessionPrice || 0),
                username: initialData.username || '',
                password: '' // Keep empty for security, only update if typed
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
        <div className="bg-white p-6 border-[4px] border-gray-950 shadow-[10px_10px_0px_0px_black] dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-8 border-b-4 border-gray-50 dark:border-gray-800 pb-4">
                <div className="w-12 h-12 bg-gray-950 text-white flex items-center justify-center transform -rotate-3 border-2 border-gray-950">
                    {initialData ? <Edit size={24} strokeWidth={2.5} /> : <UserPlus size={24} strokeWidth={2.5} />}
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-950 dark:text-white uppercase italic tracking-tighter leading-none">{initialData ? 'تعديل بيانات الطالب' : 'استصدار هوية طالب جديد'}</h3>
                    <p className="text-[10px] text-gray-400 mt-1 font-black uppercase tracking-widest italic">الاستخبارات الأكاديمية • تحرير البيانات</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Basic Info Section */}
                <div>
                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[3px] text-primary-600 mb-6 border-r-4 border-primary-600 pr-3">
                         المعلومات الأساسية
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 italic">اسم الطالب الثلاثي *</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-950 focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_black] transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-black text-sm italic"
                                placeholder="الاسم المطلوب للهوية"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 italic">المستوى الدراسي *</label>
                            <input
                                required
                                value={formData.grade}
                                onChange={e => setFormData({ ...formData, grade: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-950 focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_black] transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-black text-sm italic"
                                placeholder="..."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 italic">المنهج الدراسي</label>
                            <input
                                value={formData.curriculum}
                                onChange={e => setFormData({ ...formData, curriculum: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-950 focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_black] transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-black text-sm italic"
                                placeholder="مثال: سعودي / مصري"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 italic">رقم تواصل ولي الأمر *</label>
                            <input
                                required
                                type="tel"
                                value={formData.parentPhone}
                                onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-950 focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_black] transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-black text-sm"
                                dir="ltr"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 italic">رقم هاتف الطالب</label>
                            <input
                                type="tel"
                                value={formData.studentPhone}
                                onChange={e => setFormData({ ...formData, studentPhone: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-950 focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_black] transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-black text-sm"
                                dir="ltr"
                                placeholder="اختياري"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 italic">معدل سعر الحصة (ج.م) *</label>
                            <input
                                required
                                type="number"
                                value={formData.sessionPrice}
                                onChange={e => setFormData({ ...formData, sessionPrice: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-950 focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_black] transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-black text-sm italic"
                            />
                        </div>
                    </div>
                </div>

                {/* Account Credentials Section */}
                <div className="p-6 bg-gray-950 text-white border-r-8 border-primary-600">
                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[3px] text-primary-400 mb-6 italic">
                         <Shield size={16} /> إعدادات الحساب (بيانات الدخول)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1 italic">اسم المستخدم (Username)</label>
                            <div className="relative">
                                <input
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-4 py-4 bg-white/5 border-2 border-white/10 focus:outline-none focus:border-primary-500 transition-all font-black text-sm placeholder:text-gray-700"
                                    placeholder="Username للهوية الرقمية"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700">@</div>
                            </div>
                            <p className="text-[8px] text-gray-500 font-bold italic mt-1 uppercase tracking-widest">يترك فارغاً إذا كنت تريد استخدام رقم الهاتف كاسم مستخدم</p>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1 italic">كلمة المرور (Secret Key)</label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" size={18} />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-12 py-4 bg-white/5 border-2 border-white/10 focus:outline-none focus:border-primary-500 transition-all font-black text-sm"
                                    placeholder={initialData ? "تحديث السر (اتركه فارغاً للحفاظ عليه)" : "كلمة مرور الطالب الافتراضية"}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 italic">ملاحظات تكتيكية إضافية</label>
                    <textarea
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-950 focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_black] transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-black text-sm italic min-h-[100px]"
                        placeholder="أدخل أي تفاصيل أمنية أو ملاحظات خاصة..."
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-6">
                    <motion.button
                        whileHover={{ scale: 1.02, x: -5 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="px-12 py-5 bg-gray-950 text-white text-xs font-black uppercase tracking-[5px] italic border-b-8 border-primary-600 shadow-[10px_10px_0px_0px_rgba(37,99,235,0.2)] flex items-center gap-3"
                    >
                        <Save size={20} strokeWidth={3} />
                        {initialData ? 'تأمين التحديثات' : 'تنفيذ أمر الإضافة (DEPLOY)'}
                    </motion.button>
                </div>
            </form>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Save, Shield, Key, Info, GraduationCap, Phone, User as UserIcon } from 'lucide-react';
import type { Student } from '../types';

interface StudentFormProps {
    onSubmit: (data: Omit<Student, 'id' | 'enrollments'>) => void;
    initialData?: Student | null;
    onCancel?: () => void;
}

export const StudentForm = ({ onSubmit, initialData, onCancel }: StudentFormProps) => {
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
                password: '' 
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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-none overflow-hidden mb-10" dir="rtl">
            {/* Form Header */}
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#5c59f2] text-white flex items-center justify-center shadow-lg rotate-2">
                        {initialData ? <Edit size={24} /> : <UserPlus size={24} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase italic">{initialData ? 'تحديث ملف الطالب' : 'تسجيل طالب جديد'}</h3>
                        <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest leading-none">إدارة الوثائق الأكاديمية • {initialData ? 'تعديل البيانات' : 'إنشاء سجل المتابعة'}</p>
                    </div>
                </div>
                {onCancel && (
                    <button 
                        type="button" 
                        onClick={onCancel}
                        className="text-xs font-black text-rose-500 hover:bg-rose-50 px-4 py-2 border border-rose-100 transition-colors uppercase tracking-widest"
                    >
                        إلغاء العملية
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-12">
                {/* Section 1: Basic Profile */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3 pb-2 border-b border-slate-50 dark:border-slate-800">
                        <Info size={16} className="text-[#5c59f2]" />
                        <h4 className="text-[11px] font-black uppercase tracking-[3px] text-slate-400">ملف التعريف الأساسي</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">الاسم الكامل للطالب</label>
                            <div className="relative">
                                <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800/50 border-r-2 border-r-emerald-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 dark:text-white font-bold text-sm transition-all"
                                    placeholder="أدخل الاسم الثلاثي..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">المرحلة الدراسية</label>
                            <div className="relative">
                                <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input
                                    required
                                    value={formData.grade}
                                    onChange={e => setFormData({ ...formData, grade: e.target.value })}
                                    className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800/50 border-r-2 border-r-[#5c59f2] focus:outline-none focus:bg-white dark:focus:bg-slate-800 dark:text-white font-bold text-sm transition-all"
                                    placeholder="مثال: الصف الثالث الثانوي"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">المنهج الدراسي</label>
                            <input
                                value={formData.curriculum}
                                onChange={e => setFormData({ ...formData, curriculum: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-r-2 border-r-amber-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 dark:text-white font-bold text-sm transition-all"
                                placeholder="..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">هاتف ولي الأمر (للمتابعة)</label>
                            <div className="relative">
                                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input
                                    required
                                    type="tel"
                                    dir="ltr"
                                    value={formData.parentPhone}
                                    onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                                    className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800/50 border-r-2 border-r-emerald-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 dark:text-white font-bold text-sm transition-all text-left tabular-nums"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">هاتف الطالب الشخصي</label>
                            <input
                                type="tel"
                                dir="ltr"
                                value={formData.studentPhone}
                                onChange={e => setFormData({ ...formData, studentPhone: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-r-2 border-r-indigo-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 dark:text-white font-bold text-sm transition-all text-left tabular-nums"
                                placeholder="اختياري..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">تسعير الحصة الافتراضي</label>
                            <input
                                required
                                type="number"
                                value={formData.sessionPrice}
                                onChange={e => setFormData({ ...formData, sessionPrice: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-r-2 border-r-[#5c59f2] focus:outline-none focus:bg-white dark:focus:bg-slate-800 dark:text-white font-bold text-sm transition-all tabular-nums"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Secure Access */}
                <div className="bg-slate-900 text-white p-8 border-r-4 border-r-emerald-500 rounded-none relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-full bg-emerald-500/5 -skew-x-12 transform -translate-x-16"></div>
                    
                    <div className="flex items-center gap-3 mb-8 relative z-10">
                        <Shield className="text-emerald-500" size={18} />
                        <h4 className="text-[11px] font-black uppercase tracking-[3px] text-emerald-400">بيانات اعتماد الوصول الآمن</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">اسم المستخدم (Username)</label>
                            <div className="relative">
                                <input
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-5 py-4 bg-white/5 border border-white/10 focus:outline-none focus:border-emerald-500 transition-all font-black text-sm placeholder:text-slate-700"
                                    placeholder="المعرف الرقمي للطالب..."
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-black">@DAREEN</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">كلمة المرور (Secret Key)</label>
                            <div className="relative">
                                <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-5 pr-12 py-4 bg-white/5 border border-white/10 focus:outline-none focus:border-emerald-500 transition-all font-black text-sm"
                                    placeholder={initialData ? "تحديث السر (اتركه فارغاً للحفاظ عليه)" : "أنشئ كلمة مرور قوية..."}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Notes */}
                <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ملاحظات إضافية</label>
                     <textarea
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 focus:outline-none focus:bg-white dark:focus:bg-slate-800 dark:text-white font-bold text-sm min-h-[120px] transition-all"
                        placeholder="أضف أي تفاصيل هامة حول الحالة الأكاديمية للطالب..."
                    />
                </div>

                <div className="flex items-center justify-end pt-8 border-t border-slate-50 dark:border-slate-800">
                    <button
                        type="submit"
                        className="px-12 py-5 bg-[#5c59f2] text-white text-xs font-black uppercase tracking-[5px] italic shadow-2xl shadow-indigo-200 dark:shadow-none hover:-translate-y-1 transition-all flex items-center gap-4"
                    >
                        <Save size={20} />
                        {initialData ? 'تأمين التعديلات' : 'تسجيل الطالب فوراً'}
                    </button>
                </div>
            </form>
        </div>
    );
};
